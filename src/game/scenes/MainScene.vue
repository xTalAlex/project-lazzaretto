<template>
  <Scene
    name="MainScene"
    @preload="onScenePreload"
    @create="onSceneCreate"
    v-slot="{ preloaded }"
  >
    <template v-if="preloaded">
      <NPC texture="chef" :x="1500" :y="350" facing="down" />

      <NPC texture="archrat" :x="300" :y="250" facing="right" />

      <Player />
    </template>
  </Scene>
</template>

<script setup lang="ts">
import { shallowRef, provide } from "vue";
import { Scene } from "phavuer";
import type { GameObjects, Tilemaps, Scene as PhaserScene } from "phaser";
import Player from "@game/entities/Player.vue";
import NPC from "@game/entities/NPC.vue";
import { SolidLayersKey, NpcGroupKey } from "@game/types";
import { assetUrl } from "@game/assets";

// ---------------------------------------------------------------------------
// Tile layer convention (2.5D top-down). Same set for every map.
//   - collides : whether the layer blocks entities
//   - depth    : 0 = drawn below entities, HIGH_DEPTH = drawn above entities
//     (entities use depth = y for y-sorting; tile layers stay at the extremes)
// ---------------------------------------------------------------------------

const HIGH_DEPTH = 10000;

type TileLayerCfg = {
  /** Layer name as it appears in Tiled */
  name: string;
  /** Tileset name in Tiled (also used to derive the loader key `tiles-${tileset}`) */
  tileset: "ground" | "wall" | "props" | "roofs";
  collides: boolean;
  depth: number;
};

const TILE_LAYERS: readonly TileLayerCfg[] = [
  { name: "Ground", tileset: "ground", collides: false, depth: 0 },
  { name: "Walls", tileset: "wall", collides: true, depth: 0 },
  { name: "PropsLow", tileset: "props", collides: true, depth: 0 },
  { name: "Roofs", tileset: "roofs", collides: false, depth: HIGH_DEPTH },
  { name: "PropsHigh", tileset: "props", collides: false, depth: HIGH_DEPTH },
] as const;

/** Deduplicated tileset list for the loader */
const TILESETS = [...new Set(TILE_LAYERS.map((l) => l.tileset))];

// ---------------------------------------------------------------------------
// Shared state (provided to entities)
// ---------------------------------------------------------------------------

const solidLayers = shallowRef<
  (Tilemaps.TilemapLayer | Tilemaps.TilemapGPULayer)[]
>([]);
provide(SolidLayersKey, solidLayers);

const npcGroup = shallowRef<GameObjects.Group | null>(null);
provide(NpcGroupKey, npcGroup);

// ---------------------------------------------------------------------------
// Animations registry (parametric per character)
// ---------------------------------------------------------------------------

const CHARACTERS = ["player", "chef", "archrat"] as const;
/** Directions order must match the sprite sheet layout rows 0, 1, 2, 3 */
const DIRECTIONS = ["up", "right", "down", "left"] as const;

const registerCharacterAnims = (scene: PhaserScene, textureKey: string) => {
  DIRECTIONS.forEach((dir, row) => {
    const base = row * 3;
    scene.anims.create({
      key: `idle-${textureKey}-${dir}`,
      frames: [{ key: textureKey, frame: base + 1 }],
      frameRate: 1,
      repeat: -1,
    });
    scene.anims.create({
      key: `walk-${textureKey}-${dir}`,
      frames: scene.anims.generateFrameNumbers(textureKey, {
        frames: [base, base + 1, base + 2, base + 1],
      }),
      frameRate: 8,
      repeat: -1,
    });
  });
};

// ---------------------------------------------------------------------------
// Scene lifecycle
// ---------------------------------------------------------------------------

const onScenePreload = (scene: PhaserScene) => {
  TILESETS.forEach((ts) =>
    scene.load.image(`tiles-${ts}`, assetUrl(`tilesets/village/${ts}.png`)),
  );
  scene.load.tilemapTiledJSON("map0", assetUrl("maps/map0.tmj"));

  CHARACTERS.forEach((char) =>
    scene.load.spritesheet(char, assetUrl(`sprites/${char}.png`), {
      frameWidth: 48,
      frameHeight: 64,
    }),
  );

  // NPC group must exist before children mount
  npcGroup.value = scene.add.group();
};

const onSceneCreate = (scene: PhaserScene) => {
  const map = scene.make.tilemap({ key: "map0" });

  // Register each tileset once; the same image can be reused by multiple layers
  const tilesetRefs = new Map<string, Tilemaps.Tileset>();
  TILESETS.forEach((ts) => {
    const tileset = map.addTilesetImage(ts, `tiles-${ts}`);
    if (tileset) {
      tilesetRefs.set(ts, tileset);
    } else {
      console.warn(`[MainScene] Tileset "${ts}" not found in map0`);
    }
  });

  // Build every configured layer; collect collidable ones for entities
  const solids: (Tilemaps.TilemapLayer | Tilemaps.TilemapGPULayer)[] = [];
  TILE_LAYERS.forEach((cfg) => {
    const tileset = tilesetRefs.get(cfg.tileset);
    if (tileset) {
      const layer = map.createLayer(cfg.name, tileset, 0, 0);
      if (layer) {
        if (cfg.depth) layer.setDepth(cfg.depth);
        if (cfg.collides) {
          layer.setCollisionByExclusion([-1]);
          solids.push(layer);
        }
      } else {
        console.warn(`[MainScene] Tiled layer "${cfg.name}" not found in map0`);
      }
    }
  });
  solidLayers.value = solids;

  scene.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  CHARACTERS.forEach((key) => registerCharacterAnims(scene, key));
};
</script>
