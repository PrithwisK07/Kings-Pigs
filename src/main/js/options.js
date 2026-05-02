import { setOffset, setEraserMode, isEraserActive } from "./canvas.js";
import { setZoomLevel } from "./floating.js";
import { downloadLevelImage } from "./export.js";
import { loadLevelImage, loadLevelFromMemory } from "./import.js"; // Added memory import

// ==========================================
// UI TOGGLES & OPTIONS
// ==========================================
const options = document.querySelectorAll(".option");
options.forEach((option) => {
  option.addEventListener("click", () => {
    options.forEach((opt) => opt.classList.remove("active"));
    option.classList.add("active");
  });
});

// Reset Viewport
const scrollToContent = document.querySelector(".back");
if (scrollToContent) {
  scrollToContent.addEventListener("click", () => {
    setOffset({ offsetX: 0, offsetY: 0 });
    setZoomLevel(1);
  });
}

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
// UNIFIED LOAD & SAVE LOGIC
// ==========================================
const saveBtn = document.querySelector("#save-wrapper");
const loadBtn = document.querySelector(".load"); 
const loadModal = document.querySelector("#loadModal");
const closeLoadBtn = document.querySelector("#closeLoadModal");
const fileInput = document.querySelector("#import-file");
const cloudBtn = document.querySelector(".load-choice.disabled"); // The "Cloud" button

// --- 1. SAVE MODAL LOGIC ---
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    const slot = prompt("Enter Level Number to save to (e.g., 1, 2, 3), or leave blank to just download the PNG:");
    // If they clicked cancel, slot is null. If they typed nothing, slot is "".
    if (slot !== null) {
      downloadLevelImage(slot.trim()); 
    }
  });
}

// --- 2. LOAD MODAL LOGIC ---
if (loadBtn) {
  loadBtn.addEventListener("click", () => {
    if (loadModal) loadModal.style.display = "flex";
  });
}

if (closeLoadBtn) {
  closeLoadBtn.addEventListener("click", () => {
    if (loadModal) loadModal.style.display = "none";
  });
}

// Click outside to close the modal
if (loadModal) {
  loadModal.addEventListener("click", (e) => {
    if (e.target === loadModal) {
      loadModal.style.display = "none";
    }
  });
}

// --- 3. HANDLE FILE SELECTION (PC IMPORT) ---
if (fileInput) {
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      if (loadModal) loadModal.style.display = "none";
      loadLevelImage(file);
      e.target.value = ""; 
    }
  });
}

// --- 4. HANDLE BROWSER MEMORY (REPLACING CLOUD) ---
if (cloudBtn) {
  cloudBtn.classList.remove("disabled"); // Enable the button!
  cloudBtn.title = "Load from Browser Memory";
  const cloudText = cloudBtn.querySelector("span");
  if (cloudText) cloudText.innerText = "Game Memory";

  cloudBtn.addEventListener("click", () => {
    const slot = prompt("Enter the Level Number you want to edit (e.g., 1, 2, 3):");
    if (slot) {
      const customLevels = JSON.parse(localStorage.getItem("kings_pigs_custom_levels")) || {};
      
      if (customLevels[slot]) {
        if (loadModal) loadModal.style.display = "none";
        loadLevelFromMemory(customLevels[slot]);
      } else {
        alert(`Level ${slot} does not exist in browser memory yet!`);
      }
    }
  });
}