<template>
  <Scene
    name="MainScene"
    @preload="onScenePreload"
    @create="onSceneCreate"
    v-slot="{ preloaded }"
  >
    <Rectangle
      v-for="(o, i) in obstacles"
      :key="i"
      :x="o.x"
      :y="o.y"
      :width="o.width"
      :height="o.height"
      :fillColor="0x6b4423"
      @create="addToObstacleGroup"
    >
      <StaticBody />
    </Rectangle>

    <Player v-if="preloaded" />
  </Scene>
</template>

<script setup lang="ts">
import { shallowRef, provide } from "vue";
import { Scene, Rectangle, StaticBody } from "phavuer";
import type { GameObjects, Scene as PhaserScene } from "phaser";
import Player from "@game/entities/Player.vue";
import gameConfig from "@game/config";
import { ObstacleGroupKey } from "@game/types";
import { assetUrl } from "@game/assets";

const WORLD_W = gameConfig.width * 2;
const WORLD_H = gameConfig.height * 2;

const obstacleGroup = shallowRef<GameObjects.Group | null>(null);
provide(ObstacleGroupKey, obstacleGroup);

const obstacles = [
  { x: 400, y: 220, width: 200, height: 32 },
  { x: 880, y: 500, width: 32, height: 200 },
  { x: 240, y: 480, width: 64, height: 64 },
];

const onScenePreload = (scene: PhaserScene) => {
  obstacleGroup.value = scene.add.group();
  scene.load.spritesheet("player", assetUrl("player.png"), {
    frameWidth: 48,
    frameHeight: 64,
  });
};

const onSceneCreate = (scene: PhaserScene) => {
  scene.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
  scene.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

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

const addToObstacleGroup = (rect: GameObjects.Rectangle) => {
  obstacleGroup.value?.add(rect);
};
</script>
