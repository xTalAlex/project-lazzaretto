<template>
  <Container :x="x" :y="y - 52" :depth="10001">
    <Rectangle
      :width="48"
      :height="24"
      :fillColor="0x000000"
      :fillAlpha="0.9"
      :strokeColor="0xffffff"
      :strokeAlpha="0.4"
      :lineWidth="1"
      :radius="8"
    />
    <Text
      :text="dots"
      :style="{
        fontFamily: 'monospace',
        fontStyle: 'bold',
        fontSize: '16px',
        color: '#ffffff',
      }"
      :originX="0.5"
      :originY="0.75"
    />
  </Container>
</template>

<script setup lang="ts">
import { shallowRef, onUnmounted } from "vue";
import { Container, Rectangle, Text } from "phavuer";

defineProps<{
  x: number;
  y: number;
}>();

const FRAMES = [".", "..", "..."] as const;
const dots = shallowRef<string>(FRAMES[0]);
let frame = 0;

const timer = window.setInterval(() => {
  frame = (frame + 1) % FRAMES.length;
  dots.value = FRAMES[frame];
}, 350);

onUnmounted(() => {
  window.clearInterval(timer);
});
</script>
