export default class Levels {
  constructor(levelManager) {
    this.levelManager = levelManager;
  }

  getLevelImgPath(levelName) {
    switch (levelName) {
      case 1:
        this.levelManager.tileSetImgPath = "../res/Terrain (32x32).png";
        this.levelManager.levelDataImgPath = "../res/landing_page_data.png";
        break;
    }
  }
}
