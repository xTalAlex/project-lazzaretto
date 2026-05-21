<template>
  <div class="w-full aspect-video">
    <Game :config="gameConfig">
      <MainScene />
    </Game>
  </div>
</template>

<script setup lang="ts">
import { Game } from "phavuer";
import MainScene from "@game/scenes/MainScene.vue";
import gameConfig from "@game/config";
</script>
