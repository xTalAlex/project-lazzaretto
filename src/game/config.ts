import Phaser from "phaser";

const tailwindStyles = getComputedStyle(document.documentElement);

export const gameConfig = {
  width: 640,
  height: 360,
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
      debug: true,
      gravity: { x: 0, y: 0 }, // No gravity for a top-down game
    },
  },
};

export default gameConfig;
