import { dialogue } from "../../uiComponents/dialogue.js";
import signHotelLines from "../../dialogue/items/signHotelDialogue.js";

// ✅ Create the hotel sign item
export function generateSignHotelComponents(k, pos) {
  return [
    k.sprite("assets", { anim: "signhotel" }),
    k.area({ shape: new k.Rect(k.vec2(-4, -4), 24, 24) }), // Larger collider
    k.body({ isStatic: true }),
    k.pos(pos.x, pos.y + 6), // Offset to avoid player overlap
    k.z(1), // Draw behind player
    "item",
    { itemName: "signhotel" },
  ];
}

// ✅ Handle interaction with the hotel sign
export async function startSignInteraction(k) {
  const lines = signHotelLines;
  const randomLine = lines[Math.floor(Math.random() * lines.length)];
  const header = "Hotel";

  k.play("soundUI", { volume: 0.4 }); // Make the UI sound quieter

  await dialogue(
    k,
    k.vec2(0, 0),
    [randomLine],
    true,          // Instant
    null,          // No portrait
    [],            // No voice
    null,          // No NPC name
    header         // 🆕 Item label at top
  );
}











