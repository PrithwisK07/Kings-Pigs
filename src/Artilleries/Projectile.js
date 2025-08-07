import Object from "../objects/Object.js";
import Constants from "../utilities/Constants.js";
import { canMoveHere } from "../utilities/HelperMethods.js";
import { getSpriteAtlas } from "../utilities/LoadSave.js";

export default class Projectile extends Object {
  constructor(x, y, levelData) {
    super(
      x,
      y,
      Constants.Projectile.PROJECTILE_WIDTH,
      Constants.Projectile.PROJECTILE_HEIGHT
    );

    this.levelData = levelData;

    this.initHitbox(
      x + Constants.Projectile.PROJECTILE_WIDTH / 1.2,
      y + Constants.Projectile.PROJECTILE_HEIGHT / 1.1,
      (Constants.Projectile.PROJECTILE_WIDTH * Constants.SCALE) / 3.75,
      (Constants.Projectile.PROJECTILE_HEIGHT * Constants.SCALE) / 2.5
    );

    this.loadImg(Constants.Projectile.PROJECTILE_SRC);

    this.explosion = false;
    this.loadExplosionImg();
    this.explosionPos = {
      x: 0,
      y: 0,
    };

    this.countdownTimer = Constants.PigWithMatch.FRAME_SPEED;

    this.gravity = 0.01;
    this.ySpeed = 0;
    this.gravityEnabled = false;
    this.distanceTraveled = 0;
  }

  async loadExplosionImg() {
    this.explosionImg = await getSpriteAtlas(
      Constants.Projectile.EXPLOSION_SRC
    );
  }

  draw(ctx, XlvlOffset) {
    if (!this.objectImg || !this.levelData) return;

    console.log(this.explosion);
    if (this.explosion) {
      this.drawExplosion(ctx, XlvlOffset);
      return;
    }

    // this.drawHitbox(ctx, XlvlOffset);

    ctx.drawImage(
      this.objectImg,
      0 * this.width,
      0 * this.height,
      this.width,
      this.height,
      this.hitbox.x -
        Constants.Projectile.PROJECTILE_WIDTH / 0.975 -
        XlvlOffset,
      this.hitbox.y - Constants.Projectile.PROJECTILE_HEIGHT / 1.1,
      this.width * Constants.SCALE,
      this.height * Constants.SCALE
    );
  }

  update(Cannon, left) {
    this.updatePosition(Cannon, left);
    if (this.gravityEnabled) {
      this.updatePositionY(Cannon);
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
      }
    }
  }

  updatePosition(Cannon, left) {
    const xSpeed = left
      ? -Constants.Projectile.PROJECTILE_SPEED
      : Constants.Projectile.PROJECTILE_SPEED;

    this.updatePositionX(Cannon, xSpeed);
  }

  updatePositionX(Cannon, xSpeed) {
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

      if (this.distanceTraveled >= 100) {
        this.gravityEnabled = true;
      }
    } else {
      this.explosion = true;
      Cannon.projectileActive = false;
      this.explosionPos = {
        x: this.hitbox.x,
        y: this.hitbox.y,
      };
    }
  }

  updatePositionY(Cannon) {
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
      this.explosion = true;
      Cannon.projectileActive = false;
      this.explosionPos = {
        x: this.hitbox.x,
        y: this.hitbox.y,
      };
    }
  }

  drawExplosion(ctx, XlvlOffset) {
    console.log(this.explosionImg);
    ctx.drawImage(
      this.explosionImg,
      this.frameX * this.width,
      0 * this.height,
      Constants.Projectile.EXPLOSION_WIDTH,
      Constants.Projectile.EXPLOSION_HEIGHT,
      this.explosionPos.x - XlvlOffset,
      this.explosionPos.y,
      Constants.Projectile.EXPLOSION_WIDTH * Constants.SCALE,
      Constants.Projectile.EXPLOSION_HEIGHT * Constants.SCALE
    );
  }
}
