import Constants from "../utilities/Constants.js";
import {
  canMoveHere,
  GetEntityYPosUnderRoofOrAboveFloor,
} from "../utilities/HelperMethods.js";
import { getSpriteAtlas } from "../utilities/LoadSave.js";
import Object from "./Object.js";

export default class Bomb extends Object {
  constructor(x, y, flip, levelManager, player) {
    super(x, y, Constants.Bomb.BOMB_WIDTH, Constants.Bomb.BOMB_HEIGHT);

    this.levelManager = levelManager;
    this.flip = flip ? false : true;
    this.pause = false;
    this.canDraw = true;
    this.player = player;

    this.damage = 35;

    this.initHitbox(
      x,
      y,
      (Constants.Bomb.BOMB_WIDTH / 4) * Constants.SCALE,
      (Constants.Bomb.BOMB_HEIGHT / 4) * Constants.SCALE
    );

    this.explosion = false;
    this.loadExplosionImg();
    this.explosionPos = { x: 0, y: 0 };

    this.countdownTimer = Constants.PigWithMatch.FRAME_SPEED;
    this.objectState = Constants.Bomb.IDLE;
    this.hitbox.y = GetEntityYPosUnderRoofOrAboveFloor(this.hitbox, 1);

    this.loadImg(Constants.Bomb.BOMB_SRC);

    this.gravity = 0.025;
    this.rotation = 0;
    this.rotationSpeed = 0.05;

    this.pivotOffsetX = 0;
    this.pivotOffsetY = 0;
  }

  async loadImg(src) {
    this.objectImg = await getSpriteAtlas(src);
  }

  async loadExplosionImg() {
    this.explosionImg = await getSpriteAtlas(
      Constants.Projectile.EXPLOSION_SRC
    );
  }

  checkCollisionPlayer() {
    // FIX: Ensure the player actually exists and isn't already dead before checking hitboxes
    if (!this.player || this.player.isDead || !this.player.hitbox) return;

    if(this.player.hitbox.intersects(this.hitbox) && !this.explosion) {
      this.player.takeDamage(this.damage);

      if (!this.explosion) {
        this.explosion = true;
        this.explosionPos = {
          x: this.hitbox.x,
          y: this.hitbox.y,
        };
      }
    }
  }

  setProps(vx, vy) {
    this.active = true;
    this.vx = this.flip ? -vx : vx;
    this.vy = vy;
  }

  update() {
    if (!this.levelData || !this.active) return;

    this.checkCollisionPlayer();

    if (
      canMoveHere(
        this.hitbox.x + this.vx,
        this.hitbox.y,
        this.hitbox.width,
        this.hitbox.height,
        this.levelData
      )
    ) {
      this.hitbox.x += this.vx;
    } else {
      this.stopAndExplode();
    }

    this.vy += this.gravity;
    if (
      canMoveHere(
        this.hitbox.x,
        this.hitbox.y + this.vy,
        this.hitbox.width,
        this.hitbox.height,
        this.levelData
      )
    ) {
      this.hitbox.y += this.vy;
    } else {
      this.stopAndExplode();
    }

    if (!this.explosion) {
      this.rotation += this.rotationSpeed * (this.vx < 0 ? -1 : 1);
    }

    if (this.explosion) this.updateAnimationtick();
  }

  stopAndExplode() {
    this.vy = 0;
    this.vx = 0;
    this.levelManager.triggerShake(1, 1);

    if (!this.explosion) {
      this.explosion = true;
      this.explosionPos = { x: this.hitbox.x, y: this.hitbox.y };
    }
  }

  updateAnimationtick() {
    this.countdown++;
    if (this.countdown >= this.countdownTimer) {
      this.countdown = 0;
      this.frameX++;
      if (this.frameX >= Constants.Projectile.getSpriteAmount()) {
        this.frameX = 0;
        this.explosion = false;
        this.active = false; // Flags it for LevelManager to clean up safely
        this.popActiveBombs();
      }
    }
  }

  popActiveBombs() {
    this.canDraw = false;
    // FIX: Removed the buggy splice method. LevelManager handles cleanup now!
  }

  draw(ctx, XlvlOffset, YlvlOffset) {
    if (this.pause || !this.objectImg || !this.canDraw) return;

    if (this.explosion) {
      this.drawExplosion(ctx, XlvlOffset, YlvlOffset);
      return;
    }

    ctx.save();

    const centerX = this.hitbox.x + this.hitbox.width / 2 - XlvlOffset;

    const centerY =
      this.hitbox.y +
      this.hitbox.height / 2 +
      1 * Constants.SCALE -
      3 * Constants.SCALE - YlvlOffset;

    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);

    if (this.rotation != 0) {
      this.objectState = Constants.Bomb.EXPLODE;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        this.objectImg,
        this.frameX * this.width,
        this.objectState * this.height,
        this.width,
        this.height,
        (-this.width / 2) * Constants.SCALE - 1.5 * Constants.SCALE,
        (-this.height / 2) * Constants.SCALE - 3.5 * Constants.SCALE,
        this.width * Constants.SCALE,
        this.height * Constants.SCALE
      );
    } else {
      this.objectState = Constants.Bomb.IDLE;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        this.objectImg,
        this.frameX * this.width,
        this.objectState * this.height,
        this.width,
        this.height,
        (-this.width / 2) * Constants.SCALE,
        (-this.height / 2) * Constants.SCALE,
        this.width * Constants.SCALE,
        this.height * Constants.SCALE
      );
    }

    ctx.restore();
  }

  drawExplosion(ctx, XlvlOffset, YlvlOffset) {
    ctx.drawImage(
      this.explosionImg,
      this.frameX * Constants.Projectile.EXPLOSION_WIDTH,
      0,
      Constants.Projectile.EXPLOSION_WIDTH,
      Constants.Projectile.EXPLOSION_HEIGHT,
      this.explosionPos.x -
        XlvlOffset -
        Constants.Projectile.EXPLOSION_WIDTH / 2 -
        2 * Constants.SCALE,
      this.explosionPos.y -
        Constants.Projectile.EXPLOSION_HEIGHT / 2 -
        2 * Constants.SCALE - YlvlOffset,
      Constants.Projectile.EXPLOSION_WIDTH * Constants.SCALE,
      Constants.Projectile.EXPLOSION_HEIGHT * Constants.SCALE
    );
  }

  loadLevelData(levelData) {
    this.levelData = levelData;
  }
}