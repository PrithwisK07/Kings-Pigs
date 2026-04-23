import { cells } from "./canvas.js";

let undoStack = [];
let redoStack = [];

// Helper to capture the current grid state
function getCurrentState() {
  const state = [];
  cells.forEach((cell) => {
    const tile = cell.querySelector(".tile-layer img");
    const objects = [...cell.querySelectorAll(".object-layer img")];

    state.push({
      tile: tile ? { 
        src: tile.src, 
        className: tile.className,
        dataId: tile.getAttribute("data-id") 
      } : null,
      objects: objects.map((img) => ({
        src: img.src,
        className: img.className,
        dataId: img.getAttribute("data-id")
      })),
    });
  });
  return state;
}

export function saveState() {
  undoStack.push(getCurrentState());
  redoStack = []; // Clear the redo future if you make a new branching action
}

function restoreState(stateToRestore) {
  cells.forEach((cell, i) => {
    cell.innerHTML = "";

    let tileLayer = document.createElement("div");
    tileLayer.className = "tile-layer";
    let objectLayer = document.createElement("div");
    objectLayer.className = "object-layer";

    cell.appendChild(tileLayer);
    cell.appendChild(objectLayer);

    if (stateToRestore[i].tile) {
      const img = document.createElement("img");
      img.src = stateToRestore[i].tile.src;
      img.className = stateToRestore[i].tile.className;
      if (stateToRestore[i].tile.dataId) {
        img.setAttribute("data-id", stateToRestore[i].tile.dataId);
      }
      tileLayer.appendChild(img);
    }

    stateToRestore[i].objects.forEach((data) => {
      const img = document.createElement("img");
      img.src = data.src;
      img.className = data.className;
      if (data.dataId) {
        img.setAttribute("data-id", data.dataId);
      }
      objectLayer.appendChild(img);
    });
  });
}

export function undo() {
  if (undoStack.length === 0) return;
  redoStack.push(getCurrentState()); // Save current state to Redo
  const lastState = undoStack.pop();
  restoreState(lastState);
}

export function redo() {
  if (redoStack.length === 0) return;
  undoStack.push(getCurrentState()); // Save current state to Undo
  const nextState = redoStack.pop();
  restoreState(nextState);
}

// Hotkeys: Ctrl+Z (Undo) and Ctrl+Y or Ctrl+Shift+Z (Redo)
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "z" && !e.shiftKey) {
    e.preventDefault();
    undo();
  }
  if ((e.ctrlKey && e.key.toLowerCase() === "y") || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z")) {
    e.preventDefault();
    redo();
  }
});