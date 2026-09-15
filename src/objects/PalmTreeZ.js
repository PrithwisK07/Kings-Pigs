import Constants from "../utilities/Constants.js";
import Object from "./Object.js";

export default class PalmTreeZ extends Object {
    constructor(x, y, flip, levelManager, player) {
        super(x, y, Constants.PalmTreeZ.PALM_TREEZ_WIDTH, Constants.PalmTreeZ.PALM_TREEZ_HEIGHT);

        this.levelManager = levelManager;
        this.player = player;
        this.flip = flip;
        
        const effectiveX = this.flip ? x + 9 * Constants.SCALE : x + 1 * Constants.SCALE;

        this.initHitbox(
            effectiveX,
            y - 35 * Constants.SCALE,
            Constants.PalmTreeZ.PALM_TREEZ_WIDTH * Constants.SCALE / 3 - 8 * Constants.SCALE,
            Constants.PalmTreeZ.PALM_TREEZ_HEIGHT * Constants.SCALE / 4
        );

        this.countdownTimer = Constants.PalmTreeZ.FRAME_SPEED;

        this.loadImg(Constants.PalmTreeZ.PALM_TREEZ_SRC);
    }

    update() {
        this.updateAnimationtick();
    }

    updateAnimationtick() {
        this.countdown++;

        if(this.countdown > this.countdownTimer) {
            this.countdown = 0;
            this.frameX++;

            if(this.frameX >= Constants.PalmTreeZ.getSpriteAmount()) {
                this.frameX = 0;
            }
        }
    }

    draw(ctx, XlvlOffset, YlvlOffset) {
        if(!this.objectImg) return;

        // this.drawHitbox(ctx, XlvlOffset, YlvlOffset);

        let drawX = this.hitbox.x - XlvlOffset - this.hitbox.width - 13 * Constants.SCALE;

        if (this.flip) {
            ctx.scale(-1, 1);
            drawX = -drawX - this.hitbox.width * 4;
        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            this.objectImg,
            this.frameX * this.width, 
            0 * this.height,
            this.width,
            this.height,
            drawX,
            this.hitbox.y - YlvlOffset - 2 * Constants.SCALE,
            this.width * Constants.SCALE,
            this.height * Constants.SCALE
        );
    }
}