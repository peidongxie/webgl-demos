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

  transpose(): this {
    const a = this.elements;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < i; j++) {
        const tmp = a[i + j * 4];
        a[i + j * 4] = a[i * 4 + j];
        a[i * 4 + j] = tmp;
      }
    }
    return this;
  }

  setInverseOf(other: Matrix4): this {
    const a = other.elements;
    const b = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const tmp00 = a[(i > 0 ? 0 : 1) * 4 + (j > 0 ? 0 : 1)];
        const tmp01 = a[(i > 0 ? 0 : 1) * 4 + (j > 1 ? 1 : 2)];
        const tmp02 = a[(i > 0 ? 0 : 1) * 4 + (j > 2 ? 2 : 3)];
        const tmp10 = a[(i > 1 ? 1 : 2) * 4 + (j > 0 ? 0 : 1)];
        const tmp11 = a[(i > 1 ? 1 : 2) * 4 + (j > 1 ? 1 : 2)];
        const tmp12 = a[(i > 1 ? 1 : 2) * 4 + (j > 2 ? 2 : 3)];
        const tmp20 = a[(i > 2 ? 2 : 3) * 4 + (j > 0 ? 0 : 1)];
        const tmp21 = a[(i > 2 ? 2 : 3) * 4 + (j > 1 ? 1 : 2)];
        const tmp22 = a[(i > 2 ? 2 : 3) * 4 + (j > 2 ? 2 : 3)];
        b[i + j * 4] =
          ((i + j) % 2 ? -1 : 1) *
          (tmp00 * tmp11 * tmp22 +
            tmp01 * tmp12 * tmp20 +
            tmp02 * tmp10 * tmp21 -
            tmp00 * tmp12 * tmp21 -
            tmp01 * tmp10 * tmp22 -
            tmp02 * tmp11 * tmp20);
      }
    }
    const rank = a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3];
    if (rank !== 0) {
      for (let i = 0; i < 16; i++) {
        this.elements[i] = b[i] / rank;
      }
    }
    return this;
  }

  invert(): this {
    return this.setInverseOf(this);
  }

  setOrtho(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number,
  ): this {
    if (left === right || bottom === top || near === far) {
      throw 'null frustum';
    }
    this.setIdentity();
    const a = this.elements;
    a[0] = 2 / (right - left);
    a[5] = 2 / (top - bottom);
    a[10] = -2 / (far - near);
    a[12] = -(right + left) / (right - left);
    a[13] = -(top + bottom) / (top - bottom);
    a[14] = -(far + near) / (far - near);
    return this;
  }

  ortho(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number,
  ): this {
    return this.concat(
      new Matrix4().setOrtho(left, right, bottom, top, near, far),
    );
  }

  setPerspective(
    fovy: number,
    aspect: number,
    near: number,
    far: number,
  ): this {
    if (near === far || aspect === 0) {
      throw 'null frustum';
    }
    if (near <= 0) {
      throw 'near <= 0';
    }
    if (far <= 0) {
      throw 'far <= 0';
    }
    const degree = (Math.PI * fovy) / 360;
    const tan = Math.tan(degree);
    if (tan === 0) {
      throw 'null frustum';
    }
    const cot = 1 / tan;
    this.setIdentity();
    const a = this.elements;
    a[0] = cot / aspect;
    a[5] = cot;
    a[10] = -(far + near) / (far - near);
    a[11] = -1;
    a[14] = -(2 * near * far) / (far - near);
    a[15] = 0;
    return this;
  }

  perspective(fovy: number, aspect: number, near: number, far: number): this {
    return this.concat(new Matrix4().setPerspective(fovy, aspect, near, far));
  }

  setScale(x: number, y: number, z: number): this {
    this.setIdentity();
    const a = this.elements;
    a[0] = x;
    a[5] = y;
    a[10] = z;
    return this;
  }

  scale(x: number, y: number, z: number): this {
    const a = this.elements;
    for (let i = 0; i < 4; i++) {
      a[i] *= x;
      a[i + 4] *= y;
      a[i + 8] *= z;
    }
    return this;
  }

  setTranslate(x: number, y: number, z: number): this {
    this.setIdentity();
    const a = this.elements;
    a[12] = x;
    a[13] = y;
    a[14] = z;
    return this;
  }

  translate(x: number, y: number, z: number): this {
    const a = this.elements;
    for (let i = 0; i < 4; i++) {
      a[i + 12] += a[i] * x + a[i + 4] * y + a[i + 8] * z;
    }
    return this;
  }

  setRotate(angle: number, x: number, y: number, z: number): this {
    this.setIdentity();
    const degree = (Math.PI * angle) / 180;
    const a = this.elements;
    const sin = Math.sin(degree);
    const cos = Math.cos(degree);
    if (x !== 0 && y === 0 && z === 0) {
      a[5] = cos;
      a[6] = x < 0 ? -sin : sin;
      a[9] = x < 0 ? sin : -sin;
      a[10] = cos;
    } else if (x === 0 && y !== 0 && z === 0) {
      a[0] = cos;
      a[2] = y < 0 ? sin : -sin;
      a[8] = y < 0 ? -sin : sin;
      a[10] = cos;
    } else if (x === 0 && y === 0 && z !== 0) {
      a[0] = cos;
      a[4] = z < 0 ? sin : -sin;
      a[1] = z < 0 ? -sin : sin;
      a[5] = cos;
    } else if (x !== 0 || y !== 0 || z !== 0) {
      const squareSum = x * x + y * y + z * z;
      const xx = (x * x) / squareSum;
      const yy = (y * y) / squareSum;
      const zz = (z * z) / squareSum;
      const xy = (x * y) / squareSum;
      const yz = (y * z) / squareSum;
      const zx = (z * x) / squareSum;
      const tmp = 1 - cos;
      const magnitude = Math.sqrt(squareSum);
      const xSin = (x * sin) / magnitude;
      const ySin = (y * sin) / magnitude;
      const zSin = (z * sin) / magnitude;
      a[0] = xx * tmp + cos;
      a[1] = xy * tmp + zSin;
      a[2] = zx * tmp - ySin;
      a[4] = xy * tmp - zSin;
      a[5] = yy * tmp + cos;
      a[6] = yz * tmp + xSin;
      a[8] = zx * tmp + ySin;
      a[9] = yz * tmp - xSin;
      a[10] = zz * tmp + cos;
    }
    return this;
  }

  rotate(angle: number, x: number, y: number, z: number): this {
    return this.concat(new Matrix4().setRotate(angle, x, y, z));
  }
}

export { Matrix4, Vector3, Vector4 };
