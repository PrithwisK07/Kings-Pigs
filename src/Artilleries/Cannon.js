import Constants from "../utilities/Constants.js";
import { GetEntityYPosUnderRoofOrAboveFloor } from "../utilities/HelperMethods.js";
import Object from "../objects/Object.js";
import Projectile from "./Projectile.js";

export default class Cannon extends Object {
  constructor(x, y) {
    super(x, y, Constants.Cannon.CANNON_WIDTH, Constants.Cannon.CANNON_HEIGHT);

    this.attack = false;
    this.shootProjectile = false;
    this.projectileActive = false;
    this.levelData = null;

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
      this.projectile = new Projectile(
        this.hitbox.x,
        this.hitbox.y,
        this.levelData
      );
      this.projectileActive = true;
    }
  }

  draw(ctx, XlvlOffset) {
    if (!this.objectImg) return;
    if (!this.canDraw) return;

    // this.drawHitbox(ctx, XlvlOffset);

    if (this.projectileActive) this.projectile.draw(ctx, XlvlOffset);

    ctx.drawImage(
      this.objectImg,
      this.frameX * this.width,
      this.objectState * this.height,
      this.width,
      this.height,
      this.hitbox.x - XlvlOffset + 1,
      this.hitbox.y + 5 * Constants.SCALE,
      this.hitbox.width,
      this.hitbox.height
    );
  }

  loadLevelData(levelData) {
    this.levelData = levelData;
  }
}
