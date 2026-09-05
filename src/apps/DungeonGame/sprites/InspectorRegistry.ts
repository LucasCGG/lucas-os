import { SpriteSheet } from "./SpriteSheet";

export interface InspectorEntry {
  name: string;
  sheet: SpriteSheet;
}

export class InspectorRegistry {
  private static entries = new Map<string, SpriteSheet>();
  private static listeners = new Set<() => void>();

  static register(name: string, sheet: SpriteSheet): void {
    InspectorRegistry.entries.set(name, sheet);
    InspectorRegistry.emit();
  }

  static list(): InspectorEntry[] {
    return [...InspectorRegistry.entries.entries()].map(([name, sheet]) => ({ name, sheet }));
  }

  static subscribe(fn: () => void): () => void {
    InspectorRegistry.listeners.add(fn);
    return () => {
      InspectorRegistry.listeners.delete(fn);
    };
  }

  private static emit(): void {
    for (const fn of InspectorRegistry.listeners) {
      fn();
    }
  }
}
