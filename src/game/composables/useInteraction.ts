import Phaser from "phaser";
import { inject } from "vue";
import { useScene, onPreUpdate } from "phavuer";
import { NpcGroupKey } from "@game/types";
import { getActionKey } from "@game/input";
import { bus } from "@game/events";
import { useGameMode } from "@game/composables/useGameMode";
import { usePlayerPosition } from "@game/composables/usePlayerPosition";
import { useClosestNpc } from "@game/composables/useClosestNpc";

const INTERACTION_RANGE = 48;

export function useInteraction() {
  const { mode } = useGameMode();
  const { position } = usePlayerPosition();
  const { setClosestNpcId } = useClosestNpc();
  const scene = useScene();
  const npcGroup = inject(NpcGroupKey);
  const interactKey = getActionKey(scene, "interact");

  const findClosestNpcId = (): string | null => {
    let id: string | null = null;
    if (mode.value === "explore" && npcGroup?.value && position.value) {
      const { x: px, y: py } = position.value;
      const children =
        npcGroup.value.getChildren() as Phaser.GameObjects.Sprite[];

      let closest: Phaser.GameObjects.Sprite | null = null;
      let minDist = Infinity;

      children.forEach((npc) => {
        const distance = Phaser.Math.Distance.Between(px, py, npc.x, npc.y);
        if (distance < minDist) {
          minDist = distance;
          closest = npc;
        }
      });

      const target = closest as Phaser.GameObjects.Sprite | null;
      if (target && minDist <= INTERACTION_RANGE) {
        id = (target.getData("npcId") as string | undefined) ?? null;
      }
    }
    return id;
  };

  onPreUpdate(() => {
    const closestId = findClosestNpcId();
    setClosestNpcId(closestId);

    if (Phaser.Input.Keyboard.JustDown(interactKey)) {
      if (mode.value === "explore") {
        if (closestId) {
          bus.emit("dialogue:start", { npcId: closestId });
        }
      } else if (mode.value === "dialogue") {
        bus.emit("dialogue:advance");
      }
    }
  });
}
