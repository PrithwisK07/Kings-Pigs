import Player from "../entities/Player.js";
import KeyBoardInputs from "../inputs/KeyBoardInputs.js";
import MouseInput from "../inputs/MouseInput.js";
import LevelManager from "../level/LevelManager.js";
import Constants from "../utilities/Constants.js";
import { getLevelData } from "../utilities/loadSave.js";

export default class Game {
  constructor() {
    // Canvas and context
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.init();

    // Fixed FPS
    this.FPS_SET = 120;
    this.UPS_SET = 200;

    this.timePerFrame = 1000 / this.FPS_SET;
    this.timePerUpdate = 1000 / this.UPS_SET;

    this.lastCheckTime = performance.now();

    this.deltaFrame = 0;
    this.deltaUpdate = 0;

    // Scroll offset
    this.XlvlOffset = 0;
    this.rightBorder = 0.8 * this.width;
    this.leftBorder = 0.2 * this.width;
    this.totLvlTile = 50;
    this.offViewLvlWidth = this.totLvlTile * Constants.TILE_SIZE - this.width;

    // Monitor FPS
    this.frameCount = 0;
    this.updateCount = 0;
    this.currentFrameCount = 0;
    this.currentUpdateCount = 0;

    this.lastFpsCheck = performance.now();

    this.loop(0);
  }

  getPlayer() {
    return this.player;
  }

  init() {
    // Canvas size
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;

    // Other Game objects.
    this.levelManager = new LevelManager();
    this.player = new Player(200, 300);
    this.keyBoardInputs = new KeyBoardInputs(this.player);
    this.mouseInputs = new MouseInput(this.player);
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.levelManager.draw(this.ctx, this.XlvlOffset);

    this.player.draw(this.ctx, this.XlvlOffset);
    this.player.loadLevelData(getLevelData(this.levelManager.levelDataImg));

    this.ctx.beginPath();
    this.ctx.font = "bold 12px sans-serif";
    this.ctx.fillText(
      `FPS: ${this.currentFrameCount}, UPS: ${this.currentUpdateCount}`,
      3,
      12
    );
    this.ctx.closePath();
  }

  checkBorders() {
    const playerX = this.player.hitbox.x;
    const diff = playerX - this.XlvlOffset;

    if (diff > this.rightBorder) this.XlvlOffset += diff - this.rightBorder;
    if (diff < this.leftBorder) this.XlvlOffset += diff - this.leftBorder;

    if (this.XlvlOffset < 0) this.XlvlOffset = 0;
    if (this.XlvlOffset > this.offViewLvlWidth) {
      this.XlvlOffset = this.offViewLvlWidth;
    }
  }

  update() {
    this.player.update();
    this.checkBorders();
  }

  loop = (currentTimeStamp) => {
    const deltatime = currentTimeStamp - this.lastCheckTime;
    this.lastCheckTime = currentTimeStamp;

    this.deltaFrame += deltatime;
    this.deltaUpdate += deltatime;

    if (this.deltaFrame > this.timePerFrame) {
      this.deltaFrame -= this.timePerFrame;
      this.frameCount++;
      this.render();
    }

    while (this.deltaUpdate > this.timePerUpdate) {
      this.deltaUpdate -= this.timePerUpdate;
      this.updateCount++;
      this.update();
    }

    if (currentTimeStamp - this.lastFpsCheck >= 1000) {
      console.log(`FPS: ${this.frameCount}, UPS: ${this.updateCount}`);
      this.currentFrameCount = this.frameCount;
      this.currentUpdateCount = this.updateCount;
      this.frameCount = this.updateCount = 0;
      this.lastFpsCheck = currentTimeStamp;
    }

    requestAnimationFrame(this.loop);
  };
}
