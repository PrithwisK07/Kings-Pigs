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
  Pig: {
    PIG_WIDTH: 34,
    PIG_HEIGHT: 28,
    FRAME_SPEED: 20,
    SPEED: 0.8,
    PIG_SRC: "../res/Pig.png",

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
        case Constants.Pig.DEATH:
          return 4;
        case Constants.Pig.HIT:
          return 2;
        case Constants.Pig.ATTACK:
          return 5;
        case Constants.Pig.GROUND:
          return 1;
        case Constants.Pig.FALL:
          return 1;
        case Constants.Pig.JUMP:
          return 1;
        case Constants.Pig.RUNNING:
          return 6;
        case Constants.Pig.IDLE:
          return 11;
        default:
          return -1;
      }
    },
  },
  PigThrowingBox: {
    PIG_THROWING_BOX_WIDTH: 34,
    PIG_THROWING_BOX_HEIGHT: 30,
    PIG_THROWING_BOX_SRC: "../res/PigThrowingBox.png",
    SPEED: 0.8,

    withoutBox: {
      DEATH: 0,
      HIT: 1,
      ATTACK: 2,
      GROUND: 3,
      FALL: 4,
      JUMP: 5,
      RUNNING: 6,
      IDLE: 7,
    },
    withBox: {
      ATTACK: 8,
      RUNNING: 9,
      IDLE: 10,
      PICKING: 11,
    },

    getSpriteAmount(entityState, hasBox) {
      if (hasBox) {
        switch (entityState) {
          case Constants.PigThrowingBox.withBox.PICKING:
            return 5;
          case Constants.PigThrowingBox.withBox.ATTACK:
            return 5;
          case Constants.PigThrowingBox.withBox.RUNNING:
            return 6;
          case Constants.PigThrowingBox.withBox.IDLE:
            return 9;
          default:
            return -1;
        }
      } else {
        switch (entityState) {
          case Constants.PigThrowingBox.withoutBox.DEATH:
            return 4;
          case Constants.PigThrowingBox.withoutBox.HIT:
            return 2;
          case Constants.PigThrowingBox.withoutBox.ATTACK:
            return 5;
          case Constants.PigThrowingBox.withoutBox.GROUND:
            return 1;
          case Constants.PigThrowingBox.withoutBox.FALL:
            return 1;
          case Constants.PigThrowingBox.withoutBox.JUMP:
            return 1;
          case Constants.PigThrowingBox.withoutBox.RUNNING:
            return 6;
          case Constants.PigThrowingBox.withoutBox.IDLE:
            return 11;
          default:
            return -1;
        }
      }
    },
  },

  PigWithMatch: {
    PIG_WITH_MATCH_WIDTH: 34,
    PIG_WITH_MATCH_HEIGHT: 28,
    PIG_WITH_MATCH_SRC: "../res/PigWithMatch.png",
    SPEED: 0.8,
    FRAME_SPEED: 30,

    withoutMatch: {
      IDLE: 0,
      LIGHT: 3,
    },
    withMatch: {
      ATTACK: 1,
      IDLE: 2,
    },

    getSpriteAmount(entityState, hasMatch) {
      if (hasMatch) {
        switch (entityState) {
          case Constants.PigWithMatch.withMatch.ATTACK:
            return 3;
          case Constants.PigWithMatch.withMatch.IDLE:
            return 3;
          default:
            return -1;
        }
      } else {
        switch (entityState) {
          case Constants.PigWithMatch.withoutMatch.IDLE:
            return 11;
          case Constants.PigWithMatch.withoutMatch.LIGHT:
            return 3;
          default:
            return -1;
        }
      }
    },
  },

  Box: {
    BOX_WIDTH: 22,
    BOX_HEIGHT: 16,
    BOX_SRC: "../res/Box.png",

    IDLE: 0,
    HIT: 1,

    getSpriteAmount(entityState) {
      switch (entityState) {
        case Constants.Box.HIT:
          return 1;
        case Constants.Box.IDLE:
          return 1;
        default:
          return -1;
      }
    },
  },

  Cannon: {
    CANNON_WIDTH: 44,
    CANNON_HEIGHT: 28,
    CANNON_SRC: "../res/Cannon.png",

    ATTACK: 0,
    IDLE: 1,

    getSpriteAmount(entityState) {
      switch (entityState) {
        case Constants.Cannon.ATTACK:
          return 4;
        case Constants.Cannon.IDLE:
          return 1;
        default:
          return -1;
      }
    },
  },

  Projectile: {
    PROJECTILE_WIDTH: 44,
    PROJECTILE_HEIGHT: 28,
    PROJECTILE_SRC: "../res/Cannon Ball.png",
    PROJECTILE_SPEED: 1.2,

    EXPLOSION_WIDTH: 52,
    EXPLOSION_HEIGHT: 56,
    EXPLOSION_SRC: "../res/Boooooom (52x56).png",

    getSpriteAmount() {
      return 6;
    },
  },
};

export default Constants;
