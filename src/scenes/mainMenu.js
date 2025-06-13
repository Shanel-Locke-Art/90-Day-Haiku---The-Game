import menuText from "../dialogue/items/menuText.js";
import { gameState } from "../state/stateManagers.js";
import { audioManager } from "../state/audioManager.js";

export default function mainMenu(k) {
  // 🎵 Play background music
  audioManager.playMusic(k, "menuMusic");

  k.setBackground(k.Color.fromHex("#000000")); // Black background

  // 🌅 Animated sunset background (GIF-style)
  k.add([
    k.sprite("sunset", { anim: "loop" }),
    k.anchor("center"),
    k.pos(k.center()),
    k.scale(k.width() / 500, k.height() / 350),
    k.z(-1),
    k.fixed(),
  ]);

  // 🪧 Text background box
  const boxWidth = k.width() * 0.8;
  const boxHeight = 170;
  const boxX = k.width() * 0.1;
  const boxY = k.center().y - 140;

  k.add([
    k.rect(boxWidth, boxHeight, { radius: 16 }),
    k.pos(boxX, boxY),
    k.color(0, 0, 0),
    k.opacity(0.75),
    k.z(0),
  ]);

  // 🕹 Title
  k.add([
    k.text(menuText.title, { size: 70, font: "gameboy" }),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y - 80),
    k.z(1),
  ]);

  // 🔁 Blinking prompt
  const prompt = k.add([
    k.text(menuText.playIndication || "Press ENTER to Start", {
      size: 22,
      font: "gameboy",
    }),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y - 15),
    k.z(1),
  ]);

  let blinkTimer = 0;
  k.onUpdate(() => {
    blinkTimer += k.dt();
    prompt.hidden = Math.floor(blinkTimer * 2) % 2 === 0;
  });

  const startGame = () => {
    gameState.setFontSize(25);
    audioManager.stopMusic();
    k.go("instructions"); // Goes to instructions screen first
  };

  // 🎮 Inputs
  k.onKeyPress("enter", startGame);
  k.onClick(startGame);
  k.onTouchStart(startGame);
}
