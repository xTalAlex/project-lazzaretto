import type { InjectionKey, ShallowRef } from "vue";
import type { GameObjects, Tilemaps } from "phaser";

// ---------------------------------------------------------------------------
// Shared domain types
// ---------------------------------------------------------------------------

/** 4-way facing direction. Order matches sprite sheet rows 0..3. */
export type Direction = "up" | "right" | "down" | "left";

// ---------------------------------------------------------------------------
// Vue InjectionKey — shared state across scene/entities
// ---------------------------------------------------------------------------

/**
 * All collidable tilemap layers exposed by the scene (Walls, PropsLow, ...).
 * Entities iterate and register one collider per layer.
 */
export const SolidLayersKey: InjectionKey<
  ShallowRef<(Tilemaps.TilemapLayer | Tilemaps.TilemapGPULayer)[]>
> = Symbol("SolidLayers");

/**
 * Group containing all NPC sprites. Entities register a single collider against
 * the group; new NPCs are added automatically when they mount.
 */
export const NpcGroupKey: InjectionKey<ShallowRef<GameObjects.Group | null>> =
  Symbol("NpcGroup");
