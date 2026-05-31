import type { Direction } from "@game/types";

/**
 * Returns the cardinal direction pointing from (fromX,fromY) to (toX,toY).
 * Dominant-axis rule: the larger absolute delta wins (Manhattan).
 * Ties prefer the horizontal axis.
 */
export const directionTowards = (
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): Direction => {
  const dx = toX - fromX;
  const dy = toY - fromY;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "right" : "left";
  } else {
    return dy > 0 ? "down" : "up";
  }
};
