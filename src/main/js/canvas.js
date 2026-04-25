import { floatingTile, setFloatingTile, zoomLevel } from "./floating.js";
import { saveState } from "./history.js";

// ==========================================
// 1. ALL DOM QUERIES (Moved to the very top)
// ==========================================
const container = document.querySelector(".container");
const modal = document.querySelector("#gridModal");
const confirmBtn = document.querySelector("#confirmGrid");
const cancelBtn = document.querySelector("#cancelGrid");
const canvasContainer = document.querySelector(".canvas-container");
const canvas = document.querySelector(".canvas");
const upperNum = document.querySelector(".upper-num");
const leftNum = document.querySelector(".left-num");
const zoomWrapper = document.querySelector(".zoom-wrapper");

// ==========================================
// 2. GLOBAL STATE VARIABLES
// ==========================================
export let ROWS, COLS;
export let offsetX = 0, offsetY = 0;
export let isEraserActive = false;
export const cells = [];

const CELL_SIZE = 42;
let isPanning = false;
let isPlacing = false;
let lastX = 0, lastY = 0;
let velocityX = 0, velocityY = 0;

// ==========================================
// 3. INITIALIZATION & LISTENERS
// ==========================================
container.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// Modal logic
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

// Wrappers for clean separation
const panWrapper = document.createElement("div");
canvasContainer.appendChild(panWrapper);
panWrapper.appendChild(zoomWrapper);

// ==========================================
// 4. PANNING & ZOOM LOGIC
// ==========================================
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

setTimeout(() => { requestAnimationFrame(animatePan); }, 0);

export let isSpaceHeld = false;

window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !isSpaceHeld) {
    isSpaceHeld = true;
    e.preventDefault();

    canvasContainer.classList.add("pan-hover");
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    isSpaceHeld = false;
    isPanning = false; 
    
    canvasContainer.classList.remove("pan-hover", "pan-active");
  }
});

canvasContainer.addEventListener("mousedown", (e) => {
  if (e.button === 0 && isSpaceHeld) {
    isPanning = true;
    lastX = e.clientX;
    lastY = e.clientY;
    
    canvasContainer.classList.remove("pan-hover");
    canvasContainer.classList.add("pan-active");
  }
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
  
  canvasContainer.classList.remove("pan-active");
  
  if (isSpaceHeld) {
    canvasContainer.classList.add("pan-hover");
  }
});

canvasContainer.addEventListener("mouseleave", () => {
  isPanning = false;
  canvasContainer.classList.remove("pan-active");
});

// ==========================================
// 5. ERASER LOGIC
// ==========================================
export function setEraserMode(state) {
  isEraserActive = state;
  const eraserBtn = document.querySelector(".eraser-btn");
  
  if (eraserBtn) {
    if (isEraserActive) {
      eraserBtn.classList.add("active-tool"); // Uses the new CSS class
      setFloatingTile(null);
    } else {
      eraserBtn.classList.remove("active-tool");
    }
  }
}

export function eraseFromCell(cell) {
  const objectLayer = cell.querySelector(".object-layer");
  const tileLayer = cell.querySelector(".tile-layer");

  // Check if actual images exist inside the layers
  const hasObject = objectLayer && objectLayer.querySelector("img");
  const hasTile = tileLayer && tileLayer.querySelector("img");

  // Smart Erase: Erase object first. If no object, erase tile.
  if (hasObject) {
    saveState();
    objectLayer.innerHTML = "";
  } else if (hasTile) {
    saveState();
    tileLayer.innerHTML = "";
  }
}

// ==========================================
// 6. GRID GENERATION & TILE PLACEMENT
// ==========================================
export function setGridDimensions(rows, cols) {
  ROWS = rows;
  COLS = cols;
  
  const rowsInput = document.querySelector("#rowsInput");
  const colsInput = document.querySelector("#colsInput");
  if (rowsInput) rowsInput.value = rows;
  if (colsInput) colsInput.value = cols;
}

export function makeGrid() {
  canvas.innerHTML = ""; 
  cells.length = 0;
  upperNum.innerHTML = "";
  leftNum.innerHTML = "";
  
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
      if (isPlacing) {
        if (isEraserActive) eraseFromCell(cell);
        else if (floatingTile) placeTile(cell);
      }
    });

    // Right-click to pick up a topmost object OR tile
    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      
      setEraserMode(false); // Turn off eraser if picking up a tile

      const objectImg = cell.querySelector(".object-layer img:last-child");
      const tileImg = cell.querySelector(".tile-layer img");
      const placedImg = objectImg || tileImg || cell.querySelector("img");

      if (!placedImg) return;
      if (floatingTile) floatingTile.remove();

      const newFloating = placedImg.cloneNode(true);
      if (newFloating.classList.contains("placed-object")) return;

      newFloating.classList.remove("placed-tile");
      newFloating.classList.add("floating-tile");

      const type = getTypeFromElement(placedImg);
      newFloating.dataset.type = type;
      if (type === "tile") newFloating.classList.add("tile"); 

      const targetBox = placedImg.getBoundingClientRect();
      const natW = placedImg.naturalWidth || placedImg.width || CELL_SIZE;
      const natH = placedImg.naturalHeight || placedImg.height || CELL_SIZE;

      newFloating.style.left = targetBox.left + (targetBox.width / 2) * zoomLevel + "px";
      newFloating.style.top = targetBox.top + (targetBox.height / 2) * zoomLevel + "px";
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

function getTypeFromElement(el) {
  if (!el) return null;
  if (el.dataset && el.dataset.type) return el.dataset.type; 
  if (el.classList.contains("tile") || el.classList.contains("placed-tile"))
    return "tile";
  return "object";
}

export function placeTile(cell) {
  if (!floatingTile) return;

  const type = getTypeFromElement(floatingTile);
  const dataId = floatingTile.getAttribute("data-id");

  let tileLayer = cell.querySelector(".tile-layer");
  let objectLayer = cell.querySelector(".object-layer");

  // ==========================================
  // SPAM & DUPLICATE PREVENTION
  // ==========================================
  if (type === "tile" && tileLayer) {
    const existingImg = tileLayer.querySelector("img");
    // If the tile currently in the cell has the exact same ID, ignore the click!
    if (existingImg && existingImg.getAttribute("data-id") === dataId) {
      return; 
    }
  } else if (objectLayer) {
    // If placing an object/enemy, check if this exact object is already here
    const existingImgs = objectLayer.querySelectorAll("img");
    for (let img of existingImgs) {
      if (img.getAttribute("data-id") === dataId) {
        return; 
      }
    }
  }

  // If we make it past the checks above, it is a genuine new action!
  saveState();

  // Create layers if they don't exist yet
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

  if (dataId) {
    newImg.setAttribute("data-id", dataId);
  }

  if (type === "tile") {
    newImg.classList.add("placed-tile");
    newImg.dataset.type = "tile";
    newImg.width = 42;  
    newImg.height = 42; 

    tileLayer.innerHTML = ""; // Wipes old terrain tile
    tileLayer.appendChild(newImg);
  } else {
    newImg.classList.add("placed-object");

    if (floatingTile.classList.contains("enemy")) {
      newImg.classList.add("pl-enemy");
    } else {
      newImg.classList.add("pl-object");
    }

    newImg.dataset.type = "object";

    const natW = floatingTile.naturalWidth || floatingTile.width || 42;
    const natH = floatingTile.naturalHeight || floatingTile.height || 42;
    newImg.width = natW;
    newImg.height = natH;

    objectLayer.appendChild(newImg);
  }
}

// Place tile or Erase on left-click
canvas.addEventListener("mousedown", (e) => {
  if (e.button !== 0 || isSpaceHeld) return; 

  const cell = e.target.closest(".cell");
  if (!cell) return;

  isPlacing = true;
  if (isEraserActive) eraseFromCell(cell);
  else if (floatingTile) placeTile(cell);
});

canvas.addEventListener("mouseup", () => (isPlacing = false));

// Grid preview on modal open
// Grab the elements
const rowsInput = document.querySelector("#rowsInput");
const colsInput = document.querySelector("#colsInput");
const miniGrid = document.querySelector("#miniGrid");
const previewText = document.querySelector("#previewText");

// Function to draw the mini grid
function updatePreview() {
  const r = parseInt(rowsInput.value) || 1;
  const c = parseInt(colsInput.value) || 1;

  // Cap the preview so it doesn't crash the browser if they type 9999
  const displayRows = Math.min(r, 50);
  const displayCols = Math.min(c, 50);

  // Update text label
  // previewText.textContent = `${r} x ${c}`;

  // Use '1fr' to automatically scale the cells to fit perfectly inside the 160px box!
  miniGrid.style.gridTemplateRows = `repeat(${displayRows}, 1fr)`;
  miniGrid.style.gridTemplateColumns = `repeat(${displayCols}, 1fr)`;

  // Clear old preview and draw new cells
  miniGrid.innerHTML = "";
  const totalCells = displayRows * displayCols;
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "mini-cell";
    miniGrid.appendChild(cell);
  }
}

// Listen for typing/clicking arrows in the inputs
if (rowsInput && colsInput) {
  rowsInput.addEventListener("input", updatePreview);
  colsInput.addEventListener("input", updatePreview);
  
  // Draw the initial 15x15 preview as soon as the page loads
  updatePreview(); 
}