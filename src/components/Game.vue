<template>
  <div class="relative w-full aspect-video">
    <Game :config="gameConfig">
      <MainScene />
    </Game>
    <DialogueBox />
  </div>
</template>

<script setup lang="ts">
import { Game } from "phavuer";
import MainScene from "@game/scenes/MainScene.vue";
import DialogueBox from "@game/ui/DialogueBox.vue";
import gameConfig from "@game/config";
</script>
