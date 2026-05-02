import { setOffset, setEraserMode, isEraserActive } from "./canvas.js";
import { setZoomLevel } from "./floating.js";
import { loadLevelImage, loadLevelFromMemory } from "./import.js"; 
import { showToast, downloadLevelImage } from "./export.js";

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
const cloudBtn = document.querySelector(".load-choice.disabled"); 

// ==========================================
// NEW: Track the currently active level!
// ==========================================
let currentEditingSlot = "";

// --- 1. SAVE MODAL LOGIC ---
const saveModal = document.getElementById("saveModal");
const saveSlotInput = document.getElementById("saveSlotInput");

if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    saveModal.style.display = "flex";
    // Auto-fill the input with the level we are currently editing!
    saveSlotInput.value = currentEditingSlot; 
    saveSlotInput.focus();
  });
}

document.getElementById("confirmSave")?.addEventListener("click", () => {
  const slot = saveSlotInput.value.trim();
  saveModal.style.display = "none";
  
  if (slot) {
    currentEditingSlot = slot; // Remember this slot for the next time we hit Save!
  } else {
    showToast("Downloading PNG only (No slot specified)", "success");
  }
  
  downloadLevelImage(slot); 
});

document.getElementById("cancelSave")?.addEventListener("click", () => {
  saveModal.style.display = "none";
});

// --- 2. LOAD MODAL LOGIC ---
if (loadBtn) {
  loadBtn.addEventListener("click", () => {
    loadModal.style.display = "flex";
  });
}

if (closeLoadBtn) {
  closeLoadBtn.addEventListener("click", () => {
    loadModal.style.display = "none";
  });
}

// 2A. Load from PC
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

// 2B. LOAD FROM MEMORY MODAL LOGIC
const loadMemoryModal = document.getElementById("loadMemoryModal");
const loadSlotInput = document.getElementById("loadSlotInput");

if (cloudBtn) {
  cloudBtn.classList.remove("disabled"); 
  cloudBtn.title = "Load from Browser Memory";
  cloudBtn.querySelector("span").innerText = "Game Memory";

  cloudBtn.addEventListener("click", () => {
    loadModal.style.display = "none"; 
    loadMemoryModal.style.display = "flex"; 
    loadSlotInput.value = "";
    loadSlotInput.focus();
  });
}

document.getElementById("confirmLoadMemory")?.addEventListener("click", () => {
  const slot = loadSlotInput.value.trim();
  loadMemoryModal.style.display = "none";
  
  if (slot) {
    const customLevels = JSON.parse(localStorage.getItem("kings_pigs_custom_levels")) || {};
    
    if (customLevels[slot]) {
      loadLevelFromMemory(customLevels[slot]);
      showToast(`Loaded Level ${slot} from Memory!`, "success");
      
      // REMEMBER THIS LEVEL FOR QUICK SAVING LATER!
      currentEditingSlot = slot; 
    } else {
      showToast(`Level ${slot} is empty!`, "error");
    }
  }
});

document.getElementById("cancelLoadMemory")?.addEventListener("click", () => {
  loadMemoryModal.style.display = "none";
});