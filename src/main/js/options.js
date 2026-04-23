import { setOffset, setEraserMode, isEraserActive } from "./canvas.js";
import { setZoomLevel } from "./floating.js";
import { downloadLevelImage } from "./export.js";
import { loadLevelImage } from "./import.js"; // Added Import

// Option buttons
const options = document.querySelectorAll(".option");
options.forEach((option) => {
  option.addEventListener("click", () => {
    options.forEach((opt) => opt.classList.remove("active"));
    option.classList.add("active");
  });
});

// Save animation & Export
const circle = document.querySelector(".progress");
const saveWrapper = document.querySelector("#save-wrapper");

saveWrapper.addEventListener("click", () => {
  circle.style.transition = "none";
  circle.style.strokeDashoffset = 283;
  circle.style.opacity = "1";

  setTimeout(() => {
    circle.style.transition = "stroke-dashoffset 1.25s linear";
    circle.style.strokeDashoffset = 0;

    downloadLevelImage();

    setTimeout(() => (circle.style.opacity = "0"), 1400);
  }, 10);
});

// Load / Import Logic
const importInput = document.querySelector("#import-file");

if (importInput) {
  importInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      loadLevelImage(file);
      
      // Reset the input value so you can upload the same file twice if needed
      e.target.value = ""; 
    }
  });
}

// Reset Viewport
const scrollToContent = document.querySelector(".back");
scrollToContent.addEventListener("click", () => {
  setOffset({ offsetX: 0, offsetY: 0 });
  setZoomLevel(1);
});

// Toggle Grid Borders (Replaces the old mask trick)
const grid = document.querySelector(".grid");
const canvas = document.querySelector(".canvas");

if (grid && canvas) {
  canvas.classList.add("show-grid"); // Make grid visible by default
  
  grid.addEventListener("click", () => {
    canvas.classList.toggle("show-grid");
  });
}

const eraserBtn = document.querySelector(".eraser button");
if (eraserBtn) {
  eraserBtn.addEventListener("click", () => {
    // Toggle the eraser state
    setEraserMode(!isEraserActive);
  });
}