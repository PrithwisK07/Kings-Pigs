/* left-sidebar */

import { getSpriteAtlas } from "../utilities/LoadSave.js";

const container = document.querySelector(".container");
const sidebar = document.querySelector(".tileSet");

async function loadImage() {
  const image = await getSpriteAtlas("../res/Terrain (32x32).png");
  return image;
}

function cropImage(img, sx, sy, sw, sh) {
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  const croppedImage = new Image();
  croppedImage.src = canvas.toDataURL("image/png");
  return croppedImage;
}

const image = await loadImage();

const rows = 5;
const cols = 19;
const tileSize = 32;

for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
    const img = cropImage(
      image,
      j * tileSize,
      i * tileSize,
      tileSize,
      tileSize
    );
    const tile = document.createElement("img");
    tile.classList.add("tile");
    tile.src = img.src;

    if (j * rows + i == 94) continue;
    sidebar.appendChild(tile);
  }
}

let floatingTile = null;
const floatingTileSize = 42;

sidebar.addEventListener("click", (e) => {
  if (e.target.classList.contains("tile")) {
    if (floatingTile) floatingTile.remove();

    floatingTile = e.target.cloneNode(true);
    floatingTile.classList.add("floating-tile");

    floatingTile.style.position = "fixed";
    floatingTile.style.pointerEvents = "none";
    floatingTile.style.zIndex = "1000";

    const rect = e.target.getBoundingClientRect();
    floatingTile.style.left = rect.left + floatingTileSize / 2 + "px";
    floatingTile.style.top = rect.top + floatingTileSize / 2 + "px";
    floatingTile.style.border = "none";

    document.body.appendChild(floatingTile);
  }
});

container.addEventListener("mousemove", (e) => {
  if (floatingTile) {
    floatingTile.style.left = e.clientX + "px";
    floatingTile.style.top = e.clientY + "px";
  }
});

/* Canvas Setup */

const canvas = document.querySelector(".canvas");
const upperNum = document.querySelector(".upper-num");
const leftNum = document.querySelector(".left-num");

const ROWS = 15;
const COLS = 15;
const CELL_SIZE = 42;

upperNum.style.gridTemplateColumns = `repeat(${COLS}, ${CELL_SIZE}px)`;
for (let col = 1; col <= COLS; col++) {
  const numCell = document.createElement("div");
  numCell.className = "num-cell";
  numCell.textContent = col;
  upperNum.appendChild(numCell);
}

leftNum.style.gridTemplateRows = `repeat(${ROWS}, ${CELL_SIZE}px)`;
for (let row = 1; row <= ROWS; row++) {
  const numCell = document.createElement("div");
  numCell.className = "num-cell";
  numCell.textContent = row;
  leftNum.appendChild(numCell);
}

canvas.style.gridTemplateRows = `repeat(${ROWS}, ${CELL_SIZE}px)`;
canvas.style.gridTemplateColumns = `repeat(${COLS}, ${CELL_SIZE}px)`;

for (let i = 0; i < ROWS * COLS; i++) {
  const cell = document.createElement("div");
  cell.className = "cell";
  canvas.appendChild(cell);
}
