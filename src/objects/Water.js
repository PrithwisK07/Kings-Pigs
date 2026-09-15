import Constants from "../utilities/Constants.js";
import Object from "./Object.js";
import { getSpriteAtlas } from "../utilities/LoadSave.js"; // <-- Import the async loader!

export default class Water extends Object {
    constructor(x, y, levelManager, player) {
        super(x, y, Constants.Water.WATER_WIDTH, Constants.Water.WATER_HEIGHT);

        this.initHitbox(
            x - 32 * Constants.SCALE, 
            y,
            Constants.Water.WATER_WIDTH * Constants.SCALE,
            Constants.Water.WATER_HEIGHT * Constants.SCALE
        );

        this.levelManager = levelManager;
        this.player = player;

        this.frameX = 0;
        this.countdown = 0;
        this.countdownTimer = Constants.Water.FRAME_SPEED;

        this.loadImage();
    }

    async loadImage() {
        try {
            this.objectImg = await getSpriteAtlas(Constants.Water.WATER_SRC
            );
        } catch (error) {
            console.log(error.message);
        }
    }

    draw(ctx, XlvlOffset, YlvlOffset) {
        if(!this.objectImg) return;
        
        // this.drawHitbox(ctx, XlvlOffset, YlvlOffset);
        
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            this.objectImg,
            this.frameX * this.width,
            0 * this.height,
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
    }

    updateAnimationTick() {
        this.countdown++;
        if(this.countdown > this.countdownTimer) {
            this.frameX++;
            this.countdown = 0;

            if(this.frameX >= Constants.Water.getSpriteAmount()) {
                this.frameX = 0;
            }
        }
    }
}