import { setOffset, setEraserMode, isEraserActive } from "./canvas.js";
import { setZoomLevel } from "./floating.js";
import { downloadLevelImage } from "./export.js";
import { loadLevelImage } from "./import.js"; 

// Option buttons
const options = document.querySelectorAll(".option");
options.forEach((option) => {
  option.addEventListener("click", () => {
    options.forEach((opt) => opt.classList.remove("active"));
    option.classList.add("active");
  });
});

// Save Export
const saveWrapper = document.querySelector("#save-wrapper");
if (saveWrapper) {
  saveWrapper.addEventListener("click", () => {
    downloadLevelImage();
  });
}

// Reset Viewport
const scrollToContent = document.querySelector(".back");
scrollToContent.addEventListener("click", () => {
  setOffset({ offsetX: 0, offsetY: 0 });
  setZoomLevel(1);
});

// Toggle Grid Borders
const gridBtn = document.querySelector(".grid-btn");
const canvas = document.querySelector(".canvas");

if (gridBtn && canvas) {
  canvas.classList.add("show-grid"); 
  gridBtn.classList.add("active-grid"); 
  
  gridBtn.addEventListener("click", () => {
    canvas.classList.toggle("show-grid");
    gridBtn.classList.toggle("active-grid");
  });
}

// Eraser Toggle
const eraserBtn = document.querySelector(".eraser-btn");
if (eraserBtn) {
  eraserBtn.addEventListener("click", () => {
    setEraserMode(!isEraserActive);
  });
}

// Sidebar Collapse
const leftSidebar = document.querySelector("#leftSidebar");
const sidebarToggle = document.querySelector("#sidebarToggle");

if (leftSidebar && sidebarToggle) {
  sidebarToggle.addEventListener("click", () => {
    leftSidebar.classList.toggle("collapsed");
  });
}

// ==========================================
// UNIFIED LOAD & AUTO-CLOSE LOGIC
// ==========================================
const loadBtn = document.querySelector(".load"); 
const loadModal = document.querySelector("#loadModal");
const closeLoadBtn = document.querySelector("#closeLoadModal");
const fileInput = document.querySelector("#import-file");

// 1. Open the themed modal
if (loadBtn) {
  loadBtn.addEventListener("click", (e) => {
    loadModal.style.display = "flex";
  });
}

// 2. Close modal if 'Cancel' is clicked
if (closeLoadBtn) {
  closeLoadBtn.addEventListener("click", () => {
    loadModal.style.display = "none";
  });
}

// 3. Handle File Selection & Instant Close
if (fileInput) {
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      // Step A: Immediately hide the modal UI
      if (loadModal) loadModal.style.display = "none";

      // Step B: Fire the import function
      loadLevelImage(file);
      
      // Step C: Reset input so the same file can be picked again later
      e.target.value = ""; 
    }
  });
}

// 4. Click outside to close 
if (loadModal) {
  loadModal.addEventListener("click", (e) => {
    if (e.target === loadModal) {
      loadModal.style.display = "none";
    }
  });
}