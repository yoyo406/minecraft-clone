import * as THREE from 'three';
import { createTextureAtlas } from './TextureAtlas';
import { Sky } from './Sky';

export class Renderer {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  webglRenderer: THREE.WebGLRenderer;
  material: THREE.MeshLambertMaterial;
  sky: Sky;
  private fogColor: THREE.Color;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera.position.set(0, 40, 0);

    // Renderer
    this.webglRenderer = new THREE.WebGLRenderer({ antialias: false });
    this.webglRenderer.setSize(window.innerWidth, window.innerHeight);
    this.webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.webglRenderer.setClearColor(0x87ceeb);
    container.appendChild(this.webglRenderer.domElement);

    // Fog
    this.fogColor = new THREE.Color(0x89b2eb);
    this.scene.fog = new THREE.Fog(this.fogColor, 60, 90);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 100, 50);
    this.scene.add(sunLight);

    // Hemisphere light for natural feel
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x556633, 0.3);
    this.scene.add(hemiLight);

    // Texture atlas material
    const atlas = createTextureAtlas();
    this.material = new THREE.MeshLambertMaterial({
      map: atlas,
      vertexColors: true,
      side: THREE.FrontSide,
    });

    // Sky
    this.sky = new Sky(this.scene);

    // Resize handler
    window.addEventListener('resize', () => this.onResize());
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.webglRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  render(): void {
    this.sky.followCamera(this.camera);
    this.webglRenderer.render(this.scene, this.camera);
  }

  get domElement(): HTMLElement {
    return this.webglRenderer.domElement;
  }
}
