import Rectangle2D from "../custom/Rectangle2D.js";
import Constants from "../utilities/Constants.js";
import { getSpriteAtlas } from "../utilities/LoadSave.js";

export default class Object {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.frameX = 0;
    this.lastObjectState = this.objectState = Constants.Door.IDLE;

    this.countdown = 0;
    this.countdownTimer = Constants.Door.FRAME_SPEED;

    this.hitbox = null;
  }

  initHitbox(x, y, width, height) {
    this.hitbox = new Rectangle2D(x, y, width, height);
  }

  drawHitbox(ctx, XlvlOffset) {
    ctx.strokeStyle = "blue";
    ctx.strokeRect(
      this.hitbox.x - XlvlOffset,
      this.hitbox.y,
      this.hitbox.width,
      this.hitbox.height
    );
  }

  async loadImg(ImgPath) {
    this.objectImg = await getSpriteAtlas(ImgPath);
  }
}
