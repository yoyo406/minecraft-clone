# Minecraft Clone

A realistic 3D Minecraft clone built with Three.js, TypeScript, and Vite. Features procedural terrain generation, block interaction, physics, and a fully rendered voxel world — all running in the browser with no external assets.

## Features

- **Procedural Terrain** — Multi-octave simplex noise generates realistic hills, mountains, caves, and biomes (plains, desert, snow, forest)
- **16 Block Types** — Grass, Dirt, Stone, Sand, Water, Wood, Leaves, Cobblestone, Bedrock, Snow, Coal Ore, Iron Ore, Planks, Glass, Brick
- **First-Person Controls** — Pointer lock, WASD movement, jumping, sneaking
- **Block Interaction** — Left-click to break, right-click to place, with raycasting
- **Chunk System** — 16×64×16 chunks, 6-chunk render distance, face culling for performance
- **Physics** — Gravity, AABB collision detection, jumping
- **Procedural Textures** — All block textures generated via canvas (no external image files)
- **Sky & Lighting** — Gradient sky dome, directional sunlight, hemisphere light, fog
- **Ambient Occlusion** — Per-vertex AO for realistic shadows between blocks
- **HUD** — Crosshair, hotbar with block selection, FPS/coordinates debug overlay (F3)
- **Trees** — Procedurally placed with trunk and leaf canopy

## Controls

| Key | Action |
|-----|--------|
| W/A/S/D | Move |
| Space | Jump |
| Shift | Sneak (slow) |
| Left Click | Break block |
| Right Click | Place block |
| 1-9 | Select hotbar slot |
| Scroll | Cycle hotbar |
| F3 | Toggle debug info |

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- [Three.js](https://threejs.org/) — WebGL 3D rendering
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Vite](https://vitejs.dev/) — Fast dev server and bundler
