class Vector3 {
  elements: Float32Array;

  constructor(source?: Vector3) {
    this.elements = source?.elements.slice() || new Float32Array(3);
  }

  normalize(): this {
    const a = this.elements;
    const magnitude = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    if (magnitude) {
      a[0] = a[0] / magnitude;
      a[1] = a[1] / magnitude;
      a[2] = a[2] / magnitude;
    } else {
      a[0] = 0;
      a[1] = 0;
      a[2] = 0;
    }
    return this;
  }
}

class Vector4 {
  elements: Float32Array;

  constructor(source?: Vector4) {
    this.elements = source?.elements.slice() || new Float32Array(4);
  }
}

const MATRIX4_IDENTITY = new Float32Array([
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
]);

class Matrix4 {
  elements: Float32Array;

  constructor(source?: Matrix4) {
    this.elements = source?.elements.slice() || MATRIX4_IDENTITY.slice();
  }

  setIdentity(): this {
    this.elements.set(MATRIX4_IDENTITY);
    return this;
  }

  set(matrix: Matrix4): this {
    if (this.elements !== matrix.elements) {
      this.elements.set(matrix.elements);
    }
    return this;
  }

  concat(other: Matrix4): this {
    const a = this.elements;
    const b = a === other.elements ? a.slice() : other.elements;
    const c = this.elements;
    for (let i = 0; i < 4; i++) {
      const ai0 = a[i];
      const ai1 = a[i + 4];
      const ai2 = a[i + 8];
      const ai3 = a[i + 12];
      for (let j = 0; j < 4; j++) {
        const b0j = b[j * 4];
        const b1j = b[j * 4 + 1];
        const b2j = b[j * 4 + 2];
        const b3j = b[j * 4 + 3];
        c[i + j * 4] = ai0 * b0j + ai1 * b1j + ai2 * b2j + ai3 * b3j;
      }
    }
    return this;
  }

  multiply(other: Matrix4): this {
    return this.concat(other);
  }

  multiplyVector3(pos: Vector3): Vector3 {
    const a = this.elements;
    const b = pos.elements;
    const result = new Vector3();
    const c = result.elements;
    for (let i = 0; i < 3; i++) {
      const ai0 = a[i];
      const ai1 = a[i + 4];
      const ai2 = a[i + 8];
      const ai3 = a[i + 12];
      const b00 = b[0];
      const b10 = b[1];
      const b20 = b[2];
      const b30 = 1;
      c[i] = ai0 * b00 + ai1 * b10 + ai2 * b20 + ai3 * b30;
    }
    return result;
  }

  multiplyVector4(pos: Vector4): Vector4 {
    const a = this.elements;
    const b = pos.elements;
    const result = new Vector4();
    const c = result.elements;
    for (let i = 0; i < 4; i++) {
      const ai0 = a[i];
      const ai1 = a[i + 4];
      const ai2 = a[i + 8];
      const ai3 = a[i + 12];
      const b00 = b[0];
      const b10 = b[1];
      const b20 = b[2];
      const b30 = b[3];
      c[i] = ai0 * b00 + ai1 * b10 + ai2 * b20 + ai3 * b30;
    }
    return result;
  }
}

export { Matrix4, Vector3, Vector4 };
