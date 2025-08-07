import Constants from "../utilities/Constants.js";
import {
  canMoveHere,
  GetEntityYPosUnderRoofOrAboveFloor,
} from "../utilities/HelperMethods.js";
import Object from "../objects/Object.js";

export default class Cannon extends Object {
  constructor(x, y) {
    super(x, y, Constants.Cannon.CANNON_WIDTH, Constants.Cannon.CANNON_HEIGHT);

    this.velX = 2;
    this.velY = -3;
    this.gravity = 0.1;
    this.levelData = null;
    this.alive = true;

    this.pause = false;

    this.canDraw = true;

    this.initHitbox(
      x,
      y,
      Constants.Cannon.CANNON_WIDTH * Constants.SCALE,
      Constants.Cannon.CANNON_HEIGHT * Constants.SCALE
    );

    this.hitbox.y = GetEntityYPosUnderRoofOrAboveFloor(this.hitbox, 1);

    this.loadImg(Constants.Cannon.CANNON_SRC);
  }

  update() {
    this.velY += this.gravity;
    this.x += this.velX;
    this.y += this.velY;

    this.hitbox.x = this.x;
    this.hitbox.y = this.y;

    if (!canMoveHere(this.x, this.y, this.width, this.height, this.levelData)) {
      this.alive = false;
      this.explode();
    }

    // Optional: hit player directly
    if (this.hitbox.intersects(player.hitbox)) {
      player.takeDamage();
      this.alive = false;
    }
  }

  explode() {
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const speed = 1.5 + Math.random() * 1;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed - 1.5;
      fragments.push(new CannonPiece(this.x, this.y, dx, dy));
    }
  }

  draw(ctx, XlvlOffset) {
    if (this.pause) return;

    if (!this.objectImg) return;
    if (!this.canDraw) return;

    // this.drawHitbox(ctx, XlvlOffset);

    this.frameX = 1;
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

  setLevelData(levelData) {
    this.levelData = levelData;
  }
}
