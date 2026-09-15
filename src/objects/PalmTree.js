import Object from "./Object.js";
import Constants from "../utilities/Constants.js";

export default class PalmTree extends Object {
    constructor(x, y, flip, levelManager, player) {
        super(x, y, Constants.PalmTree.PALM_TREE_WIDTH, Constants.PalmTree.PALM_TREE_HEIGHT);

        this.levelManager = levelManager;
        this.player = player;
        this.flip = flip;

        this.initHitbox(
            x + 10 * Constants.SCALE,
            y - 35 * Constants.SCALE,
            Constants.PalmTree.PALM_TREE_WIDTH * Constants.SCALE / 3 - 8 * Constants.SCALE,
            Constants.PalmTree.PALM_TREE_HEIGHT * Constants.SCALE / 4
        );

        this.countdownTimer = Constants.PalmTree.FRAME_SPEED;

        this.loadImg(Constants.PalmTree.PALM_TREE_SRC);
    }

    update() {
        this.updateAnimationtick();
    }

    updateAnimationtick() {
        this.countdown++;

        if(this.countdown > this.countdownTimer) {
            this.countdown = 0;
            this.frameX++;

            if(this.frameX >= Constants.PalmTree.getSpriteAmount()) {
                this.frameX = 0;
            }
        }
    }

    draw(ctx, XlvlOffset, YlvlOffset) {
        if(!this.objectImg) return;
        
        // this.drawHitbox(ctx, XlvlOffset, YlvlOffset);
        
        let drawX = this.hitbox.x - XlvlOffset - this.hitbox.width - 13 * Constants.SCALE;

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