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

if (saveWrapper) {
  saveWrapper.addEventListener("click", () => {
    // Instantly trigger the download without waiting for an animation
    downloadLevelImage();
  });
}

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
const gridBtn = document.querySelector(".grid-btn");
const canvas = document.querySelector(".canvas");

if (gridBtn && canvas) {
  // Set initial default state (Grid is ON)
  canvas.classList.add("show-grid"); 
  gridBtn.classList.add("active-grid"); // Pushes the button down initially
  
  // Toggle both the canvas grid and the button visuals on click
  gridBtn.addEventListener("click", () => {
    canvas.classList.toggle("show-grid");
    gridBtn.classList.toggle("active-grid");
  });
}

const eraserBtn = document.querySelector(".eraser-btn");
if (eraserBtn) {
  eraserBtn.addEventListener("click", () => {
    // Toggle the eraser state
    setEraserMode(!isEraserActive);
  });
}