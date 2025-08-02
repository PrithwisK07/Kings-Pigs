export default class MouseInput {
  constructor(player) {
    this.player = player;
    addEventListener("mousemove", (e) => this.handleMouseMove(e));
    addEventListener("mousedown", (e) => this.handleMouseDown(e));
  }

  handleMouseDown(e) {
    const Mouse = e.button;
    this.player.mouseClicked(Mouse);
  }

  handleMouseMove(e) {
    const mousePos = {
      x: e.clientX,
      y: e.clientY,
    };
  }
}
