import type { InjectionKey, ShallowRef } from "vue";
import type { GameObjects, Tilemaps } from "phaser";

// ---------------------------------------------------------------------------
// Vue InjectionKey — shared state across scene/entities
// ---------------------------------------------------------------------------

export const WallsLayerKey: InjectionKey<
  ShallowRef<Tilemaps.TilemapLayer | Tilemaps.TilemapGPULayer | null>
> = Symbol("WallsLayer");
