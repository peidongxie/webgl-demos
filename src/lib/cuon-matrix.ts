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
}

export { Matrix4, Vector3, Vector4 };
