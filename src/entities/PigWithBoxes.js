import Constants from "../utilities/Constants.js";
import Entity from "./Entity.js";
import { getSpriteAtlas, getBoxes, getPalmTreeStanding, getPalmTreeZ } from "../utilities/LoadSave.js";
import {
  canMoveHere,
  GetEntityXPosNextToWall,
  GetEntityYPosUnderRoofOrAboveFloor,
  isEntityOnFloor,
  detectAnySolidTile,
  detectOnDifferentPlatform,
} from "../utilities/HelperMethods.js";
import Rectangle2D from "../custom/Rectangle2D.js";
import Box from "../objects/Box.js";

export default class PigThrowingBox extends Entity {
  constructor(x, y, player, isFlipped, levelManager) {
    super(
      x + Constants.PigThrowingBox.PIG_THROWING_BOX_WIDTH / 1.4,
      y,
      Constants.PigThrowingBox.PIG_THROWING_BOX_WIDTH,
      Constants.PigThrowingBox.PIG_THROWING_BOX_HEIGHT,
    );

    this.player = player;
    this.levelManager = levelManager;

    this.lastEntityState = this.entityState =
      Constants.PigThrowingBox.withBox.IDLE;

    this.death = false;
    this.gettingHit = false;
    this.attack = false;
    this.left = false;
    this.right = false;
    this.onGround = true;
    this.jumping = false;
    this.flip = isFlipped;
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
    this.blockedFrames = 0; 

    this.damage = 10;

    this.countdown = 0;
    this.countdownTimer = Constants.Player.FRAME_SPEED;

    this.initHitbox(
      x + Constants.PigThrowingBox.PIG_THROWING_BOX_WIDTH / 1.4,
      y,
      (this.width / 2) * Constants.SCALE,
      (this.height / 1.3) * Constants.SCALE,
    );

    this.loadImage();
    this.loadTheBoxes();
    this.loadSolidObjects(); 

    this.levelData = null;
  }

  async loadTheBoxes() {
    this.boxes = await getBoxes();
  }

  async loadSolidObjects() {
    this.palmTreeStanding = await getPalmTreeStanding();
    this.palmTreeZ = await getPalmTreeZ();
  }

  pushActiveBoxes() {
    const pigY = this.hitbox.y;
    
    const playerY = (this.player && this.player.hitbox) ? this.player.hitbox.y : pigY;

    if (pigY - playerY >= 20 * Constants.SCALE) this.box.setProps(2.75, -4);
    else this.box.setProps(1.5, -2.5);

    this.box.loadLevelData(this.levelData);
    this.levelManager.activeBoxes.push(this.box);
  }

  popBoxes(Box) {
    this.levelManager.boxes.splice(this.levelManager.boxes.indexOf(Box), 1);
  }

  async loadImage() {
    try {
      this.kingPigImg = await getSpriteAtlas(
        Constants.PigThrowingBox.PIG_THROWING_BOX_SRC,
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  draw(ctx, XlvlOffset, YlvlOffset) {
    if (!this.levelData) return;
    if (!this.kingPigImg) return;

    if (this.box) this.box.draw(ctx, XlvlOffset, YlvlOffset);

    this.drawHealthBar(ctx, XlvlOffset, YlvlOffset);

    ctx.save();
    this.flip ? ctx.scale(-1, 1) : ctx.scale(1, 1);
    ctx.imageSmoothingEnabled = false;

    const offsetY = this.hasBox ? 2 : 3;

    ctx.drawImage(
      this.kingPigImg,
      this.frameX * this.width,
      this.entityState * this.height,
      this.width,
      this.height,
      this.flip
        ? -this.hitbox.x - this.hitbox.width * 1.7 + XlvlOffset
        : this.hitbox.x - this.hitbox.width / 1.5 - XlvlOffset,
      this.hitbox.y - this.hitbox.height / 3 + offsetY * Constants.SCALE - YlvlOffset,
      this.width * Constants.SCALE,
      this.height * Constants.SCALE,
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
    this.isDeathWaitOver();
  }

  detectTheBox() {
    if (!this.boxes) return;
    if (this.isDead) return;
    if (this.hasBox) return;

    this.boxes.forEach((box) => {
      if (!box.pause)
        if (box.hitbox.intersects(this.hitbox)) {
          this.stopMoving();
          this.popBoxes(box);
          box.pause = true;
          this.pickingBox = true;
        }
    });
  }

  isDeathWaitOver() {
    if (this.dyingWait) {
      this.deathCountDown++;
      if (this.deathCountDown >= this.deathCountDownMax) {
        this.dyingWait = false;
        this.afterDeath = true;
        this.deathCountDown = 0;
      }
    }
  }

  detectAndChasePlayer() {
    if (!this.player || !this.levelData) return;
    if (this.player.isDead) return;
    if (this.isDead || this.afterDeath || this.dyingWait) return;

    const playerCenterX = this.player.hitbox.x + this.player.hitbox.width / 2;
    const pigCenterX = this.hitbox.x + this.hitbox.width / 2;
    const playerCenterY = this.player.hitbox.y + this.player.hitbox.height / 2;
    const pigCenterY = this.hitbox.y + this.hitbox.height / 2;

    const deltaX = playerCenterX - pigCenterX;
    const distanceX = Math.abs(deltaX);

    const TOLERANCE_RANGE = 200 * Constants.SCALE;
    const ATTACK_RANGE = this.hasBox
      ? 100 * Constants.SCALE
      : 50 * Constants.SCALE;

    if (distanceX > TOLERANCE_RANGE) {
      if (this.chaseTimeout <= 0) {
        this.stopMoving();
      }
      return;
    }

    const canSeePlayer = this.hasBox
      ? distanceX < 120 * Constants.SCALE
      : this.hasLineOfSight(pigCenterX, pigCenterY, playerCenterX, pigCenterY);

    if (canSeePlayer) {
      this.chaseTimeout = this.MAX_CHASE_TIMEOUT;
      this.flip = deltaX > 0;
    }

    if (canSeePlayer || this.chaseTimeout > 0) {
      let wantsToMove = false;

      if (distanceX < ATTACK_RANGE && !this.inAir) {
        if (!this.hasBox) {
          if (this.hitbox.intersects(this.player.hitbox)) {
            if (this.attackCooldown === 0) {
              this.stopMoving();
              this.attack = true;
              this.attackCooldown = 75;
            }
          } else {
            wantsToMove = true; 
          }
        } else {
          if (this.attackCooldown === 0) {
            this.stopMoving();
            this.attack = true;
            this.attackCooldown = 75;
          }
        }
      } else {
        wantsToMove = true;
      }

      if (wantsToMove) {
        if (distanceX < 10 * Constants.SCALE) {
          this.blockedFrames++;
          if (this.blockedFrames > 30) {
            this.stopMoving();
          } else {
            this.stopMoving(); 
          }
        } else {
          const moveDirection = deltaX > 0 ? Constants.PigThrowingBox.SPEED : -Constants.PigThrowingBox.SPEED;
          
          const isBlocked = !canMoveHere(
            this.hitbox.x + moveDirection,
            this.hitbox.y,
            this.hitbox.width,
            this.hitbox.height,
            this.levelData,
            this.palmTreeStanding,
            this.palmTreeZ
          );

          if (isBlocked) {
            this.blockedFrames++;
            if (this.blockedFrames > 30) {
              this.stopMoving();
            } else {
              this.left = deltaX < 0;
              this.right = deltaX > 0;
            }
          } else {
            this.blockedFrames = 0;
            this.left = deltaX < 0;
            this.right = deltaX > 0;
          }
        }
      }
    } else {
      this.stopMoving();
      this.blockedFrames = 0;
    }
  }

  stopMoving() {
    this.left = false;
    this.right = false;
  }

  hasLineOfSight(x1, y1, x2, y2) {
    if (detectAnySolidTile(x1, y1, x2, y2, this.levelData)) return false;

    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);

    const checkVisionBlock = (objects) => {
      if (!objects) return false;
      for (const obj of objects) {
        if (obj.hitbox.x < maxX && obj.hitbox.x + obj.hitbox.width > minX) {
          if (y1 >= obj.hitbox.y && y1 <= obj.hitbox.y + obj.hitbox.height) {
            return true;
          }
        }
      }
      return false;
    };

    if (checkVisionBlock(this.palmTreeStanding)) return false;
    if (checkVisionBlock(this.palmTreeZ)) return false;

    return true;
  }

  setAnimation() {
    this.lastEntityState = this.entityState;

    if (!this.isDead) {
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
        if (this.entityState === Constants.PigThrowingBox.withBox.PICKING)
          return;

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

        if(this.gettingHit) {
          this.entityState = Constants.PigThrowingBox.withoutBox.HIT;
        }

        if (this.attack) {
          this.entityState = Constants.PigThrowingBox.withoutBox.ATTACK;
        }

        if (this.pickingBox) {
          this.entityState = Constants.PigThrowingBox.withBox.PICKING;
        }
      }
    }

    if (this.isDead)
      this.entityState = Constants.PigThrowingBox.withoutBox.DEATH;

    if (this.dyingWait)
      this.entityState = Constants.PigThrowingBox.withoutBox.DEATH_WAIT;

    if (this.afterDeath)
      this.entityState = Constants.PigThrowingBox.withoutBox.AFTER_DEATH;

    if (this.lastEntityState != this.entityState) {
      this.frameX = 0;
      this.countdown = 0;
    }
  }

  updatePosition() {
    if (!this.left && !this.right && !this.inAir && !this.gettingHit) return;

    if (!this.inAir)
      if (!isEntityOnFloor(this.hitbox, this.levelData, this.palmTreeStanding, this.palmTreeZ)) this.inAir = true;

    if (this.inAir) {
      if (
        canMoveHere(
          this.hitbox.x,
          this.hitbox.y + this.ySpeed,
          this.hitbox.width,
          this.hitbox.height,
          this.levelData,
          this.palmTreeStanding,
          this.palmTreeZ
        )
      ) {
        this.hitbox.y += this.ySpeed;
        this.ySpeed += this.gravity;
      } else {
        this.hitbox.y = GetEntityYPosUnderRoofOrAboveFloor(
          this.hitbox,
          this.ySpeed,
          this.palmTreeStanding,
          this.palmTreeZ
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
    if (this.isDead) return;

    const newX = this.hitbox.x + xSpeed2;
    const newY = this.hitbox.y;

    const hitboxAlias = new Rectangle2D(
      this.hitbox.x + offset * 0.7,
      this.hitbox.y,
      this.hitbox.width,
      this.hitbox.height,
    );

    const canMove = canMoveHere(
      newX,
      newY,
      this.hitbox.width,
      this.hitbox.height,
      this.levelData,
      this.palmTreeStanding,
      this.palmTreeZ
    );

    const isOnFloor = isEntityOnFloor(hitboxAlias, this.levelData, this.palmTreeStanding, this.palmTreeZ);

    if (this.hasBox) {
      const footX = this.flip
        ? this.hitbox.x + this.hitbox.width + 1
        : this.hitbox.x - 1;

      const footY = this.hitbox.y + this.hitbox.height + 1;

      const tileBelowAheadIsSolid = !canMoveHere(
        footX,
        footY,
        1,
        1,
        this.levelData,
        this.palmTreeStanding,
        this.palmTreeZ
      );

      if (canMove && isOnFloor && tileBelowAheadIsSolid) {
        this.hitbox.x = newX;
      } else {
        this.attack = true;
        this.left = false;
        this.right = false;
      }
    } else {
      if (canMove) {
        this.hitbox.x = newX;
      } else {
        this.hitbox.x = GetEntityXPosNextToWall(
          this.hitbox, 
          xSpeed2, 
          this.palmTreeStanding, 
          this.palmTreeZ
        );
      }
    }
  }

  updateAnimationTick() {
    this.countdown++;

    if (this.countdown >= this.countdownTimer) {
      this.countdown = 0;

      this.frameX++;

      if (
        this.entityState === Constants.PigThrowingBox.withoutBox.ATTACK &&
        this.frameX == 3
      )
        this.damagePlayer(this.damage);

      if (
        this.frameX >=
        Constants.PigThrowingBox.getSpriteAmount(this.entityState, this.hasBox)
      ) {
        if (
          this.entityState === Constants.PigThrowingBox.withoutBox.AFTER_DEATH
        ) {
          this.afterDeath = false;
          this.active = false;
          return;
        }

        if (this.entityState === Constants.PigThrowingBox.withoutBox.DEATH) {
          this.dyingWait = true;
          return;
        }

        if (this.entityState == Constants.PigThrowingBox.withBox.ATTACK) {
          this.hasBox = false;
          this.box = new Box(
            this.hitbox.x,
            this.hitbox.y,
            this.flip,
            this.levelManager,
            this.player
          );
          this.pushActiveBoxes();
        }

        if (this.entityState == Constants.PigThrowingBox.withBox.PICKING) {
          this.pickingBox = false;
          this.hasBox = true;
        }

        this.frameX = 0;
        this.attack = false;
        this.gettingHit = false;

        if (this.isDead || this.afterDeath || this.dyingWait) return;

        if (this.hasBox)
          this.entityState = Constants.PigThrowingBox.withBox.IDLE;
        else this.entityState = Constants.PigThrowingBox.withoutBox.IDLE;
      }
    }
  }

  damagePlayer(damage) {
    if (this.attack && !this.hasBox) this.player.takeDamage(damage);
  }

  loadLevelData(levelData) {
    this.levelData = levelData;
  }
}