import { gameState } from "../state/stateManagers.js";
import { audioManager } from "../state/audioManager.js";

export default function ending_oldman(k) {
  gameState.setCurrentScene("ending_oldman");
  audioManager.playMusic(k, "lonelyEndingMusic");

  k.setBackground(k.Color.fromHex("#E6E6E6"));

  // 🖼️ Old Man image on the left
  const scale = Math.min(k.width() / 2 / 600, k.height() / 400);

  k.add([
    k.sprite("endingOldman"),
    k.pos(-10, 20),
    k.scale(0.65),
    k.z(0),
  ]);

  const textStartX = k.width() * 0.55;

  // 🖋️ Title
  k.add([
    k.text("You Chose Tetsuya", { size: 48 }),
    k.pos(textStartX, 60),
    k.anchor("left"),
    k.color(50, 50, 50),
    k.z(100),
  ]);

  k.add([
    k.text(
      "Sailed west with my bones—\nHe insisted I was bait.\nNo fish, just silence.\n\n'Wife once fed the crows.'\nHe said that, then fed your dreams.\nYou woke up... in Guam.",
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
