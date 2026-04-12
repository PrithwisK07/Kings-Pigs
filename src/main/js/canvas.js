import { floatingTile, setFloatingTile, zoomLevel } from "./floating.js";
import { saveState } from "./history.js";

const container = document.querySelector(".container");
container.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// Modal logic.
const modal = document.querySelector("#gridModal");
const confirmBtn = document.querySelector("#confirmGrid");
const cancelBtn = document.querySelector("#cancelGrid");

let ROWS, COLS;

modal.addEventListener("click", (e) => {
  if (e.target === confirmBtn) {
    modal.style.display = "none";

    const rowsInput = document.querySelector("#rowsInput");
    const colsInput = document.querySelector("#colsInput");

    ROWS = rowsInput.value;
    COLS = colsInput.value;

    makeGrid();
  }

  if (e.target === cancelBtn) {
    window.location.href = "./index.html";
  }
});

const canvasContainer = document.querySelector(".canvas-container");

// --- New wrappers for clean separation ---
const panWrapper = document.createElement("div");
const zoomWrapper = document.querySelector(".zoom-wrapper");

canvasContainer.appendChild(panWrapper);
panWrapper.appendChild(zoomWrapper);

// Pan state
let isPanning = false;
let lastX = 0,
  lastY = 0;
let velocityX = 0,
  velocityY = 0;
export let offsetX = 0,
  offsetY = 0;

export function setOffset({ offsetX: newX, offsetY: newY }) {
  offsetX = newX;
  offsetY = newY;
  panWrapper.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoomLevel})`;
}

function animatePan() {
  offsetX += velocityX;
  offsetY += velocityY;

  velocityX *= 0.85;
  velocityY *= 0.85;

  panWrapper.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoomLevel})`;

  requestAnimationFrame(animatePan);
}

animatePan();

// --- Panning logic ---
canvasContainer.addEventListener("mousedown", (e) => {
  if (e.button === 0) return;

  isPanning = true;
  lastX = e.clientX;
  lastY = e.clientY;
});

canvasContainer.addEventListener("mousemove", (e) => {
  if (!isPanning) return;

  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;

  velocityX = dx;
  velocityY = dy;

  lastX = e.clientX;
  lastY = e.clientY;
});

canvasContainer.addEventListener("mouseup", () => {
  isPanning = false;
});

canvasContainer.addEventListener("mouseleave", () => {
  isPanning = false;
});

// --- Grid setup ---
const canvas = document.querySelector(".canvas");
const upperNum = document.querySelector(".upper-num");
const leftNum = document.querySelector(".left-num");

const CELL_SIZE = 42;
export const cells = [];

function makeGrid() {
  canvas.style.gridTemplateRows = `repeat(${ROWS}, ${CELL_SIZE}px)`;
  canvas.style.gridTemplateColumns = `repeat(${COLS}, ${CELL_SIZE}px)`;

  // Numbering - top
  upperNum.style.gridTemplateColumns = `repeat(${COLS}, ${CELL_SIZE}px)`;
  for (let col = 1; col <= COLS; col++) {
    const numCell = document.createElement("div");
    numCell.className = "num-cell";
    numCell.textContent = col;
    upperNum.appendChild(numCell);
  }

  // Numbering - left
  leftNum.style.gridTemplateRows = `repeat(${ROWS}, ${CELL_SIZE}px)`;
  for (let row = 1; row <= ROWS; row++) {
    const numCell = document.createElement("div");
    numCell.className = "num-cell";
    numCell.textContent = row;
    leftNum.appendChild(numCell);
  }

  // Grid cells
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    canvas.appendChild(cell);
    cells.push(cell);
  }

  document.querySelectorAll(".cell").forEach((cell) => {
    cell.addEventListener("mouseenter", () => {
      if (isPlacing && floatingTile) placeTile(cell);
    });

    // Right-click to pick up a topmost object OR tile
    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      // Prefer topmost object, then tile
      const objectImg = cell.querySelector(".object-layer img:last-child");
      const tileImg = cell.querySelector(".tile-layer img");
      const placedImg = objectImg || tileImg || cell.querySelector("img");

      if (!placedImg) return;

      if (floatingTile) floatingTile.remove();

      // clone but DON'T wipe classes with className = '...' — preserve type info
      const newFloating = placedImg.cloneNode(true);

      if (newFloating.classList.contains("placed-object")) {
        return;
      }

      // remove 'placed-*' classes but keep type info
      newFloating.classList.remove("placed-tile");
      newFloating.classList.add("floating-tile");

      // preserve a clean explicit marker so placeTile can decide
      const type = getTypeFromElement(placedImg);
      newFloating.dataset.type = type;
      if (type === "tile") newFloating.classList.add("tile"); // keep shorthand for earlier checks if needed

      // size & position for floating preview (natural size scaled by zoom)
      const targetBox = placedImg.getBoundingClientRect();
      const natW = placedImg.naturalWidth || placedImg.width || CELL_SIZE;
      const natH = placedImg.naturalHeight || placedImg.height || CELL_SIZE;

      newFloating.style.left =
        targetBox.left + (targetBox.width / 2) * zoomLevel + "px";
      newFloating.style.top =
        targetBox.top + (targetBox.height / 2) * zoomLevel + "px";

      newFloating.style.position = "fixed";
      newFloating.style.pointerEvents = "none";
      newFloating.style.zIndex = "1000";
      newFloating.style.border = "none";
      newFloating.style.width = natW * zoomLevel + "px";
      newFloating.style.height = natH * zoomLevel + "px";

      document.body.appendChild(newFloating);
      setFloatingTile(newFloating);
    });
  });
}

export function getCell() {
  return document.querySelectorAll(".cell");
}

/* -------------------------
   Helper: read element type
   ------------------------- */
function getTypeFromElement(el) {
  if (!el) return null;
  if (el.dataset && el.dataset.type) return el.dataset.type; // prefer explicit marker
  if (el.classList.contains("tile") || el.classList.contains("placed-tile"))
    return "tile";
  return "object";
}

/* -------------------------
   Place tile/object into cell
   ------------------------- */
export function placeTile(cell) {
  if (!floatingTile) return;
  saveState();

  // ensure layers exist
  let tileLayer = cell.querySelector(".tile-layer");
  let objectLayer = cell.querySelector(".object-layer");

  if (!tileLayer) {
    tileLayer = document.createElement("div");
    tileLayer.className = "tile-layer";
    cell.appendChild(tileLayer);
  }

  if (!objectLayer) {
    objectLayer = document.createElement("div");
    objectLayer.className = "object-layer";
    cell.appendChild(objectLayer);
  }

  const newImg = document.createElement("img");
  newImg.src = floatingTile.src;

  const type = getTypeFromElement(floatingTile);

  if (type === "tile") {
    // Always overwrite the tile layer
    newImg.classList.add("placed-tile");
    newImg.dataset.type = "tile";

    // Snap tile to cell size
    newImg.width = CELL_SIZE;
    newImg.height = CELL_SIZE;

    // Clear old tile(s) before adding the new one
    tileLayer.innerHTML = "";
    tileLayer.appendChild(newImg);
  } else {
    // place as object on top
    newImg.classList.add("placed-object");

    if (floatingTile.classList.contains("enemy")) {
      newImg.classList.add("pl-enemy");
    } else {
      newImg.classList.add("pl-object");
    }

    newImg.dataset.type = "object";

    // Preserve object's natural pixel size (prevents stretching)
    const natW = floatingTile.naturalWidth || floatingTile.width || CELL_SIZE;
    const natH = floatingTile.naturalHeight || floatingTile.height || CELL_SIZE;
    newImg.width = natW;
    newImg.height = natH;

    objectLayer.appendChild(newImg);
  }
}

let isPlacing = false;

// Place tile on left-click
canvas.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  if (!floatingTile) return;

  const cell = e.target.closest(".cell");
  if (!cell) return;

  isPlacing = true;
  placeTile(cell);
});

canvas.addEventListener("mouseup", () => (isPlacing = false));
