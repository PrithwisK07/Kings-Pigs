import Constants from "./Constants.js";

function getCollidingObject(hitbox, xSpeed, ySpeed, palmTreeStanding, palmTreeZ) {
  if (palmTreeStanding) {
    for (const palmTree of palmTreeStanding) {
      if (
        hitbox.x + xSpeed < palmTree.hitbox.x + palmTree.hitbox.width &&
        hitbox.x + hitbox.width + xSpeed > palmTree.hitbox.x &&
        hitbox.y + ySpeed < palmTree.hitbox.y + palmTree.hitbox.height &&
        hitbox.y + hitbox.height + ySpeed > palmTree.hitbox.y
      ) {
        return palmTree;
      }
    }
  }

  if (palmTreeZ) {
    for (const palmTree of palmTreeZ) {
      if (
        hitbox.x + xSpeed < palmTree.hitbox.x + palmTree.hitbox.width &&
        hitbox.x + hitbox.width + xSpeed > palmTree.hitbox.x &&
        hitbox.y + ySpeed < palmTree.hitbox.y + palmTree.hitbox.height &&
        hitbox.y + hitbox.height + ySpeed > palmTree.hitbox.y
      ) {
        return palmTree;
      }
    }
  }

  return null;
}

export function canMoveHere(x, y, width, height, levelData, palmTreeStanding, palmTreeZ) {
  // Exact boundary check for objects (stops you BEFORE you get inside)
  const dummyHitbox = { x, y, width, height };
  if (getCollidingObject(dummyHitbox, 0, 0, palmTreeStanding, palmTreeZ)) {
    return false;
  }

  // Corner checks for tiles
  if (!isSolid(x, y, levelData))
    if (!isSolid(x + width, y + height, levelData))
      if (!isSolid(x + width, y, levelData))
        if (!isSolid(x, y + height, levelData)) return true;

  return false;
}

function isSolid(x, y, levelData) {
  const maxWidth = levelData[0].length * Constants.TILE_SIZE;
  const maxHeight = levelData.length * Constants.TILE_SIZE;

  if (x < 0 || x >= maxWidth) return true;
  if (y < 0 || y >= maxHeight) return true;

  const XIndex = Math.floor(x / Constants.TILE_SIZE);
  const YIndex = Math.floor(y / Constants.TILE_SIZE);
  
  const value = levelData[YIndex][XIndex];
  
  if (value === 12 || value === 255) return false;

  if ((value >= 0 && value <= 46) || (value >= 94 && value <= 140)) {
    return true; 
  }

  if (value >= 141 || value < 0) return true;

  return false;
}

export function GetEntityYPosUnderRoofOrAboveFloor(hitbox, ySpeed, palmTreeStanding, palmTreeZ) {
  const obj = getCollidingObject(hitbox, 0, ySpeed, palmTreeStanding, palmTreeZ);
  
  if (obj) {
    if (ySpeed > 0) return obj.hitbox.y - hitbox.height - 1; 
    else return obj.hitbox.y + obj.hitbox.height + 1; 
  }

  const YIndex = Math.floor(hitbox.y / Constants.TILE_SIZE);
  const tileYPOS = YIndex * Constants.TILE_SIZE;

  if (ySpeed > 0) {
    const yOffset = Constants.TILE_SIZE - hitbox.height;
    return Math.floor(tileYPOS + yOffset - 1);
  } else {
    return Math.floor(tileYPOS);
  }
}

export function GetEntityXPosNextToWall(hitbox, xSpeed, palmTreeStanding, palmTreeZ) {
  const obj = getCollidingObject(hitbox, xSpeed, 0, palmTreeStanding, palmTreeZ);
  
  if (obj) {
    if (xSpeed > 0) return obj.hitbox.x - hitbox.width - 1;
    else return obj.hitbox.x + obj.hitbox.width + 1; 
  }

  if (xSpeed > 0) {
    const XIndex = Math.floor((hitbox.x + hitbox.width + xSpeed) / Constants.TILE_SIZE);
    const tileXPOS = XIndex * Constants.TILE_SIZE;
    return tileXPOS - hitbox.width - 1;
  } else {
    const XIndex = Math.floor(hitbox.x / Constants.TILE_SIZE);
    const tileXPOS = XIndex * Constants.TILE_SIZE;
    return Math.floor(tileXPOS);
  }
}

export function isEntityOnFloor(hitbox, levelData, palmTreeStanding, palmTreeZ) {
  // AABB floor check for objects (projected 2 pixels downwards)
  if (getCollidingObject(hitbox, 0, 2, palmTreeStanding, palmTreeZ)) {
    return true;
  }

  // Tile checks
  const bottomLeftTile = isSolid(hitbox.x, hitbox.y + hitbox.height + 2, levelData);
  const bottomRightTile = isSolid(hitbox.x + hitbox.width, hitbox.y + hitbox.height + 1, levelData);

  if (!bottomLeftTile && !bottomRightTile) {
    return false;
  }

  return true;
}

export function detectAnySolidTile(x1, y1, x2, y2, levelData) {
  let subject1XIndex = Math.floor(x1 / Constants.TILE_SIZE);
  let subject1YIndex = Math.floor(y1 / Constants.TILE_SIZE);

  let subject2XIndex = Math.floor(x2 / Constants.TILE_SIZE);
  let subject2YIndex = Math.floor(y2 / Constants.TILE_SIZE);

  const a = Math.min(subject1XIndex, subject2XIndex);
  const b = Math.max(subject1XIndex, subject2XIndex);

  if (subject1YIndex != subject2YIndex) return true;

  for (let j = a; j <= b; j++) {
    if (
      isSolid(
        j * Constants.TILE_SIZE,
        subject1YIndex * Constants.TILE_SIZE,
        levelData
      )
    )
      return true;
  }

  return false;
}

export function detectOnDifferentPlatform(x1, y1, x2, y2, levelData) {
  const startX = Math.floor(Math.min(x1, x2) / Constants.TILE_SIZE);
  const endX = Math.floor(Math.max(x1, x2) / Constants.TILE_SIZE);
  const tileY = Math.floor((y1 + Constants.TILE_SIZE) / Constants.TILE_SIZE);

  const subject1YIndex = Math.floor(y1 / Constants.TILE_SIZE);
  const subject2YIndex = Math.floor(y2 / Constants.TILE_SIZE);

  if (subject1YIndex != subject2YIndex) return true;

  for (let x = startX; x <= endX; x++) {
    const tile = levelData[tileY]?.[x];
    if (
      !tile ||
      !isSolid(x * Constants.TILE_SIZE, tileY * Constants.TILE_SIZE, levelData)
    ) {
      return true;
    }
  }

  return false;
}