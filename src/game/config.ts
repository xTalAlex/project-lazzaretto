import Phaser from "phaser";

const tailwindStyles = getComputedStyle(document.documentElement);

export const gameConfig = {
  width: 960,
  height: 540,
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  backgroundColor: tailwindStyles.getPropertyValue("--color-olive-800"),
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.FIT,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 }, // No gravity for a top-down game
    },
  },
};

export const KEYBINDINGS = {
  interact: "E",
} as const;

export type ActionKey = keyof typeof KEYBINDINGS;

export default gameConfig;
