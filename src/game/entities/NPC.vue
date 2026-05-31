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
  <TalkIndicator v-if="talking" :x="x" :y="y" />
  <TalkHint v-if="showHint" :x="x" :y="y" />
</template>

<script setup lang="ts">
import { inject, computed, shallowRef, onUnmounted } from "vue";
import Phaser from "phaser";
import { Sprite, StaticBody } from "phavuer";
import { NpcGroupKey, type Direction } from "@game/types";
import { bus } from "@game/events";
import { usePlayerPosition } from "@game/composables/usePlayerPosition";
import { useDialogueSource } from "@game/composables/useDialogueSource";
import { useClosestNpc } from "@game/composables/useClosestNpc";
import { directionTowards } from "@game/utils/direction";
import TalkIndicator from "@game/ui/TalkIndicator.vue";
import TalkHint from "@game/ui/TalkHint.vue";

const props = defineProps<{
  id: string;
  texture: string;
  x: number;
  y: number;
  facing: Direction;
}>();
const npcGroup = inject(NpcGroupKey);
const { position: playerPosition } = usePlayerPosition();
const { setSource, clearSource } = useDialogueSource();
const { closestNpcId } = useClosestNpc();

const facing = shallowRef<Direction>(props.facing);
const facingBeforeDialogue = shallowRef<Direction | null>(null);
const talking = shallowRef(false);

const animKey = computed(() => `idle-${props.texture}-${facing.value}`);
const showHint = computed(
  () => !talking.value && closestNpcId.value === props.id,
);

const offStart = bus.on("dialogue:start", ({ npcId }) => {
  if (npcId === props.id) {
    talking.value = true;
    setSource(props.x, props.y);
    if (playerPosition.value) {
      facingBeforeDialogue.value = facing.value;
      facing.value = directionTowards(
        props.x,
        props.y,
        playerPosition.value.x,
        playerPosition.value.y,
      );
    }
  }
});

const offEnd = bus.on("dialogue:end", () => {
  if (talking.value) {
    talking.value = false;
    clearSource();
  }
  if (facingBeforeDialogue.value !== null) {
    facing.value = facingBeforeDialogue.value;
    facingBeforeDialogue.value = null;
  }
});

onUnmounted(() => {
  offStart();
  offEnd();
});

const onSpriteCreate = (sprite: Phaser.GameObjects.Sprite) => {
  npcGroup?.value?.add(sprite);
  sprite.setData("npcId", props.id);
  sprite.setDepth(sprite.y);
};
</script>
