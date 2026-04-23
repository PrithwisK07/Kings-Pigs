import { setEraserMode } from "./canvas.js";

export let floatingTile = null;
export let zoomLevel = 1;
const baseTileSize = 42;

export function setFloatingTile(tile) {
  if (tile === null && floatingTile) {
    floatingTile.remove();
  }
  floatingTile = tile;
}

export function setZoomLevel(level) {
  zoomLevel = level; // allow others to update it
}

const container = document.querySelector(".container");
const tileSet = document.querySelector(".tileSet");
const enemySet = document.querySelector(".Enemy");
const objSet = document.querySelector(".Objects");

// Generic handler to start floating an element
function startFloating(e, className) {
  if (e.target.classList.contains(className)) {
    setEraserMode(false);
    
    if (floatingTile) floatingTile.remove();

    floatingTile = e.target.cloneNode(true);
    floatingTile.classList.add("floating-tile");

    const targetBox = e.target.getBoundingClientRect();
    floatingTile.style.left =
      targetBox.left + (targetBox.width / 2) * zoomLevel + "px";
    floatingTile.style.top =
      targetBox.top + (targetBox.height / 2) * zoomLevel + "px";

    floatingTile.style.position = "fixed";
    floatingTile.style.pointerEvents = "none";
    floatingTile.style.zIndex = "1000";
    floatingTile.style.border = "none";

    floatingTile.style.width = targetBox.width * zoomLevel + "px";
    floatingTile.style.height = targetBox.height * zoomLevel + "px";

    document.body.appendChild(floatingTile);
  }
}

// Apply floating logic to tiles
tileSet.addEventListener("click", (e) => {
  startFloating(e, "tile");
});

// Apply floating logic to objects (like enemies)
enemySet.addEventListener("click", (e) => {
  startFloating(e, "enemy");
});

objSet.addEventListener("click", (e) => {
  startFloating(e, "object");
});

// Follow mouse
container.addEventListener("mousemove", (e) => {
  if (floatingTile) {
    floatingTile.style.left = e.clientX + "px";
    floatingTile.style.top = e.clientY + "px";
  }
});

// Cancel floating tile/object if clicking outside
document.addEventListener("click", (e) => {
  const insideCanvas = e.target.closest(".canvas");
  const insidetileSet = e.target.closest(".tileSet");
  const insideenemySet = e.target.closest(".Enemy");
  const insideobjectSet = e.target.closest(".Objects");

  if (
    !insideCanvas &&
    !insidetileSet &&
    !insideenemySet &&
    !insideobjectSet &&
    floatingTile
  ) {
    floatingTile.remove();
    floatingTile = null;
  }
});
