<template>
  <Sprite
    :texture="texture"
    :play="animKey"
    :x="x"
    :y="y"
    @create="onSpriteCreate"
  >
    <StaticBody :width="32" :height="24" :offsetX="8" :offsetY="40" />
  </Sprite>
</template>

<script setup lang="ts">
import { inject, computed } from "vue";
import Phaser from "phaser";
import { Sprite, StaticBody } from "phavuer";
import { NpcGroupKey } from "@game/types";

const props = defineProps<{
  texture: string;
  x: number;
  y: number;
  facing: "up" | "right" | "down" | "left";
}>();
const npcGroup = inject(NpcGroupKey);

const animKey = computed(() => `idle-${props.texture}-${props.facing}`);

const onSpriteCreate = (sprite: Phaser.GameObjects.Sprite) => {
  npcGroup?.value?.add(sprite);
  sprite.setDepth(sprite.y);
};
</script>
