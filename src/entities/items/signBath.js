import { dialogue } from "../../uiComponents/dialogue.js";
import bathSignLines from "../../dialogue/items/signBathDialogue.js";

// 🪧 Generate the bath sign with proper z-layering and collider offset
export function generateSignBathComponents(k, pos) {
  return [
    k.sprite("assets", { anim: "signbath" }),
    k.area({ shape: new k.Rect(k.vec2(-4, -4), 24, 24) }), // Larger collider
    k.body({ isStatic: true }),
    k.pos(pos.x, pos.y + 6), // Offset to avoid player overlap
    k.z(1), // Ensure it's behind the player
    "item",
    { itemName: "signbath" },
  ];
}

// 📜 Show a random haiku from the bath sign
export async function startSignInteraction(k) {
  const lines = bathSignLines;
  const randomLine = lines[Math.floor(Math.random() * lines.length)];

  const header = "Bath House"; // 🆕 Displayed in header box

  k.play("soundUI", { volume: 0.4 }); // Make the UI sound quieter

  await dialogue(
    k,
    k.vec2(0, 0),
    [randomLine],
    true,          // instant
    null,          // no portrait
    [],            // no voices
    null,          // no NPC name
    header         // ✅ Header text shown above dialogue
  );
}













