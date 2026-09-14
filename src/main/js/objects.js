import { getSpriteAtlas, cropImage } from "./utils.js";

const sidebar = document.querySelector(".Objects");
const rows = 6;
const cols = 1;

const frameWidth = 96;
const frameHeight = 96;

const visibleWidth = 52; 
const visibleHeight = 96; 

const offsetX = 22; 
const offsetY = 0; 

const objectBlueValues = [4, 0, 7, 8, 12, 13]; 

(async function loadTiles() {
  const image = await getSpriteAtlas("../res/objects2.png");

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      
      const cropX = (j * frameWidth) + offsetX;
      const cropY = (i * frameHeight) + offsetY;

      const img = cropImage(image, cropX, cropY, visibleWidth, visibleHeight);
      
      const tile = document.createElement("img");
      tile.classList.add("object");
      tile.src = img.src;

      tile.dataset.id = objectBlueValues[i];
      
      sidebar.appendChild(tile);
    }
  }
})();