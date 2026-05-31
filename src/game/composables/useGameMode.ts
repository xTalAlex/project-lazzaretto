import { shallowRef, readonly, type DeepReadonly, type ShallowRef } from "vue";

export type GameMode = "explore" | "dialogue";

const mode = shallowRef<GameMode>("explore");

export function useGameMode() {
  return {
    mode: readonly(mode) as DeepReadonly<ShallowRef<GameMode>>,
    setMode(next: GameMode) {
      mode.value = next;
    },
  };
}
