import { dialogue } from "../../uiComponents/dialogue.js";
import signTrainLines from "../../dialogue/items/signTrainDialogue.js";

// 🚉 Generate the train station sign
export function generateSignTrainComponents(k, pos) {
  return [
    k.sprite("assets", { anim: "signtrain" }), // Make sure the "signtrain" animation exists in your asset sheet
    k.area({ shape: new k.Rect(k.vec2(-4, -4), 24, 24) }), // Generous collider
    k.body({ isStatic: true }),
    k.pos(pos.x, pos.y + 6), // Slight vertical offset
    k.z(1), // Behind player
    "item",
    { itemName: "signtrain" },
  ];
}

// 🗾 Trigger randomized sign haiku
export async function startSignInteraction(k) {
  const lines = signTrainLines;
  const randomLine = lines[Math.floor(Math.random() * lines.length)];
  const header = "Train Station";

  k.play("soundUI", { volume: 0.4 }); // Make the UI sound quieter

  await dialogue(
    k,
    k.vec2(0, 0),
    [randomLine],
    true,          // Instant mode
    null,          // No portrait
    [],            // No voice line
    null,          // No NPC name
    header         // ✅ Label at the top
  );
}
