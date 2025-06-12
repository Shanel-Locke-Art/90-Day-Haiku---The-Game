import { dialogue } from "../../uiComponents/dialogue.js";
import mangaBookLines from "../../dialogue/items/mangaBookDialogue.js";

// 📚 Create the manga bookshelf item
export function generateBooksComponents(k, pos) {
  return [
    k.sprite("assets", { anim: "mangabookshelf" }),
    k.area({ shape: new k.Rect(k.vec2(-4, -4), 24, 24) }),
    k.body({ isStatic: true }),
    k.pos(pos.x, pos.y + 6),
    k.z(1),
    "item",
    { itemName: "mangabooks" },
  ];
}

// 📚 Handle interaction with the manga bookshelf
export async function startBooksInteraction(k) {
  const lines = mangaBookLines;
  const randomLine = lines[Math.floor(Math.random() * lines.length)];
  const header = "Manga Book";

  k.play("soundUI", { volume: 0.4 }); // Make the UI sound quieter

  await dialogue(
    k,
    k.vec2(0, 0),
    [randomLine],
    true,       // Instant
    null,       // No portrait
    [],         // No voice
    null,       // No NPC name
    header      // Label at top
  );
}
