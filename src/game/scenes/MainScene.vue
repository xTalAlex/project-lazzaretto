<template>
  <Scene
    name="MainScene"
    @preload="onScenePreload"
    @create="onSceneCreate"
    v-slot="{ preloaded }"
  >
    <Player v-if="preloaded" />
  </Scene>
</template>

<script setup lang="ts">
import { shallowRef, provide } from "vue";
import { Scene } from "phavuer";
import type { GameObjects, Tilemaps, Scene as PhaserScene } from "phaser";
import Player from "@game/entities/Player.vue";
import { WallsLayerKey } from "@game/types";
import { assetUrl } from "@game/assets";

const wallsLayer = shallowRef<
  Tilemaps.TilemapLayer | Tilemaps.TilemapGPULayer | null
>(null);
provide(WallsLayerKey, wallsLayer);

const onScenePreload = (scene: PhaserScene) => {
  scene.load.image("tiles-ground", assetUrl("tilesets/village/ground.png"));
  scene.load.image("tiles-wall", assetUrl("tilesets/village/wall.png"));
  scene.load.tilemapTiledJSON("map0", assetUrl("maps/map0.tmj"));
  scene.load.spritesheet("player", assetUrl("sprites/player.png"), {
    frameWidth: 48,
    frameHeight: 64,
  });
};

const onSceneCreate = (scene: PhaserScene) => {
  const map = scene.make.tilemap({ key: "map0" });

  const groundTs = map.addTilesetImage("ground", "tiles-ground");
  if (groundTs) map.createLayer("Ground", groundTs, 0, 0);

  const wallTs = map.addTilesetImage("wall", "tiles-wall");
  if (wallTs) {
    wallsLayer.value = map.createLayer("Walls", wallTs, 0, 0);
    wallsLayer.value.setCollisionByExclusion([-1]);
  }
  scene.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  const directions = ["up", "right", "down", "left"] as const;
  directions.forEach((dir, row) => {
    const base = row * 3;
    scene.anims.create({
      key: `idle-${dir}`,
      frames: [{ key: "player", frame: base + 1 }],
      frameRate: 1,
      repeat: -1,
    });
    scene.anims.create({
      key: `walk-${dir}`,
      frames: scene.anims.generateFrameNumbers("player", {
        frames: [base, base + 1, base + 2, base + 1],
      }),
      frameRate: 8,
      repeat: -1,
    });
  });
};
</script>
