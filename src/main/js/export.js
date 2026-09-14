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
    showToast("Please create a grid first!", "error");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = COLS;
  canvas.height = ROWS;
  const ctx = canvas.getContext("2d");
  const imgData = ctx.createImageData(COLS, ROWS);

  // NEW: Create an array to hold the debug data
  const debugGrid = [];

  for (let row = 0; row < ROWS; row++) {
    const rowLog = []; // NEW: Array for the current row

    for (let col = 0; col < COLS; col++) {
      const flatIndex = row * COLS + col;
      const cell = cells[flatIndex];

      const tileImg = cell.querySelector(".placed-tile");
      const objectImg = cell.querySelector(".placed-object");

      let r = 255; let g = 0; let b = 255; 

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

      // NEW: Push the calculated cell values as a formatted string
      rowLog.push(`[${r}, ${g}, ${b}]`);

      const dataIndex = flatIndex * 4;
      imgData.data[dataIndex] = r;
      imgData.data[dataIndex + 1] = g;
      imgData.data[dataIndex + 2] = b;
      imgData.data[dataIndex + 3] = 255;
    }
    
    // NEW: Push the completed row into the main grid
    debugGrid.push(rowLog);
  }

  // NEW: Output the data as a highly readable table in the console
  console.log(`--- Level ${levelSlot || 'Data'} Output ---`);
  console.table(debugGrid);

  ctx.putImageData(imgData, 0, 0);
  const dataURL = canvas.toDataURL("image/png");

  if (levelSlot) {
    const customLevels = JSON.parse(localStorage.getItem("kings_pigs_custom_levels")) || {};
    customLevels[levelSlot] = dataURL; 
    localStorage.setItem("kings_pigs_custom_levels", JSON.stringify(customLevels));
    
    let progress = JSON.parse(localStorage.getItem("kings_pigs_progress"));
    if (!progress) {
      progress = {
        1: { unlocked: true, stars: 0, score: 0, time: "--:--", goal: "SURVIVE" }
      };
    }
    
    if (!progress[levelSlot]) {
      progress[levelSlot] = { unlocked: true, stars: 0, score: 0, time: "--:--", goal: "CUSTOM LEVEL" };
    } else {
      progress[levelSlot].unlocked = true; 
    }
    localStorage.setItem("kings_pigs_progress", JSON.stringify(progress));

    showToast(`Level ${levelSlot} Saved to Memory!`, "success");
  } else {
    showToast(`Level Downloaded!`, "success");
  }

  const link = document.createElement("a");
  link.download = `level_${levelSlot || 'data'}_${ROWS}x${COLS}.png`;
  link.href = dataURL; 
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}