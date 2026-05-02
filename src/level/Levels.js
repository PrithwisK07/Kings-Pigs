import Constants from "../utilities/Constants.js";

export default class Levels {
  constructor(levelManager, player) {
    this.levelManager = levelManager;
    this.player = player;
  }

  async getLevelImgPath(levelName) {
    // 1. Force levelName to be an integer
    const levelInt = parseInt(levelName) || 1;
    
    // 2. Fetch the dictionary of custom levels
    const customLevels = JSON.parse(localStorage.getItem("kings_pigs_custom_levels")) || {};
    const customData = customLevels[levelInt.toString()];

    // 3. SET THE TILESET (Always use the base tileset for all levels)
    // If you add new Biomes later, you can write logic here to change it!
    this.levelManager.tileSetImgPath = Constants.Levels.level1.tileSetImgPath;

    // 4. DETERMINE THE LEVEL DATA
    if (customData) {
      // If a custom map exists in memory, use it immediately for ANY level number!
      this.levelManager.levelDataImgPath = customData;
      console.log(`🎮 Loaded Custom Level ${levelInt} from Editor Memory!`);
    } else {
      // If no custom map exists, look for a default game file
      switch (levelInt) {
        case 1:
          this.levelManager.levelDataImgPath = "../res/level_data_25x15.png";
          break;
        case 2:
          this.levelManager.levelDataImgPath = "../res/level_2_default.png";
          break;
        case 3:
          this.levelManager.levelDataImgPath = "../res/level_3_default.png";
          break;
        default:
          // SAFETY NET: If they click Level 8 but no file exists, load Level 1 so the game doesn't crash!
          this.levelManager.levelDataImgPath = "../res/level_data_25x15.png";
          console.warn(`⚠️ Default map for Level ${levelInt} missing! Falling back to Level 1.`);
          break;
      }
      console.log(`🎮 Loaded Default Level ${levelInt}`);
    }
  }
}