import * as THREE from 'three';
import { BlockType } from '../blocks/BlockType';

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 64;

export class Chunk {
  cx: number;
  cz: number;
  blocks: Uint8Array;
  mesh: THREE.Mesh | null = null;
  dirty: boolean = true;

  constructor(cx: number, cz: number) {
    this.cx = cx;
    this.cz = cz;
    this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
  }

  private index(lx: number, ly: number, lz: number): number {
    return ly * CHUNK_SIZE * CHUNK_SIZE + lz * CHUNK_SIZE + lx;
  }

  getBlock(lx: number, ly: number, lz: number): BlockType {
    if (lx < 0 || lx >= CHUNK_SIZE || ly < 0 || ly >= CHUNK_HEIGHT || lz < 0 || lz >= CHUNK_SIZE) {
      return BlockType.AIR;
    }
    return this.blocks[this.index(lx, ly, lz)] as BlockType;
  }

  setBlock(lx: number, ly: number, lz: number, type: BlockType): void {
    if (lx < 0 || lx >= CHUNK_SIZE || ly < 0 || ly >= CHUNK_HEIGHT || lz < 0 || lz >= CHUNK_SIZE) {
      return;
    }
    this.blocks[this.index(lx, ly, lz)] = type;
    this.dirty = true;
  }

  dispose(): void {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(m => m.dispose());
      } else {
        this.mesh.material.dispose();
      }
    }
  }
}
