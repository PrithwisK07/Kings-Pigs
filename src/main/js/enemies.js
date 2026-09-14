import { getSpriteAtlas, cropImage } from "./utils.js";

const sidebar = document.querySelector(".Enemy");
const rows = 1;
const cols = 8;

const frameWidth = 72;
const frameHeight = 32;

const visibleWidth = 44;
const visibleHeight = 32;
const offsetX = 14; // (72 - 44) / 2 = 14px of empty space to skip

const enemyBlueValues = [1, 2, 3, 6, 5, 9, 10, 11];

(async function loadTiles() {
  const image = await getSpriteAtlas("../res/enemies.png");

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Jump 72px per frame, but start 14px inward to grab the dead center
      const cropX = (j * frameWidth) + offsetX;
      const cropY = i * frameHeight;

      const img = cropImage(image, cropX, cropY, visibleWidth, visibleHeight);
      
      const tile = document.createElement("img");
      tile.classList.add("enemy");
      tile.src = img.src;
      tile.dataset.id = enemyBlueValues[j];

      sidebar.appendChild(tile);
    }
  }
})();