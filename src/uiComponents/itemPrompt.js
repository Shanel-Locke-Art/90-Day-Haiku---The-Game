// ✅ itemPrompt.js — shared UI element for "E to Interact"
export function createInteractPrompt(k) {
  const WIDTH = 180;
  const HEIGHT = 24;

  // Background rectangle
  const bg = k.add([
    k.rect(WIDTH, HEIGHT, { radius: 4 }),
    k.color(0, 0, 0),
    k.opacity(0), // Start hidden
    k.pos(0, 0),
    k.z(1099),
    k.fixed(),
    "interactPromptBG",
  ]);

  // Text inside the prompt
  const text = k.add([
    k.text("E to Interact", { size: 24 }),
    k.color(255, 255, 255),
    k.opacity(0), // Start hidden
    k.pos(0, 0),
    k.z(1100),
    k.fixed(),
    "interactPromptText",
  ]);

  return {
    show() {
      bg.opacity = 0.7;
      text.opacity = 1;
    },
    hide() {
      bg.opacity = 0;
      text.opacity = 0;
    },
    setPosition(worldPos) {
      const screenPos = k.toScreen(worldPos);
      const centeredPos = screenPos.sub(k.vec2(WIDTH / 2, HEIGHT + 12)); // Center and offset above
      bg.pos = centeredPos;
      text.pos = centeredPos.add(k.vec2(5, 2)); // Padding inside box
    },
  };
}

