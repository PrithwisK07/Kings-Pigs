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
    JUMP_POWER: 400,
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
};

export default Constants;
