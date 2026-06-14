import { BlockType } from './BlockType';

export interface BlockFaces {
  top: number;
  bottom: number;
  side: number;
}

export interface BlockProperties {
  faces: BlockFaces;
  transparent: boolean;
  solid: boolean;
}

// Texture indices in the atlas (row-major, 4 per row)
const T = {
  GRASS_TOP: 0,
  GRASS_SIDE: 1,
  DIRT: 2,
  STONE: 3,
  SAND: 4,
  WATER: 5,
  WOOD_SIDE: 6,
  WOOD_TOP: 7,
  LEAVES: 8,
  COBBLESTONE: 9,
  BEDROCK: 10,
  SNOW: 11,
  COAL_ORE: 12,
  IRON_ORE: 13,
  PLANKS: 14,
  GLASS: 15,
  BRICK: 16,
};

const registry: Map<BlockType, BlockProperties> = new Map();

function register(type: BlockType, faces: BlockFaces, transparent: boolean, solid: boolean) {
  registry.set(type, { faces, transparent, solid });
}

register(BlockType.GRASS, { top: T.GRASS_TOP, bottom: T.DIRT, side: T.GRASS_SIDE }, false, true);
register(BlockType.DIRT, { top: T.DIRT, bottom: T.DIRT, side: T.DIRT }, false, true);
register(BlockType.STONE, { top: T.STONE, bottom: T.STONE, side: T.STONE }, false, true);
register(BlockType.SAND, { top: T.SAND, bottom: T.SAND, side: T.SAND }, false, true);
register(BlockType.WATER, { top: T.WATER, bottom: T.WATER, side: T.WATER }, true, false);
register(BlockType.WOOD, { top: T.WOOD_TOP, bottom: T.WOOD_TOP, side: T.WOOD_SIDE }, false, true);
register(BlockType.LEAVES, { top: T.LEAVES, bottom: T.LEAVES, side: T.LEAVES }, true, true);
register(BlockType.COBBLESTONE, { top: T.COBBLESTONE, bottom: T.COBBLESTONE, side: T.COBBLESTONE }, false, true);
register(BlockType.BEDROCK, { top: T.BEDROCK, bottom: T.BEDROCK, side: T.BEDROCK }, false, true);
register(BlockType.SNOW, { top: T.SNOW, bottom: T.SNOW, side: T.SNOW }, false, true);
register(BlockType.COAL_ORE, { top: T.COAL_ORE, bottom: T.COAL_ORE, side: T.COAL_ORE }, false, true);
register(BlockType.IRON_ORE, { top: T.IRON_ORE, bottom: T.IRON_ORE, side: T.IRON_ORE }, false, true);
register(BlockType.PLANKS, { top: T.PLANKS, bottom: T.PLANKS, side: T.PLANKS }, false, true);
register(BlockType.GLASS, { top: T.GLASS, bottom: T.GLASS, side: T.GLASS }, true, true);
register(BlockType.BRICK, { top: T.BRICK, bottom: T.BRICK, side: T.BRICK }, false, true);

export function getBlockProperties(type: BlockType): BlockProperties | undefined {
  return registry.get(type);
}

export function isTransparent(type: BlockType): boolean {
  if (type === BlockType.AIR) return true;
  const props = registry.get(type);
  return props ? props.transparent : true;
}

export function isSolid(type: BlockType): boolean {
  if (type === BlockType.AIR) return false;
  const props = registry.get(type);
  return props ? props.solid : false;
}

export const TEXTURE_COUNT = 17;
