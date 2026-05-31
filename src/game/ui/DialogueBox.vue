<template>
  <div
    v-if="active"
    class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4"
  >
    <div
      class="pointer-events-auto w-full max-w-2xl rounded-none border-2 border-olive-500 bg-olive-950/90 px-5 py-4 text-stone-100 shadow-lg"
    >
      <div class="mb-1 text-sm font-semibold tracking-wide text-olive-500">
        {{ speaker }}
      </div>
      <p class="text-base leading-relaxed">{{ currentLine }}</p>
      <div class="mt-2 text-right text-xs text-olive-500">
        {{ t("game.ui.pressE") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useDialogue } from "@game/composables/useDialogue";

const { t } = useI18n();
const { active, speaker, currentLine } = useDialogue();
</script>
