import { SpawnerConfig } from "../types/SpawnerConfig";

export class Spawner {
  private timer = 0;
  private nextDelay: number;
  private spawnedCount = 0;
  private isSpawning = false;

  constructor(protected readonly config: SpawnerConfig) {
    this.nextDelay = this.rollDelay();
  }

  tick(
    deltaTime: number,
    currentCount: number,
    spawnBatch: (count: number) => Promise<number>,
  ): void {
    if (this.isFinished()) return;
    if (this.isSpawning) return;

    this.timer += deltaTime;


    if (
      this.config.maxActive !== undefined &&
      currentCount >= this.config.maxActive
    ) {
      return;
    }
    if (this.timer < this.nextDelay) return;

    this.timer = 0;
    this.nextDelay = this.rollDelay();

    const remaining =
      this.config.totalToSpawn - this.spawnedCount;

    const batch = Math.min(
      this.rollBatch(),
      remaining,
    );

    this.isSpawning = true;
    this.spawnedCount += batch;

    void spawnBatch(batch)
      .then((actualSpawned) => {
        this.spawnedCount -= batch - actualSpawned;
      })
      .catch(() => {
        // Undo reservation if spawning completely fails.
        this.spawnedCount -= batch;
      })
      .finally(() => {
        this.isSpawning = false;
      });
  }

  isFinished(): boolean {
    return this.spawnedCount >= this.config.totalToSpawn;
  }

  getSpawnedCount(): number {
    return this.spawnedCount;
  }

  protected rollDelay(): number {
    return (
      this.config.minDelay +
      Math.random() *
        (this.config.maxDelay - this.config.minDelay)
    );
  }

  protected rollBatch(): number {
    return (
      this.config.minBatch +
      Math.floor(
        Math.random() *
          (this.config.maxBatch - this.config.minBatch + 1),
      )
    );
  }
}
