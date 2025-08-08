import Constants from "../utilities/Constants.js";
import {
  canMoveHere,
  GetEntityYPosUnderRoofOrAboveFloor,
} from "../utilities/HelperMethods.js";
import Object from "./Object.js";

export default class Bomb extends Object {
  constructor(x, y) {
    super(x, y, Constants.Bomb.BOMB_WIDTH, Constants.Bomb.BOMB_HEIGHT);

    this.active = false;
    this.pause = false;

    this.canDraw = true;

    this.initHitbox(
      x,
      y,
      (Constants.Bomb.BOMB_WIDTH / 4) * Constants.SCALE,
      (Constants.Bomb.BOMB_HEIGHT / 4) * Constants.SCALE
    );

    this.objectState = Constants.Bomb.IDLE;
    this.hitbox.y = GetEntityYPosUnderRoofOrAboveFloor(this.hitbox, 1);

    this.loadImg(Constants.Bomb.BOMB_SRC);
  }

  update(left) {
    this.updatePosition(left);
    if (this.gravityEnabled) {
      this.updatePositionY(Cannon);
    }

    if (this.explosion) this.updateAnimationtick(Cannon);
  }

  updateAnimationtick(Cannon) {
    this.countdown++;
    if (this.countdown >= this.countdownTimer) {
      this.countdown = 0;
      this.frameX++;
      if (this.frameX >= Constants.Projectile.getSpriteAmount()) {
        this.frameX = 0;
        this.explosion = false;
        Cannon.projectileActive = false;
      }
    }
  }

  updatePosition(left) {
    const xSpeed = left
      ? -Constants.Projectile.PROJECTILE_SPEED
      : Constants.Projectile.PROJECTILE_SPEED;

    this.updatePositionX(xSpeed);
  }

  updatePositionX(xSpeed) {
    if (
      canMoveHere(
        this.hitbox.x + xSpeed,
        this.hitbox.y,
        this.hitbox.width,
        this.hitbox.height,
        this.levelData
      )
    ) {
      this.hitbox.x += xSpeed;
      this.distanceTraveled += Math.abs(xSpeed);

      if (this.distanceTraveled >= Math.random() * 100 + 50) {
        this.gravityEnabled = true;
      }
    } else {
      if (!this.explosion) {
        this.explosion = true;
        this.explosionPos = {
          x: this.hitbox.x,
          y: this.hitbox.y,
        };
      }
    }
  }

  updatePositionY() {
    this.ySpeed += this.gravity;

    if (
      canMoveHere(
        this.hitbox.x,
        this.hitbox.y + this.ySpeed,
        this.hitbox.width,
        this.hitbox.height,
        this.levelData
      )
    ) {
      this.hitbox.y += this.ySpeed;
    } else {
      if (!this.explosion) {
        this.explosion = true;
        this.explosionPos = {
          x: this.hitbox.x,
          y: this.hitbox.y,
        };
      }
    }
  }

  draw(ctx, XlvlOffset) {
    if (this.pause) return;

    if (!this.objectImg) return;
    if (!this.canDraw) return;

    // this.drawHitbox(ctx, XlvlOffset);

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

  setLevelData(levelData) {
    this.levelData = levelData;
  }
}
