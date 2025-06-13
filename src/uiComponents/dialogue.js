// File: src/uiComponents/dialogue.js

import { gameState } from "../state/stateManagers.js";
import { npcPortraitFrames } from "../state/npcPortraits.js";

let dialogueCompleteCallback = null;

async function displayLine(textContainer, line) {
  for (const char of line) {
    await new Promise((resolve) =>
      setTimeout(() => {
        textContainer.text += char;
        resolve();
      }, 10)
    );
  }
}

export async function dialogue(
  k,
  pos,
  content = [],
  instant = false,
  portraits = [],
  voices = [],
  speakers = [],
  headerText = null
) {
  gameState.setFreezePlayer(true);
  k.play("soundUI", { volume: 0.4 });

  if (!Array.isArray(content)) content = [String(content)];
  if (!Array.isArray(portraits)) portraits = [];
  if (!Array.isArray(voices)) voices = [];
  if (!Array.isArray(speakers)) speakers = [];

  k.destroyAll("dialogueBox");
  k.destroyAll("portraitFrame");
  k.destroyAll("portraitImage");
  k.destroyAll("nameLabel");

  const centerX = k.width() / 2;
  const dialogY = k.height() - 225;
  const portraitX = centerX - 380;
  const portraitY = dialogY;

  let portraitFrame, portraitImage, nameLabel;

  const showPortrait = (portraitName, npcName) => {
    k.destroyAll("portraitFrame");
    k.destroyAll("portraitImage");
    k.destroyAll("nameLabel");

    if (!portraitName && !npcName) return;

    portraitFrame = k.add([
      k.rect(120, 150, { radius: 12 }),
      k.color(255, 255, 255),
      k.pos(portraitX, portraitY),
      k.z(1001),
      k.fixed(),
      k.opacity(0.85),
      "portraitFrame",
    ]);

    const portraitFrameIndex = npcPortraitFrames[portraitName] || npcPortraitFrames.default;

    portraitImage = k.add([
      k.sprite("assets", { frame: portraitFrameIndex }),
      k.pos(portraitX + 25, portraitY + 10),
      k.scale(5.2),
      k.z(1002),
      k.fixed(),
      "portraitImage",
    ]);

    if (npcName) {
      nameLabel = k.add([
        k.text(npcName, {
          font: "gameboy",
          size: 22,
        }),
        k.color(0, 0, 0),
        k.pos(portraitX + 60, portraitY + 125),
        k.anchor("center"),
        k.z(1003),
        k.fixed(),
        "nameLabel",
      ]);
    }
  };

  let headerBox, headerLabel;
  if (headerText) {
    headerBox = k.add([
      k.rect(680, 36, { radius: 6 }),
      k.color(255, 255, 255),
      k.pos(centerX - 250, dialogY - 40),
      k.z(999),
      k.fixed(),
      k.opacity(0.85),
    ]);

    headerLabel = k.add([
      k.text(headerText, {
        font: "gameboy",
        size: 30,
      }),
      k.color(0, 0, 0),
      k.pos(centerX - 375 / 2 - 40, dialogY - 22),
      k.anchor("left"),
      k.z(1000),
      k.fixed(),
    ]);
  }

  const dialogueBox = k.add([
    k.rect(680, 200, { radius: 12 }),
    k.color(255, 255, 255),
    k.pos(centerX - 250, dialogY),
    k.z(1000),
    k.fixed(),
    k.opacity(0.85),
    "dialogueBox",
  ]);

  const textContainer = dialogueBox.add([
    k.text("", {
      font: "gameboy",
      width: 640,
      lineSpacing: 12,
      size: gameState.getFontSize(),
    }),
    k.color(0, 0, 0),
    k.pos(20, gameState.getFontSize() * 1.6),
    k.fixed(),
  ]);

  const continuePrompt = dialogueBox.add([
    k.text("Press SPACE", {
      font: "gameboy",
      size: gameState.getFontSize() - 4,
    }),
    k.color(0, 0, 0),
    k.pos(270, 170),
    k.fixed(),
    k.opacity(0),
  ]);

  let blinkTimer = 0;
  const blinkUpdate = k.onUpdate(() => {
    if (continuePrompt.opacity > 0) {
      blinkTimer += k.dt();
      continuePrompt.hidden = Math.floor(blinkTimer * 2) % 2 === 0;
    }
  });

  let index = 0;
  let lineFinishedDisplayed = false;
  let currentVoice = null;

  const playVoice = (idx) => {
    return new Promise((resolve) => {
      if (voices && voices[idx]) {
        try {
          if (currentVoice && currentVoice.stop) currentVoice.stop();
          currentVoice = k.play(voices[idx]);
          if (currentVoice && currentVoice.on) {
            currentVoice.on("end", resolve);
          } else {
            const wait = setTimeout(resolve, 7000);
            k.onKeyPress("space", () => {
              clearTimeout(wait);
              resolve();
            });
          }
        } catch (e) {
          console.warn(`⚠️ Couldn't play voice line: ${voices[idx]}`, e);
          resolve();
        }
      } else {
        resolve();
      }
    });
  };

  const showLine = async (idx) => {
    textContainer.text = "";
    continuePrompt.opacity = 0;
    lineFinishedDisplayed = false;

    const portraitName = portraits[idx] || null;
    const speakerName = speakers[idx] || null;
    showPortrait(portraitName, speakerName);

    await Promise.all([
      (async () => {
        if (instant) {
          textContainer.text = content[idx];
        } else {
          await displayLine(textContainer, content[idx]);
        }
      })(),
      playVoice(idx),
    ]);

    continuePrompt.opacity = 1;
    lineFinishedDisplayed = true;
  };

  await showLine(index);

  const handleAdvance = async () => {
    if (!lineFinishedDisplayed) return;

    if (currentVoice && currentVoice.stop) {
      currentVoice.stop();
    }

    index++;

    if (!content[index]) {
      k.destroy(dialogueBox);
      k.destroyAll("interactPrompt");
      k.destroyAll("portraitImage");
      k.destroyAll("portraitFrame");
      k.destroyAll("nameLabel");
      if (headerBox) k.destroy(headerBox);
      if (headerLabel) k.destroy(headerLabel);
      dialogueKey.cancel();
      mouseClick.cancel();
      blinkUpdate.cancel();
      gameState.setFreezePlayer(false);
      if (typeof dialogueCompleteCallback === "function") {
        dialogueCompleteCallback();
        dialogueCompleteCallback = null;
      }
      return;
    }

    await showLine(index);
  };

  const dialogueKey = k.onKeyPress("space", handleAdvance);
  const mouseClick = k.onClick(handleAdvance);
}

export { displayLine };

export function onDialogueComplete(callback) {
  dialogueCompleteCallback = callback;
}

export function showRewardHeader(k, text, colorRGB = [255, 0, 0]) {
  const centerX = k.width() / 2;
  const dialogY = k.height() - 225;

  const headerBox = k.add([
    k.rect(375, 36, { radius: 6 }),
    k.color(255, 255, 255),
    k.pos(centerX - 250, dialogY - 40),
    k.z(999),
    k.fixed(),
    k.opacity(0.85),
  ]);

  const headerLabel = k.add([
    k.text(text, {
      font: "gameboy",
      size: 30,
    }),
    k.color(...colorRGB),
    k.pos(centerX - 135, dialogY - 22),
    k.anchor("center"),
    k.z(1000),
    k.fixed(),
  ]);

  setTimeout(() => {
    k.destroy(headerBox);
    k.destroy(headerLabel);
  }, 3000);
}
