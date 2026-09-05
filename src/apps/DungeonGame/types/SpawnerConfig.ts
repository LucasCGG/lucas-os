export interface SpawnerConfig {
  totalToSpawn: number;
  minDelay: number;
  maxDelay: number;
  minBatch: number;
  maxBatch: number;
  maxActive?: number;
}
