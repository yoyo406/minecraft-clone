import * as THREE from 'three';
import { BlockType } from '../blocks/BlockType';
import { isSolid } from '../blocks/BlockRegistry';
import { World } from '../world/World';
import { InputHandler } from './InputHandler';
import { applyPhysics, PhysicsBody } from './Physics';

const MOVE_SPEED = 5.0;
const SNEAK_SPEED = 2.0;
const JUMP_VELOCITY = 8.5;
const MOUSE_SENSITIVITY = 0.002;
const PLAYER_HEIGHT = 1.7;
const PLAYER_WIDTH = 0.6;
const EYE_HEIGHT = 1.6;
const REACH = 6;

export class Player {
  body: PhysicsBody;
  yaw: number = 0;
  pitch: number = 0;
  selectedSlot: number = 0;
  camera: THREE.PerspectiveCamera;
  hotbar: BlockType[] = [
    BlockType.GRASS, BlockType.DIRT, BlockType.STONE,
    BlockType.COBBLESTONE, BlockType.WOOD, BlockType.PLANKS,
    BlockType.BRICK, BlockType.GLASS, BlockType.SAND,
  ];

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.body = {
      x: 0,
      y: 40,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      onGround: false,
    };
  }

  get selectedBlock(): BlockType {
    return this.hotbar[this.selectedSlot];
  }

  update(dt: number, input: InputHandler, world: World): void {
    // Mouse look
    if (input.pointerLocked) {
      const { dx, dy } = input.consumeMouseDelta();
      this.yaw -= dx * MOUSE_SENSITIVITY;
      this.pitch -= dy * MOUSE_SENSITIVITY;
      this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch));
    }

    // Movement
    const sneaking = input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight');
    const speed = sneaking ? SNEAK_SPEED : MOVE_SPEED;

    let moveX = 0;
    let moveZ = 0;

    if (input.isKeyDown('KeyW')) moveZ -= 1;
    if (input.isKeyDown('KeyS')) moveZ += 1;
    if (input.isKeyDown('KeyA')) moveX -= 1;
    if (input.isKeyDown('KeyD')) moveX += 1;

    // Normalize diagonal movement
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      moveX /= len;
      moveZ /= len;
    }

    // Rotate movement by yaw
    const sinYaw = Math.sin(this.yaw);
    const cosYaw = Math.cos(this.yaw);
    this.body.vx = (moveX * cosYaw - moveZ * sinYaw) * speed;
    this.body.vz = (moveX * sinYaw + moveZ * cosYaw) * speed;

    // Jump
    if ((input.isKeyDown('Space')) && this.body.onGround) {
      this.body.vy = JUMP_VELOCITY;
      this.body.onGround = false;
    }

    // Physics
    applyPhysics(this.body, world, dt);

    // Update camera
    this.camera.position.set(this.body.x, this.body.y + EYE_HEIGHT, this.body.z);
    const lookDir = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    );
    this.camera.lookAt(this.camera.position.clone().add(lookDir));

    // Hotbar selection
    const scroll = input.consumeScroll();
    if (scroll !== 0) {
      this.selectedSlot = ((this.selectedSlot + scroll) % 9 + 9) % 9;
    }
    for (let i = 0; i < 9; i++) {
      if (input.isKeyDown(`Digit${i + 1}`)) {
        this.selectedSlot = i;
      }
    }

    // Block interaction
    if (input.pointerLocked) {
      if (input.consumeLeftClick()) {
        this.breakBlock(world);
      }
      if (input.consumeRightClick()) {
        this.placeBlock(world);
      }
    }
  }

  raycast(world: World): { x: number; y: number; z: number; nx: number; ny: number; nz: number } | null {
    const dir = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    );

    const origin = new THREE.Vector3(this.body.x, this.body.y + EYE_HEIGHT, this.body.z);
    const step = 0.05;
    let prevX = Math.floor(origin.x);
    let prevY = Math.floor(origin.y);
    let prevZ = Math.floor(origin.z);

    for (let t = 0; t < REACH; t += step) {
      const px = origin.x + dir.x * t;
      const py = origin.y + dir.y * t;
      const pz = origin.z + dir.z * t;

      const bx = Math.floor(px);
      const by = Math.floor(py);
      const bz = Math.floor(pz);

      if (bx !== prevX || by !== prevY || bz !== prevZ) {
        const block = world.getBlock(bx, by, bz);
        if (isSolid(block)) {
          return {
            x: bx, y: by, z: bz,
            nx: prevX - bx,
            ny: prevY - by,
            nz: prevZ - bz,
          };
        }
        prevX = bx;
        prevY = by;
        prevZ = bz;
      }
    }
    return null;
  }

  private breakBlock(world: World): void {
    const hit = this.raycast(world);
    if (hit) {
      world.setBlock(hit.x, hit.y, hit.z, BlockType.AIR);
    }
  }

  private placeBlock(world: World): void {
    const hit = this.raycast(world);
    if (hit) {
      const px = hit.x + hit.nx;
      const py = hit.y + hit.ny;
      const pz = hit.z + hit.nz;

      // Don't place inside player
      const halfW = PLAYER_WIDTH / 2;
      if (
        px >= Math.floor(this.body.x - halfW) && px <= Math.floor(this.body.x + halfW) &&
        pz >= Math.floor(this.body.z - halfW) && pz <= Math.floor(this.body.z + halfW) &&
        py >= Math.floor(this.body.y) && py <= Math.floor(this.body.y + PLAYER_HEIGHT)
      ) {
        return;
      }

      world.setBlock(px, py, pz, this.selectedBlock);
    }
  }

  /** Spawn player on the highest block near origin */
  spawn(world: World): void {
    const spawnX = 8;
    const spawnZ = 8;
    const highestY = world.getHighestBlock(spawnX, spawnZ);
    this.body.x = spawnX + 0.5;
    this.body.y = highestY + 1;
    this.body.z = spawnZ + 0.5;
  }
}
