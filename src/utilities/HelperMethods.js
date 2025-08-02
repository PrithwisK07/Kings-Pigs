import Constants from "./Constants.js";

export function canMoveHere(x, y, width, height, levelData) {
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

  if (value >= 45 && value <= 95) return false;

  if (value >= 95 || value < 0 || value != 12) return true;
  return false;
}

export function GetEntityXPosNextToWall(hitbox, xSpeed) {
  if (xSpeed > 0) {
    // moving right → right side collision
    const XIndex = Math.floor(
      (hitbox.x + hitbox.width + xSpeed) / Constants.TILE_SIZE
    );
    const tileXPOS = XIndex * Constants.TILE_SIZE;
    return tileXPOS - hitbox.width - 1;
  } else {
    const XIndex = Math.floor(hitbox.x / Constants.TILE_SIZE);
    const tileXPOS = XIndex * Constants.TILE_SIZE;

    return Math.floor(tileXPOS);
  }
}

export function GetEntityYPosUnderRoofOrAboveFloor(hitbox, ySpeed) {
  const YIndex = Math.floor(hitbox.y / Constants.TILE_SIZE);
  const tileYPOS = YIndex * Constants.TILE_SIZE;

  if (ySpeed > 0) {
    const yOffset = Constants.TILE_SIZE - hitbox.height;
    return Math.floor(tileYPOS + yOffset - 1);
  } else {
    return Math.floor(tileYPOS);
  }
}

export function isEntityOnFloor(hitbox, levelData) {
  if (!isSolid(hitbox.x, hitbox.y + hitbox.height + 2, levelData))
    if (
      !isSolid(hitbox.x + hitbox.width, hitbox.y + hitbox.height + 1, levelData)
    )
      return false;

  return true;
}
