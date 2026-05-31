import { shallowRef, readonly } from "vue";

/**
 * Singleton: id of the NPC currently within interaction range of the player,
 * or `null` if none. Written by `useInteraction` every frame; read by NPCs
 * to decide whether to show their "talk to me" hint.
 */
const closestNpcId = shallowRef<string | null>(null);

export function useClosestNpc() {
  return {
    closestNpcId: readonly(closestNpcId),
    setClosestNpcId(id: string | null) {
      if (closestNpcId.value !== id) {
        closestNpcId.value = id;
      }
    },
  };
}
