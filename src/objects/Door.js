import Constants from "../utilities/Constants.js";
import Object from "../objects/Object.js";
import { GetEntityYPosUnderRoofOrAboveFloor } from "../utilities/HelperMethods.js";

// 1: Exit Door Only.
// 0: Entry Door Only.

export default class Door extends Object {
  constructor(x, y, player, doorType) {
    super(x, y, Constants.Door.DOOR_WIDTH, Constants.Door.DOOR_HEIGHT);

    this.doorType = doorType;

    this.opening = false;
    this.closing = false;
    this.stopAnimation = false;

    this.canExit = false;
    this.exitCountdown = 0;
    this.exitCountTimer = 400;

    this.player = player;

    this.initHitbox(
      x,
      y,
      Constants.Door.DOOR_WIDTH,
      Constants.Door.DOOR_HEIGHT
    );

    this.hitbox.y =
      GetEntityYPosUnderRoofOrAboveFloor(this.hitbox) + 8.35 * Constants.SCALE;

    this.loadImg(Constants.Door.DOOR_IMG_SRC);
  }

  update() {
    if (this.stopAnimation) return;

    if (!this.canExit) this.updateExitCountdown();

    this.updateAnimationTick();

    this.checkCollision();

    this.setAnimation();
  }

  updateExitCountdown() {
    this.exitCountdown++;
    if (this.exitCountdown >= this.exitCountTimer) {
      this.exitCountdown = 0;
      this.canExit = true;
    }
  }

  checkCollision() {
    if (this.player.stopAnimation) {
      return;
    }

    if (this.doorType == 0) console.log("Hi");

    if (this.doorType == 0) {
      if (this.hitbox.intersects(this.player.hitbox)) {
        if (this.player.enterDoor) {
          this.opening = true;
          console.log("opening");
        }
      }
    } else {
      if (this.hitbox.intersects(this.player.hitbox)) {
        if (this.player.exitDoor) {
          this.opening = true;
        }
      }
    }
  }

  setAnimation() {
    this.lastObjectState = this.objectState;

    this.objectState = Constants.Door.IDLE;

    if (this.closing) {
      this.objectState = Constants.Door.CLOSE;
      return;
    }

    if (this.opening) {
      this.objectState = Constants.Door.OPEN;
    }

    if (this.lastObjectState != this.objectState) {
      this.frameX = 0;
      this.countdown = 0;
    }
  }

  updateAnimationTick() {
    this.countdown++;

    if (this.countdown >= this.countdownTimer) {
      this.countdown = 0;
      this.frameX++;

      if (this.frameX >= Constants.Door.getSpriteAmount(this.objectState)) {
        this.frameX = 0;

        if (this.closing) {
          this.closing = false;
          this.frameX = Constants.Door.getSpriteAmount(this.objectState);
          this.stopAnimation = true;
        }

        if (this.player.stopAnimation || this.player.startAnimation) {
          this.closing = true;
          return;
        }

        if (this.opening) {
          this.frameX = Constants.Door.getSpriteAmount(this.objectState);

          if (this.doorType == 0) this.player.enterTheDoor();
          else {
            if (this.canExit) this.player.exitTheDoor();
          }

          this.opening = false;
        }
      }
    }
  }

  draw(ctx, XlvlOffset) {
    ctx.save();

    // this.drawHitbox(ctx, XlvlOffset);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      this.objectImg,
      this.frameX * this.width,
      this.objectState * this.height,
      this.width,
      this.height,
      this.hitbox.x - this.hitbox.width - XlvlOffset,
      this.hitbox.y,
      this.width * Constants.SCALE,
      this.height * Constants.SCALE
    );
    ctx.restore();
  }
}
