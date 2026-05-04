import Constants from "../utilities/Constants.js";

export default class Levels {
  constructor(levelManager, player) {
    this.levelManager = levelManager;
    this.player = player;
  }

  async getLevelImgPath(levelName) {
    const levelInt = parseInt(levelName) || 1;
    
    const customLevels = JSON.parse(localStorage.getItem("kings_pigs_custom_levels")) || {};
    const customData = customLevels[levelInt.toString()];

    this.levelManager.tileSetImgPath = Constants.Levels.level1.tileSetImgPath;

    if (customData) {
      this.levelManager.levelDataImgPath = customData;
      console.log(`🎮 Loaded Custom Level ${levelInt} from Editor Memory!`);
    } else {
      switch (levelInt) {
        case 1:
          // FIX: Use Absolute Paths!
          this.levelManager.levelDataImgPath = "../res/level_data_25x15.png";
          break;
        case 2:
          this.levelManager.levelDataImgPath = "/res/level_2_default.png";
          break;
        case 3:
          this.levelManager.levelDataImgPath = "/res/level_3_default.png";
          break;
        default:
          this.levelManager.levelDataImgPath = "/res/level_data_25x15.png";
          console.warn(`⚠️ Default map missing! Falling back to Level 1.`);
          break;
      }
      console.log(`🎮 Loaded Default Level ${levelInt}`);
    }
  }
}