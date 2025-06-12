import { gameState } from "../state/stateManagers.js";
import { audioManager } from "../state/audioManager.js";

export default function ending_hana(k) {
  gameState.setCurrentScene("ending_hana");
  audioManager.playMusic(k, "lonelyEndingMusic");

  k.setBackground(k.Color.fromHex("#E6E6E6"));

  // 🖼️ Hana’s portrait on left
  const leftImageWidth = k.width() / 2;
  const leftImageHeight = k.height();
  const scale = Math.min(leftImageWidth / 600, leftImageHeight / 400);

  k.add([
    k.sprite("endingHana"),
    k.pos(-10, 20),
    k.scale(0.65),
    k.z(0),
  ]);

  const textStartX = k.width() * 0.55;

  // 🖋️ Title
  k.add([
    k.text("You Chose Hana", { size: 48 }),
    k.pos(textStartX, 60),
    k.anchor("left"),
    k.color(50, 50, 50),
    k.z(100),
  ]);

  // 💬 Haikus
  k.add([
    k.text(
      "Needles on her skin—\nShe inked your name upside down.\nThen moved out that night.\n\n'What’s your deepest truth?'\nShe asked mid-tattoo, then left.\nYour answer? Regret.",
      { size: 28, width: k.width() / 1.5, align: "left", lineSpacing: 10 }
    ),
    k.pos(textStartX, 260),
    k.anchor("left"),
    k.color(80, 80, 80),
    k.z(100),
  ]);

  // 🔁 Prompt
  k.add([
    k.text("Press ENTER or TAP anywhere\nto return to the main menu.", { size: 24 }),
    k.pos(textStartX, k.height() - 100),
    k.anchor("left"),
    k.color(0, 0, 0),
    k.z(100),
  ]);

  function returnToMenu() {
    audioManager.stopMusic();
    k.go("mainMenu");
  }

  k.onKeyPress("enter", returnToMenu);
  k.onClick(returnToMenu);
}
