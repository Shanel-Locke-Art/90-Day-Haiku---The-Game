// File: src/entities/characters/npc2.js

import { playerState, npcState, gameState } from "../../state/stateManagers.js";
import { dialogue, onDialogueComplete } from "../../uiComponents/dialogue.js";
import { playAnimIfNotPlaying } from "../../utils.js";
import { healthBar } from "../../uiComponents/healthbar.js";
import { addWanderBehavior } from "../wanderAI.js";

export function generateNpc2Components(k, pos) {
  return [
    k.sprite("assets", { anim: "npc2-down" }),
    k.pos(pos),
    k.body({ isStatic: false }),
    k.area({ shape: new k.Rect(k.vec2(), 20, 20) }),
    k.z(1),
    "npc2",
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
    playAnimIfNotPlaying(npc, "npc2-side");
  } else {
    if (dy < 0) {
      playAnimIfNotPlaying(npc, "npc2-up");
    } else {
      playAnimIfNotPlaying(npc, "npc2-down");
    }
  }
}

async function handleFallbackDialogue(k, entity, player, portraitKey) {
  const originalDirection = player.direction;
  player.direction = "down";
  entity.isTalking = true;
  entity.pauseWander = true;

  facePlayerToNPC(entity, player);

  const fallbackText = [
    "Once I ate a bug.\nIt tasted like old secrets.\nStill, I’d try again.",
    "Moonlight on the fence.\nSometimes I dance with my thoughts.\nThey never step right.",
    "My shoes once spoke French.\nOr maybe it was the wind.\nI should wear sandals."
  ];

  const fallbackVoices = ["npc2_extra1", "npc2_extra2", "npc2_extra3"];
  const randIndex = Math.floor(Math.random() * fallbackText.length);

  await dialogue(
    k,
    k.vec2(0, 0),
    [fallbackText[randIndex]],
    false,
    [portraitKey],
    [fallbackVoices[randIndex]],
    ["Stranger"]
  );

  npcState.setNbTalked("npc2", npcState.getNbTalked("npc2") + 1);
  player.direction = originalDirection;

  onDialogueComplete(() => {
    entity.isTalking = false;
    entity.pauseWander = false;
    entity.trigger("dialogue-ended");
  });
}

export async function startInteraction(k, npc2, player) {
  await handleFallbackDialogue(k, npc2, player, "npc2Portrait");
}

export function endInteraction(npc2) {
  playAnimIfNotPlaying(npc2, "npc2-down");
}

export function attachNpc2ToScene(k, parent, pos) {
  const npc2Components = generateNpc2Components(k, pos);
  const npc2 = parent.add([...npc2Components]);
  npc2.lastAnim = "down";
  addWanderBehavior(k, npc2);
  return npc2;
}
