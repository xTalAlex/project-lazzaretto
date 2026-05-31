import type Phaser from "phaser";

export const KEYBINDINGS = {
  interact: "E",
} as const;

export type ActionKey = keyof typeof KEYBINDINGS;

export const getActionKey = (
  scene: Phaser.Scene,
  action: ActionKey,
): Phaser.Input.Keyboard.Key => {
  if (!scene.input.keyboard)
    throw new Error("Keyboard input not available in this scene");
  return scene.input.keyboard.addKey(KEYBINDINGS[action]);
};
