import Object from "./Object.js";
import Constants from "../utilities/Constants.js";

export default class Sail extends Object {
    constructor(x, y, flip, levelManager, player) {
        super(x, y, Constants.Sail.SAIL_WIDTH, Constants.Sail.SAIL_HEIGHT);

        this.levelManager = levelManager;
        this.player = player;
        this.flip = flip;

        this.initHitbox(
            x + 30 * Constants.SCALE,
            y - 29 * Constants.SCALE,
            Constants.Sail.SAIL_WIDTH * Constants.SCALE,
            Constants.Sail.SAIL_HEIGHT * Constants.SCALE
        );

        this.countdownTimer = Constants.Sail.SAIL_SPEED;

        this.objectState = Constants.Sail.IDLE;

        const offsetY = 3;
        
        this.startingY = this.hitbox.y;
        this.peakYDuringSail = this.hitbox.y - offsetY * Constants.SCALE;
        this.troughYDuringSail = this.hitbox.y + offsetY * Constants.SCALE;

        this.sailSpeedY = -0.085;

        this.loadImg(Constants.Sail.SAIL_SRC);
    }

    draw(ctx, XlvlOffset, YlvlOffset) {
        if(!this.objectImg) return;
        
        // this.drawHitbox(ctx, XlvlOffset, YlvlOffset);
        
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            this.objectImg,
            this.frameX * this.width,
            this.objectState * this.height,
            this.width,
            this.height,
            this.hitbox.x - XlvlOffset,
            this.hitbox.y - YlvlOffset,
            this.width * Constants.SCALE, 
            this.height * Constants.SCALE
        );
        ctx.restore();
    }

    update() {
        this.updateAnimationTick();
        this.setAnimation();
        this.sailAnimation();
    }

    setAnimation() {
        this.lastObjectState = this.objectState;

        this.objectState = Constants.Sail.IDLE;

        if (this.lastObjectState != this.objectState) {
            this.frameX = 0;
            this.countdown = 0;
        }
    }

    sailAnimation() {
        this.hitbox.y -= this.sailSpeedY;

        if(this.hitbox.y <= this.peakYDuringSail || this.hitbox.y >= this.troughYDuringSail) 
            this.sailSpeedY = - this.sailSpeedY;
    }

    updateAnimationTick() {
        this.countdown++;
        if(this.countdown >= this.countdownTimer) {
            this.countdown = 0;
            this.frameX++;
            
            if(this.frameX >= Constants.Sail.getSpriteAmount(this.objectState)) {
                this.frameX = 0;
            }
        }
    }
}