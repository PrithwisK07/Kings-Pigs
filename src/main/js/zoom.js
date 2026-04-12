import { floatingTile, setZoomLevel, zoomLevel } from "./floating.js";

const canvasContainer = document.querySelector(".canvas-container");
const zoomWrapper = document.querySelector(".zoom-wrapper");
const zoomStep = 0.1,
  minZoom = 0.2,
  maxZoom = 3;

let offsetX = 0,
  offsetY = 0;

canvasContainer.addEventListener("wheel", (e) => {
  if (!e.ctrlKey) return;
  e.preventDefault();

  const rect = canvasContainer.getBoundingClientRect();
  const cursorX = e.clientX - rect.left;
  const cursorY = e.clientY - rect.top;

  const oldZoom = zoomLevel;
  const newZoom =
    e.deltaY < 0
      ? Math.min(oldZoom + zoomStep, maxZoom)
      : Math.max(oldZoom - zoomStep, minZoom);

  // adjust offsets so cursor stays fixed
  offsetX = cursorX - (cursorX - offsetX) * (newZoom / oldZoom);
  offsetY = cursorY - (cursorY - offsetY) * (newZoom / oldZoom);

  zoomWrapper.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${newZoom})`;

  if (floatingTile) {
    const naturalW = floatingTile.naturalWidth || floatingTile.width;
    const naturalH = floatingTile.naturalHeight || floatingTile.height;

    floatingTile.style.width = naturalW * newZoom + "px";
    floatingTile.style.height = naturalH * newZoom + "px";
  }

  setZoomLevel(newZoom);
});
