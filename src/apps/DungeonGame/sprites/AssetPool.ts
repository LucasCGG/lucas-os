import { ImageSource } from "./types";

export class AssetPool {
  private static images = new Map<string, ImageSource>();

  static getImage(path: string): ImageSource | null {
    return AssetPool.images.get(path) ?? null;
  }

  static putImage(path: string, image: ImageSource): void {
    AssetPool.images.set(path, image);
  }

  static load(path: string, url = path): Promise<ImageSource> {
    const existing = AssetPool.images.get(path);
    if (existing !== undefined) {
      return Promise.resolve(existing);
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        AssetPool.images.set(path, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`AssetPool: failed to load '${url}'`));
      img.src = url;
    });
  }

  static loadAll(entries: { path: string; url?: string }[]): Promise<ImageSource[]> {
    return Promise.all(entries.map((e) => AssetPool.load(e.path, e.url ?? e.path)));
  }

  static clearImage(path: string): void {
    AssetPool.images.delete(path);
  }

  static clearAll(): void {
    AssetPool.images.clear();
  }
}
