import { shallowRef, readonly, type DeepReadonly, type ShallowRef } from "vue";

export type PlayerPosition = { x: number; y: number };

const position = shallowRef<PlayerPosition | null>(null);

export function usePlayerPosition() {
  return {
    position: readonly(position) as DeepReadonly<
      ShallowRef<PlayerPosition | null>
    >,
    setPosition(x: number, y: number) {
      position.value = { x, y };
    },
  };
}
