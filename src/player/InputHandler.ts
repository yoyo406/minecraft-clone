export class InputHandler {
  keys: Set<string> = new Set();
  mouseX: number = 0;
  mouseY: number = 0;
  mouseDeltaX: number = 0;
  mouseDeltaY: number = 0;
  leftClick: boolean = false;
  rightClick: boolean = false;
  pointerLocked: boolean = false;
  scrollDelta: number = 0;

  private canvas: HTMLElement;
  private onLockChange: (() => void) | null = null;

  constructor(canvas: HTMLElement) {
    this.canvas = canvas;
    this.setupListeners();
  }

  private setupListeners(): void {
    document.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (e.code === 'F3') e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    document.addEventListener('mousemove', (e) => {
      if (this.pointerLocked) {
        this.mouseDeltaX += e.movementX;
        this.mouseDeltaY += e.movementY;
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (!this.pointerLocked) {
        this.requestPointerLock();
        return;
      }
      if (e.button === 0) this.leftClick = true;
      if (e.button === 2) this.rightClick = true;
    });

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    document.addEventListener('wheel', (e) => {
      this.scrollDelta += Math.sign(e.deltaY);
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
      if (this.onLockChange) this.onLockChange();
    });
  }

  requestPointerLock(): void {
    this.canvas.requestPointerLock();
  }

  setLockChangeCallback(fn: () => void): void {
    this.onLockChange = fn;
  }

  consumeMouseDelta(): { dx: number; dy: number } {
    const dx = this.mouseDeltaX;
    const dy = this.mouseDeltaY;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    return { dx, dy };
  }

  consumeLeftClick(): boolean {
    const v = this.leftClick;
    this.leftClick = false;
    return v;
  }

  consumeRightClick(): boolean {
    const v = this.rightClick;
    this.rightClick = false;
    return v;
  }

  consumeScroll(): number {
    const v = this.scrollDelta;
    this.scrollDelta = 0;
    return v;
  }

  isKeyDown(code: string): boolean {
    return this.keys.has(code);
  }
}
