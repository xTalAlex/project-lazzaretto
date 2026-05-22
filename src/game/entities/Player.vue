<template>
  <Rectangle
    :x="640"
    :y="360"
    :width="32"
    :height="48"
    :fillColor="0x000000"
    @create="onCreate"
  >
    <Body
      :velocityX="velocityX"
      :velocityY="velocityY"
      :collideWorldBounds="true"
    />
  </Rectangle>
</template>

<script setup lang="ts">
import { ref, inject } from "vue";
import { Rectangle, Body, useScene, onPreUpdate } from "phavuer";
import Phaser from "phaser";
import { ObstacleGroupKey } from "@game/types";

const SPEED = 130;
const scene = useScene();
const obstacleGroup = inject(ObstacleGroupKey);

const velocityX = ref(0);
const velocityY = ref(0);

let cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
let keys: {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
} | null = null;

const onCreate = (rect: Phaser.GameObjects.Rectangle) => {
  if (scene.input.keyboard) {
    cursors = scene.input.keyboard.createCursorKeys();
    keys = scene.input.keyboard.addKeys("W,A,S,D") as NonNullable<typeof keys>;
  }
  scene.cameras.main.startFollow(rect, true, 1, 1);

  if (obstacleGroup?.value) {
    scene.physics.add.collider(rect, obstacleGroup.value);
  }
};

onPreUpdate(() => {
  if (cursors && keys) {
    const left = cursors.left?.isDown || keys.A.isDown;
    const right = cursors.right?.isDown || keys.D.isDown;
    const up = cursors.up?.isDown || keys.W.isDown;
    const down = cursors.down?.isDown || keys.S.isDown;

    const vec = new Phaser.Math.Vector2(
      (right ? 1 : 0) - (left ? 1 : 0),
      (down ? 1 : 0) - (up ? 1 : 0),
    );
    if (vec.length() > 0) vec.normalize();

    velocityX.value = vec.x * SPEED;
    velocityY.value = vec.y * SPEED;
  }
});
</script>
