import Constants from "../utilities/Constants.js";
import Object from "./Object.js";

export default class Box extends Object {
  constructor(x, y) {
    super(x, y, Constants.Box.BOX_WIDTH, Constants.Box.BOX_HEIGHT);

    this.canDraw = true;

    this.initHitbox(
      x,
      y,
      (Constants.Box.BOX_WIDTH - 6) *
        (Constants.SCALE, Constants.Box.BOX_HEIGHT - 6) *
        Constants.SCALE
    );
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
      fragments.push(new BoxPiece(this.x, this.y, dx, dy));
    }
  }

  draw(ctx, XlvlOffset) {
    if (!this.canDraw) return;

    ctx.drawImage();
  }

  setLevelData(levelData) {
    this.levelData = levelData;
  }
}
