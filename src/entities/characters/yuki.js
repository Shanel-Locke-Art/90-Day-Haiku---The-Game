// File: src/entities/characters/yuki.js

import { playerState, npcState, gameState } from "../../state/stateManagers.js";
import { dialogue, onDialogueComplete } from "../../uiComponents/dialogue.js";
import { playAnimIfNotPlaying } from "../../utils.js";
import yukiLines from "../../dialogue/characters/yukiDialogue.js";
import { healthBar } from "../../uiComponents/healthbar.js";

export function generateYukiComponents(k, pos) {
  return [
    k.sprite("assets", { anim: "yuki-down" }),
    k.pos(pos),
    k.body({ isStatic: false }),
    k.area({ shape: new k.Rect(k.vec2(), 20, 20) }),
    k.z(1),
    "yuki",
  ];
}

function facePlayerToNPC(npc, player) {
  const dx = player.pos.x - npc.pos.x;
  const dy = player.pos.y - npc.pos.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    npc.flipX = dx < 0;
    playAnimIfNotPlaying(npc, "yuki-side");
  } else {
    if (dy < 0) {
      playAnimIfNotPlaying(npc, "yuki-up");
    } else {
      playAnimIfNotPlaying(npc, "yuki-down");
    }
  }
}

async function handleSharedDialogue(k, entity, player, npcKey, linesData, portraitKey, heartBarInstance) {
  const originalDirection = player.direction;
  player.direction = "down";
  entity.isTalking = true;

  facePlayerToNPC(entity, player);

  const scene = gameState.getCurrentScene();
  const currentData = linesData[scene] || {};
  const {
    lines = [],
    voices = [],
    randyVoices = [],
  } = currentData;

  playerState.setIsSwordEquipped(true);

  npcState.setSceneTalked(npcKey, scene);

  // Track overall number of interactions (optional)
  let nbTalked = npcState.getNbTalked(npcKey);
  const totalPairs = Math.floor(lines.length / 2);
  const cappedTalkIndex = Math.min(nbTalked, totalPairs - 1);

  const entry1 = lines[cappedTalkIndex * 2];
  const entry2 = lines[cappedTalkIndex * 2 + 1];

  if (entry1?.text && entry2?.text) {
    await dialogue(
      k,
      k.vec2(0, 0),
      [entry1.text, entry2.text],
      false,
      [portraitKey, "randyPortrait"],
      [voices[cappedTalkIndex] || null, randyVoices[cappedTalkIndex] || null],
        ["Yuki", "Randy"]
      );
    }
    else {
    const fallbackOptions = {
      teahouse: [
        "Steam curls, words vanish—\nOnly warmth remains with tea.",
        "I sip memories\nFloating in cups left behind—\nSome still steep in hope.",
        "The moon peeks inwards—\nNot to watch, just to listen.",
        "Hands near the kettle—\nSome wait for tea, some for truth."
      ],
      cstore: [
        "Checkout beep again—\nA song for the lonely shift.",
        "The ice cream is soft—\nNot the only thing that melts.",
        "Stocking shelves at night—\nEach can whispers its own tale.",
        "Even gum wrappers\nhave dreams of being chosen—\ncrinkled but hopeful."
      ]
    };

    const fallbackVoices = {
      teahouse: ["yuki_tea_extra1", "yuki_tea_extra2", "yuki_tea_extra3", "yuki_tea_extra4"],
      cstore: ["yuki_extra1", "yuki_extra2", "yuki_extra3", "yuki_extra4"]
    };

    const linesArray = fallbackOptions[scene] || fallbackOptions.cstore;
    const voiceArray = fallbackVoices[scene] || fallbackVoices.cstore;
    const randIndex = Math.floor(Math.random() * linesArray.length);

    await dialogue(
      k,
      k.vec2(0, 0),
      [linesArray[randIndex]],
      false,
      ["yukiPortrait"],
      [voiceArray[randIndex]],
      ["Yuki"]
    );
  }

   // ✅ Check if both scenes have been talked to at least twice
    const shouldGiveHeart =
      npcState.getSceneTalkCount(npcKey, "cstore") >= 3 &&
      npcState.getSceneTalkCount(npcKey, "teahouse") >= 3 &&
      !npcState.getHasGivenHeart(npcKey);

    if (shouldGiveHeart && playerState.getCurrentMaxHealth() < playerState.getTrueMaxHealth()) {
      playerState.setCurrentMaxHealth(playerState.getCurrentMaxHealth() + 1);
      playerState.setHealth(playerState.getCurrentMaxHealth());
      k.destroyAll("healthContainer");
      heartBarInstance.giveHeartToNPC("yuki");
      heartBarInstance.update();
      npcState.setHasGivenHeart(npcKey, true);
    }

    npcState.setNbTalked(npcKey, nbTalked + 1);
    player.direction = originalDirection;

    onDialogueComplete(() => {
      entity.isTalking = false;
      entity.pauseWander = false;
      entity.reverseDirection = true;
      entity.trigger("dialogue-ended");
  });
}

export async function startInteraction(k, yuki, player, heartBarInstance) {
  await handleSharedDialogue(k, yuki, player, "yuki", yukiLines, "yukiPortrait", heartBarInstance);
}

export function endInteraction(yuki) {
  playAnimIfNotPlaying(yuki, "yuki-down");
}

export function attachYukiToScene(k, parent, pos) {
  const yuki = parent.add([...generateYukiComponents(k, pos)]);
  yuki.lastAnim = "down";
  return yuki;
}
