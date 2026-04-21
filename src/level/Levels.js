import Constants from "../utilities/Constants.js";

export default class Levels {
  constructor(levelManager, player) {
    this.levelManager = levelManager;
    this.player = player;
  }

  async getLevelImgPath(levelName) {

    switch (levelName) {
      case 1:
        this.levelManager.tileSetImgPath =
          Constants.Levels.level1.tileSetImgPath;
        // this.levelManager.levelDataImgPath =
        //   Constants.Levels.level1.levelDataImgPath;
        this.levelManager.levelDataImgPath =
          "../res/level_data_25x15.png";
    }
  }
}
