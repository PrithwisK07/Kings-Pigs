import Constants from "../utilities/Constants.js";

export default class Levels {
  constructor(levelManager, player) {
    this.levelManager = levelManager;
    this.player = player;
  }

  async getLevelImgPath(levelName) {
    
    const customTestLevel = localStorage.getItem("test_level_data");

    switch (levelName) {
      case 1:
        this.levelManager.tileSetImgPath = Constants.Levels.level1.tileSetImgPath;
        
        if (customTestLevel) {
          this.levelManager.levelDataImgPath = customTestLevel;
          console.log("🎮 Loaded custom playtest level from Editor!");
        } else {
          this.levelManager.levelDataImgPath = Constants.Levels.level1.levelDataImgPath;
        }
        break;
        
    }
  }
}