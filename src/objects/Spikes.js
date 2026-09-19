import Constants from "../utilities/Constants.js";
import Object from "./Object.js";
import { getPigThrowingBombs, getPigThrowingBoxes, getPigs, getKingPigs } from "../utilities/LoadSave.js";

export default class Spikes extends Object {
    constructor(x, y, levelManager, player) {
        super(x, y, Constants.Spikes.SPIKES_WIDTH, Constants.Spikes.SPIKES_HEIGHT);

        this.initHitbox(
            x, 
            y,
            Constants.Spikes.SPIKES_WIDTH * Constants.SCALE,
            Constants.Spikes.SPIKES_HEIGHT * Constants.SCALE
        );

        this.levelManager = levelManager;
        this.player = player;

        this.loadImg(Constants.Spikes.SPIKES_SRC);

        this.getEnemies();
    }

    async getEnemies() {
        this.pigs = await getPigs();
        this.kingPigs = await getKingPigs();
        this.pigThrowingBoxes = await getPigThrowingBoxes();
        this.pigThrowingBombs = await getPigThrowingBombs();
    }

    draw(ctx, XlvlOffset, YlvlOffset) {
        if(!this.objectImg) return;
        
        // this.drawHitbox(ctx, XlvlOffset, YlvlOffset);
        
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            this.objectImg,
            0 * this.width,
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
        if(this.hitbox.intersects(this.player.hitbox)) {
            this.player.takeDamage(1);
            this.player.left = false;
            this.player.right = false;
        }

        if(!this.pigs || !this.kingPigs || !this.pigThrowingBombs || !this.pigThrowingBoxes) return;

        this.pigs.forEach((pig) => {
            if(this.hitbox.intersects(pig.hitbox))
                pig.takeDamage(1);
        });

        this.kingPigs.forEach((pig) => {
            if(this.hitbox.intersects(pig.hitbox))
                pig.takeDamage(1);
        });

        this.pigThrowingBombs.forEach((pig) => {
            if(this.hitbox.intersects(pig.hitbox))
                pig.takeDamage(1);
        });

        this.pigThrowingBoxes.forEach((pig) => {
            if(this.hitbox.intersects(pig.hitbox))
                pig.takeDamage(1);
        });
    }
}