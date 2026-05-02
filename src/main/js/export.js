import { cells, ROWS, COLS } from "./canvas.js";

// NEW: Helper function for clean UI alerts
export function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type}`; 
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

export function downloadLevelImage(levelSlot = null) {
  if (!ROWS || !COLS) {
    showToast("Please create a grid first!", "error"); // CHANGED
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = COLS;
  canvas.height = ROWS;
  const ctx = canvas.getContext("2d");
  const imgData = ctx.createImageData(COLS, ROWS);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const flatIndex = row * COLS + col;
      const cell = cells[flatIndex];

      const tileImg = cell.querySelector(".placed-tile");
      const objectImg = cell.querySelector(".placed-object");

      let r = 0; let g = 0; let b = 255; 

      if (tileImg && tileImg.hasAttribute("data-id")) {
        const parsedId = parseInt(tileImg.getAttribute("data-id"));
        if (!isNaN(parsedId)) { r = parsedId; g = 255; }
      }

      if (objectImg && objectImg.hasAttribute("data-id")) {
        const parsedId = parseInt(objectImg.getAttribute("data-id"));
        if (!isNaN(parsedId)) {
          b = parsedId;
          if (objectImg.classList.contains("flipped") || objectImg.dataset.flipped === "true") {
            g = 1;
          }
        }
      }

      const dataIndex = flatIndex * 4;
      imgData.data[dataIndex] = r;
      imgData.data[dataIndex + 1] = g;
      imgData.data[dataIndex + 2] = b;
      imgData.data[dataIndex + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const dataURL = canvas.toDataURL("image/png");

  if (levelSlot) {
    const customLevels = JSON.parse(localStorage.getItem("kings_pigs_custom_levels")) || {};
    customLevels[levelSlot] = dataURL; 
    localStorage.setItem("kings_pigs_custom_levels", JSON.stringify(customLevels));
    
    let progress = JSON.parse(localStorage.getItem("kings_pigs_progress"));
    if (!progress) {
      progress = {
        1: { unlocked: true, stars: 3, score: 4500, time: "01:14", goal: "ESCAPE" },
        2: { unlocked: true, stars: 2, score: 2800, time: "02:30", goal: "DEFEAT BOSS" },
        3: { unlocked: true, stars: 0, score: 0, time: "--:--", goal: "COLLECT GEMS" },
      };
    }
    
    if (!progress[levelSlot]) {
      progress[levelSlot] = { unlocked: true, stars: 0, score: 0, time: "--:--", goal: "CUSTOM LEVEL" };
    } else {
      progress[levelSlot].unlocked = true; 
    }
    localStorage.setItem("kings_pigs_progress", JSON.stringify(progress));

    showToast(`Level ${levelSlot} Saved to Memory!`, "success"); // CHANGED
  } else {
    showToast(`Level Downloaded!`, "success"); // CHANGED
  }

  const link = document.createElement("a");
  link.download = `level_${levelSlot || 'data'}_${ROWS}x${COLS}.png`;
  link.href = dataURL; 
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}