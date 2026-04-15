import { getSpriteAtlas, cropImage } from "./utils.js";

const sidebar = document.querySelector(".tileSet");
const rows = 5;
const cols = 19;
const tileSize = 32;

(async function loadTiles() {
  const image = await getSpriteAtlas("../res/Terrain (32x32).png");

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (j * rows + i === 94) continue; 

      const img = cropImage(image, j * tileSize, i * tileSize, tileSize, tileSize);
      const tile = document.createElement("img");
      tile.classList.add("tile");
      tile.src = img.src;
      
      const tileIndex = (i * cols) + j;
      tile.dataset.id = tileIndex; 

      sidebar.appendChild(tile);
    }
  }
})();
