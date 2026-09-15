import { getSpriteAtlas, cropImage } from "./utils.js";

const sidebar = document.querySelector(".Objects");
const rows = 8;
const cols = 1;

const frameWidth = 96;
const frameHeight = 96;

const visibleWidth = [26, 26, 26, 96, 52, 52, 52, 32]; 
const visibleHeight = [32, 32, 32, 32, 56, 96, 56, 32]; 

const offsetX = [34, 34, 34, 0, 22, 22, 22, 34]; 
const offsetY = [48 + 16, 48 + 16, 48 + 16, 48 + 16, 40, 0, 40, 48 + 16]; 

const objectBlueValues = [4, 0, 7, 14, 8, 12, 13, 15]; 

(async function loadTiles() {
  const image = await getSpriteAtlas("../res/objects2.png");

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      
      const cropX = (j * frameWidth) + offsetX[i];
      const cropY = (i * frameHeight) + offsetY[i];

      const img = cropImage(image, cropX, cropY, visibleWidth[i], visibleHeight[i]);
      
      const tile = document.createElement("img");
      tile.classList.add("object");
      tile.src = img.src;

      tile.dataset.id = objectBlueValues[i];
      
      sidebar.appendChild(tile);
    }
  }
})();