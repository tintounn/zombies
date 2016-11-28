class Vector3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  fromVector(vector) {
    this.x = vector.x;
    this.y = vector.y;
    this.z = vector.z;
  }

  translate(vector) {
    this.x+=vector.x;
    this.y+=vector.y;
    this.z+=vector.z;
  }
}
