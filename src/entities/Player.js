import Entity from "./entity.js";
import { getSpriteAtlas } from "../utilities/LoadSave.js";
import Constants from "../utilities/Constants.js";
import {
  canMoveHere,
  GetEntityXPosNextToWall,
  GetEntityYPosUnderRoofOrAboveFloor,
  isEntityOnFloor,
} from "../utilities/HelperMethods.js";

export default class Player extends Entity {
  constructor(x, y, game) {
    super(x, y, Constants.Player.PLAYER_WIDTH, Constants.Player.PLAYER_HEIGHT);

    this.lastEntityState = this.entityState = Constants.Player.IDLE;

    this.game = game;

    this.doorIn = false;
    this.doorOut = false;
    this.death = false;
    this.gettingHit = false;
    this.attack = false;
    this.left = false;
    this.right = false;
    this.onGround = true;
    this.jumping = false;
    this.flip = false;
    this.inAir = true;
    this.hasRecoiled = false;
    this.enterDoor = false;
    this.exitDoor = true;
    this.stopAnimation = false;

    this.startAnimation = false;

    this.canDraw = false;

    this.exitedDoor = false;
    this.enteredDoor = false;

    this.stopKeyPress = true;

    this.ySpeed = 0;
    this.gravity = 0.05;
    // this.jumpSpeed = -1.95 * Constants.SCALE;
    this.jumpSpeed = -2.3 * Constants.SCALE;
    this.fallSpeedAfterCollision = 0.2 * Constants.SCALE;

    this.countdown = 0;
    this.countdownTimer = Constants.Player.FRAME_SPEED;

    this.initHitbox(
      x,
      y,
      (this.width / 4) * Constants.SCALE,
      (this.height / 2) * Constants.SCALE
    );

    this.loadImage();

    this.levelData = null;
  }

  async loadImage() {
    try {
      this.playerImg = await getSpriteAtlas(Constants.Player.PLAYER_IMG_SRC);
    } catch (error) {
      console.log(error.message);
    }
  }

  draw(ctx, XlvlOffset) {
    if (!this.levelData) return;
    if (!this.playerImg) return;

    if (!this.canDraw) return;

    if (this.stopAnimation) return;

    // this.drawHitbox(ctx);

    ctx.save();
    this.flip ? ctx.scale(-1, 1) : ctx.scale(1, 1);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      this.playerImg,
      this.frameX * this.width + 1,
      this.entityState * this.height + 1,
      this.width,
      this.height,
      this.flip
        ? -this.hitbox.x - this.hitbox.width - 21 * Constants.SCALE + XlvlOffset
        : this.hitbox.x - this.hitbox.width - 1 * Constants.SCALE - XlvlOffset,
      this.hitbox.y - this.hitbox.height / 2 + 1.5 * Constants.SCALE,
      this.width * Constants.SCALE,
      this.height * Constants.SCALE
    );
    ctx.restore();
  }

  exitTheDoor() {
    this.exitedDoor = true;
    this.canDraw = true;
  }

  enterTheDoor() {
    this.enteredDoor = true;
  }

  update() {
    if (!this.levelData) return;
    if (this.stopAnimation) return;

    this.setAnimation();
    this.updatePosition();

    if (this.entityState === Constants.Player.ATTACK) {
      const recoilStrength = 0.5 * Constants.SCALE;

      if (this.flip) {
        this.updateXPos(recoilStrength);
      } else {
        this.updateXPos(-recoilStrength);
      }
    }

    if (
      this.entityState === Constants.Player.ATTACK &&
      !this.hasRecoiled &&
      !this.inAir
    ) {
      const jumpStrength = -1 * Constants.SCALE;

      this.ySpeed = jumpStrength;
      this.inAir = true;

      this.hasRecoiled = true;
    }

    if (this.entityState !== Constants.Player.ATTACK) {
      this.hasRecoiled = false;
    }

    this.updateAnimationTick();
  }

  setAnimation() {
    this.lastEntityState = this.entityState;

    if (this.entityState === Constants.Player.ATTACK) {
      return;
    }

    this.entityState = Constants.Player.IDLE;

    if (this.inAir)
      if (this.ySpeed < 0) this.entityState = Constants.Player.JUMP;
      else this.entityState = Constants.Player.FALL;

    if ((this.left || this.right) && !this.inAir) {
      this.entityState = Constants.Player.RUNNING;
    }

    if (this.attack) {
      this.entityState = Constants.Player.ATTACK;
    }

    if (this.exitedDoor) this.entityState = Constants.Player.DOOR_OUT;

    if (this.enteredDoor) this.entityState = Constants.Player.DOOR_IN;

    if (this.lastEntityState != this.entityState) {
      this.frameX = 0;
      this.countdown = 0;
    }
  }

  updatePosition() {
    if (this.jumping) this.jump(this.jumpSpeed);

    if (!this.left && !this.right && !this.inAir && !this.gettingHit) return;

    if (!this.inAir)
      if (!isEntityOnFloor(this.hitbox, this.levelData)) this.inAir = true;

    if (this.inAir) {
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
        this.ySpeed += this.gravity;
      } else {
        this.hitbox.y = GetEntityYPosUnderRoofOrAboveFloor(
          this.hitbox,
          this.ySpeed
        );

        if (this.ySpeed > 0) {
          this.inAir = false;
          this.ySpeed = 0;
        } else {
          this.ySpeed = this.fallSpeedAfterCollision;
        }
      }
    }

    if (this.left) {
      this.updateXPos(-Constants.Player.PLAYER_SPEED);
      this.flip = true;
    }
    if (this.right) {
      this.updateXPos(Constants.Player.PLAYER_SPEED);
      this.flip = false;
    }
  }

  updateXPos(xSpeed2) {
    if (
      canMoveHere(
        this.hitbox.x + xSpeed2,
        this.hitbox.y,
        this.hitbox.width,
        this.hitbox.height,
        this.levelData
      )
    ) {
      this.hitbox.x += xSpeed2;
    } else {
      this.hitbox.x = GetEntityXPosNextToWall(this.hitbox, xSpeed2);
    }
  }

  jump(jumpSpeed) {
    if (this.inAir) return;
    this.inAir = true;
    this.ySpeed = jumpSpeed;
  }

  updateAnimationTick() {
    this.countdown++;

    if (this.countdown >= this.countdownTimer) {
      this.countdown = 0;

      this.frameX++;

      if (this.frameX >= Constants.Player.getSpriteAmount(this.entityState)) {
        if (this.entityState === Constants.Player.DOOR_IN) {
          this.stopAnimation = true;
        }

        if (this.entityState === Constants.Player.DOOR_OUT) {
          this.exitDoor = false;
          this.exitedDoor = false;
          this.startAnimation = true;
          this.stopKeyPress = false;
        }

        this.frameX = 0;
        this.attack = false;
        this.entityState = Constants.Player.IDLE;
      }
    }
  }

  stopKeyPressMethod() {
    this.stopKeyPress = true;
    this.left = false;
    this.right = false;
  }

  keyPressed(key) {
    if (this.stopKeyPress) return;

    switch (key) {
      case "a":
      case "ArrowLeft":
        this.left = true;
        break;
      case "d":
      case "ArrowRight":
        this.right = true;
        break;
      case "w":
      case "ArrowUp":
        this.enterDoor = true;
        break;
      case " ":
        this.jumping = true;
        break;
      default:
        break;
    }
  }

  keyReleased(key) {
    switch (key) {
      case "a":
      case "ArrowLeft":
        this.left = false;
        break;
      case "d":
      case "ArrowRight":
        this.right = false;
        break;
      case " ":
        this.jumping = false;
        break;
      default:
        break;
    }
  }

  mouseClicked(mouse) {
    switch (mouse) {
      case 0:
        if (!this.attack && this.entityState !== Constants.Player.ATTACK) {
          this.attack = true;
        }
        break;
      default:
        break;
    }
  }

  loadLevelData(levelData) {
    this.levelData = levelData;
  }
}
