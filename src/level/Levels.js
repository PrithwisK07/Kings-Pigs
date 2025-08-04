import Door from "../objects/Door.js";
import Constants from "../utilities/Constants.js";

export default class Levels {
  constructor(levelManager, player) {
    this.levelManager = levelManager;
    this.player = player;
  }

  getLevelImgPath(levelName) {
    const entryX = 250;
    const entryY = 400;

    const exitX = Constants.OG_TILE_SIZE * 20;
    const exitY = Constants.OG_TILE_SIZE * 12;

    switch (levelName) {
      case 1:
        this.levelManager.tileSetImgPath =
          Constants.Levels.level1.tileSetImgPath;
        this.levelManager.levelDataImgPath =
          Constants.Levels.level1.levelDataImgPath;
        this.levelManager.door = [
          new Door(entryX, entryY, this.player, 1),
          new Door(exitX, exitY, this.player, 0),
        ];
        break;
    }
  }
}

// possible write two door classes, one for entry door and one for exit door.
