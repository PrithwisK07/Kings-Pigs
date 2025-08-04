const Constants = {
  SCALE: 1.94,
  OG_TILE_SIZE: 32,
  TILE_SIZE: Math.floor(32 * 1.94),
  TILE_IN_ROW: 30,
  TILE_IN_COLUMN: 20,

  Player: {
    DOOR_OUT: 0,
    DOOR_IN: 1,
    DEATH: 2,
    HIT: 3,
    ATTACK: 4,
    RUNNING: 5,
    GROUND: 6,
    FALL: 7,
    JUMP: 8,
    IDLE: 9,
    FRAME_SPEED: 20,

    PLAYER_IMG_SRC: "../res/KingSprite.png",
    PLAYER_SPEED: 1.5,
    PLAYER_WIDTH: 78,
    PLAYER_HEIGHT: 58,

    get PLAYER_X() {
      return window.innerWidth / 2 - this.PLAYER_WIDTH / 2;
    },

    get PLAYER_Y() {
      return window.innerHeight / 2 - this.PLAYER_HEIGHT / 2;
    },

    getSpriteAmount(action) {
      switch (action) {
        case Constants.Player.DOOR_IN:
          return 8;
        case Constants.Player.DOOR_OUT:
          return 8;
        case Constants.Player.DEATH:
          return 4;
        case Constants.Player.HIT:
          return 2;
        case Constants.Player.ATTACK:
          return 3;
        case Constants.Player.RUNNING:
          return 8;
        case Constants.Player.GROUND:
          return 1;
        case Constants.Player.FALL:
          return 1;
        case Constants.Player.JUMP:
          return 1;
        case Constants.Player.IDLE:
          return 7;
        default:
          return -1;
      }
    },
  },
  Door: {
    IDLE: 0,
    OPEN: 1,
    CLOSE: 2,
    FRAME_SPEED: 30,

    DOOR_IMG_SRC: "../res/Door.png",
    DOOR_WIDTH: 46,
    DOOR_HEIGHT: 56,

    getSpriteAmount(action) {
      switch (action) {
        case Constants.Door.IDLE:
          return 1;
        case Constants.Door.OPEN:
          return 4;
        case Constants.Door.CLOSE:
          return 2;
        default:
          return -1;
      }
    },
  },
  Levels: {
    level1: {
      tileSetImgPath: "../res/Terrain (32x32).png",
      levelDataImgPath: "../res/landing_page_data (2).png",
    },
  },
  KingPig: {
    KINGPIG_WIDTH: 38,
    KINGPIG_HEIGHT: 28,
    FRAME_SPEED: 20,
    SPEED: 0.8,
    KINGPIG_SRC: "../res/KingPig.png",

    DEATH: 0,
    HIT: 1,
    ATTACK: 2,
    GROUND: 3,
    FALL: 4,
    JUMP: 5,
    RUNNING: 6,
    IDLE: 7,

    getSpriteAmount(entityState) {
      switch (entityState) {
        case Constants.KingPig.DEATH:
          return 4;
        case Constants.KingPig.HIT:
          return 2;
        case Constants.KingPig.ATTACK:
          return 5;
        case Constants.KingPig.GROUND:
          return 1;
        case Constants.KingPig.FALL:
          return 1;
        case Constants.KingPig.JUMP:
          return 1;
        case Constants.KingPig.RUNNING:
          return 5;
        case Constants.KingPig.IDLE:
          return 12;
        default:
          break;
      }
    },
  },
};

export default Constants;
