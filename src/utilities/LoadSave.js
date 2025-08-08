import KingPig from "../entities/KingPig.js";
import Pig from "../entities/Pig.js";
import PigThrowingBox from "../entities/PigWithBoxes.js";
import Box from "../objects/Box.js";
import Cannon from "../Artilleries/Cannon.js";
import Bomb from "../objects/Bomb.js";
import PigWithMatch from "../entities/PigWithMatch.js";
import PigThrowingBomb from "../entities/PigWithBomb.js";
import Constants from "./Constants.js";

let boxes = [];
let cannons = [];
let bombs = [];
let kingPigs = [];
let pigs = [];
let pigThrowingBoxes = [];
let pigWithMatches = [];
let pigThrowingBombs = [];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function getSpriteAtlas(src) {
  try {
    const img = await loadImage(src);
    return img;
  } catch (error) {
    console.error("Failed to load image:", error.message);
    throw error;
  }
}

export function getLevelData(levelDataImg, player, levelManager) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = levelDataImg.width;
  canvas.height = levelDataImg.height;

  ctx.drawImage(levelDataImg, 0, 0); // Invisible draw

  const { data } = ctx.getImageData(
    0,
    0,
    levelDataImg.width,
    levelDataImg.height
  );

  const levelData = [];

  for (let i = 0; i < levelDataImg.height; i++) {
    const row = [];
    for (let j = 0; j < levelDataImg.width; j++) {
      const index = (i * levelDataImg.width + j) * 4;
      let redValue = data[index];
      let greenValue = data[index + 1];
      let blueValue = data[index + 2];

      if (greenValue == 0 && redValue == 0) redValue = 12;

      if (blueValue == 0) {
        boxes.push(
          new Box(
            j * Constants.OG_TILE_SIZE * Constants.SCALE +
              Constants.Box.BOX_WIDTH * Constants.SCALE,
            i * Constants.OG_TILE_SIZE * Constants.SCALE +
              Constants.Box.BOX_HEIGHT * Constants.SCALE
          )
        );
      }

      if (blueValue == 1) {
        kingPigs.push(
          new KingPig(
            j * Constants.OG_TILE_SIZE * Constants.SCALE,
            i * Constants.OG_TILE_SIZE * Constants.SCALE,
            player
          )
        );
      }

      if (blueValue == 2) {
        pigs.push(
          new Pig(
            j * Constants.OG_TILE_SIZE * Constants.SCALE,
            i * Constants.OG_TILE_SIZE * Constants.SCALE,
            player
          )
        );
      }

      if (blueValue == 3) {
        pigThrowingBoxes.push(
          new PigThrowingBox(
            j * Constants.OG_TILE_SIZE * Constants.SCALE,
            i * Constants.OG_TILE_SIZE * Constants.SCALE,
            player
          )
        );
      }

      if (blueValue == 4) {
        cannons.push(
          new Cannon(
            j * Constants.OG_TILE_SIZE * Constants.SCALE,
            i * Constants.OG_TILE_SIZE * Constants.SCALE
          )
        );
      }

      if (blueValue == 5) {
        pigWithMatches.push(
          new PigWithMatch(
            j * Constants.OG_TILE_SIZE * Constants.SCALE,
            i * Constants.OG_TILE_SIZE * Constants.SCALE,
            player
          )
        );
      }

      if (blueValue == 6) {
        pigThrowingBombs.push(
          new PigThrowingBomb(
            j * Constants.OG_TILE_SIZE * Constants.SCALE,
            i * Constants.OG_TILE_SIZE * Constants.SCALE,
            player,
            levelManager
          )
        );
      }

      if (blueValue == 7) {
        bombs.push(
          new Bomb(
            j * Constants.OG_TILE_SIZE * Constants.SCALE,
            i * Constants.OG_TILE_SIZE * Constants.SCALE
          )
        );
      }

      row.push(redValue);
    }
    levelData.push(row);
  }

  return levelData;
}

export async function getBoxes() {
  return boxes;
}

export async function getKingPigs() {
  return kingPigs;
}

export async function getPigs() {
  return pigs;
}

export async function getPigThrowingBoxes() {
  return pigThrowingBoxes;
}

export async function getCannons() {
  return cannons;
}

export async function getPigWithMatches() {
  return pigWithMatches;
}

export async function getPigThrowingBombs() {
  return pigThrowingBombs;
}

export async function getBombs() {
  return bombs;
}
