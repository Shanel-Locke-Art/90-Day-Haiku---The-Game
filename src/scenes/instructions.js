import { gameState } from "../state/stateManagers.js";
import { colorizeBackground } from "../utils.js";
import { audioManager } from "../state/audioManager.js";

export default function instructionScene(k) {
  // 🎵 Play chill background music
  audioManager.playMusic(k, "instructionsMusic", { volume: 0.7 });

  // 🖼️ Background image
  k.add([
    k.sprite("instructions"), 
    k.anchor("center"),
    k.scale(k.width() / 1536, k.height() / 1024),
    k.pos(k.center()),
    k.z(-1),
  ]);

  // 🪧 Background box for title and instructions
  const boxWidth = 900;
  const boxHeight = 600;
  const boxX = k.center().x - boxWidth / 2;
  const boxY = 100;

  k.add([
    k.rect(boxWidth, boxHeight, { radius: 16 }),
    k.pos(boxX, boxY - 20),
    k.color(255, 255, 255),
    k.opacity(0.75),
    k.z(0),
  ]);

  // 📜 Title (centered inside box)
  k.add([
    k.text("HOW TO PLAY", {
      size: 60,
      font: "gameboy",
    }),
    k.pos(k.center().x, boxY + 25),
    k.anchor("center"),
    k.color(0, 0, 0),
    k.z(1),
  ]);

  // 📝 Instructions (left-aligned, visually centered)
  k.add([
    k.text(
      "You play as *Randy*, an obnoxious American tourist seeking love (and maybe immigration paperwork).\n\n" +
        "- Talk to people using the E key.\n" +
        "- End the game at any time using the ESC key.\n" +
        "- Everyone speaks in haiku. So do you.\n" +
        "- Win hearts by saying the right things or giving gifts.\n" +
        "- Collect hearts to start the K-1 visa journey with that person.\n\n" +
       
        "Tips:\n" +
        "- Listen closely. Locals will drop hints.\n" +
        "- Flattery and weird snacks go a long way.\n" +
        "- You’re not a hero. You’re Randy.",
      {
        size: 20,
        width: boxWidth - 40,
        lineSpacing: 14,
        font: "gameboy",
      }
    ),
    k.pos(boxX + 20, boxY + 100),
    k.color(0, 0, 0),
    k.z(1),
  ]);

  // 🔁 Blinking "Press ENTER" prompt
  const prompt = k.add([
    k.text("Press ENTER to Begin", {
      size: 26,
      font: "gameboy",
    }),
    k.anchor("center"),
    k.pos(k.center().x, boxY - 30 + boxHeight - 30),
    k.color(0, 0, 0),
    k.z(1),
  ]);

  let blinkTimer = 0;
  k.onUpdate(() => {
    blinkTimer += k.dt();
    prompt.hidden = Math.floor(blinkTimer * 2) % 2 === 0;
  });

  // Input to start game
  const startGame = () => {
    audioManager.stopMusic();
    k.go("world");
  };

  k.onKeyPress("enter", startGame);
  k.onClick(startGame);
  k.onTouchStart(startGame);
}