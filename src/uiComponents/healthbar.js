// File: src/uiComponents/healthbar.js
import { playerState } from "../state/stateManagers.js";

// List of characters with their heart status
const npcHearts = [
  { id: "randy", name: "Randy", hasHeart: true },
  { id: "oldman", name: "Tetsuya", hasHeart: false },
  { id: "satoshi", name: "Satoshi", hasHeart: false },
  { id: "hana", name: "Hana", hasHeart: false },
  { id: "naoko", name: "Naoko", hasHeart: false },
  { id: "mari", name: "Mari", hasHeart: false },
  { id: "koji", name: "Koji", hasHeart: false },
  { id: "yuki", name: "Yuki", hasHeart: false },
];

// Reference to audio key to be played when a heart is added
const HEART_GAIN_SOUND = "sparkle";

export function healthBar(k) {
  const HEART_SIZE = 45;
  const HEART_PADDING = 30; // more space between hearts
  const LABEL_Y_OFFSET = 45;

  // Background panel
  const backgroundFrame = k.add([
    k.rect(400, HEART_SIZE + 40, { radius: 8 }),
    k.color(255, 255, 255),
    k.opacity(0.75),
    k.pos(12, 12),
    k.fixed(),
    k.z(1800),
    "heartBackground",
  ]);

  // Foreground heart icons
  const heartsContainer = k.add([
    k.pos(20, 20),
    k.fixed(),
    k.z(2001),
    "heartContainer",
  ]);

  function buildHearts() {
    heartsContainer.children = [];

    let x = 0;
    for (const npc of npcHearts) {
      const spriteName = npc.hasHeart ? "full-heart" : "empty-heart";
      const labelColor = npc.hasHeart ? k.rgb(0, 0, 0) : k.rgb(150, 150, 150);

      // Add heart sprite
      heartsContainer.add([
        k.sprite(spriteName),
        k.pos(x, 0),
        k.z(2002),
      ]);

      // Add label text
      heartsContainer.add([
        k.text(npc.name, {
          font: "gameboy",
          size: 15,
          width: HEART_SIZE + 4,
          align: "center",
        }),
        k.color(labelColor),
        k.pos(x, LABEL_Y_OFFSET),
        k.z(2002),
      ]);

      x += HEART_SIZE + HEART_PADDING;
    }

    backgroundFrame.width = x + 20;
  }

  // Build initial state
  buildHearts();

  return {
    update() {
      buildHearts();
    },
    // 🎉 Called to grant a heart to an NPC
    giveHeartToNPC(npcId) {
      const npc = npcHearts.find(n => n.id === npcId);
      if (npc && !npc.hasHeart) {
        npc.hasHeart = true;
        buildHearts();
        try {
          k.play(HEART_GAIN_SOUND);
        } catch (e) {
          console.warn("⚠️ Could not play sparkle sound:", e);
        }
      }
    },
    // Optional helper
    hasHeart(npcId) {
      const npc = npcHearts.find(n => n.id === npcId);
      return npc?.hasHeart ?? false;
    },
  };
}
