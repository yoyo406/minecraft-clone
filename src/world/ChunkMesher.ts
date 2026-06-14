import * as THREE from 'three';
import { BlockType } from '../blocks/BlockType';
import { getBlockProperties, isTransparent } from '../blocks/BlockRegistry';
import { getUVsForFace } from '../rendering/TextureAtlas';
import { Chunk, CHUNK_SIZE, CHUNK_HEIGHT } from './Chunk';

interface WorldBlockAccess {
  getBlock(x: number, y: number, z: number): BlockType;
}

// Face directions: [dx, dy, dz]
const FACES = [
  { dir: [0, 1, 0], vertices: [[0,1,0],[1,1,0],[1,1,1],[0,1,1]], normal: [0,1,0], face: 'top' as const },
  { dir: [0, -1, 0], vertices: [[0,0,1],[1,0,1],[1,0,0],[0,0,0]], normal: [0,-1,0], face: 'bottom' as const },
  { dir: [0, 0, 1], vertices: [[0,0,1],[0,1,1],[1,1,1],[1,0,1]], normal: [0,0,1], face: 'side' as const },
  { dir: [0, 0, -1], vertices: [[1,0,0],[1,1,0],[0,1,0],[0,0,0]], normal: [0,0,-1], face: 'side' as const },
  { dir: [1, 0, 0], vertices: [[1,0,1],[1,1,1],[1,1,0],[1,0,0]], normal: [1,0,0], face: 'side' as const },
  { dir: [-1, 0, 0], vertices: [[0,0,0],[0,1,0],[0,1,1],[0,0,1]], normal: [-1,0,0], face: 'side' as const },
];

export function buildChunkMesh(
  chunk: Chunk,
  world: WorldBlockAccess,
  material: THREE.Material
): THREE.Mesh | null {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const colors: number[] = [];

  let vertexCount = 0;
  const worldX = chunk.cx * CHUNK_SIZE;
  const worldZ = chunk.cz * CHUNK_SIZE;

  for (let ly = 0; ly < CHUNK_HEIGHT; ly++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        const block = chunk.getBlock(lx, ly, lz);
        if (block === BlockType.AIR) continue;

        const props = getBlockProperties(block);
        if (!props) continue;

        const wx = worldX + lx;
        const wz = worldZ + lz;

        for (const face of FACES) {
          const [dx, dy, dz] = face.dir;
          const nx = wx + dx;
          const ny = ly + dy;
          const nz = wz + dz;

          const neighbor = world.getBlock(nx, ny, nz);

          // Only render face if neighbor is transparent (and not same transparent block)
          if (!isTransparent(neighbor) || (props.transparent && neighbor === block)) continue;

          const textureIdx = props.faces[face.face];
          const [u0, v0, u1, v1] = getUVsForFace(textureIdx);

          // Simple ambient occlusion approximation
          const ao = computeAO(world, wx, ly, wz, face.dir, face.vertices);

          for (let i = 0; i < 4; i++) {
            const v = face.vertices[i];
            positions.push(lx + v[0], ly + v[1], lz + v[2]);
            normals.push(face.normal[0], face.normal[1], face.normal[2]);

            const aoFactor = 0.6 + ao[i] * 0.4;
            colors.push(aoFactor, aoFactor, aoFactor);
          }

          uvs.push(u0, v1, u1, v1, u1, v0, u0, v0);

          // Two triangles (flip based on AO to avoid artifacts)
          if (ao[0] + ao[2] > ao[1] + ao[3]) {
            indices.push(vertexCount, vertexCount + 1, vertexCount + 2);
            indices.push(vertexCount, vertexCount + 2, vertexCount + 3);
          } else {
            indices.push(vertexCount + 1, vertexCount + 2, vertexCount + 3);
            indices.push(vertexCount + 1, vertexCount + 3, vertexCount);
          }

          vertexCount += 4;
        }
      }
    }
  }

  if (positions.length === 0) return null;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(worldX, 0, worldZ);
  return mesh;
}

function computeAO(
  world: WorldBlockAccess,
  wx: number, wy: number, wz: number,
  faceDir: number[],
  vertices: number[][]
): number[] {
  const ao: number[] = [];

  for (const v of vertices) {
    const vx = wx + v[0];
    const vy = wy + v[1];
    const vz = wz + v[2];

    let occlusion = 0;

    // Check 3 neighbors around this vertex along the face normal direction
    for (let dx = -1; dx <= 0; dx++) {
      for (let dy = -1; dy <= 0; dy++) {
        for (let dz = -1; dz <= 0; dz++) {
          // Only check blocks that share this vertex and are on the face side
          const checkX = vx + dx;
          const checkY = vy + dy;
          const checkZ = vz + dz;

          // Skip the block itself
          if (checkX === wx && checkY === wy && checkZ === wz) continue;
          // Skip blocks on the opposite side of the face
          if (faceDir[0] !== 0 && (checkX - wx) * faceDir[0] < 0) continue;
          if (faceDir[1] !== 0 && (checkY - wy) * faceDir[1] < 0) continue;
          if (faceDir[2] !== 0 && (checkZ - wz) * faceDir[2] < 0) continue;

          if (!isTransparent(world.getBlock(checkX, checkY, checkZ))) {
            occlusion++;
          }
        }
      }
    }

    ao.push(1.0 - occlusion * 0.15);
  }

  return ao;
}
