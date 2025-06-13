import { playerState, npcState, gameState } from "../../state/stateManagers.js";
import { dialogue, onDialogueComplete } from "../../uiComponents/dialogue.js";
import { playAnimIfNotPlaying } from "../../utils.js";
import { kojiLines } from "../../dialogue/characters/kojiDialogue.js";
import { healthBar } from "../../uiComponents/healthbar.js";
import { addWanderBehavior } from "../wanderAI.js";

export function generateKojiComponents(k, pos) {
  return [
    k.sprite("assets", { anim: "koji-down" }),
    k.pos(pos),
    k.body({ isStatic: false }),
    k.area({ shape: new k.Rect(k.vec2(), 15, 15) }),
    k.z(1),
    "koji",
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
    playAnimIfNotPlaying(npc, "koji-side");
  } else {
    if (dy < 0) {
      playAnimIfNotPlaying(npc, "koji-up");
    } else {
      playAnimIfNotPlaying(npc, "koji-down");
    }
  }
}

async function handleSharedDialogue(k, entity, player, npcKey, linesData, portraitKey, heartBarInstance) {
  const originalDirection = player.direction;
  player.direction = "down";
  entity.isTalking = true;

  facePlayerToNPC(entity, player);

  const scene = gameState.getCurrentScene();
  const gaveOriyoki = playerState.getHasGivenOriyokiToKoji?.();
  const hasOriyoki = playerState.getHasOriyoki?.();

  if (hasOriyoki && !gaveOriyoki) {
    await dialogue(
      k,
      k.vec2(0, 0),
      [
        "Wooden bowls stacked high—\nSilence served beside each meal.\nYou remembered me."
      ],
      false,
      [portraitKey],
      ["koji_oriyoki"],
      ["Koji"]
    );

    playerState.setHasGivenOriyokiToKoji(true);
    playerState.setHasOriyoki(false);

    if (!npcState.getHasGivenHeart(npcKey) && playerState.getCurrentMaxHealth() < playerState.getTrueMaxHealth()) {
      playerState.setCurrentMaxHealth(playerState.getCurrentMaxHealth() + 1);
      playerState.setHealth(playerState.getCurrentMaxHealth());
      k.destroyAll("healthContainer");

      const newHeartBar = healthBar(k);
      if (newHeartBar?.update) {
        newHeartBar.giveHeartToNPC(npcKey);
        newHeartBar.update();
      }

      npcState.setHasGivenHeart(npcKey, true);
    }

    onDialogueComplete(() => {
      entity.isTalking = false;
      entity.pauseWander = false;
      entity.reverseDirection = true;
      entity.trigger("dialogue-ended");
    });

    player.direction = originalDirection;
    return;
  }

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
      ["Koji", "Randy"]
    );
  } else {
    const fallbackOptions = {
      train: [
        "Track hums underfoot—\nGhosts ride softer than we do.\nStill, we call them late.",
        "Lantern sways gently—\nLike my thoughts at platform's edge.\nWhere do memories go?",
        "Ticket in my hand—\nDestination long unknown.\nBut I board anyway.",
        "Dust on every step—\nEven wind forgets this place.\nBut not me. Not yet.",
      ],
    };
    const voiceOptions = {
      train: ["koji_extra1", "koji_extra2", "koji_extra3", "koji_extra4"],
    };

    const linesArray = fallbackOptions[scene] || fallbackOptions.train;
    const voiceArray = voiceOptions[scene] || voiceOptions.train;
    const randIndex = Math.floor(Math.random() * linesArray.length);

    await dialogue(
      k,
      k.vec2(0, 0),
      [linesArray[randIndex]],
      false,
      [portraitKey],
      [voiceArray[randIndex]],
      ["Koji"]
    );
  }

  if (shouldGiveHeart && playerState.getCurrentMaxHealth() < playerState.getTrueMaxHealth()) {
    playerState.setCurrentMaxHealth(playerState.getCurrentMaxHealth() + 1);
    playerState.setHealth(playerState.getCurrentMaxHealth());
    k.destroyAll("healthContainer");
    heartBarInstance.giveHeartToNPC("koji");
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

export async function startInteraction(k, koji, player, heartBarInstance) {
  await handleSharedDialogue(k, koji, player, "koji", kojiLines, "kojiPortrait", heartBarInstance);
}

export function endInteraction(koji) {
  playAnimIfNotPlaying(koji, "koji-down");
}

export function attachKojiToScene(k, parent, pos) {
  const kojiComponents = generateKojiComponents(k, pos);
  const koji = parent.add([...kojiComponents]);
  koji.lastAnim = "down";
  addWanderBehavior(k, koji);
  return koji;
}
