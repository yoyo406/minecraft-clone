import { isSolid } from '../blocks/BlockRegistry';
import { World } from '../world/World';

export interface PhysicsBody {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  width: number;
  height: number;
  onGround: boolean;
}

const GRAVITY = -25;
const TERMINAL_VELOCITY = -50;

export function applyPhysics(body: PhysicsBody, world: World, dt: number): void {
  // Apply gravity
  body.vy += GRAVITY * dt;
  if (body.vy < TERMINAL_VELOCITY) body.vy = TERMINAL_VELOCITY;

  // Move and collide on each axis separately
  moveAxis(body, world, 'x', body.vx * dt);
  moveAxis(body, world, 'z', body.vz * dt);
  moveAxisY(body, world, body.vy * dt);
}

function moveAxis(body: PhysicsBody, world: World, axis: 'x' | 'z', delta: number): void {
  if (delta === 0) return;

  body[axis] += delta;

  const halfW = body.width / 2;
  const minX = Math.floor(body.x - halfW);
  const maxX = Math.floor(body.x + halfW);
  const minZ = Math.floor(body.z - halfW);
  const maxZ = Math.floor(body.z + halfW);
  const minY = Math.floor(body.y);
  const maxY = Math.floor(body.y + body.height);

  for (let bx = minX; bx <= maxX; bx++) {
    for (let bz = minZ; bz <= maxZ; bz++) {
      for (let by = minY; by <= maxY; by++) {
        if (isSolid(world.getBlock(bx, by, bz))) {
          // Collision detected — push back
          if (delta > 0) {
            if (axis === 'x') body.x = bx - halfW - 0.001;
            else body.z = bz - halfW - 0.001;
          } else {
            if (axis === 'x') body.x = bx + 1 + halfW + 0.001;
            else body.z = bz + 1 + halfW + 0.001;
          }
          if (axis === 'x') body.vx = 0;
          else body.vz = 0;
          return;
        }
      }
    }
  }
}

function moveAxisY(body: PhysicsBody, world: World, delta: number): void {
  if (delta === 0) return;

  body.y += delta;
  body.onGround = false;

  const halfW = body.width / 2;
  const minX = Math.floor(body.x - halfW);
  const maxX = Math.floor(body.x + halfW);
  const minZ = Math.floor(body.z - halfW);
  const maxZ = Math.floor(body.z + halfW);

  if (delta < 0) {
    // Moving down
    const checkY = Math.floor(body.y);
    for (let bx = minX; bx <= maxX; bx++) {
      for (let bz = minZ; bz <= maxZ; bz++) {
        if (isSolid(world.getBlock(bx, checkY, bz))) {
          body.y = checkY + 1;
          body.vy = 0;
          body.onGround = true;
          return;
        }
      }
    }
  } else {
    // Moving up
    const checkY = Math.floor(body.y + body.height);
    for (let bx = minX; bx <= maxX; bx++) {
      for (let bz = minZ; bz <= maxZ; bz++) {
        if (isSolid(world.getBlock(bx, checkY, bz))) {
          body.y = checkY - body.height;
          body.vy = 0;
          return;
        }
      }
    }
  }
}
