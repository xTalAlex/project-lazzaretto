<template>
  <Container :x="x" :y="y - 52" :depth="10001">
    <!-- bubble body -->
    <Rectangle
      :width="26"
      :height="20"
      :fillColor="0xffffff"
      :fillAlpha="0.95"
      :radius="6"
    />
    <!-- bubble tail (pointing down-left toward NPC head) -->
    <Triangle
      :x1="-2"
      :y1="10"
      :x2="6"
      :y2="10"
      :x3="-2"
      :y3="16"
      :fillColor="0xffffff"
      :fillAlpha="0.95"
    />
    <!-- three black dots inside the bubble -->
    <Rectangle :x="-6" :y="0" :width="3" :height="3" :fillColor="0x000000" />
    <Rectangle :x="0" :y="0" :width="3" :height="3" :fillColor="0x000000" />
    <Rectangle :x="6" :y="0" :width="3" :height="3" :fillColor="0x000000" />
  </Container>
</template>

<script setup lang="ts">
import { Container, Rectangle, Triangle } from "phavuer";

defineProps<{
  x: number;
  y: number;
}>();
</script>
