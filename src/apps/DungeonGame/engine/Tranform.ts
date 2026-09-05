export class Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;

  constructor(x: number, y: number, width: number, height: number, rotation: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
  }

  copy(): Transform{
    return new Transform(this.x, this.y,this.width,this.height,this.rotation)
  }

  copyFrom(other: Transform): void{
    this.x = other.x;
    this.y = other.y;
    this.width = other.width;
    this.height = other.height;
    this.rotation = other.rotation;
  }

  intersects(other: Transform): boolean {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
}
