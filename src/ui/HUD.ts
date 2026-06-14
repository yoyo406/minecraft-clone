import { BLOCK_NAMES } from '../blocks/BlockType';
import { getBlockProperties } from '../blocks/BlockRegistry';
import { createBlockPreview } from '../rendering/TextureAtlas';
import { Player } from '../player/Player';
import * as THREE from 'three';

export class HUD {
  private debugEl: HTMLElement;
  private hotbarEl: HTMLElement;
  private instructionsEl: HTMLElement;
  private crosshairEl: HTMLElement;
  private showDebug: boolean = false;
  private slotElements: HTMLElement[] = [];
  private atlas: THREE.Texture;

  constructor(atlas: THREE.Texture) {
    this.debugEl = document.getElementById('debug')!;
    this.hotbarEl = document.getElementById('hotbar')!;
    this.instructionsEl = document.getElementById('instructions')!;
    this.crosshairEl = document.getElementById('crosshair')!;
    this.atlas = atlas;

    document.addEventListener('keydown', (e) => {
      if (e.code === 'F3') {
        e.preventDefault();
        this.showDebug = !this.showDebug;
        this.debugEl.style.display = this.showDebug ? 'block' : 'none';
      }
    });
  }

  buildHotbar(player: Player): void {
    this.hotbarEl.innerHTML = '';
    this.slotElements = [];

    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.className = 'hotbar-slot';

      const num = document.createElement('span');
      num.className = 'hotbar-number';
      num.textContent = String(i + 1);
      slot.appendChild(num);

      const blockType = player.hotbar[i];
      const props = getBlockProperties(blockType);
      if (props) {
        const preview = createBlockPreview(props.faces.side || props.faces.top, this.atlas);
        slot.appendChild(preview);
      }

      this.hotbarEl.appendChild(slot);
      this.slotElements.push(slot);
    }
  }

  update(player: Player, fps: number): void {
    // Update selected slot highlight
    for (let i = 0; i < this.slotElements.length; i++) {
      this.slotElements[i].className = i === player.selectedSlot ? 'hotbar-slot selected' : 'hotbar-slot';
    }

    // Update debug info
    if (this.showDebug) {
      const pos = player.body;
      const blockName = BLOCK_NAMES[player.selectedBlock] || 'Unknown';
      this.debugEl.innerHTML = [
        `FPS: ${fps}`,
        `XYZ: ${pos.x.toFixed(1)} / ${pos.y.toFixed(1)} / ${pos.z.toFixed(1)}`,
        `On Ground: ${pos.onGround}`,
        `Selected: ${blockName}`,
      ].join('<br>');
    }
  }

  setPointerLocked(locked: boolean): void {
    this.instructionsEl.style.display = locked ? 'none' : 'block';
    this.crosshairEl.style.display = locked ? 'block' : 'none';
    this.hotbarEl.style.display = locked ? 'flex' : 'none';
  }
}
