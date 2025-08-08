import Constants from "../utilities/Constants.js";
import Entity from "./entity.js";
import { getSpriteAtlas, getCannons } from "../utilities/LoadSave.js";
import { GetEntityYPosUnderRoofOrAboveFloor } from "../utilities/HelperMethods.js";

export default class PigWithMatch extends Entity {
  constructor(x, y, player) {
    super(
      x + Constants.PigWithMatch.PIG_WITH_MATCH_WIDTH / 1.4,
      y,
      Constants.PigWithMatch.PIG_WITH_MATCH_WIDTH,
      Constants.PigWithMatch.PIG_WITH_MATCH_HEIGHT
    );

    this.player = player;

    this.lastEntityState = this.entityState =
      Constants.PigWithMatch.withMatch.IDLE;

    this.death = false;
    this.gettingHit = false;
    this.attack = false;

    this.cannon = null;
    this.hasMatch = false;
    this.lightMatch = false;
    this.fireCannon = false;

    this.attackCooldown = 0;

    this.countdown = 0;
    this.countdownTimer = Constants.PigWithMatch.FRAME_SPEED;

    this.initHitbox(
      x + Constants.PigWithMatch.PIG_WITH_MATCH_WIDTH / 1.5,
      y,
      (this.width / 2) * Constants.SCALE,
      (this.height / 1.3) * Constants.SCALE
    );

    this.loadImage();
    this.loadTheCannons();

    this.levelData = null;

    this.hitbox.y = GetEntityYPosUnderRoofOrAboveFloor(this.hitbox, 1);
  }

  async loadTheCannons() {
    this.cannons = await getCannons();
  }

  async loadImage() {
    try {
      this.pigWithMatch = await getSpriteAtlas(
        Constants.PigWithMatch.PIG_WITH_MATCH_SRC
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  draw(ctx, XlvlOffset) {
    if (!this.levelData) return;
    if (!this.pigWithMatch) return;

    // this.drawHitbox(ctx, XlvlOffset);

    ctx.save();
    this.flip ? ctx.scale(-1, 1) : ctx.scale(1, 1);
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      this.pigWithMatch,
      this.frameX * this.width,
      this.entityState * this.height,
      this.width,
      this.height,
      this.flip
        ? -this.hitbox.x - this.hitbox.width * 1.7 + XlvlOffset
        : this.hitbox.x - this.hitbox.width / 3 - XlvlOffset,
      this.hitbox.y - this.hitbox.height / 6 + 2 * Constants.SCALE,
      this.width * Constants.SCALE,
      this.height * Constants.SCALE
    );
    ctx.restore();

    this.getConcernedCannon();
  }

  getConcernedCannon() {
    this.cannons.forEach((cannon) => {
      if (this.hitbox.intersects(cannon.hitbox)) {
        this.cannon = cannon;
      }
    });
  }

  update() {
    if (!this.levelData) return;
    this.setAnimation();

    if (this.attackCooldown > 0) this.attackCooldown--;

    this.detectTheCannon();
    this.detectPlayer();
    this.updateAnimationTick();
  }

  detectTheCannon() {
    if (!this.cannon) return;
    if (!this.hasMatch) return;

    const playerY = this.player.hitbox.y;
    const pigY = this.hitbox.y;
    const VERTICAL_TOLERANCE_RANGE = 120 * Constants.SCALE;

    if (this.hasMatch)
      if (
        playerY + this.player.hitbox.height / 5 + 4 >= pigY &&
        playerY - pigY <= VERTICAL_TOLERANCE_RANGE
      ) {
        if (!this.cannon.projectileActive) {
          this.attack = true;
          if (this.fireCannon) {
            this.cannon.shoot();
            this.fireCannon = false;
          }
        }
      }
  }

  detectPlayer() {
    if (!this.player || !this.levelData) return;

    const playerCenterX = this.player.hitbox.x + this.player.hitbox.width / 2;
    const pigCenterX = this.hitbox.x + this.hitbox.width / 2;

    const deltaX = playerCenterX - pigCenterX;
    const distanceX = Math.abs(deltaX);

    const TOLERANCE_RANGE = 180 * Constants.SCALE;

    const canSeePlayer =
      distanceX < TOLERANCE_RANGE &&
      pigCenterX > playerCenterX + this.player.hitbox.width; // Detect Player first and then shoot.

    // const canSeePlayer = true; // Always shoot.

    if (canSeePlayer)
      if (this.attackCooldown === 0) {
        this.lightMatch = true;
        this.attackCooldown = 150;
      }
  }

  setAnimation() {
    this.lastEntityState = this.entityState;

    if (this.hasMatch) {
      this.entityState = Constants.PigWithMatch.withMatch.IDLE;

      if (this.attack) {
        this.entityState = Constants.PigWithMatch.withMatch.ATTACK;
      }
    } else {
      this.entityState = Constants.PigWithMatch.withoutMatch.IDLE;

      if (this.lightMatch) {
        this.entityState = Constants.PigWithMatch.withoutMatch.LIGHT;
      }
    }

    if (this.lastEntityState != this.entityState) {
      this.frameX = 0;
      this.countdown = 0;
    }
  }

  updateAnimationTick() {
    this.countdown++;

    if (this.countdown >= this.countdownTimer) {
      this.countdown = 0;

      this.frameX++;

      if (
        this.frameX >=
        Constants.PigWithMatch.getSpriteAmount(this.entityState, this.hasMatch)
      ) {
        if (this.entityState == Constants.PigWithMatch.withMatch.ATTACK) {
          this.hasMatch = false;
          this.attack = false;
          this.fireCannon = true;
        }

        if (this.entityState == Constants.PigWithMatch.withoutMatch.LIGHT) {
          this.lightMatch = false;
          this.hasMatch = true;
        }

        this.frameX = 0;

        if (this.hasMatch)
          this.entityState = Constants.PigWithMatch.withMatch.IDLE;
        else this.entityState = Constants.PigWithMatch.withoutMatch.IDLE;
      }
    }
  }

  loadLevelData(levelData) {
    this.levelData = levelData;
  }
}
