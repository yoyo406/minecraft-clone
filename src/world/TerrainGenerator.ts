import { SimplexNoise } from '../utils/noise';
import { BlockType } from '../blocks/BlockType';
import { Chunk, CHUNK_SIZE, CHUNK_HEIGHT } from './Chunk';

export class TerrainGenerator {
  private heightNoise: SimplexNoise;
  private detailNoise: SimplexNoise;
  private caveNoise: SimplexNoise;
  private treeNoise: SimplexNoise;
  private biomeNoise: SimplexNoise;

  private readonly seaLevel = 20;
  private readonly baseHeight = 24;

  constructor(seed: number = 42) {
    this.heightNoise = new SimplexNoise(seed);
    this.detailNoise = new SimplexNoise(seed + 1);
    this.caveNoise = new SimplexNoise(seed + 2);
    this.treeNoise = new SimplexNoise(seed + 3);
    this.biomeNoise = new SimplexNoise(seed + 4);
  }

  generateChunk(chunk: Chunk): void {
    const worldX = chunk.cx * CHUNK_SIZE;
    const worldZ = chunk.cz * CHUNK_SIZE;

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = worldX + lx;
        const wz = worldZ + lz;

        const height = this.getHeight(wx, wz);
        const biome = this.getBiome(wx, wz);

        for (let ly = 0; ly < CHUNK_HEIGHT; ly++) {
          const block = this.getBlockAt(wx, ly, wz, height, biome);
          chunk.setBlock(lx, ly, lz, block);
        }
      }
    }

    // Generate trees
    this.generateTrees(chunk, worldX, worldZ);
  }

  private getHeight(wx: number, wz: number): number {
    const scale = 0.008;
    const detailScale = 0.03;

    const mainHeight = this.heightNoise.fractal2D(wx * scale, wz * scale, 4, 2, 0.5);
    const detail = this.detailNoise.noise2D(wx * detailScale, wz * detailScale) * 0.3;

    // Mountain factor
    const mountainScale = 0.004;
    const mountain = Math.max(0, this.heightNoise.noise2D(wx * mountainScale, wz * mountainScale));
    const mountainHeight = mountain * mountain * 30;

    const h = this.baseHeight + (mainHeight + detail) * 12 + mountainHeight;
    return Math.floor(Math.max(1, Math.min(CHUNK_HEIGHT - 2, h)));
  }

  private getBiome(wx: number, wz: number): 'plains' | 'desert' | 'snow' | 'forest' {
    const temp = this.biomeNoise.noise2D(wx * 0.003, wz * 0.003);
    const moisture = this.biomeNoise.noise2D(wx * 0.003 + 100, wz * 0.003 + 100);

    if (temp > 0.3) return 'desert';
    if (temp < -0.3) return 'snow';
    if (moisture > 0.1) return 'forest';
    return 'plains';
  }

  private getBlockAt(wx: number, ly: number, _wz: number, surfaceHeight: number, biome: string): BlockType {
    // Bedrock at bottom
    if (ly === 0) return BlockType.BEDROCK;

    // Cave generation
    if (ly > 1 && ly < surfaceHeight - 3) {
      const caveVal = this.caveNoise.noise3D(wx * 0.05, ly * 0.05, _wz * 0.05);
      if (caveVal > 0.6) return BlockType.AIR;
    }

    if (ly > surfaceHeight) {
      // Water
      if (ly <= this.seaLevel) return BlockType.WATER;
      return BlockType.AIR;
    }

    if (ly === surfaceHeight) {
      // Surface block depends on biome
      if (biome === 'desert') return BlockType.SAND;
      if (biome === 'snow') return BlockType.SNOW;
      if (ly <= this.seaLevel + 1) return BlockType.SAND;
      return BlockType.GRASS;
    }

    if (ly > surfaceHeight - 4) {
      if (biome === 'desert') return BlockType.SAND;
      return BlockType.DIRT;
    }

    // Ore generation
    if (ly < 20 && Math.random() < 0.01) return BlockType.IRON_ORE;
    if (ly < 40 && Math.random() < 0.015) return BlockType.COAL_ORE;

    return BlockType.STONE;
  }

  private generateTrees(chunk: Chunk, worldX: number, worldZ: number): void {
    for (let lx = 2; lx < CHUNK_SIZE - 2; lx++) {
      for (let lz = 2; lz < CHUNK_SIZE - 2; lz++) {
        const wx = worldX + lx;
        const wz = worldZ + lz;

        const biome = this.getBiome(wx, wz);
        if (biome === 'desert') continue;

        const treeChance = biome === 'forest' ? 0.02 : 0.005;
        const treeVal = this.treeNoise.noise2D(wx * 0.5, wz * 0.5);

        if (treeVal > 1 - treeChance * 100) {
          // Find surface
          let surfaceY = -1;
          for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
            const block = chunk.getBlock(lx, y, lz);
            if (block === BlockType.GRASS || block === BlockType.SNOW) {
              surfaceY = y;
              break;
            }
          }

          if (surfaceY > 0 && surfaceY < CHUNK_HEIGHT - 8) {
            this.placeTree(chunk, lx, surfaceY + 1, lz);
          }
        }
      }
    }
  }

  private placeTree(chunk: Chunk, x: number, baseY: number, z: number): void {
    const trunkHeight = 4 + Math.floor(Math.random() * 2);

    // Trunk
    for (let y = 0; y < trunkHeight; y++) {
      chunk.setBlock(x, baseY + y, z, BlockType.WOOD);
    }

    // Leaves
    const leafStart = baseY + trunkHeight - 1;
    for (let dy = 0; dy < 3; dy++) {
      const radius = dy === 2 ? 1 : 2;
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (dx === 0 && dz === 0 && dy < 2) continue; // trunk space
          if (Math.abs(dx) === radius && Math.abs(dz) === radius && Math.random() > 0.6) continue;
          const lx = x + dx;
          const lz = z + dz;
          if (lx >= 0 && lx < CHUNK_SIZE && lz >= 0 && lz < CHUNK_SIZE) {
            const ly = leafStart + dy;
            if (ly < CHUNK_HEIGHT && chunk.getBlock(lx, ly, lz) === BlockType.AIR) {
              chunk.setBlock(lx, ly, lz, BlockType.LEAVES);
            }
          }
        }
      }
    }
  }
}
