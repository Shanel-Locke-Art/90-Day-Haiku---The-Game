import { dialogue } from "../../uiComponents/dialogue.js";
import whiteVendingLines from "../../dialogue/items/whiteVendingDialogue.js";

// ⚪ Create the white vending machine item
export function generateWhiteVendingComponents(k, pos) {
  return [
    k.sprite("assets", { anim: "whitevending" }),
    k.area({ shape: new k.Rect(k.vec2(-4, -4), 24, 24) }),
    k.body({ isStatic: true }),
    k.pos(pos.x, pos.y + 6), // Offset to avoid overlap
    k.z(1), // Behind player
    "item",
    { itemName: "whitevending" },
  ];
}

// ⚪ Handle interaction with the white vending machine
export async function startWhiteVendingInteraction(k) {
  const lines = whiteVendingLines;
  const randomLine = lines[Math.floor(Math.random() * lines.length)];
  const header = "Vending Machine";

  k.play("soundUI", { volume: 0.4 }); // Make the UI sound quieter

  await dialogue(
    k,
    k.vec2(0, 0),
    [randomLine],
    true,       // Instant
    null,       // No portrait
    [],         // No voice
    null,       // No NPC name
    header      // Item label at top
  );
}
