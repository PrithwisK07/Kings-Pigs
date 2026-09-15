import Constants from "../utilities/Constants.js";
import Levels from "./Levels.js";
import {
  getSpriteAtlas, getLevelData, getBoxes, getKingPigs,
  getPigThrowingBoxes, getPigs, getCannons, getPigWithMatches,
  getPigThrowingBombs, getBombs, getDoors,
  getPalmTreeStanding, getPalmTreeZ, getWater,
  getSpikes
} from "../utilities/LoadSave.js";

export default class LevelManager {
  constructor(player, game, currentLevel) {
    this.tileSetImgPath = null;
    this.levelDataImgPath = null;
    this.game = game;
    this.player = player;
    this.levelData = null;
    this.levelName = currentLevel || 1; 
    this.door = [];
    this.shakeTime = 0;
    this.shakeIntensity = 0;
    this.activeBoxes = [];
    this.activeBombs = [];
    this.palmTreeStanding = [];
    this.palmTreeZ = [];
    this.water = [];
    this.spikes = [];

    this.levels = new Levels(this, this.player);
    this.tileSetImg = null;
    this.levelDataImg = null;
    this.levelSprite = [];
    this.altCanvas = document.createElement("canvas");
  }

  async init(onProgress) { 
    if(onProgress) onProgress(10, "Mapping the terrain...");
    await this.levels.getLevelImgPath(this.levelName);

    if(onProgress) onProgress(30, "Painting the tiles...");
    await this.loadTileMap();
    this.loadLevel();

    if(onProgress) onProgress(50, "Summoning enemies...");
    this.game.kingPigs = await getKingPigs(this.levelDataImg);
    this.game.pigs = await getPigs(this.levelDataImg);
    this.game.pigThrowingBoxes = await getPigThrowingBoxes(this.levelDataImg);
    this.game.pigWithMatches = await getPigWithMatches(this.levelDataImg);
    this.game.pigThrowingBombs = await getPigThrowingBombs(this.levelDataImg);
    
    if(onProgress) onProgress(70, "Placing cannons and objects...");
    this.player.loadLevelData(this.levelData);
    this.boxes = await getBoxes();
    this.cannons = await getCannons();
    this.bombs = await getBombs();
    this.door = await getDoors();
    this.palmTreeStanding = await getPalmTreeStanding();
    this.palmTreeZ = await getPalmTreeZ();
    this.water = await getWater();
    this.spikes = await getSpikes();

    if(onProgress) onProgress(90, "Waking up the King Pig...");
    this.game.boxes = this.boxes;
    this.game.bombs = this.bombs;
    this.game.cannons = this.cannons;
    this.game.palmTreeStanding = this.palmTreeStanding;
    this.game.palmTreeZ = this.palmTreeZ;
    this.game.water = this.water;
    this.game.spikes = this.spikes;

    this.game.kingPigs.forEach((kp) => kp.loadLevelData(this.levelData));
    this.game.pigs.forEach((p) => p.loadLevelData(this.levelData));
    this.game.pigThrowingBoxes.forEach((p) => p.loadLevelData(this.levelData, this.boxes));
    this.game.pigWithMatches.forEach((p) => p.loadLevelData(this.levelData));
    this.game.pigThrowingBombs.forEach((p) => p.loadLevelData(this.levelData));
    this.cannons.forEach((cannon) => cannon.loadLevelData(this.levelData));

    if(onProgress) onProgress(100, "Ready!");
  }

  async loadTileMap() {
    this.tileSetImg = await getSpriteAtlas(this.tileSetImgPath);
    this.levelDataImg = await getSpriteAtlas(this.levelDataImgPath);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.height = canvas.width = Constants.OG_TILE_SIZE;

    this.levelData = getLevelData(this.levelDataImg, this.player, this);

    for (let i = 0; i < 8; i++) {
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
        const tileID = this.levelData[i][j];

        if (tileID !== 255) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            this.levelSprite[tileID],
            Math.floor(j * Constants.TILE_SIZE),
            Math.floor(i * Constants.TILE_SIZE),
            Constants.TILE_SIZE,
            Constants.TILE_SIZE
          );
        }
      }
    }
  }

  triggerShake(duration, intensity) {
    this.shakeTime = duration;
    this.shakeIntensity = intensity;
  }

  draw(ctx, XlvlOffset, YlvlOffset) {
    ctx.imageSmoothingEnabled = false;

    let offsetX = 0;
    let offsetY = 0;

    if (this.shakeTime > 0) {
      offsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      offsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      this.shakeTime--;
    }

    ctx.save();
    ctx.translate(offsetX, offsetY);

    ctx.drawImage(
      this.altCanvas,
      XlvlOffset,
      YlvlOffset,
      ctx.canvas.width,
      ctx.canvas.height,
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );

    this.door.forEach((d) => {
      d.draw(ctx, XlvlOffset, YlvlOffset);
    });

    if (this.boxes)
      this.boxes.forEach((box) => {
        box.draw(ctx, XlvlOffset, YlvlOffset);
      });

    if (this.cannons)
      this.cannons.forEach((cannon) => {
        cannon.draw(ctx, XlvlOffset, YlvlOffset);
      });

    if (this.bombs)
      this.bombs.forEach((bomb) => {
        bomb.draw(ctx, XlvlOffset, YlvlOffset);
      });

    if(this.palmTreeStanding)
      this.palmTreeStanding.forEach((palmTree) => {
        palmTree.draw(ctx, XlvlOffset, YlvlOffset);
      })

    if(this.palmTreeZ)
      this.palmTreeZ.forEach((palmTree) => {
        palmTree.draw(ctx, XlvlOffset, YlvlOffset);
      }) 

    if(this.water) {
      this.water.forEach((w) => {
        w.draw(ctx, XlvlOffset, YlvlOffset);
      })
    }
    
    if(this.spikes) {
      this.spikes.forEach((spike) => {
        spike.draw(ctx, XlvlOffset, YlvlOffset);
      })
    }

    if (this.activeBombs)
      this.activeBombs.forEach((bomb) => {
        bomb.draw(ctx, XlvlOffset, YlvlOffset);
      });

    if (this.activeBoxes)
      this.activeBoxes.forEach((box) => {
        box.draw(ctx, XlvlOffset, YlvlOffset);
      });

    ctx.restore();
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

    if(this.palmTreeStanding)
      this.palmTreeStanding.forEach((palmTree) => {
        palmTree.update();
      }) 

    if(this.palmTreeZ)
      this.palmTreeZ.forEach((palmTree) => {
        palmTree.update();
      }) 

    if(this.water) {
      this.water.forEach((w) => {
        w.update();
      })
    }
    
    if(this.spikes) {
      this.spikes.forEach((spike) => {
        spike.update();
      })
    }

    if (this.activeBombs) {
      this.activeBombs.forEach((bomb) => {
        bomb.update();
      });
      this.activeBombs = this.activeBombs.filter(bomb => bomb.active);
    }

    if (this.activeBoxes) {
      this.activeBoxes.forEach((box) => {
        box.update();
      });
      this.activeBoxes = this.activeBoxes.filter(box => box.active);
    }
  }
}
