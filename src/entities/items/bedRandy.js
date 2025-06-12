import { dialogue } from "../../uiComponents/dialogue.js";

const bedRandyLines = [
  "Randy's pod glows soft—\nMisnamed towns in bold shirts blur,\nDreams flirt, never stay.",
];

export function generateBedRandyComponents(k, pos) {
  return [
    k.sprite("assets", {
      anim: "bedrandy",
    }),
    k.area({ shape: new k.Rect(k.vec2(0, 0), 20, 20) }),
    k.body({ isStatic: true }),
    k.pos(pos),
    k.z(1), // Ensures item spawns behind player
    k.scale(1),
    "item",
    { itemName: "bedrandy" },
  ];
}

export async function startBedRandyInteraction(k) {
  if (!Array.isArray(bedRandyLines)) {
    console.warn("⚠️ bedRandyLines is invalid:", bedRandyLines);
    return;
  }

  const header = "Your Bed";

  k.play("soundUI", { volume: 0.4 }); // Make the UI sound quieter

  await dialogue(
    k,
    k.vec2(0, 0),
    bedRandyLines,
    true,      // Instant mode
    null,      // No portrait
    [],        // No voice
    null,      // No NPC name
    header     // ✅ Display item name
  );
}








