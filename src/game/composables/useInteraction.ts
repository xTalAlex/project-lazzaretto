import Phaser from "phaser";
import { inject } from "vue";
import { useScene, onPreUpdate } from "phavuer";
import { NpcGroupKey } from "@game/types";
import { getActionKey } from "@game/input";

const INTERACTION_RANGE = 48;

export function useInteraction(getPlayerPos: () => { x: number; y: number }) {
  const scene = useScene();
  const npcGroup = inject(NpcGroupKey);
  const interactKey = getActionKey(scene, "interact");

  onPreUpdate(() => {
    if (Phaser.Input.Keyboard.JustDown(interactKey)) {
      if (npcGroup?.value) {
        const { x: px, y: py } = getPlayerPos();
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

        if (closest && minDist <= INTERACTION_RANGE) {
          console.log(`[interact]`, closest.texture.key);
        }
      }
    }
  });
}
