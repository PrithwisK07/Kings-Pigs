import Constants from "../utilities/Constants.js";
import Entity from "./entity.js";
import { getSpriteAtlas } from "../utilities/LoadSave.js";
import {
  canMoveHere,
  GetEntityXPosNextToWall,
  GetEntityYPosUnderRoofOrAboveFloor,
  isEntityOnFloor,
  detectAnySolidTile,
} from "../utilities/HelperMethods.js";

export default class KingPig extends Entity {
  constructor(x, y, player) {
    super(
      x,
      y,
      Constants.KingPig.KINGPIG_WIDTH,
      Constants.KingPig.KINGPIG_HEIGHT
    );

    this.player = player;

    this.lastEntityState = this.entityState = Constants.KingPig.IDLE;

    this.death = false;
    this.gettingHit = false;
    this.attack = false;
    this.left = false;
    this.right = false;
    this.onGround = true;
    this.jumping = false;
    this.flip = false;
    this.inAir = true;

    this.ySpeed = 0;
    this.gravity = 0.05;
    this.jumpSpeed = -1.95 * Constants.SCALE;
    this.fallSpeedAfterCollision = 0.2 * Constants.SCALE;

    this.attackCooldown = 0;
    this.chaseTimeout = 0;
    this.MAX_CHASE_TIMEOUT = 1800;

    this.countdown = 0;
    this.countdownTimer = Constants.Player.FRAME_SPEED;

    this.initHitbox(
      x,
      y,
      (this.width / 2) * Constants.SCALE,
      (this.height / 1.3) * Constants.SCALE
    );

    this.loadImage();

    this.levelData = null;
  }

  async loadImage() {
    try {
      this.kingPigImg = await getSpriteAtlas(Constants.KingPig.KINGPIG_SRC);
    } catch (error) {
      console.log(error.message);
    }
  }

  draw(ctx, XlvlOffset) {
    if (!this.levelData) return;
    if (!this.kingPigImg) return;

    // this.drawHitbox(ctx, XlvlOffset);

    ctx.save();
    this.flip ? ctx.scale(-1, 1) : ctx.scale(1, 1);
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      this.kingPigImg,
      this.frameX * this.width,
      this.entityState * this.height,
      this.width,
      this.height,
      this.flip
        ? -this.hitbox.x - this.hitbox.width * 1.55 + XlvlOffset
        : this.hitbox.x - this.hitbox.width / 1.9 - XlvlOffset,
      this.hitbox.y - this.hitbox.height / 3 + 1 * Constants.SCALE,
      this.width * Constants.SCALE,
      this.height * Constants.SCALE
    );
    ctx.restore();
  }

  update() {
    if (!this.levelData) return;

    this.setAnimation();
    this.updatePosition();

    if (this.entityState === Constants.KingPig.ATTACK) {
      const recoilStrength = 0.3 * Constants.SCALE;

      if (this.flip) {
        this.updateXPos(recoilStrength);
      } else {
        this.updateXPos(-recoilStrength);
      }
    }

    if (
      this.entityState === Constants.KingPig.ATTACK &&
      !this.hasRecoiled &&
      !this.inAir
    ) {
      const jumpStrength = -1 * Constants.SCALE;

      this.ySpeed = jumpStrength;
      this.inAir = true;

      this.hasRecoiled = true;
    }

    if (this.entityState !== Constants.KingPig.ATTACK) {
      this.hasRecoiled = false;
    }

    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.chaseTimeout > 0) this.chaseTimeout--;

    this.detectAndChasePlayer();
    this.updateAnimationTick();
  }

  detectAndChasePlayer() {
    if (!this.player || !this.levelData) return;

    const playerCenterX = this.player.hitbox.x + this.player.hitbox.width / 2;
    const pigCenterX = this.hitbox.x + this.hitbox.width / 2;
    const playerY = this.player.hitbox.y;
    const pigY = this.hitbox.y;

    const deltaX = playerCenterX - pigCenterX;
    const distanceX = Math.abs(deltaX);

    const TOLERANCE_RANGE = 200 * Constants.SCALE;
    const ATTACK_RANGE = 20 * Constants.SCALE;

    if (distanceX > TOLERANCE_RANGE) {
      if (this.chaseTimeout <= 0) {
        this.stopMoving();
      }
      return;
    }
    const canSeePlayer = this.hasLineOfSight(
      pigCenterX,
      pigY,
      playerCenterX,
      playerY
    );

    if (canSeePlayer) {
      this.chaseTimeout = this.MAX_CHASE_TIMEOUT;

      this.flip = deltaX > 0;

      if (distanceX < ATTACK_RANGE && !this.inAir) {
        if (this.hitbox.intersects(this.player.hitbox)) {
          if (this.attackCooldown === 0) {
            this.stopMoving();
            this.attack = true;
            this.attackCooldown = 75;
          }
        }
      } else {
        this.left = deltaX < 0;
        this.right = deltaX > 0;
      }
    } else {
      if (this.chaseTimeout <= 0) {
        this.stopMoving();
      }
    }
  }

  stopMoving() {
    this.left = false;
    this.right = false;
  }

  hasLineOfSight(x1, y1, x2, y2) {
    return !detectAnySolidTile(x1, y1, x2, y2, this.levelData);
  }

  setAnimation() {
    this.lastEntityState = this.entityState;

    if (this.entityState === Constants.KingPig.ATTACK) {
      return;
    }

    this.entityState = Constants.KingPig.IDLE;

    if (this.inAir)
      if (this.ySpeed < 0) this.entityState = Constants.KingPig.JUMP;
      else this.entityState = Constants.KingPig.FALL;

    if ((this.left || this.right) && !this.inAir) {
      this.entityState = Constants.KingPig.RUNNING;
    }

    if (this.attack) {
      this.entityState = Constants.KingPig.ATTACK;
    }

    if (this.lastEntityState != this.entityState) {
      this.frameX = 0;
      this.countdown = 0;
    }
  }

  updatePosition() {
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
      this.updateXPos(-Constants.KingPig.SPEED);
      this.flip = false;
    }
    if (this.right) {
      this.updateXPos(Constants.KingPig.SPEED);
      this.flip = true;
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
      if (xSpeed2 > 0) {
        this.left = true;
        this.right = false;
      } else {
        this.left = false;
        this.right = true;
      }
    }
  }

  updateAnimationTick() {
    this.countdown++;

    if (this.countdown >= this.countdownTimer) {
      this.countdown = 0;

      this.frameX++;

      if (this.frameX >= Constants.KingPig.getSpriteAmount(this.entityState)) {
        this.frameX = 0;
        this.attack = false;
        this.entityState = Constants.KingPig.IDLE;
      }
    }
  }

  loadLevelData(levelData) {
    this.levelData = levelData;
  }
}
