import Rectangle2D from "../custom/Rectangle2D.js";

export default class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.hitbox = null;
    this.attackbox = null;
    this.frameX = 0;
    this.health = 100;
    this.active = true;
    this.isDead = false;
    this.gettingHit = false;
    
    this.deathCountDown = 0;
    this.deathCountDownMax = 200;

    this.dyingWait = false;
    this.afterDeath = false;
  }

  initHitbox(x, y, width, height) {
    this.hitbox = new Rectangle2D(x, y, width, height);
  }

  initAttackbox(x, y, width, height) {
    this.attackbox = new Rectangle2D(x, y, width, height);
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      return;
    }
    
    this.gettingHit = true;
  }

  drawHealthBar(ctx, XlvlOffset, YlvlOffset) {
    ctx.beginPath();
    ctx.fillText(this.health, this.hitbox.x + this.hitbox.width / 4 - XlvlOffset, this.hitbox.y - 5 - YlvlOffset);
    ctx.closePath();
  }

  drawHitbox(ctx, XlvlOffset, YlvlOffset) {
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.strokeRect(
      this.hitbox.x - XlvlOffset,
      this.hitbox.y - YlvlOffset,
      this.hitbox.width,
      this.hitbox.height
    );
    ctx.stroke();
    ctx.closePath();
  }

  drawAttackbox(ctx, XlvlOffset, YlvlOffset) {
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.strokeRect(
      this.attackbox.x - XlvlOffset,
      this.attackbox.y - YlvlOffset,
      this.attackbox.width,
      this.attackbox.height
    );
    ctx.stroke();
    ctx.closePath();
  }
}
