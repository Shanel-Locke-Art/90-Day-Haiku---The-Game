import { dialogue } from "../../uiComponents/dialogue.js";
import { playerState } from "../../state/stateManagers.js";

const swordLine = [
  "Blade sleeps in still light—\nDust clings to forgotten strength,\nNow it breathes again.",
];

// 🗡️ Generate the ancient sword item
export function generateSwordComponents(k, pos) {
  return [
    k.sprite("assets", { 
      anim: "sword" }),
    k.area({ shape: new k.Rect(k.vec2(-4, -4), 24, 24) }),
    k.body({ isStatic: true }),
    k.pos(pos.x, pos.y + 6),
    k.z(1),
    "item",
    { itemName: "sword" },
  ];
}

// ✨ Trigger sword interaction and pickup
export async function startSwordInteraction(k, swordObj, interactPrompt) {
  const header = "Ancient Sword";

  k.play("soundUI", { volume: 0.4 });

  await dialogue(
    k,
    k.vec2(0, 0),
    swordLine,
    true,
    null,
    [],
    null,
    header
  );

  playerState.setHasSword(true);

  // 🗑️ Remove sword from scene and hide prompt
  interactPrompt.hide();
  k.destroy(swordObj);
}
