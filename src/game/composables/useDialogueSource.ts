import { shallowRef, readonly, type DeepReadonly, type ShallowRef } from "vue";

export type DialogueSource = { x: number; y: number };

const source = shallowRef<DialogueSource | null>(null);

export function useDialogueSource() {
  return {
    source: readonly(source) as DeepReadonly<ShallowRef<DialogueSource | null>>,
    setSource(x: number, y: number) {
      source.value = { x, y };
    },
    clearSource() {
      source.value = null;
    },
  };
}
