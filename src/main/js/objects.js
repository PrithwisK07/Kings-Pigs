import { getSpriteAtlas, cropImage } from "./utils.js";

const sidebar = document.querySelector(".Objects");
const rows = 4;
const cols = 1;
const enemyWidth = 52;
const enemyHeight = 56;

const objectBlueValues = [4, 0, 7, 255]; 

(async function loadTiles() {
  const image = await getSpriteAtlas("../res/objects.png");

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const img = cropImage(image, j * enemyWidth, i * enemyHeight, enemyWidth, enemyHeight);
      const tile = document.createElement("img");
      tile.classList.add("object");
      tile.src = img.src;

      tile.dataset.id = objectBlueValues[i];

      sidebar.appendChild(tile);
    }
  }
})();
