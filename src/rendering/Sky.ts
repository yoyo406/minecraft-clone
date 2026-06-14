import * as THREE from 'three';

export class Sky {
  private mesh: THREE.Mesh;
  private uniforms: { topColor: THREE.Uniform; bottomColor: THREE.Uniform; offset: THREE.Uniform; exponent: THREE.Uniform };

  constructor(scene: THREE.Scene) {
    this.uniforms = {
      topColor: new THREE.Uniform(new THREE.Color(0x0077ff)),
      bottomColor: new THREE.Uniform(new THREE.Color(0x89b2eb)),
      offset: new THREE.Uniform(10),
      exponent: new THREE.Uniform(0.6),
    };

    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `;

    const skyGeometry = new THREE.SphereGeometry(500, 32, 16);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: this.uniforms.topColor,
        bottomColor: this.uniforms.bottomColor,
        offset: this.uniforms.offset,
        exponent: this.uniforms.exponent,
      },
      vertexShader,
      fragmentShader,
      side: THREE.BackSide,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(this.mesh);
  }

  followCamera(camera: THREE.Camera): void {
    this.mesh.position.copy(camera.position);
  }
}
