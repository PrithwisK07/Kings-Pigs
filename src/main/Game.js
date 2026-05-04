import Player from "../entities/Player.js";
import KeyBoardInputs from "../inputs/KeyBoardInputs.js";
import MouseInput from "../inputs/MouseInput.js";
import LevelManager from "../level/LevelManager.js";
import Constants from "../utilities/Constants.js";

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

    // Scroll offset - X-axis
    this.XlvlOffset = 0;
    this.rightBorder = 0.8 * this.width;
    this.leftBorder = 0.2 * this.width;
    this.totLvlTile = 50;
    this.offViewLvlWidth = this.totLvlTile * Constants.TILE_SIZE - this.width;
    
    // Scroll offset - Y-axis
    this.YlvlOffset = 0;
    this.topBorder = 0.2 * this.height;
    this.bottomBorder = 0.8 * this.height;
    this.totLvlTile = 50;
    this.offViewLvlHeight = this.totLvlTile * Constants.TILE_SIZE - this.height;

    // Monitor FPS
    this.frameCount = 0;
    this.updateCount = 0;
    this.currentFrameCount = 0;
    this.currentUpdateCount = 0;

    this.lastFpsCheck = performance.now();

    // Entities 
    this.kingPigs = [];
    this.pigs = [];
    this.pigThrowingBoxes = [];
    this.pigWithMatches = [];
    this.pigThrowingBombs = [];

    // Objects
    this.cannons = [];
    this.boxes = [];
    this.bombs = [];
    
    this.loop(0);
  }
  
  async init() {
    // Canvas size
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;

    const urlParams = new URLSearchParams(window.location.search);

    this.currentLevel = parseInt(urlParams.get("level")) || 1;
    console.log(`🎮 Initializing Game with Level ${this.currentLevel}`);

    this.player = new Player(230, 300, this);
    this.levelManager = new LevelManager(this.player, this, this.currentLevel);

    const fillBar = document.getElementById("load-fill");
    const statusText = document.getElementById("load-status");

    const updateProgress = (percent, text) => {
      if (fillBar) fillBar.style.width = `${percent}%`;
      if (statusText) statusText.innerText = text;
    };

    await this.levelManager.init(updateProgress); 

    setTimeout(() => {
      const loader = document.getElementById("loading-screen");
      if (loader) {
        loader.style.opacity = "0"; 
        setTimeout(() => loader.style.display = "none", 400); 
      }
      
      this.keyBoardInputs = new KeyBoardInputs(this.player);
      this.mouseInputs = new MouseInput(this.player);
      
    }, 500);
  }
  
  getPlayer() {
    return this.player;
  }

  getPigs() {
    return this.pigs;
  }

  getKingPigs() {
    return this.kingPigs;
  }

  getPigThrowingBoxes() {
    return this.pigThrowingBoxes;
  }

  getPigWithMatches() {
    return this.pigWithMatches;
  }

  getBombs() {
    return this.bombs;
  }

  getBoxes() {
    return this.boxes;
  }

  getCannons() {
    return this.cannons;
  }


  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.levelManager.draw(this.ctx, this.XlvlOffset, this.YlvlOffset);

    if(this.player.active) this.player.draw(this.ctx, this.XlvlOffset, this.YlvlOffset);

    this.kingPigs.forEach((kp) => {
      if(kp.active) kp.draw(this.ctx, this.XlvlOffset, this.YlvlOffset);
    });

    this.pigs.forEach((p) => {
      if(p.active) p.draw(this.ctx, this.XlvlOffset, this.YlvlOffset);
    });

    this.pigThrowingBoxes.forEach((p) => {
      if(p.active) p.draw(this.ctx, this.XlvlOffset, this.YlvlOffset);
    });

    this.pigWithMatches.forEach((p) => {
      if(p.active) p.draw(this.ctx, this.XlvlOffset, this.YlvlOffset);
    });

    this.pigThrowingBombs.forEach((p) => {
      if(p.active) p.draw(this.ctx, this.XlvlOffset, this.YlvlOffset);
    });

    this.ctx.beginPath();
    this.ctx.fillStyle = "white";
    this.ctx.font = "bold 14px sans-serif";
    this.ctx.fillText(
      `FPS: ${this.currentFrameCount}, UPS: ${this.currentUpdateCount}`,
      3,
      12
    );
    this.ctx.closePath();
  }

  checkBordersX() {
    const playerX = this.player.hitbox.x;
    const diff = playerX - this.XlvlOffset;

    if (diff > this.rightBorder) this.XlvlOffset += diff - this.rightBorder;
    if (diff < this.leftBorder) this.XlvlOffset += diff - this.leftBorder;

    if (this.XlvlOffset < 0) this.XlvlOffset = 0;
    if (this.XlvlOffset > this.offViewLvlWidth) {
      this.XlvlOffset = this.offViewLvlWidth;
    }
  }
  
  checkBordersY() {
    const playerY = this.player.hitbox.y;
    const diff = playerY - this.YlvlOffset;

    if (diff > this.bottomBorder) this.YlvlOffset += diff - this.bottomBorder;
    if (diff < this.topBorder) this.YlvlOffset += diff - this.topBorder;

    if (this.YlvlOffset < 0) this.YlvlOffset = 0;
    if (this.YlvlOffset > this.offViewLvlHeight) {
      this.YlvlOffset = this.offViewLvlHeight;
    }
  }

  update() {
    this.levelManager.update();

    if(this.player.active) this.player.update();

    this.kingPigs.forEach((kp) => {
      if(kp.active) kp.update();
    });

    this.pigs.forEach((p) => {
      if(p.active) p.update();
    });

    this.pigThrowingBoxes.forEach((p) => {
      if(p.active) p.update();
    });

    this.pigWithMatches.forEach((p) => {
      if(p.active) p.update();
    });

    this.pigThrowingBombs.forEach((p) => {
      if(p.active) p.update();
    });

    this.checkBordersX();
    this.checkBordersY();
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
