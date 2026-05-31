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
import { WallsLayerKey, NpcGroupKey } from "@game/types";
import { assetUrl } from "@game/assets";

const wallsLayer = shallowRef<
  Tilemaps.TilemapLayer | Tilemaps.TilemapGPULayer | null
>(null);
provide(WallsLayerKey, wallsLayer);
const npcGroup = shallowRef<GameObjects.Group | null>(null);
provide(NpcGroupKey, npcGroup);

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

const onScenePreload = (scene: PhaserScene) => {
  scene.load.image("tiles-ground", assetUrl("tilesets/village/ground.png"));
  scene.load.image("tiles-wall", assetUrl("tilesets/village/wall.png"));
  scene.load.tilemapTiledJSON("map0", assetUrl("maps/map0.tmj"));
  CHARACTERS.forEach((char) =>
    scene.load.spritesheet(char, assetUrl(`sprites/${char}.png`), {
      frameWidth: 48,
      frameHeight: 64,
    }),
  );
  npcGroup.value = scene.add.group();
};

const onSceneCreate = (scene: PhaserScene) => {
  const map = scene.make.tilemap({ key: "map0" });

  const groundTs = map.addTilesetImage("ground", "tiles-ground");
  if (groundTs) map.createLayer("Ground", groundTs, 0, 0);

  const wallTs = map.addTilesetImage("wall", "tiles-wall");
  if (wallTs) {
    const layer = map.createLayer("Walls", wallTs, 0, 0);
    if (layer) {
      layer.setCollisionByExclusion([-1]);
      wallsLayer.value = layer;
    }
  }
  scene.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  CHARACTERS.forEach((key) => registerCharacterAnims(scene, key));
};
</script>
