export async function getSpriteAtlas(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

export function cropImage(img, sx, sy, sw, sh) {
  const scale = window.devicePixelRatio || 1;

  const canvas = document.createElement("canvas");
  canvas.width = sw * scale;
  canvas.height = sh * scale;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  ctx.scale(scale, scale);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  const croppedImage = new Image();
  croppedImage.src = canvas.toDataURL("image/png");
  return croppedImage;
}
