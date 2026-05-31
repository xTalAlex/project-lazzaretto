<template>
  <Sprite
    texture="player"
    :play="animKey"
    :x="960"
    :y="540"
    @create="onSpriteCreate"
  >
    <Body
      :width="32"
      :height="12"
      :offsetX="8"
      :offsetY="52"
      :collideWorldBounds="true"
      @create="onBodyCreate"
    />
  </Sprite>
</template>

<script setup lang="ts">
import { ref, inject, computed, onUnmounted } from "vue";
import { Sprite, Body, useScene, onPreUpdate } from "phavuer";
import Phaser from "phaser";
import { SolidLayersKey, NpcGroupKey, type Direction } from "@game/types";
import { bus } from "@game/events";
import { useInteraction } from "@game/composables/useInteraction";
import { useGameMode } from "@game/composables/useGameMode";
import { usePlayerPosition } from "@game/composables/usePlayerPosition";
import { useDialogueSource } from "@game/composables/useDialogueSource";
import { directionTowards } from "@game/utils/direction";

const SPEED = 250;
const scene = useScene();
const solidLayers = inject(SolidLayersKey);
const npcGroup = inject(NpcGroupKey);
const { mode } = useGameMode();
const { setPosition } = usePlayerPosition();
const { source: dialogueSource } = useDialogueSource();

useInteraction();

const facing = ref<Direction>("down");
const moving = ref(false);

const offDialogueStart = bus.on("dialogue:start", () => {
  if (playerSprite && dialogueSource.value) {
    facing.value = directionTowards(
      playerSprite.x,
      playerSprite.y,
      dialogueSource.value.x,
      dialogueSource.value.y,
    );
  }
});

onUnmounted(() => {
  offDialogueStart();
});

const animKey = computed(
  () => `${moving.value ? "walk" : "idle"}-player-${facing.value}`,
);

let cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
let keys: {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
} | null = null;
let playerSprite: Phaser.GameObjects.Sprite | null = null;
let playerBody: Phaser.Physics.Arcade.Body | null = null;

const onSpriteCreate = (sprite: Phaser.GameObjects.Sprite) => {
  playerSprite = sprite;
  if (scene.input.keyboard) {
    cursors = scene.input.keyboard.createCursorKeys();
    keys = scene.input.keyboard.addKeys("W,A,S,D") as NonNullable<typeof keys>;
  }
  scene.cameras.main.startFollow(sprite, true, 1, 1);
};

const onBodyCreate = (body: Phaser.Physics.Arcade.Body) => {
  playerBody = body;
  if (playerSprite) {
    solidLayers?.value.forEach((layer) => {
      if (playerSprite) scene.physics.add.collider(playerSprite, layer);
    });
    if (npcGroup?.value) {
      scene.physics.add.collider(playerSprite, npcGroup.value);
    }
  }
};

onPreUpdate(() => {
  if (cursors && keys && playerBody && playerSprite) {
    if (mode.value === "explore") {
      const left = cursors.left?.isDown || keys.A.isDown;
      const right = cursors.right?.isDown || keys.D.isDown;
      const up = cursors.up?.isDown || keys.W.isDown;
      const down = cursors.down?.isDown || keys.S.isDown;

      const vec = new Phaser.Math.Vector2(
        (right ? 1 : 0) - (left ? 1 : 0),
        (down ? 1 : 0) - (up ? 1 : 0),
      );
      if (vec.length() > 0) vec.normalize();

      playerBody.setVelocity(vec.x * SPEED, vec.y * SPEED);
      moving.value = vec.length() > 0;

      // Diagonal movement makes facing sideways
      if (vec.x < 0) facing.value = "left";
      else if (vec.x > 0) facing.value = "right";
      else if (vec.y < 0) facing.value = "up";
      else if (vec.y > 0) facing.value = "down";
    } else {
      playerBody.setVelocity(0, 0);
      moving.value = false;
    }

    // Depth sorting by y coordinate (always, even while talking)
    playerSprite.setDepth(playerSprite.y);

    // Publish position for other systems (NPCs, dialogue, hints)
    setPosition(playerSprite.x, playerSprite.y);
  }
});
</script>
