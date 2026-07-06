// Tracks keyboard/mouse state and resolves clicks into "interact" vs "fire".
class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouse = { x: 0, y: 0 };
    this.firing = false;
    this.onInteract = null; // (x, y) => boolean (true if it consumed the click)
    this.onAnyInput = null; // () => void, used to leave the START screen

    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      if (this.onAnyInput) this.onAnyInput();
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    canvas.addEventListener('mousemove', (e) => {
      this._updateMouse(e);
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      this._updateMouse(e);
      if (this.onAnyInput) this.onAnyInput();
      const consumed = this.onInteract ? this.onInteract(this.mouse.x, this.mouse.y) : false;
      if (!consumed) this.firing = true;
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button !== 0) return;
      this.firing = false;
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _updateMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    this.mouse.x = (e.clientX - rect.left) * scaleX;
    this.mouse.y = (e.clientY - rect.top) * scaleY;
  }

  isDown(key) {
    return this.keys.has(key);
  }

  getMoveVector() {
    let x = 0;
    let y = 0;
    if (this.isDown('w') || this.isDown('arrowup')) y -= 1;
    if (this.isDown('s') || this.isDown('arrowdown')) y += 1;
    if (this.isDown('a') || this.isDown('arrowleft')) x -= 1;
    if (this.isDown('d') || this.isDown('arrowright')) x += 1;
    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.sqrt(2);
      x *= inv;
      y *= inv;
    }
    return { x, y };
  }
}
