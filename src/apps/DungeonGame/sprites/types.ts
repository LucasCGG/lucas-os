export type ImageSource = HTMLImageElement | HTMLCanvasElement | ImageBitmap;

export interface SpriteFrame {
  image: ImageSource;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export function imageWidth(img: ImageSource): number {
  if (typeof HTMLImageElement !== "undefined" && img instanceof HTMLImageElement) {
    return img.naturalWidth || img.width;
  }
  return img.width;
}

export function imageHeight(img: ImageSource): number {
  if (typeof HTMLImageElement !== "undefined" && img instanceof HTMLImageElement) {
    return img.naturalHeight || img.height;
  }
  return img.height;
}
