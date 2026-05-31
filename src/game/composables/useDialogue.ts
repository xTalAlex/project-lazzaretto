import { shallowRef, computed, readonly } from "vue";
import { bus } from "@game/events";
import { useGameMode } from "@game/composables/useGameMode";
import { i18n } from "@src/i18n";

type DialogueLine = string;

const npcId = shallowRef<string | null>(null);
const lines = shallowRef<DialogueLine[]>([]);
const speaker = shallowRef<string>("");
const index = shallowRef<number>(0);

const { setMode } = useGameMode();

const active = computed(() => npcId.value !== null);
const currentLine = computed<DialogueLine | null>(() => {
  return !active.value ? null : (lines.value[index.value] ?? null);
});

const end = () => {
  npcId.value = null;
  lines.value = [];
  speaker.value = "";
  index.value = 0;
  setMode("explore");
  bus.emit("dialogue:end");
};

bus.on("dialogue:start", ({ npcId: id }) => {
  const t = i18n.global.t;
  const tm = i18n.global.tm;

  const loadedLines = tm(`game.dialogues.${id}.lines`) as unknown;
  const loadedSpeaker = t(`game.dialogues.${id}.speaker`);

  if (Array.isArray(loadedLines) && loadedLines.length > 0) {
    npcId.value = id;
    speaker.value = loadedSpeaker;
    lines.value = loadedLines as DialogueLine[];
    index.value = 0;
    setMode("dialogue");
  } else {
    console.warn(`[useDialogue] No dialogue found for npcId="${id}"`);
  }
});

bus.on("dialogue:advance", () => {
  if (active.value) {
    if (index.value < lines.value.length - 1) {
      index.value += 1;
    } else {
      end();
    }
  }
});

export function useDialogue() {
  return {
    active,
    speaker: readonly(speaker),
    currentLine,
  };
}
