import type { InjectionKey, ShallowRef } from "vue";
import type { GameObjects } from "phaser";

// ---------------------------------------------------------------------------
// Vue InjectionKey — shared state across scene/entities
// ---------------------------------------------------------------------------

export const ObstacleGroupKey: InjectionKey<
  ShallowRef<GameObjects.Group | null>
> = Symbol("ObstacleGroup");
