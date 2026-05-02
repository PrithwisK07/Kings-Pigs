import { cells, setGridDimensions, makeGrid } from "./canvas.js";
import { saveState } from "./history.js";

// Core logic extracted so it can be used by both Computer and Browser imports
function processLevelImage(img) {
  setGridDimensions(img.height, img.width);
  makeGrid();
  saveState();

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, img.width, img.height).data;

  cells.forEach((cell, index) => {
    cell.innerHTML = ""; 

    let tileLayer = document.createElement("div");
    tileLayer.className = "tile-layer";
    
    let objectLayer = document.createElement("div");
    objectLayer.className = "object-layer";

    cell.appendChild(tileLayer);
    cell.appendChild(objectLayer);

    const dataIndex = index * 4;
    const r = imgData[dataIndex];
    const g = imgData[dataIndex + 1];
    const b = imgData[dataIndex + 2];

    // --- RESTORE TERRAIN ---
    if (r !== 255) {
      const sidebarTile = document.querySelector(`.tileSet .tile[data-id="${r}"]`);
      if (sidebarTile) {
        const newImg = sidebarTile.cloneNode(true);
        newImg.className = "placed-tile"; 
        newImg.setAttribute("data-id", r);
        newImg.width = 42;
        newImg.height = 42;
        tileLayer.appendChild(newImg);
      }
    }

    // --- RESTORE OBJECTS & ENEMIES ---
    if (b !== 255) {
      const sidebarObj = document.querySelector(`.Enemy .enemy[data-id="${b}"]`) || 
                         document.querySelector(`.Objects .object[data-id="${b}"]`);
      
      if (sidebarObj) {
        const newImg = sidebarObj.cloneNode(true);
        newImg.className = "placed-object";
        newImg.setAttribute("data-id", b);
        
        if (sidebarObj.classList.contains("enemy")) {
          newImg.classList.add("pl-enemy");
        } else {
          newImg.classList.add("pl-object");
        }

        if (g === 1) {
          newImg.dataset.flipped = "true";
          if (b === 8) newImg.classList.add("entry-door-visual");
          else newImg.classList.add("flipped");
        } else {
          newImg.dataset.flipped = "false";
        }

        const natW = sidebarObj.naturalWidth || sidebarObj.width || 42;
        const natH = sidebarObj.naturalHeight || sidebarObj.height || 42;
        newImg.width = natW;
        newImg.height = natH;
        
        objectLayer.appendChild(newImg);
      }
    }
  });

  console.log(`Successfully mapped a ${img.width}x${img.height} level!`);
}

// 1. Load from PC (File Upload)
export function loadLevelImage(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => processLevelImage(img);
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// 2. NEW: Load from Browser Memory (Base64)
export function loadLevelFromMemory(base64String) {
  const img = new Image();
  img.onload = () => processLevelImage(img);
  img.src = base64String;
}