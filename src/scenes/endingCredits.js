import { gameState } from "../state/stateManagers.js";
import { colorizeBackground } from "../utils.js";
import { audioManager } from "../state/audioManager.js";

export default function endingCredits(k) {
  // 🎵 Play background music
  audioManager.playMusic(k, "endingMusic");

  // 🌅 Background image
  k.add([
    k.sprite("endingCredits"),
    k.anchor("center"),
    k.scale(k.width() / 1280, k.height() / 620),
    k.pos(k.center()),
    k.z(-1),
  ]);

  // 🪧 Text background box
  const boxWidth = 600;
  const boxHeight = 240;
  const boxX = k.center().x - boxWidth / 2;
  const boxY = 120;

  k.add([
    k.rect(boxWidth, boxHeight, { radius: 12 }),
    k.pos(boxX, boxY),
    k.color(255, 255, 255),
    k.opacity(0.75),
    k.z(0),
  ]);

  // 🕹 Title text
  k.add([
    k.text("Randy decided to Go Home!", {
      size: 48,
      font: "gameboy",
    }),
    k.anchor("center"),
    k.pos(k.center().x, boxY + 40),
    k.color(0, 0, 0),
    k.z(1),
  ]);

  // 📝 Credit text
  k.add([
    k.text(
      "Created by Shanel L0g1cF@11acy Locke\nPlease Find Me Online @ www.shanellockeart.com",
      {
        size: 20,
        width: 540,
        lineSpacing: 18,
        font: "gameboy",
      }
    ),
    k.anchor("center"),
    k.pos(k.center().x, boxY + 110),
    k.color(0, 0, 0),
    k.z(1),
  ]);

  // 🔁 Blinking prompt
  const prompt = k.add([
    k.text("Press ENTER to Finish the Game", {
      size: 18,
      font: "gameboy",
    }),
    k.anchor("center"),
    k.pos(k.center().x, boxY + 200),
    k.color(0, 0, 0),
    k.z(1),
  ]);

  let blinkTimer = 0;
  k.onUpdate(() => {
    blinkTimer += k.dt();
    prompt.hidden = Math.floor(blinkTimer * 2) % 2 === 0;
  });

  const finish = () => {
    k.go("endingSelection");
  };

  // 🎮 Inputs
  k.onKeyPress("enter", finish);
  k.onClick(finish);
  k.onTouchStart(finish);
}
