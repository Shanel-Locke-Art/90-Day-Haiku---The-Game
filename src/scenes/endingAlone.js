import { gameState } from "../state/stateManagers.js";
import { audioManager } from "../state/audioManager.js";

export default function endingAlone(k) {
  gameState.setCurrentScene("endingAlone");
  audioManager.playMusic(k, "lonelyEndingMusic");

  k.setBackground(k.Color.fromHex("#E6E6E6"));

  // ✅ Load and fit image to the left half
  const leftImageWidth = k.width() / 2;
  const leftImageHeight = k.height();
  const spriteOriginalWidth = 600;
  const spriteOriginalHeight = 400;
  const scaleX = leftImageWidth / spriteOriginalWidth;
  const scaleY = leftImageHeight / spriteOriginalHeight;
  const scale = Math.min(scaleX, scaleY); // Keep aspect ratio

  k.add([
    k.sprite("endingAlone"),
    k.pos(-10, 20),
    k.scale(.65),
    k.z(0),
  ]);

  const textStartX = k.width() * 0.55;

  // 🖋️ Title
  k.add([
    k.text("You Return Alone", { size: 48 }),
    k.pos(textStartX, 60),
    k.anchor("left"),
    k.color(50, 50, 50),
    k.z(100),
  ]);

  // 💬 Message
    k.add([
    k.text(
        "Randy understood—\nLove’s just like airport sushi.\nTry again next flight.\n\nHe waved with a grin—\nLove’s delayed, not canceled yet.\nYou board solo, meh.",
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
  k.onClick(returnToMenu); // ✅ Touch/click support
}
