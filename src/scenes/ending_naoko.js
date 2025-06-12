import { gameState } from "../state/stateManagers.js";
import { audioManager } from "../state/audioManager.js";

export default function ending_naoko(k) {
  gameState.setCurrentScene("ending_naoko");
  audioManager.playMusic(k, "lonelyEndingMusic");

  k.setBackground(k.Color.fromHex("#E6E6E6"));

  // 🔥 Naoko’s image on the left
  const leftImageWidth = k.width() / 2;
  const leftImageHeight = k.height();
  const scale = Math.min(leftImageWidth / 600, leftImageHeight / 400);

  k.add([
    k.sprite("endingNaoko"),
    k.pos(-20, 80),
    k.scale(0.65),
    k.z(0),
  ]);

  const textStartX = k.width() * 0.55;

  // 🖋️ Title
  k.add([
    k.text("You Chose Naoko", { size: 48 }),
    k.pos(textStartX, 60),
    k.anchor("left"),
    k.color(50, 50, 50),
    k.z(100),
  ]);

  // 🔥 Haikus
  k.add([
    k.text(
      "They burned incense low—\n'Love is ash,' they softly said.\nYou coughed, then they left.\n\nThey ghosted your calls—\nYou mailed a mixtape to hell.\nEven hell returned.",
      { size: 28, width: k.width() / 1.5, align: "left", lineSpacing: 10 }
    ),
    k.pos(textStartX, 260),
    k.anchor("left"),
    k.color(80, 80, 80),
    k.z(100),
  ]);

  // 🔁 Prompt
  const promptText = k.add([
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
