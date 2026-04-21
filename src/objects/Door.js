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
    this.exitCountTimer = 300;
    
    this.countdownTimer = Constants.Door.FRAME_SPEED;
    this.player = player;
    
    this.initHitbox(
      x,
      y - Constants.Door.DOOR_HEIGHT,
      Constants.Door.DOOR_WIDTH,
      Constants.Door.DOOR_HEIGHT
    );
    
    this.hitbox.y =
    GetEntityYPosUnderRoofOrAboveFloor(this.hitbox) + 3 * Constants.SCALE;
    
    // Making the position of the player relevant to that of the exit door.
    if(this.doorType == 1) {
      this.player.hitbox.x = this.hitbox.x;
      this.player.hitbox.y = this.hitbox.y; 
    }

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

    if (this.doorType == 0) {
      if (this.hitbox.intersects(this.player.hitbox)) {
        console.log("entry door");
        if (this.player.enterDoor) {
          this.opening = true;
          this.player.stopKeyPressMethod();
        }
      }
    } else {
      if (this.hitbox.intersects(this.player.hitbox)) {
        console.log("exit door");
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

        if (this.doorType == 0) {
          if (this.player.stopAnimation) {
            this.closing = true;
            this.opening = false; 
            return;
          }
        } else {
          if (this.player.startAnimation) {
            this.closing = true;
            this.opening = false; 
            return;
          }
        }

        if (this.opening) {
          this.frameX = Constants.Door.getSpriteAmount(this.objectState);

          if (this.doorType == 0) {
            this.player.enterTheDoor();
          } else {
            if (this.canExit) this.player.exitTheDoor();
          }
        }
      }
    }
  }

  draw(ctx, XlvlOffset, YlvlOffset) {
    if (this.objectImg == null) return;

    ctx.save();
    
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      this.objectImg,
      this.frameX * this.width,
      this.objectState * this.height,
      this.width,
      this.height,
      this.hitbox.x - this.hitbox.width / 2 - XlvlOffset,
      this.hitbox.y - this.height + 3 * Constants.SCALE - YlvlOffset,
      this.width * Constants.SCALE,
      this.height * Constants.SCALE
    );
    ctx.restore();

    // this.drawHitbox(ctx, XlvlOffset, YlvlOffset);
  }
}
