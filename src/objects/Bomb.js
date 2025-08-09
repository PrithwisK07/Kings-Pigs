import Constants from "../utilities/Constants.js";
import {
  canMoveHere,
  GetEntityYPosUnderRoofOrAboveFloor,
} from "../utilities/HelperMethods.js";
import { getSpriteAtlas } from "../utilities/LoadSave.js";
import Object from "./Object.js";

export default class Bomb extends Object {
  constructor(x, y, flip, levelManager) {
    super(x, y, Constants.Bomb.BOMB_WIDTH, Constants.Bomb.BOMB_HEIGHT);

    this.levelManager = levelManager;

    this.flip = flip ? false : true;
    this.pause = false;
    this.canDraw = true;

    this.initHitbox(
      x,
      y,
      (Constants.Bomb.BOMB_WIDTH / 4) * Constants.SCALE,
      (Constants.Bomb.BOMB_HEIGHT / 4) * Constants.SCALE
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

    this.loadImg(Constants.Bomb.BOMB_SRC);

    this.gravity = 0.025;
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
      this.hitbox.x - this.width / 1.35 - XlvlOffset + 1,
      this.hitbox.y - this.height / 1.2,
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
