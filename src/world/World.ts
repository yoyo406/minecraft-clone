import * as THREE from 'three';
import { BlockType } from '../blocks/BlockType';
import { Chunk, CHUNK_SIZE, CHUNK_HEIGHT } from './Chunk';
import { TerrainGenerator } from './TerrainGenerator';
import { buildChunkMesh } from './ChunkMesher';

export class World {
  chunks: Map<string, Chunk> = new Map();
  private scene: THREE.Scene;
  private material: THREE.Material;
  private generator: TerrainGenerator;
  renderDistance: number = 6;

  constructor(scene: THREE.Scene, material: THREE.Material, seed: number = 42) {
    this.scene = scene;
    this.material = material;
    this.generator = new TerrainGenerator(seed);
  }

  private chunkKey(cx: number, cz: number): string {
    return `${cx},${cz}`;
  }

  update(playerX: number, playerZ: number): void {
    const playerCX = Math.floor(playerX / CHUNK_SIZE);
    const playerCZ = Math.floor(playerZ / CHUNK_SIZE);

    // Load chunks in range
    for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
      for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
        if (dx * dx + dz * dz > this.renderDistance * this.renderDistance) continue;
        const cx = playerCX + dx;
        const cz = playerCZ + dz;
        const key = this.chunkKey(cx, cz);

        if (!this.chunks.has(key)) {
          this.loadChunk(cx, cz);
        }
      }
    }

    // Unload distant chunks
    for (const [key, chunk] of this.chunks) {
      const dx = chunk.cx - playerCX;
      const dz = chunk.cz - playerCZ;
      if (dx * dx + dz * dz > (this.renderDistance + 2) * (this.renderDistance + 2)) {
        this.unloadChunk(key, chunk);
      }
    }

    // Rebuild dirty chunks
    for (const chunk of this.chunks.values()) {
      if (chunk.dirty) {
        this.rebuildChunkMesh(chunk);
      }
    }
  }

  private loadChunk(cx: number, cz: number): void {
    const chunk = new Chunk(cx, cz);
    this.generator.generateChunk(chunk);
    this.chunks.set(this.chunkKey(cx, cz), chunk);
    this.rebuildChunkMesh(chunk);
  }

  private unloadChunk(key: string, chunk: Chunk): void {
    if (chunk.mesh) {
      this.scene.remove(chunk.mesh);
    }
    chunk.dispose();
    this.chunks.delete(key);
  }

  private rebuildChunkMesh(chunk: Chunk): void {
    if (chunk.mesh) {
      this.scene.remove(chunk.mesh);
      chunk.mesh.geometry.dispose();
    }

    const mesh = buildChunkMesh(chunk, this, this.material);
    if (mesh) {
      this.scene.add(mesh);
      chunk.mesh = mesh;
    } else {
      chunk.mesh = null;
    }
    chunk.dirty = false;
  }

  getBlock(x: number, y: number, z: number): BlockType {
    if (y < 0 || y >= CHUNK_HEIGHT) return BlockType.AIR;

    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    const chunk = this.chunks.get(this.chunkKey(cx, cz));

    if (!chunk) return BlockType.AIR;

    const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return chunk.getBlock(lx, y, lz);
  }

  setBlock(x: number, y: number, z: number, type: BlockType): void {
    if (y < 0 || y >= CHUNK_HEIGHT) return;

    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);
    const key = this.chunkKey(cx, cz);
    const chunk = this.chunks.get(key);

    if (!chunk) return;

    const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    chunk.setBlock(lx, y, lz, type);

    // Also mark neighboring chunks dirty if block is on border
    if (lx === 0) this.markDirty(cx - 1, cz);
    if (lx === CHUNK_SIZE - 1) this.markDirty(cx + 1, cz);
    if (lz === 0) this.markDirty(cx, cz - 1);
    if (lz === CHUNK_SIZE - 1) this.markDirty(cx, cz + 1);
  }

  private markDirty(cx: number, cz: number): void {
    const chunk = this.chunks.get(this.chunkKey(cx, cz));
    if (chunk) chunk.dirty = true;
  }

  /** Find the highest solid block at world x, z */
  getHighestBlock(x: number, z: number): number {
    for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
      if (this.getBlock(x, y, z) !== BlockType.AIR) {
        return y;
      }
    }
    return 0;
  }
}
