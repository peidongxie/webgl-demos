// interface Vertex {
//   x: number;
//   y: number;
//   z: number;
// }

// interface Normal {
//   x: number;
//   y: number;
//   z: number;
// }

// interface Color {
//   r: number;
//   g: number;
//   b: number;
//   a: number;
// }

// interface DrawingInfo {
//   vertices: Vertex[];
//   normals: Normal[];
//   colors: Color[];
//   indices: number[];
// }

// interface Material {
//   name: string;
//   color: Color;
// }

// interface Face {
//   materialName: string;
//   vIndices: Vertex[];
//   nIndices: number[];
// }

const DELIMITERS = ['\t', ' ', '(', ')', '"'];

class StringParser {
  str: string;
  index: number;

  constructor(str: string) {
    this.str = str;
    this.index = 0;
  }

  get wordLength(): number {
    for (let i = this.index; i < this.str.length; i++) {
      const c = this.str.charAt(i);
      if (DELIMITERS.includes(c)) {
        return i - this.index;
      }
    }
    return this.str.length - this.index;
  }

  skipDelimiters(): void {
    for (let i = this.index; i < this.str.length; i++) {
      const c = this.str.charAt(i);
      if (!DELIMITERS.includes(c)) {
        this.index = i;
        break;
      }
    }
  }

  skipToNextWord(): void {
    this.skipDelimiters();
    this.index += this.wordLength + 1;
  }

  getWord(): string {
    this.skipDelimiters();
    const word = this.str.substring(this.index, this.index + this.wordLength);
    this.index += length + 1;
    return word;
  }

  getInt(): number {
    return parseInt(this.getWord());
  }

  getFloat(): number {
    return parseFloat(this.getWord());
  }
}

// class MtlDoc {
//   complete: boolean;
//   materials: Material[];

//   constructor() {
//     this.complete = false;
//     this.materials = [];
//   }

//   parseNewMtl(stringParser: StringParser): string {
//     return stringParser.getWord();
//   }

//   parseRGB(stringParser: StringParser, name: string): Material {
//     return {
//       name,
//       color: {
//         r: stringParser.getFloat(),
//         g: stringParser.getFloat(),
//         b: stringParser.getFloat(),
//         a: 1,
//       },
//     };
//   }
// }

// class ObjObject {
//   name: string;
//   faces: Face[];

//   constructor(name: string) {
//     this.name = name;
//     this.faces = [];
//   }

//   get numIndices(): number {
//     return this.faces
//       .map((face) => face.vIndices.length)
//       .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
//   }

//   addFace(face: Face) {
//     this.faces.push(face);
//   }
// }

export { StringParser };
