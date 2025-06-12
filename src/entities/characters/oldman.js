import { playerState, npcState, gameState } from "../../state/stateManagers.js";
import { dialogue, onDialogueComplete } from "../../uiComponents/dialogue.js";
import { playAnimIfNotPlaying } from "../../utils.js";
import oldManLines from "../../dialogue/characters/oldManDialogue.js";
import { healthBar } from "../../uiComponents/healthbar.js";
import { addWanderBehavior } from "../wanderAI.js";

export function generateOldManComponents(k, pos) {
  return [
    k.sprite("assets", { anim: "oldman-down" }),
    k.pos(pos),
    k.body({ isStatic: false }),
    k.area({ shape: new k.Rect(k.vec2(), 20, 20) }),
    k.z(99),
    "oldman",
    "npc",
    "wall",
    "solid",
  ];
}

function facePlayerToNPC(npc, player) {
  const dx = player.pos.x - npc.pos.x;
  const dy = player.pos.y - npc.pos.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    npc.flipX = dx < 0;
    playAnimIfNotPlaying(npc, "oldman-side");
  } else {
    if (dy < 0) {
      playAnimIfNotPlaying(npc, "oldman-up");
    } else {
      playAnimIfNotPlaying(npc, "oldman-down");
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

  // ✅ Track how many times we've talked to Old Man in this scene
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
      ["Old Man", "Randy"]
  );
}
 else {
    const fallbackOptions = {
      world: [
        "Waves once sang to me—\nNow they whispered her goodbye.\nThe tide always took.",
        "My boat sat unused—\nBarnacles clung like old grief.\nI let silence speak.",
        "She stitched my torn nets—\nEach thread held a quiet vow.\nThe gulls knew her name.",
        "Tea cooled in my hand—\nI had poured a second cup.\nForce of habit, eh?",
      ],
      bath: [
        "No towel dries guilt—\nBut hot water forgives much.\nThe mirror steams up.",
        "I once soaked too long—\nChasing dreams in rising heat.\nThey wrinkled with me.",
        "A drop from the eaves—\nReminds me I am still here.\nStill here, soaking time.",
        "Soap slips from my hand—\nMemories do the same thing.\nSome return later.",
      ],
    };

    const voiceOptions = {
      world: ["oldman_extra1", "oldman_extra2", "oldman_extra3", "oldman_extra4"],
      bath: ["oldman_bath_extra1", "oldman_bath_extra2", "oldman_bath_extra3", "oldman_bath_extra4"],
    };

    const linesArray = fallbackOptions[scene] || fallbackOptions.world;
    const voiceArray = voiceOptions[scene] || voiceOptions.world;
    const randIndex = Math.floor(Math.random() * linesArray.length);

    await dialogue(
      k,
      k.vec2(0, 0),
      [linesArray[randIndex]],
      false,
      ["oldmanPortrait"],
      [voiceArray[randIndex]],
      ["Old Man"]
    );
  }

  // ✅ Check if both scenes have been talked to at least twice
  const shouldGiveHeart =
    npcState.getSceneTalkCount(npcKey, "world") >= 2 &&
    npcState.getSceneTalkCount(npcKey, "bath") >= 2 &&
    !npcState.getHasGivenHeart(npcKey);

  if (shouldGiveHeart && playerState.getCurrentMaxHealth() < playerState.getTrueMaxHealth()) {
    playerState.setCurrentMaxHealth(playerState.getCurrentMaxHealth() + 1);
    playerState.setHealth(playerState.getCurrentMaxHealth());
    k.destroyAll("healthContainer");
    heartBarInstance.giveHeartToNPC("oldman");
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

export async function startInteraction(k, oldman, player, heartBarInstance) {
  await handleSharedDialogue(k, oldman, player, "oldman", oldManLines, "oldmanPortrait", heartBarInstance);
}

export function endInteraction(oldman) {
  playAnimIfNotPlaying(oldman, "oldman-down");
}

export function attachOldManToScene(k, parent, pos) {
  const oldManComponents = generateOldManComponents(k, pos);
  const oldman = parent.add([...oldManComponents]);
  oldman.lastAnim = "down";
  addWanderBehavior(k, oldman);
  return oldman;
}
