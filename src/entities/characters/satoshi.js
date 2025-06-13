import { playerState, npcState, gameState } from "../../state/stateManagers.js";
import { dialogue, onDialogueComplete } from "../../uiComponents/dialogue.js";
import { playAnimIfNotPlaying } from "../../utils.js";
import { satoshiLines } from "../../dialogue/characters/satoshiDialogue.js";
import { healthBar } from "../../uiComponents/healthbar.js";
import { addWanderBehavior } from "../wanderAI.js";

export function generateSatoshiComponents(k, pos) {
  return [
    k.sprite("assets", { anim: "satoshi-down" }),
    k.pos(pos),
    k.body({ isStatic: false }),
    k.area({ shape: new k.Rect(k.vec2(), 20, 20) }),
    k.z(1),
    "satoshi",
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
    playAnimIfNotPlaying(npc, "satoshi-side");
  } else {
    if (dy < 0) {
      playAnimIfNotPlaying(npc, "satoshi-up");
    } else {
      playAnimIfNotPlaying(npc, "satoshi-down");
    }
  }
}

async function handleSharedDialogue(k, entity, player, npcKey, linesData, portraitKey, heartBarInstance) {
  if (entity.isTalking) return;
  entity.isTalking = true;
  entity.pauseWander = true;

  const originalDirection = player.direction;
  player.direction = "down";
  facePlayerToNPC(entity, player);

  const scene = gameState.getCurrentScene();
  const gaveStrawberries = playerState.getHasGivenStrawberriesToSatoshi();
  const hasStrawberries = playerState.getHasStrawberries();

  if (hasStrawberries && !gaveStrawberries) {
    await dialogue(
      k,
      k.vec2(0, 0),
      ["You brought me berries?\nMy turtle’s gonna love this.\nBro, take this heart, yo."],
      false,
      [portraitKey],
      ["satoshi_gift"],
      ["Satoshi"]
    );

    playerState.setHasGivenStrawberriesToSatoshi(true);
    playerState.setHasStrawberries(false);

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
  } = currentData;

  let nbTalked = npcState.getNbTalked(npcKey);
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
      ["Satoshi", "Randy"]
    );
    npcState.setNbTalked(npcKey, nbTalked + 1);
  } else {
    const fallback = [
      "Moonlight on my shell—\nTurtle dreams ripple softly.\nI vibe in silence.",
      "Snack crumbs on my floor—\nEach one tells a lazy tale.\nSweep? Maybe later.",
      "Yo, stars check me out—\nI wink back with zero shame.\nUniverse flirts first."
    ];
    const fallbackVoices = ["satoshi_extra1", "satoshi_extra2", "satoshi_extra3"];
    const randIndex = Math.floor(Math.random() * fallback.length);

    await dialogue(
      k,
      k.vec2(0, 0),
      [fallback[randIndex]],
      false,
      [portraitKey],
      [fallbackVoices[randIndex]],
      ["Satoshi"]
    );
  }

  onDialogueComplete(() => {
    entity.isTalking = false;
    entity.pauseWander = false;
    entity.reverseDirection = true;
    entity.trigger("dialogue-ended");
  });

  player.direction = originalDirection;
}

export async function startInteraction(k, satoshi, player, heartBarInstance) {
  await handleSharedDialogue(k, satoshi, player, "satoshi", satoshiLines, "satoshiPortrait", heartBarInstance);
}

export function endInteraction(satoshi) {
  playAnimIfNotPlaying(satoshi, "satoshi-down");
}

export function attachSatoshiToScene(k, parent, pos) {
  const satoshiComponents = generateSatoshiComponents(k, pos);
  const satoshi = parent.add([...satoshiComponents]);
  satoshi.lastAnim = "down";
  addWanderBehavior(k, satoshi);
  return satoshi;
}
