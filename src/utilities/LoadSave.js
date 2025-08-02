function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function getSpriteAtlas(src) {
  try {
    const img = await loadImage(src);
    return img;
  } catch (error) {
    console.error("Failed to load image:", error.message);
    throw error;
  }
}

export function getLevelData(levelDataImg) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = levelDataImg.width;
  canvas.height = levelDataImg.height;

  ctx.drawImage(levelDataImg, 0, 0); // Invisible draw

  const { data } = ctx.getImageData(
    0,
    0,
    levelDataImg.width,
    levelDataImg.height
  );

  const levelData = [];

  for (let i = 0; i < levelDataImg.height; i++) {
    const row = [];
    for (let j = 0; j < levelDataImg.width; j++) {
      const index = (i * levelDataImg.width + j) * 4;
      let value = data[index];
      let greenValue = data[index + 1];

      if (greenValue == 0 && value == 0) value = 12;

      row.push(value);
    }
    levelData.push(row);
  }

  return levelData;
}
