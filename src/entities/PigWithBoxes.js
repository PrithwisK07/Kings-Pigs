import Constants from "../utilities/Constants.js";
import Entity from "./entity.js";
import { getSpriteAtlas, getBoxes } from "../utilities/LoadSave.js";
import {
  canMoveHere,
  GetEntityXPosNextToWall,
  GetEntityYPosUnderRoofOrAboveFloor,
  isEntityOnFloor,
  detectAnySolidTile,
  detectOnDifferentPlatform,
} from "../utilities/HelperMethods.js";
import Rectangle2D from "../custom/Rectangle2D.js";

export default class PigThrowingBox extends Entity {
  constructor(x, y, player) {
    super(
      x + Constants.PigThrowingBox.PIG_THROWING_BOX_WIDTH / 1.4,
      y,
      Constants.PigThrowingBox.PIG_THROWING_BOX_WIDTH,
      Constants.PigThrowingBox.PIG_THROWING_BOX_HEIGHT
    );

    this.player = player;

    this.lastEntityState = this.entityState =
      Constants.PigThrowingBox.withBox.IDLE;

    this.death = false;
    this.gettingHit = false;
    this.attack = false;
    this.left = false;
    this.right = false;
    this.onGround = true;
    this.jumping = false;
    this.flip = false;
    this.inAir = true;

    this.hasBox = true;
    this.pickingBox = false;

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
      x + Constants.PigThrowingBox.PIG_THROWING_BOX_WIDTH / 1.4,
      y,
      (this.width / 2) * Constants.SCALE,
      (this.height / 1.3) * Constants.SCALE
    );

    this.loadImage();
    this.loadTheBoxes();

    this.levelData = null;
  }

  async loadTheBoxes() {
    this.boxes = await getBoxes();
  }

  async loadImage() {
    try {
      this.kingPigImg = await getSpriteAtlas(
        Constants.PigThrowingBox.PIG_THROWING_BOX_SRC
      );
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
        ? -this.hitbox.x - this.hitbox.width * 1.7 + XlvlOffset
        : this.hitbox.x - this.hitbox.width / 1.5 - XlvlOffset,
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

    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.chaseTimeout > 0) this.chaseTimeout--;

    this.detectTheBox();
    this.detectAndChasePlayer();
    this.updateAnimationTick();
  }

  detectTheBox() {
    if (!this.boxes) return;
    if (this.hasBox) return;

    this.boxes.forEach((box) => {
      if (!box.pause)
        if (box.hitbox.intersects(this.hitbox)) {
          this.stopMoving();
          box.pause = true;
          this.pickingBox = true;
        }
    });
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

    const canSeePlayer =
      this.hasLineOfSight(pigCenterX, pigY, playerCenterX, playerY) &&
      !detectOnDifferentPlatform(
        this.hitbox.x,
        this.hitbox.y,
        this.player.hitbox.x,
        this.player.hitbox.y,
        this.levelData
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

    if (this.hasBox) {
      if (this.entityState === Constants.PigThrowingBox.withBox.ATTACK) {
        return;
      }

      this.entityState = Constants.PigThrowingBox.withBox.IDLE;

      if (this.inAir)
        if (this.ySpeed < 0)
          this.entityState = Constants.PigThrowingBox.withBox.JUMP;
        else this.entityState = Constants.PigThrowingBox.withBox.FALL;

      if ((this.left || this.right) && !this.inAir) {
        this.entityState = Constants.PigThrowingBox.withBox.RUNNING;
      }

      if (this.attack) {
        this.entityState = Constants.PigThrowingBox.withBox.ATTACK;
      }
    } else {
      if (this.entityState === Constants.PigThrowingBox.withBox.PICKING) return;

      if (this.entityState === Constants.PigThrowingBox.withoutBox.ATTACK) {
        return;
      }

      this.entityState = Constants.PigThrowingBox.withoutBox.IDLE;

      if (this.inAir)
        if (this.ySpeed < 0)
          this.entityState = Constants.PigThrowingBox.withoutBox.JUMP;
        else this.entityState = Constants.PigThrowingBox.withoutBox.FALL;

      if ((this.left || this.right) && !this.inAir) {
        this.entityState = Constants.PigThrowingBox.withoutBox.RUNNING;
      }

      if (this.attack) {
        this.entityState = Constants.PigThrowingBox.withoutBox.ATTACK;
      }

      if (this.pickingBox) {
        this.entityState = Constants.PigThrowingBox.withBox.PICKING;
      }
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
      this.updateXPos(-Constants.PigThrowingBox.SPEED, -Constants.OG_TILE_SIZE);
      this.flip = false;
    }
    if (this.right) {
      this.updateXPos(Constants.PigThrowingBox.SPEED, Constants.OG_TILE_SIZE);
      this.flip = true;
    }
  }

  updateXPos(xSpeed2, offset) {
    const newX = this.hitbox.x + xSpeed2;
    const newY = this.hitbox.y;

    const hitboxAlias = new Rectangle2D(
      this.hitbox.x + offset * 0.7,
      this.hitbox.y,
      this.hitbox.width,
      this.hitbox.height
    );

    const canMove = canMoveHere(
      newX,
      newY,
      this.hitbox.width,
      this.hitbox.height,
      this.levelData
    );

    const isOnFloor = isEntityOnFloor(hitboxAlias, this.levelData);

    if (this.hasBox) {
      const footX = this.flip
        ? this.hitbox.x + this.hitbox.width + 1
        : this.hitbox.x - 1;

      const footY = this.hitbox.y + this.hitbox.height + 1;

      const tileBelowAheadIsSolid = detectAnySolidTile(
        footX,
        footY,
        footX,
        footY + 1,
        this.levelData
      );

      if (canMove && isOnFloor && tileBelowAheadIsSolid) {
        this.hitbox.x = newX;
      } else {
        this.attack = true;
        this.left = false;
        this.right = false;
      }
    } else {
      // when pig doesn't have box, allow it to walk and fall naturally
      if (canMove) {
        this.hitbox.x = newX;
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
  }

  updateAnimationTick() {
    this.countdown++;

    if (this.countdown >= this.countdownTimer) {
      this.countdown = 0;

      this.frameX++;

      if (
        this.frameX >=
        Constants.PigThrowingBox.getSpriteAmount(this.entityState, this.hasBox)
      ) {
        if (this.entityState == Constants.PigThrowingBox.withBox.ATTACK)
          this.hasBox = false;

        if (this.entityState == Constants.PigThrowingBox.withBox.PICKING) {
          this.pickingBox = false;
          this.hasBox = true;
        }

        this.frameX = 0;
        this.attack = false;

        if (this.hasBox)
          this.entityState = Constants.PigThrowingBox.withBox.IDLE;
        else this.entityState = Constants.PigThrowingBox.withoutBox.IDLE;
      }
    }
  }

  loadLevelData(levelData) {
    this.levelData = levelData;
  }
}
