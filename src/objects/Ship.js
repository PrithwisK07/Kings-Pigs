import Constants from "../utilities/Constants.js";
import Object from "./Object.js";
import Sail from "./Sail.js";
import { canMoveHere } from "../utilities/HelperMethods.js";
import Rectangle2D from "../custom/Rectangle2D.js";

export default class Ship extends Object {
    constructor(x, y, flip, levelManager, player) {
        super(x, y, Constants.Ship.SHIP_WIDTH, Constants.Ship.SHIP_HEIGHT);

        this.sail = new Sail(x, y, flip, levelManager, player);

        this.levelManager = levelManager;
        this.player = player;
        this.flip = flip;
        this.sailing = false;

        this.objectState = Constants.Ship.IDLE;

        this.initHitbox(
            x,
            y + 20 * Constants.SCALE,
            Constants.Ship.SHIP_WIDTH * Constants.SCALE,
            Constants.Ship.SHIP_HEIGHT * Constants.SCALE - 5 * Constants.SCALE
        );

        this.topBox = new Rectangle2D(
            this.hitbox.x,
            this.hitbox.y - 2 * Constants.SCALE,
            Constants.Ship.SHIP_WIDTH * Constants.SCALE,
            Constants.Ship.SHIP_HEIGHT * Constants.SCALE / 4
        );

        this.countdownTimer = Constants.Ship.SHIP_SPEED;

        const offsetY = 3;
        
        this.startingY = this.hitbox.y;
        this.peakYDuringSail = this.hitbox.y - offsetY * Constants.SCALE;
        this.troughYDuringSail = this.hitbox.y + offsetY * Constants.SCALE;

        this.sailSpeedY = -0.085;
        this.sailSpeedX = 0.25;

        this.loadImg(Constants.Ship.SHIP_SRC);
    }

    draw(ctx, XlvlOffset, YlvlOffset) {
        if(!this.objectImg) return;

        // this.drawHitbox(ctx, XlvlOffset, YlvlOffset);

        this.sail.draw(ctx, XlvlOffset, YlvlOffset);
        
        ctx.save();

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            this.objectImg,
            this.frameX * this.width,
            this.objectState * this.height,
            this.width,
            this.height,
            this.hitbox.x - XlvlOffset,
            this.hitbox.y - 2 * Constants.SCALE - YlvlOffset,
            this.width * Constants.SCALE, 
            this.height * Constants.SCALE
        );
        ctx.restore();
    }

    update() {
        this.updateAnimationTick();
        this.setAnimation();
        this.sailAnimation();
        this.updateXPos(this.sailSpeedX);
        this.checkPlayerCollision();

        this.sail.update();
    }

    checkPlayerCollision() {
        if(this.topBox.intersects(this.player.hitbox)) {
            this.player.onShip = true;
        } else {
            this.player.onShip = false;
        }
    }

    updateXPos(xSpeed) {
        if(!this.sailing) 
            if(!this.player.onShip) return;

        if (
            canMoveHere(
                this.hitbox.x + xSpeed,
                this.hitbox.y,
                this.hitbox.width,
                this.hitbox.height,
                this.levelManager.levelData
            )
        ) {
            if(!this.sail.openMast && !this.sail.hasOpenedOnce) {
                this.sail.openMast = true;
                this.sail.hasOpenedOnce = true;
            }
            
            if(this.sail.sailing) {
                this.sailing = true;
                this.hitbox.x += xSpeed;
                this.topBox.x += xSpeed;

                if(this.player.onShip) this.player.hitbox.x += xSpeed;
                
                this.sail.hitbox.x += xSpeed;
            }
        } else {
            this.sail.closeMast = true;
            this.sail.sailing = false;
            this.sailing = false;
        }
    }

    setAnimation() {
        this.lastObjectState = this.objectState;

        this.objectState = Constants.Ship.IDLE;

        if(this.sailing) {
            this.objectState = Constants.Ship.SAILING;
        }

        if (this.lastObjectState != this.objectState) {
            this.frameX = 0;
            this.countdown = 0;
        }
    }

    sailAnimation() {
        this.hitbox.y -= this.sailSpeedY;
        this.topBox.y -= this.sailSpeedY;

        if(this.player.onShip)
            this.player.hitbox.y -= this.sailSpeedY;

        if(this.hitbox.y <= this.peakYDuringSail || this.hitbox.y >= this.troughYDuringSail) { 
            this.sailSpeedY = - this.sailSpeedY;
        }
    }

    updateAnimationTick() {
        this.countdown++;
        if(this.countdown >= this.countdownTimer) {
            this.countdown = 0;
            this.frameX++;
            
            if(this.frameX >= Constants.Ship.getSpriteAmount(this.objectState)) {
                this.frameX = 0;
            }
        }
    }
}