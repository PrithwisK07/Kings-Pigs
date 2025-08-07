import Rectangle2D from "../custom/Rectangle2D.js";

export default class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.hitbox = null;
    this.frameX = 0;
  }

  initHitbox(x, y, width, height) {
    this.hitbox = new Rectangle2D(x, y, width, height);
  }

  drawHitbox(ctx, XlvlOffset) {
    ctx.beginPath();
    ctx.strokeRect(
      this.hitbox.x - XlvlOffset,
      this.hitbox.y,
      this.hitbox.width,
      this.hitbox.height
    );
    ctx.stroke();
    ctx.closePath();
  }
}
