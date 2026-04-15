import { cells, setGridDimensions, makeGrid } from "./canvas.js";
import { saveState } from "./history.js";

export function loadLevelImage(file) {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    const img = new Image();
    
    img.onload = () => {
      // 1. UPDATE THE GRID DYNAMICALLY
      // Image height = Rows, Image width = Columns
      setGridDimensions(img.height, img.width);
      
      // 2. REBUILD THE GRID VISUALLY
      makeGrid();

      // Save this new blank state for Undo functionality
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
        // Wipe the cell clean
        cell.innerHTML = ""; 

        // Recreate the standard layers
        let tileLayer = document.createElement("div");
        tileLayer.className = "tile-layer";
        
        let objectLayer = document.createElement("div");
        objectLayer.className = "object-layer";

        cell.appendChild(tileLayer);
        cell.appendChild(objectLayer);

        // Get the specific pixel colors for this cell
        const dataIndex = index * 4;
        const r = imgData[dataIndex];
        const g = imgData[dataIndex + 1];
        const b = imgData[dataIndex + 2];

        // --- RESTORE TERRAIN ---
        // If Green is 255, we know it's a valid tile (and not empty air)
        if (g === 255) {
          // Find the matching image in the left sidebar
          const sidebarTile = document.querySelector(`.tileSet .tile[data-id="${r}"]`);
          
          if (sidebarTile) {
            const newImg = sidebarTile.cloneNode(true);
            newImg.className = "placed-tile"; 
            
            // Explicitly set the data-id so it can be exported again later!
            newImg.setAttribute("data-id", r);
            
            newImg.width = 42;
            newImg.height = 42;
            tileLayer.appendChild(newImg);
          }
        }

        // --- RESTORE OBJECTS & ENEMIES ---
        // If Blue is not 255, we know an entity exists here
        if (b !== 255) {
          const sidebarObj = document.querySelector(`.Enemy .enemy[data-id="${b}"]`) || 
                             document.querySelector(`.Objects .object[data-id="${b}"]`);
          
          if (sidebarObj) {
            const newImg = sidebarObj.cloneNode(true);
            newImg.className = "placed-object";
            
            // Explicitly set the data-id so it can be exported again later!
            newImg.setAttribute("data-id", b);
            
            if (sidebarObj.classList.contains("enemy")) {
              newImg.classList.add("pl-enemy");
            } else {
              newImg.classList.add("pl-object");
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