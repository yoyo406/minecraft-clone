/**
 * Simplex-like noise implementation for terrain generation.
 * Based on improved Perlin noise with gradient permutations.
 */

export class SimplexNoise {
  private perm: Uint8Array;
  private grad3: number[][];

  constructor(seed: number = 0) {
    this.grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
    ];

    this.perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;

    // Seed-based shuffle
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807 + 0) % 2147483647;
      const j = s % (i + 1);
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }

    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }

  private dot3(g: number[], x: number, y: number, z: number): number {
    return g[0] * x + g[1] * y + g[2] * z;
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = this.fade(xf);
    const v = this.fade(yf);

    const a = this.perm[X] + Y;
    const b = this.perm[X + 1] + Y;

    const g00 = this.grad3[this.perm[a] % 12];
    const g10 = this.grad3[this.perm[b] % 12];
    const g01 = this.grad3[this.perm[a + 1] % 12];
    const g11 = this.grad3[this.perm[b + 1] % 12];

    const n00 = g00[0] * xf + g00[1] * yf;
    const n10 = g10[0] * (xf - 1) + g10[1] * yf;
    const n01 = g01[0] * xf + g01[1] * (yf - 1);
    const n11 = g11[0] * (xf - 1) + g11[1] * (yf - 1);

    return this.lerp(
      this.lerp(n00, n10, u),
      this.lerp(n01, n11, u),
      v
    );
  }

  noise3D(x: number, y: number, z: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const zf = z - Math.floor(z);
    const u = this.fade(xf);
    const v = this.fade(yf);
    const w = this.fade(zf);

    const a = this.perm[X] + Y;
    const aa = this.perm[a] + Z;
    const ab = this.perm[a + 1] + Z;
    const b = this.perm[X + 1] + Y;
    const ba = this.perm[b] + Z;
    const bb = this.perm[b + 1] + Z;

    return this.lerp(
      this.lerp(
        this.lerp(
          this.dot3(this.grad3[this.perm[aa] % 12], xf, yf, zf),
          this.dot3(this.grad3[this.perm[ba] % 12], xf - 1, yf, zf),
          u
        ),
        this.lerp(
          this.dot3(this.grad3[this.perm[ab] % 12], xf, yf - 1, zf),
          this.dot3(this.grad3[this.perm[bb] % 12], xf - 1, yf - 1, zf),
          u
        ),
        v
      ),
      this.lerp(
        this.lerp(
          this.dot3(this.grad3[this.perm[aa + 1] % 12], xf, yf, zf - 1),
          this.dot3(this.grad3[this.perm[ba + 1] % 12], xf - 1, yf, zf - 1),
          u
        ),
        this.lerp(
          this.dot3(this.grad3[this.perm[ab + 1] % 12], xf, yf - 1, zf - 1),
          this.dot3(this.grad3[this.perm[bb + 1] % 12], xf - 1, yf - 1, zf - 1),
          u
        ),
        v
      ),
      w
    );
  }

  /** Multi-octave fractal noise */
  fractal2D(x: number, y: number, octaves: number, lacunarity: number = 2, persistence: number = 0.5): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return value / maxValue;
  }
}
