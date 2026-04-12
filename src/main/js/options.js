import { offsetX, offsetY, setOffset } from "./canvas.js";
import { setZoomLevel } from "./floating.js";

// Option buttons
const options = document.querySelectorAll(".option");
options.forEach((option) => {
  option.addEventListener("click", () => {
    options.forEach((opt) => opt.classList.remove("active"));
    option.classList.add("active");
  });
});

// Save animation
const circle = document.querySelector(".progress");
const saveWrapper = document.querySelector("#save-wrapper");

saveWrapper.addEventListener("click", () => {
  circle.style.transition = "none";
  circle.style.strokeDashoffset = 283;
  circle.style.opacity = "1";

  setTimeout(() => {
    circle.style.transition = "stroke-dashoffset 1.25s linear";
    circle.style.strokeDashoffset = 0;

    setTimeout(() => (circle.style.opacity = "0"), 1400);
  }, 10);
});

const scrollToContent = document.querySelector(".back");
scrollToContent.addEventListener("click", () => {
  setOffset({ offsetX: 0, offsetY: 0 });
  setZoomLevel(1);
});

const grid_mask = document.querySelector(".grid-mask");
const grid = document.querySelector(".grid");
grid.addEventListener("click", () => {
  grid_mask.classList.toggle("active");
});
