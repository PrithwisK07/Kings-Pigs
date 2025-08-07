import Constants from "../utilities/Constants.js";
import Levels from "./Levels.js";
import {
  getSpriteAtlas,
  getLevelData,
  getBoxes,
  getKingPigs,
  getPigThrowingBoxes,
  getPigs,
  getCannons,
  getPigWithMatches,
} from "../utilities/LoadSave.js";

export default class LevelManager {
  constructor(player, game) {
    this.tileSetImgPath = null;
    this.levelDataImgPath = null;

    this.game = game;
    this.player = player;
    this.levelData = null;

    this.levelName = 1;
    this.door = [];
    this.levels = new Levels(this, this.player);
    this.levels.getLevelImgPath(this.levelName);

    this.tileSetImg = null;
    this.levelDataImg = null;

    this.levelSprite = [];

    this.altCanvas = document.createElement("canvas");

    this.init();
  }

  async init() {
    await this.loadTileMap();
    this.loadLevel();

    this.game.kingPigs = await getKingPigs(this.levelDataImg);
    this.game.pigs = await getPigs(this.levelDataImg);
    this.game.pigThrowingBoxes = await getPigThrowingBoxes(this.levelDataImg);
    this.game.pigWithMatches = await getPigWithMatches(this.levelDataImg);

    this.player.loadLevelData(this.levelData);

    this.boxes = await getBoxes(this.levelDataImg);
    this.cannons = await getCannons(this.levelDataImg);

    this.game.kingPigs.forEach((kp) => {
      kp.loadLevelData(this.levelData);
    });

    this.game.pigs.forEach((p) => {
      p.loadLevelData(this.levelData);
    });

    this.game.pigThrowingBoxes.forEach((p) => {
      p.loadLevelData(this.levelData, this.boxes);
    });

    this.game.pigWithMatches.forEach((p) => {
      p.loadLevelData(this.levelData);
    });

    this.cannons.forEach((cannon) => {
      cannon.loadLevelData(this.levelData);
    });
  }

  async loadTileMap() {
    this.tileSetImg = await getSpriteAtlas(this.tileSetImgPath);
    this.levelDataImg = await getSpriteAtlas(this.levelDataImgPath);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.height = canvas.width = Constants.OG_TILE_SIZE;

    this.levelData = getLevelData(this.levelDataImg, this.player);

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 19; j++) {
        const index = i * 19 + j;

        ctx.clearRect(0, 0, Constants.OG_TILE_SIZE, Constants.OG_TILE_SIZE);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          this.tileSetImg,
          j * Constants.OG_TILE_SIZE,
          i * Constants.OG_TILE_SIZE,
          Constants.OG_TILE_SIZE,
          Constants.OG_TILE_SIZE,
          0,
          0,
          Constants.OG_TILE_SIZE,
          Constants.OG_TILE_SIZE
        );

        const tileImg = new Image();
        tileImg.src = canvas.toDataURL();

        this.levelSprite[index] = tileImg;
      }
    }
  }

  loadLevel() {
    this.altCanvas.width = this.levelDataImg.width * Constants.TILE_SIZE;
    this.altCanvas.height = this.levelDataImg.height * Constants.TILE_SIZE;

    const ctx = this.altCanvas.getContext("2d");

    for (let i = 0; i < this.levelDataImg.height; i++) {
      for (let j = 0; j < this.levelDataImg.width; j++) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          this.levelSprite[this.levelData[i][j]],
          Math.floor(j * Constants.TILE_SIZE),
          Math.floor(i * Constants.TILE_SIZE),
          Constants.TILE_SIZE,
          Constants.TILE_SIZE
        );
      }
    }
  }

  draw(ctx, XlvlOffset) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      this.altCanvas,
      XlvlOffset,
      0,
      ctx.canvas.width,
      ctx.canvas.height,
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );

    this.door.forEach((d) => {
      d.draw(ctx, XlvlOffset);
    });

    if (!this.boxes) return;

    this.boxes.forEach((box) => {
      box.draw(ctx, XlvlOffset);
    });

    this.cannons.forEach((cannon) => {
      cannon.draw(ctx, XlvlOffset);
    });
  }

  update() {
    if (this.door)
      this.door.forEach((d) => {
        d.update();
      });

    if (this.cannons)
      this.cannons.forEach((cannon) => {
        cannon.update();
      });
  }
}
