import Constants from "../utilities/Constants.js";
import {
  canMoveHere,
  GetEntityYPosUnderRoofOrAboveFloor,
} from "../utilities/HelperMethods.js";
import Object from "./Object.js";
import { getSpriteAtlas } from "../utilities/LoadSave.js";

export default class Box extends Object {
  constructor(x, y, flip, levelManager) {
    super(x, y, Constants.Box.BOX_WIDTH, Constants.Box.BOX_HEIGHT);

    this.levelManager = levelManager;

    this.flip = flip ? false : true;
    this.pause = false;
    this.canDraw = true;

    this.initHitbox(
      x,
      y,
      Constants.Box.BOX_WIDTH * Constants.SCALE,
      Constants.Box.BOX_HEIGHT * Constants.SCALE
    );

    this.explosion = false;
    this.loadExplosionImg();
    this.explosionPos = {
      x: 0,
      y: 0,
    };

    this.countdownTimer = Constants.PigWithMatch.FRAME_SPEED;

    this.objectState = Constants.Bomb.IDLE;
    this.hitbox.y = GetEntityYPosUnderRoofOrAboveFloor(this.hitbox, 1);

    this.objectState = Constants.Box.IDLE;

    this.loadImg(Constants.Box.BOX_SRC);

    this.gravity = 0.05;
  }
  async loadExplosionImg() {
    this.explosionImg = await getSpriteAtlas(
      Constants.Projectile.EXPLOSION_SRC
    );
  }

  setProps(vx, vy) {
    this.active = true;
    this.vx = this.flip ? -vx : vx;
    this.vy = vy;
  }

  update() {
    if (!this.levelData) return;

    if (!this.active) return;

    if (
      canMoveHere(
        this.hitbox.x + this.vx,
        this.hitbox.y,
        this.hitbox.width,
        this.hitbox.height,
        this.levelData
      )
    ) {
      this.hitbox.x += this.vx;
    } else {
      this.vy = 0;
      this.vx = 0;
      if (!this.explosion) {
        this.explosion = true;
        this.explosionPos = {
          x: this.hitbox.x,
          y: this.hitbox.y,
        };
      }
    }
    this.vy += this.gravity;
    if (
      canMoveHere(
        this.hitbox.x,
        this.hitbox.y + this.vy,
        this.hitbox.width,
        this.hitbox.height,
        this.levelData
      )
    ) {
      this.hitbox.y += this.vy;
    } else {
      this.vy = 0;
      this.vx = 0;
      if (!this.explosion) {
        this.explosion = true;
        this.explosionPos = {
          x: this.hitbox.x,
          y: this.hitbox.y,
        };
      }
    }

    if (this.explosion) this.updateAnimationtick();
  }

  updateAnimationtick() {
    this.countdown++;
    if (this.countdown >= this.countdownTimer) {
      this.countdown = 0;
      this.frameX++;
      if (this.frameX >= Constants.Projectile.getSpriteAmount()) {
        this.frameX = 0;
        this.explosion = false;
        this.active = false;
        this.popActiveBombs();
      }
    }
  }

  popActiveBombs() {
    this.canDraw = false;
    this.levelManager.activeBombs.splice(
      this.levelManager.activeBombs.indexOf(this),
      1
    );
  }

  draw(ctx, XlvlOffset) {
    if (this.pause || !this.objectImg || !this.canDraw) return;

    if (this.explosion) {
      this.drawExplosion(ctx, XlvlOffset);
      return;
    }

    ctx.drawImage(
      this.objectImg,
      this.frameX * this.width,
      this.objectState * this.height,
      this.width,
      this.height,
      this.hitbox.x - XlvlOffset + 1,
      this.hitbox.y,
      this.width * Constants.SCALE,
      this.height * Constants.SCALE
    );
  }

  drawExplosion(ctx, XlvlOffset) {
    ctx.drawImage(
      this.explosionImg,
      this.frameX * Constants.Projectile.EXPLOSION_WIDTH,
      0 * Constants.Projectile.EXPLOSION_HEIGHT,
      Constants.Projectile.EXPLOSION_WIDTH,
      Constants.Projectile.EXPLOSION_HEIGHT,
      this.explosionPos.x -
        XlvlOffset -
        Constants.Projectile.EXPLOSION_WIDTH / 2 -
        2 * Constants.SCALE,
      this.explosionPos.y -
        Constants.Projectile.EXPLOSION_HEIGHT / 2 -
        2 * Constants.SCALE,
      Constants.Projectile.EXPLOSION_WIDTH * Constants.SCALE,
      Constants.Projectile.EXPLOSION_HEIGHT * Constants.SCALE
    );
  }

  loadLevelData(levelData) {
    this.levelData = levelData;
  }
}
