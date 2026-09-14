import Player from "../entities/Player.js";
import KeyBoardInputs from "../inputs/KeyBoardInputs.js";
import MouseInput from "../inputs/MouseInput.js";
import LevelManager from "../level/LevelManager.js";
import Constants from "../utilities/Constants.js";
import { getSpriteAtlas } from "../utilities/LoadSave.js";

export default class Game {
  constructor() {
    // Canvas and context
    this.canvas = document.getElementById("game-canvas");
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
    this.totLvlTile = 40;
    this.offViewLvlWidth = this.totLvlTile * Constants.TILE_SIZE - this.width;
    
    // Scroll offset - Y-axis
    this.YlvlOffset = 0;
    this.topBorder = 0.2 * this.height;
    this.bottomBorder = 0.8 * this.height;
    this.totLvlTile = 15;
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
    this.palmTreeStanding = [];    
    this.palmTreeZ = [];    

    // Death animation
    this.deathImg = null;
    this.imagePath = "../res/Dead.png";
    
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

    this.levelComplete = false; 
    this.gameOver = false;
    this.isPaused = false;
    this.levelStartTime = Date.now(); 
    this.gemsCollected = 0; 
    this.loadImage();

    document.getElementById("btn-map")?.addEventListener("click", () => {
      window.location.href = "./level_selector.html";
    });
    
    document.getElementById("btn-replay")?.addEventListener("click", () => {
      window.location.reload(); 
    });

    document.getElementById("btn-retry")?.addEventListener("click", () => {
      window.location.reload(); 
    });

    document.getElementById("btn-menu")?.addEventListener("click", () => {
      window.location.href = "../../index.html"; 
    });

    document.getElementById("btn-pause")?.addEventListener("click", () => this.togglePause());
    document.getElementById("btn-resume")?.addEventListener("click", () => this.togglePause());
    document.getElementById("btn-pause-menu")?.addEventListener("click", () => {
      window.location.href = "./index.html"; 
    });

    window.addEventListener("keydown", (e) => {
      if ((e.key === "Escape" || e.key.toLowerCase() === "p") && !this.gameOver && !this.levelComplete) {
        this.togglePause();
      }
    });
  }
  
  async loadImage() {
    try {
      this.deathImg = await getSpriteAtlas(this.imagePath);
      console.log("image: ", this.deathImg);
    } catch (error) {
      console.log(error.message);
    }
  }
  triggerLevelComplete() {
    if (this.levelComplete) return; 
    this.levelComplete = true;

    const timeElapsed = Math.floor((Date.now() - this.levelStartTime) / 1000);
    const minutes = String(Math.floor(timeElapsed / 60)).padStart(2, "0");
    const seconds = String(timeElapsed % 60).padStart(2, "0");
    const formattedTime = `${minutes}:${seconds}`;

    let progress = JSON.parse(localStorage.getItem("kings_pigs_progress")) || {};
    
    if (!progress[this.currentLevel]) {
      progress[this.currentLevel] = { unlocked: true };
    }

    progress[this.currentLevel].time = formattedTime;
    progress[this.currentLevel].score = this.gemsCollected * 100; 
    progress[this.currentLevel].stars = 3; 

    const nextLevel = this.currentLevel + 1;
    if (!progress[nextLevel]) {
      progress[nextLevel] = { unlocked: true, stars: 0, score: 0, time: "--:--", goal: "SURVIVE" };
    } else {
      progress[nextLevel].unlocked = true;
    }

    localStorage.setItem("kings_pigs_progress", JSON.stringify(progress));

    document.getElementById("clear-time").innerText = formattedTime;
    document.getElementById("clear-gems").innerText = this.gemsCollected;
    document.getElementById("level-cleared-screen").style.display = "flex";
  }

  triggerGameOver() {
    const gameOverScreen = document.getElementById("game-over-screen");
    if (!gameOverScreen) return;
    
    gameOverScreen.style.display = "flex";

    const canvas = document.getElementById("rain-canvas");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const drops = [];
    const maxDrops = 250; 

    for (let i = 0; i < maxDrops; i++) {
      const z = Math.random() * 0.7 + 0.3; 
      
      drops.push({
        x: Math.random() * width * 1.5, 
        y: Math.random() * height,      
        z: z,
        length: (Math.random() * 15 + 10) * z,
        speed: (Math.random() * 15 + 15) * z, 
        angle: 0.35                    
      });
    }

    const drawRain = () => {
      if (!this.gameOver) return;

      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";

      for (let i = 0; i < drops.length; i++) {
        let drop = drops[i];

        ctx.beginPath();
        
        ctx.strokeStyle = `rgba(150, 180, 255, ${0.45 * drop.z})`; 
        ctx.lineWidth = 1.75 * drop.z; 

        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(
          drop.x - Math.sin(drop.angle) * drop.length,
          drop.y + Math.cos(drop.angle) * drop.length
        );
        ctx.stroke();

        drop.x -= Math.sin(drop.angle) * drop.speed;
        drop.y += Math.cos(drop.angle) * drop.speed;

        if (drop.y > height || drop.x < 0) {
          drop.x = Math.random() * width * 1.5;
          drop.y = -20;                        
        }
      }

      requestAnimationFrame(drawRain);
    };

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    drawRain();

    // Skull animation on Game over.
    const skull = document.getElementById("death-sprite-canvas");
    const deadCtx = skull.getContext("2d");
    let frameX = 0;
    
    let lastTime = 0;
    const fps = 8;
    const frameInterval = 1000 / fps; 
    let timer = 0;
    
    const skullAnimation = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      
      let deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      if (deltaTime > 100) {
        deltaTime = frameInterval; 
      }

      timer += deltaTime;

      if (timer > frameInterval) {
        const width = 128;
        const height = 128;

        deadCtx.clearRect(0, 0, width, height);
        deadCtx.imageSmoothingEnabled = false;
        
        deadCtx.drawImage(
          this.deathImg, 
          frameX * width, 
          0, 
          width, 
          height,
          0,
          0,
          width,
          height
        );

        frameX++;
        if (frameX >= 8) frameX = 0;
        
        timer = timer % frameInterval; 
      }

      requestAnimationFrame(skullAnimation);
    }

    requestAnimationFrame(skullAnimation);
  }

  togglePause() {
    if (this.gameOver || this.levelComplete) return;

    this.isPaused = !this.isPaused;
    const pauseScreen = document.getElementById("pause-screen");

    if (this.isPaused) {
      pauseScreen.style.display = "flex";
    } else {
      pauseScreen.style.display = "none";
      // Prevent massive deltaTime buildup
      this.lastCheckTime = performance.now(); 
      this.loop(performance.now()); 
    }
  }

  updateHUD() {
    // Dynamically update the visual health bar
    if (this.player && this.player.health !== undefined) {
      const healthFill = document.getElementById("hud-health");
      const maxHealth = 100; 
      const healthPercent = Math.max(0, (this.player.health / maxHealth) * 100);
      
      if (healthFill) {
        healthFill.style.width = `${healthPercent}%`;
        
        // NEW: Add a danger pulse if health is low (< 25%)
        if (healthPercent <= 25) {
          healthFill.classList.add("health-danger");
        } else {
          healthFill.classList.remove("health-danger");
        }
      }
    }
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
    if (this.isPaused) return;

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
      this.updateHUD();
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
