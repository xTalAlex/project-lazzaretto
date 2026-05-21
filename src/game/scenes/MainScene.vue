<template>
  <Scene name="MainScene">
    <Rectangle
      :x="320"
      :y="180"
      :width="32"
      :height="48"
      :fillColor="0x000000"
    />
  </Scene>
</template>

<script setup lang="ts">
import { Scene, Rectangle } from "phavuer";
</script>
