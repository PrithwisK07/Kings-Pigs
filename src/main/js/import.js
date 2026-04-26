import { cells, setGridDimensions, makeGrid } from "./canvas.js";
import { saveState } from "./history.js";

export function loadLevelImage(file) {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    const img = new Image();
    
    img.onload = () => {
      // 1. UPDATE THE GRID DYNAMICALLY
      setGridDimensions(img.height, img.width);
      
      // 2. REBUILD THE GRID VISUALLY
      makeGrid();
      saveState();

      // 3. Draw the loaded image to an offscreen canvas to read its pixels
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, img.width, img.height).data;

      // 4. Loop through the freshly built grid and reconstruct the level
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
        // FIX: Check if Red is not 255 (since Green is now used for metadata!)
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

            // --- RESTORE METADATA (FLIP & DOOR TYPE) ---
            if (g === 1) {
              newImg.dataset.flipped = "true";
              if (b === 8) { 
                // If it's a door, add the blue visual tint for Exit Doors
                newImg.classList.add("entry-door-visual");
              } else { 
                // Everything else gets physically flipped
                newImg.classList.add("flipped");
              }
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

      console.log(`Successfully loaded and mapped a ${img.width}x${img.height} level!`);
    };
    
    img.src = event.target.result;
  };
  
  reader.readAsDataURL(file);
}