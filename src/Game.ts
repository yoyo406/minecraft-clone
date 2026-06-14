import { Renderer } from './rendering/Renderer';
import { World } from './world/World';
import { Player } from './player/Player';
import { InputHandler } from './player/InputHandler';
import { HUD } from './ui/HUD';

export class Game {
  private renderer: Renderer;
  private world: World;
  private player: Player;
  private input: InputHandler;
  private hud: HUD;
  private lastTime: number = 0;
  private fpsFrames: number = 0;
  private fpsTime: number = 0;
  private fps: number = 0;
  private running: boolean = false;

  constructor(container: HTMLElement) {
    this.renderer = new Renderer(container);
    this.world = new World(this.renderer.scene, this.renderer.material, 42);
    this.player = new Player(this.renderer.camera);
    this.input = new InputHandler(this.renderer.domElement);
    this.hud = new HUD(this.renderer.material.map!);

    this.input.setLockChangeCallback(() => {
      this.hud.setPointerLocked(this.input.pointerLocked);
    });

    // Initial HUD state
    this.hud.setPointerLocked(false);
  }

  start(): void {
    this.running = true;

    // Load initial chunks around spawn
    this.world.update(this.player.body.x, this.player.body.z);

    // Spawn player on surface
    this.player.spawn(this.world);

    // Build hotbar UI
    this.hud.buildHotbar(this.player);

    // Start game loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  private loop(time: number): void {
    if (!this.running) return;

    const dt = Math.min((time - this.lastTime) / 1000, 0.1); // cap at 100ms
    this.lastTime = time;

    // FPS counter
    this.fpsFrames++;
    this.fpsTime += dt;
    if (this.fpsTime >= 1.0) {
      this.fps = Math.round(this.fpsFrames / this.fpsTime);
      this.fpsFrames = 0;
      this.fpsTime = 0;
    }

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  private update(dt: number): void {
    // Update player (movement, physics, interaction)
    this.player.update(dt, this.input, this.world);

    // Update world (chunk loading/unloading)
    this.world.update(this.player.body.x, this.player.body.z);

    // Update HUD
    this.hud.update(this.player, this.fps);
  }

  private render(): void {
    this.renderer.render();
  }
}
