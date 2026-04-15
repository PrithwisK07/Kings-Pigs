import { cells } from "./canvas.js";
let history = [];

export function saveState() {
  const state = [];
  cells.forEach((cell) => {
    const tile = cell.querySelector(".tile-layer img");
    const objects = [...cell.querySelectorAll(".object-layer img")];

    state.push({
      // ADDED: Capture the data-id for the tile
      tile: tile ? { 
        src: tile.src, 
        className: tile.className,
        dataId: tile.getAttribute("data-id") 
      } : null,
      
      // ADDED: Capture the data-id for all objects
      objects: objects.map((img) => ({
        src: img.src,
        className: img.className,
        dataId: img.getAttribute("data-id")
      })),
    });
  });
  history.push(state);
}

export function undo() {
  if (history.length === 0) return;

  const lastState = history.pop();
  cells.forEach((cell, i) => {
    // wipe cell and rebuild layers
    cell.innerHTML = "";

    let tileLayer = document.createElement("div");
    tileLayer.className = "tile-layer";

    let objectLayer = document.createElement("div");
    objectLayer.className = "object-layer";

    cell.appendChild(tileLayer);
    cell.appendChild(objectLayer);

    // restore tile
    if (lastState[i].tile) {
      const img = document.createElement("img");
      img.src = lastState[i].tile.src;
      img.className = lastState[i].tile.className;
      
      // ADDED: Restore the data-id
      if (lastState[i].tile.dataId) {
        img.setAttribute("data-id", lastState[i].tile.dataId);
      }
      tileLayer.appendChild(img);
    }

    // restore objects
    lastState[i].objects.forEach((data) => {
      const img = document.createElement("img");
      img.src = data.src;
      img.className = data.className;
      
      // ADDED: Restore the data-id
      if (data.dataId) {
        img.setAttribute("data-id", data.dataId);
      }
      objectLayer.appendChild(img);
    });
  });
}

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    e.preventDefault();
    undo();
  }
});