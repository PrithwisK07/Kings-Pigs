export default class KeyBoardInputs {
  constructor(player) {
    this.player = player;
    addEventListener("keydown", (e) => this.handleKeyDown(e));
    addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    const Key = e.key;
    this.player.keyPressed(Key);
  }

  handleKeyUp(e) {
    const Key = e.key;
    this.player.keyReleased(Key);
  }
}
