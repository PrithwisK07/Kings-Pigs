import { getSpriteAtlas, cropImage } from "./utils.js";

const sidebar = document.querySelector(".Enemy");
const rows = 1;
const cols = 5;
const enemyWidth = 38;
const enemyHeight = 30;

(async function loadTiles() {
  const image = await getSpriteAtlas("../res/enemies.png");

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const img = cropImage(
        image,
        j * enemyWidth,
        i * enemyHeight,
        enemyWidth,
        enemyHeight
      );
      const tile = document.createElement("img");
      tile.classList.add("enemy");
      tile.src = img.src;

      sidebar.appendChild(tile);
    }
  }
})();
