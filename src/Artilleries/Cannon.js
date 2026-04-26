import Constants from "../utilities/Constants.js";
import { GetEntityYPosUnderRoofOrAboveFloor } from "../utilities/HelperMethods.js";
import Object from "../objects/Object.js";
import Projectile from "./Projectile.js";

export default class Cannon extends Object {
  constructor(x, y, levelManager, player) {
    super(x, y, Constants.Cannon.CANNON_WIDTH, Constants.Cannon.CANNON_HEIGHT);

    this.attack = false;
    this.shootProjectile = false;
    this.projectileActive = false;
    this.levelData = null;

    this.levelManager = levelManager;
    this.player = player;

    this.left = true; 

    this.canDraw = true;

    this.initHitbox(
      x,
      y,
      Constants.Cannon.CANNON_WIDTH * Constants.SCALE,
      Constants.Cannon.CANNON_HEIGHT * Constants.SCALE
    );

    this.objectState = this.lastObjectState = Constants.Cannon.IDLE;

    this.countdownTimer = Constants.PigWithMatch.FRAME_SPEED;

    this.hitbox.y = GetEntityYPosUnderRoofOrAboveFloor(this.hitbox, 1);

    this.loadImg(Constants.Cannon.CANNON_SRC);
  }

  update() {
    this.updateAnimationTick();
    this.setAnimation();

    if (!this.projectileActive) return;

    this.projectile.update(this, this.left);
  }

  updateAnimationTick() {
    this.countdown++;

    if (this.countdown >= this.countdownTimer) {
      this.frameX++;
      this.countdown = 0;

      if (this.objectState == Constants.Cannon.ATTACK)
        if (this.frameX == 1) this.shootProjectile = true;

      if (this.frameX >= Constants.Cannon.getSpriteAmount(this.objectState)) {
        this.frameX = 0;

        if (this.objectState == Constants.Cannon.ATTACK) {
          this.attack = false;
        }
      }
    }
  }

  setAnimation() {
    this.lastObjectState = this.objectState;

    this.objectState = Constants.Cannon.IDLE;

    if (this.attack) {
      this.objectState = Constants.Cannon.ATTACK;
    }

    if (this.lastObjectState != this.objectState) {
      this.frameX = 0;
      this.countdown = 0;
    }
  }

  shoot() {
    if (!this.projectileActive) {
      this.attack = true;
      
      let spawnX = this.hitbox.x;
      if (!this.left) {
         spawnX = this.hitbox.x + this.hitbox.width;
      }

      this.projectile = new Projectile(
        spawnX,
        this.hitbox.y,
        this.levelData,
        this.levelManager,
        this.player
      );
      this.projectileActive = true;
    }
  }

  draw(ctx, XlvlOffset, YlvlOffset) {
    if (!this.objectImg) return;
    if (!this.canDraw) return;

    // this.drawHitbox(ctx, XlvlOffset, YlvlOffset);
    
    if (this.projectileActive) this.projectile.draw(ctx, XlvlOffset, YlvlOffset);

    ctx.save(); 
    ctx.imageSmoothingEnabled = false;

    let drawX = this.hitbox.x - XlvlOffset + 1;
    let drawY = this.hitbox.y + 5 * Constants.SCALE - YlvlOffset;

    if (!this.left) {
      ctx.scale(-1, 1);
      drawX = -drawX - this.hitbox.width;
    }

    ctx.drawImage(
      this.objectImg,
      this.frameX * this.width,
      this.objectState * this.height,
      this.width,
      this.height,
      drawX,
      drawY,
      this.hitbox.width,
      this.hitbox.height
    );

    ctx.restore(); 
  }

  loadLevelData(levelData) {
    this.levelData = levelData;
  }
}