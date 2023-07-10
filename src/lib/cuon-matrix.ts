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

export { Vector3, Vector4 };
