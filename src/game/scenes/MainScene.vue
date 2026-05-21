<template>
  <Scene name="MainScene" @create="onSceneCreate">
    <Rectangle
      :x="100"
      :y="100"
      :width="64"
      :height="64"
      :fillColor="0xb24a3a"
    />
    <Rectangle
      :x="1180"
      :y="100"
      :width="64"
      :height="64"
      :fillColor="0x3a7bb2"
    />
    <Rectangle
      :x="100"
      :y="620"
      :width="64"
      :height="64"
      :fillColor="0xb2a73a"
    />
    <Rectangle
      :x="1180"
      :y="620"
      :width="64"
      :height="64"
      :fillColor="0x6b3ab2"
    />
    <Rectangle
      :x="640"
      :y="360"
      :width="32"
      :height="32"
      :fillColor="0xffffff"
    />

    <Player />
  </Scene>
</template>

<script setup lang="ts">
import { Scene, Rectangle } from "phavuer";
import Player from "@game/entities/Player.vue";
import gameConfig from "@game/config";

const WORLD_W = gameConfig.width * 2;
const WORLD_H = gameConfig.height * 2;

const onSceneCreate = (scene: Phaser.Scene) => {
  scene.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
  scene.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
};
</script>
