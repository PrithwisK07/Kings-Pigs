import Constants from "../utilities/Constants.js";
import Entity from "./entity.js";
import { getSpriteAtlas, getCannons } from "../utilities/LoadSave.js";
import { GetEntityYPosUnderRoofOrAboveFloor } from "../utilities/HelperMethods.js";

export default class PigWithMatch extends Entity {
  constructor(x, y, player, isFlipped) {
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

    this.flip = isFlipped;

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

  draw(ctx, XlvlOffset, YlvlOffset) {
    if (!this.levelData) return;
    if (!this.pigWithMatch) return;

    this.drawHealthBar(ctx, XlvlOffset, YlvlOffset);

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const drawX = this.hitbox.x - this.hitbox.width / 3 - XlvlOffset;
    const drawY = this.hitbox.y - this.hitbox.height / 6 + 2 * Constants.SCALE - YlvlOffset;
    const drawW = this.width * Constants.SCALE;
    const drawH = this.height * Constants.SCALE;

    if (this.flip) {
      const centerX = this.hitbox.x - XlvlOffset + this.hitbox.width / 2;
      ctx.translate(centerX, 0);
      ctx.scale(-1, 1);
      ctx.translate(-centerX, 0);
    }

    ctx.drawImage(
      this.pigWithMatch,
      this.frameX * this.width,
      this.entityState * this.height,
      this.width,
      this.height,
      drawX,
      drawY,
      drawW,
      drawH
    );
    
    ctx.restore();

    this.getConcernedCannon();
  }

  getConcernedCannon() {
    // FIX: Expand the search area slightly! When flipped, their hitboxes
    // sometimes drift apart. This guarantees the Pig finds its Cannon!
    const searchBox = {
      x: this.hitbox.x - 30 * Constants.SCALE,
      y: this.hitbox.y - 10 * Constants.SCALE,
      width: this.hitbox.width + 60 * Constants.SCALE,
      height: this.hitbox.height + 20 * Constants.SCALE
    };

    this.cannons.forEach((cannon) => {
      if (
        searchBox.x < cannon.hitbox.x + cannon.hitbox.width &&
        searchBox.x + searchBox.width > cannon.hitbox.x &&
        searchBox.y < cannon.hitbox.y + cannon.hitbox.height &&
        searchBox.y + searchBox.height > cannon.hitbox.y
      ) {
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
    if(this.player.isDead) return;

    // FIX: The Paradox is solved. If the animation told us to fire, fire instantly!
    if (this.fireCannon) {
      this.cannon.shoot();
      this.fireCannon = false;
      return; // Stop here so it actually shoots
    }

    // Only start the attack animation if the Pig actually has a match
    if (!this.hasMatch) return;

    const playerY = this.player.hitbox.y;
    const pigY = this.hitbox.y;
    const VERTICAL_TOLERANCE_RANGE = 120 * Constants.SCALE;

    if (
      playerY + this.player.hitbox.height / 5 + 4 >= pigY &&
      playerY - pigY <= VERTICAL_TOLERANCE_RANGE
    ) {
      if (!this.cannon.projectileActive && !this.attack) {
        this.attack = true;
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
    let canSeePlayer = false;

    if (distanceX < TOLERANCE_RANGE) {
      if (this.flip) {
        if (playerCenterX > pigCenterX) canSeePlayer = true;
      } else {
        if (playerCenterX < pigCenterX) canSeePlayer = true;
      }
    }

    if (canSeePlayer) {
      if (this.attackCooldown === 0) {
        this.lightMatch = true;
        this.attackCooldown = 150;
      }
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