import { cells, ROWS, COLS } from "./canvas.js";

export function downloadLevelImage() {
  if (!ROWS || !COLS) {
    alert("Please create a grid first!");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = COLS;
  canvas.height = ROWS;
  const ctx = canvas.getContext("2d");
  const imgData = ctx.createImageData(COLS, ROWS);

  const level2DArray = [];

  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];
    
    for (let col = 0; col < COLS; col++) {
      const flatIndex = row * COLS + col;
      const cell = cells[flatIndex];

      const tileImg = cell.querySelector(".placed-tile");
      const objectImg = cell.querySelector(".placed-object");

      let r = 0; 
      let g = 0; 
      let b = 255; 

      if (tileImg && tileImg.hasAttribute("data-id")) {
        const parsedId = parseInt(tileImg.getAttribute("data-id"));
        if (!isNaN(parsedId)) {
          r = parsedId;
          g = 255; 
        }
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

      const actualTileId = (r === 0 && g === 0) ? 12 : r;
      currentRow.push(actualTileId);
    }
    
    level2DArray.push(currentRow);
  }

  console.log(`--- Level Data (${ROWS}x${COLS}) ---`);
  console.log(level2DArray);
  console.log("JSON Output:");
  console.log(JSON.stringify(level2DArray));

  ctx.putImageData(imgData, 0, 0);
  const link = document.createElement("a");
  link.download = `level_data_${ROWS}x${COLS}.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}