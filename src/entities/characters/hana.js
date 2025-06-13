import { playerState, npcState, gameState } from "../../state/stateManagers.js";
import { dialogue, onDialogueComplete } from "../../uiComponents/dialogue.js";
import { playAnimIfNotPlaying } from "../../utils.js";
import hanaLines from "../../dialogue/characters/hanaDialogue.js";
import { healthBar } from "../../uiComponents/healthbar.js";
import { addWanderBehavior } from "../wanderAI.js";

export function generateHanaComponents(k, pos) {
  return [
    k.sprite("assets", { anim: "hana-down" }),
    k.pos(pos),
    k.body({ isStatic: false }),
    k.area({ shape: new k.Rect(k.vec2(), 20, 20) }),
    k.z(1),
    "hana",
    "wall",
    "npc",
    "solid",
  ];
}

function facePlayerToNPC(npc, player) {
  const dx = player.pos.x - npc.pos.x;
  const dy = player.pos.y - npc.pos.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    npc.flipX = dx < 0;
    playAnimIfNotPlaying(npc, "hana-side");
  } else {
    if (dy < 0) {
      playAnimIfNotPlaying(npc, "hana-up");
    } else {
      playAnimIfNotPlaying(npc, "hana-down");
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
    fallbackRandyLines = [],
    fallbackRandyVoices = [],
  } = currentData;

  playerState.setIsSwordEquipped(true);
  let nbTalked = npcState.getNbTalked(npcKey);
  const shouldGiveHeart = nbTalked === 1 && !npcState.getHasGivenHeart(npcKey);

  const entry1 = lines[nbTalked * 2];
  const entry2 = lines[nbTalked * 2 + 1];

  if (entry1?.text && entry2?.text) {
    await dialogue(
      k,
      k.vec2(0, 0),
      [entry1.text, entry2.text],
      false,
      [portraitKey, "randyPortrait"],
      [voices[nbTalked] || null, randyVoices[nbTalked] || null],
      ["Hana", "Randy"]
    );
  } else {
    const fallbackOptions = {
      antique: [
      "You want a tattoo?\nSure, I’ll ink your deep meaning—\nLive, Laugh, Regret it.",
      "This one’s a dragon—\nOr maybe it’s just your ex\nbreathing down your neck.",
      "Trust me, I’m an *art*-ist—\nYour pain is my canvas now.\nHold still or it’s worse.",
      "Spiritual ink?\nLet’s align your chakra set—\nright above your butt.",
      ],
     };
     
    const voiceOptions = { 
      antique: ["hana_extra1", "hana_extra2", "hana_extra3", "hana_extra4"],
    }; 

    const linesArray = fallbackOptions[scene] || fallbackOptions.antique;
    const voiceArray = voiceOptions[scene] || voiceOptions.antique;
    const randIndex = Math.floor(Math.random() * linesArray.length);

    await dialogue(
      k,
      k.vec2(0, 0),
      [linesArray[randIndex]],
      false,
      [portraitKey],
      [voiceArray[randIndex]],
      ["Hana"]
    );
  }

   if (shouldGiveHeart && playerState.getCurrentMaxHealth() < playerState.getTrueMaxHealth()) {
    playerState.setCurrentMaxHealth(playerState.getCurrentMaxHealth() + 1);
    playerState.setHealth(playerState.getCurrentMaxHealth());
    k.destroyAll("healthContainer");
    heartBarInstance.giveHeartToNPC("hana");
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

export async function startInteraction(k, hana, player, heartBarInstance) {
  await handleSharedDialogue(k, hana, player, "hana", hanaLines, "hanaPortrait", heartBarInstance);
}

export function endInteraction(hana) {
  playAnimIfNotPlaying(hana, "hana-down");
}

export function attachHanaToScene(k, parent, pos) {
  const hanaComponents = generateHanaComponents(k, pos);
  const hana = parent.add([...hanaComponents]);
  hana.lastAnim = "down";
  addWanderBehavior(k, hana);
  return hana;
}
