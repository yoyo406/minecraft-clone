import * as THREE from 'three';
import { TEXTURE_COUNT } from '../blocks/BlockRegistry';

const TILE_SIZE = 16;
const ATLAS_COLS = 8;

function drawPixels(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, pixels: string[][]) {
  for (let y = 0; y < pixels.length; y++) {
    for (let x = 0; x < pixels[y].length; x++) {
      ctx.fillStyle = pixels[y][x];
      ctx.fillRect(offsetX + x, offsetY + y, 1, 1);
    }
  }
}

function fillTile(ctx: CanvasRenderingContext2D, ox: number, oy: number, baseColor: string, variation: number = 0.05) {
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);

  for (let y = 0; y < TILE_SIZE; y++) {
    for (let x = 0; x < TILE_SIZE; x++) {
      const v = 1 + (Math.random() - 0.5) * variation * 2;
      const cr = Math.min(255, Math.max(0, Math.round(r * v)));
      const cg = Math.min(255, Math.max(0, Math.round(g * v)));
      const cb = Math.min(255, Math.max(0, Math.round(b * v)));
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

function tilePos(index: number): [number, number] {
  const col = index % ATLAS_COLS;
  const row = Math.floor(index / ATLAS_COLS);
  return [col * TILE_SIZE, row * TILE_SIZE];
}

function drawGrassTop(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  fillTile(ctx, ox, oy, '#4a8c2a', 0.12);
  // Darker grass patches
  for (let i = 0; i < 20; i++) {
    const x = Math.floor(Math.random() * 16);
    const y = Math.floor(Math.random() * 16);
    ctx.fillStyle = Math.random() > 0.5 ? '#3d7a22' : '#56a432';
    ctx.fillRect(ox + x, oy + y, 1, 1);
  }
}

function drawGrassSide(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  // Top 3px green, rest dirt
  fillTile(ctx, ox, oy, '#8b6b3d', 0.1);
  for (let x = 0; x < 16; x++) {
    const depth = 2 + Math.floor(Math.random() * 2);
    for (let y = 0; y < depth; y++) {
      const v = 1 + (Math.random() - 0.5) * 0.2;
      const g = Math.round(140 * v);
      ctx.fillStyle = `rgb(${Math.round(74 * v)},${g},${Math.round(42 * v)})`;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

function drawStone(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  fillTile(ctx, ox, oy, '#8a8a8a', 0.1);
  // Darker cracks
  for (let i = 0; i < 12; i++) {
    const x = Math.floor(Math.random() * 16);
    const y = Math.floor(Math.random() * 16);
    ctx.fillStyle = '#6a6a6a';
    ctx.fillRect(ox + x, oy + y, 1 + Math.floor(Math.random() * 2), 1);
  }
}

function drawWoodSide(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  fillTile(ctx, ox, oy, '#6b4c2a', 0.08);
  // Vertical bark lines
  for (let x = 0; x < 16; x += 3 + Math.floor(Math.random() * 2)) {
    for (let y = 0; y < 16; y++) {
      ctx.fillStyle = '#5a3d1e';
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

function drawWoodTop(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  fillTile(ctx, ox, oy, '#6b4c2a', 0.08);
  // Rings
  const cx = 8, cy = 8;
  for (let r = 2; r < 7; r += 2) {
    for (let a = 0; a < Math.PI * 2; a += 0.2) {
      const x = Math.round(cx + Math.cos(a) * r);
      const y = Math.round(cy + Math.sin(a) * r);
      if (x >= 0 && x < 16 && y >= 0 && y < 16) {
        ctx.fillStyle = '#5a3d1e';
        ctx.fillRect(ox + x, oy + y, 1, 1);
      }
    }
  }
}

function drawLeaves(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  fillTile(ctx, ox, oy, '#2d6b1a', 0.15);
  for (let i = 0; i < 30; i++) {
    const x = Math.floor(Math.random() * 16);
    const y = Math.floor(Math.random() * 16);
    ctx.fillStyle = Math.random() > 0.5 ? '#1f5512' : '#3a8025';
    ctx.fillRect(ox + x, oy + y, 1, 1);
  }
}

function drawCobblestone(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  fillTile(ctx, ox, oy, '#7a7a7a', 0.05);
  // Random stone shapes
  for (let i = 0; i < 8; i++) {
    const x = Math.floor(Math.random() * 13);
    const y = Math.floor(Math.random() * 13);
    const w = 2 + Math.floor(Math.random() * 3);
    const h = 2 + Math.floor(Math.random() * 3);
    const shade = 70 + Math.floor(Math.random() * 50);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(ox + x, oy + y, w, h);
  }
}

function drawBedrock(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  fillTile(ctx, ox, oy, '#3a3a3a', 0.15);
  for (let i = 0; i < 15; i++) {
    const x = Math.floor(Math.random() * 16);
    const y = Math.floor(Math.random() * 16);
    ctx.fillStyle = Math.random() > 0.5 ? '#2a2a2a' : '#4a4a4a';
    ctx.fillRect(ox + x, oy + y, 1 + Math.floor(Math.random() * 2), 1 + Math.floor(Math.random() * 2));
  }
}

function drawOre(ctx: CanvasRenderingContext2D, ox: number, oy: number, oreColor: string) {
  drawStone(ctx, ox, oy);
  // Ore spots
  for (let i = 0; i < 6; i++) {
    const x = 2 + Math.floor(Math.random() * 12);
    const y = 2 + Math.floor(Math.random() * 12);
    ctx.fillStyle = oreColor;
    ctx.fillRect(ox + x, oy + y, 2, 2);
  }
}

function drawPlanks(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  fillTile(ctx, ox, oy, '#b8945a', 0.08);
  // Horizontal plank lines
  for (let y = 0; y < 16; y += 4) {
    for (let x = 0; x < 16; x++) {
      ctx.fillStyle = '#8a6b3a';
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

function drawGlass(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  // Light blue transparent look
  fillTile(ctx, ox, oy, '#c8e8f8', 0.03);
  // Frame border
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = '#8ab4c8';
    ctx.fillRect(ox + i, oy, 1, 1);
    ctx.fillRect(ox + i, oy + 15, 1, 1);
    ctx.fillRect(ox, oy + i, 1, 1);
    ctx.fillRect(ox + 15, oy + i, 1, 1);
  }
  // Shine
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(ox + 2, oy + 2, 1, 3);
  ctx.fillRect(ox + 3, oy + 2, 1, 1);
}

function drawBrick(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  fillTile(ctx, ox, oy, '#8a8a8a', 0.03); // mortar
  for (let row = 0; row < 4; row++) {
    const offset = row % 2 === 0 ? 0 : 4;
    for (let col = 0; col < 2; col++) {
      const x = offset + col * 8;
      const y = row * 4;
      const shade = 150 + Math.floor(Math.random() * 30);
      ctx.fillStyle = `rgb(${shade},${Math.round(shade * 0.45)},${Math.round(shade * 0.35)})`;
      ctx.fillRect(ox + x + 1, oy + y + 1, 6, 2);
    }
  }
}

export function createTextureAtlas(): THREE.Texture {
  const rows = Math.ceil(TEXTURE_COUNT / ATLAS_COLS);
  const canvas = document.createElement('canvas');
  canvas.width = ATLAS_COLS * TILE_SIZE;
  canvas.height = rows * TILE_SIZE;
  const ctx = canvas.getContext('2d')!;

  // Fill background
  ctx.fillStyle = '#ff00ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw each texture tile
  const drawFns: Array<(ctx: CanvasRenderingContext2D, ox: number, oy: number) => void> = [
    drawGrassTop,          // 0
    drawGrassSide,         // 1
    (c, x, y) => fillTile(c, x, y, '#8b6b3d', 0.1), // 2 dirt
    drawStone,             // 3
    (c, x, y) => fillTile(c, x, y, '#d4c484', 0.08), // 4 sand
    (c, x, y) => fillTile(c, x, y, '#3355aa', 0.06), // 5 water
    drawWoodSide,          // 6
    drawWoodTop,           // 7
    drawLeaves,            // 8
    drawCobblestone,       // 9
    drawBedrock,           // 10
    (c, x, y) => fillTile(c, x, y, '#f0f0f0', 0.03), // 11 snow
    (c, x, y) => drawOre(c, x, y, '#333333'), // 12 coal
    (c, x, y) => drawOre(c, x, y, '#c8a070'), // 13 iron
    drawPlanks,            // 14
    drawGlass,             // 15
    drawBrick,             // 16
  ];

  for (let i = 0; i < drawFns.length; i++) {
    const [ox, oy] = tilePos(i);
    drawFns[i](ctx, ox, oy);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function getUVsForFace(textureIndex: number): [number, number, number, number] {
  const rows = Math.ceil(TEXTURE_COUNT / ATLAS_COLS);
  const col = textureIndex % ATLAS_COLS;
  const row = Math.floor(textureIndex / ATLAS_COLS);

  const u0 = col / ATLAS_COLS;
  const u1 = (col + 1) / ATLAS_COLS;
  const v0 = 1 - (row + 1) / rows;
  const v1 = 1 - row / rows;

  return [u0, v0, u1, v1];
}

// Generate a small preview canvas for a block type (for hotbar)
export function createBlockPreview(textureIndex: number, atlas: THREE.Texture): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_SIZE;
  canvas.height = TILE_SIZE;
  const ctx = canvas.getContext('2d')!;

  const source = atlas.image as HTMLCanvasElement;
  const [ox, oy] = tilePos(textureIndex);
  ctx.drawImage(source, ox, oy, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);

  return canvas;
}

// Unused export to satisfy noUnusedLocals if needed
void drawPixels;
export { TILE_SIZE, ATLAS_COLS };
