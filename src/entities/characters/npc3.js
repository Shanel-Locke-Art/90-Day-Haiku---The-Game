import { playerState, npcState, gameState } from "../../state/stateManagers.js";
import { dialogue, onDialogueComplete } from "../../uiComponents/dialogue.js";
import { playAnimIfNotPlaying } from "../../utils.js";
import { healthBar } from "../../uiComponents/healthbar.js";
import { addWanderBehavior } from "../wanderAI.js";

export function generateNpc3Components(k, pos) {
  return [
    k.sprite("assets", { anim: "npc3-down" }),
    k.pos(pos),
    k.body({ isStatic: false }),
    k.area({ shape: new k.Rect(k.vec2(), 20, 20) }),
    k.z(1),
    "npc3",
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
    playAnimIfNotPlaying(npc, "npc3-side");
  } else {
    if (dy < 0) {
      playAnimIfNotPlaying(npc, "npc3-up");
    } else {
      playAnimIfNotPlaying(npc, "npc3-down");
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
    "Wind stirs the silence\nEchoes of the unseen past\nWhispers call my name.",
    "Shoes full of gravel\nEvery step reminds me why\nI once walked away.",
    "The lamplight flickers\nShadow puppets on brick walls\nDancing with no tune."
  ];

  const fallbackVoices = ["npc3_extra1", "npc3_extra2", "npc3_extra3"];
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

  npcState.setNbTalked("npc3", npcState.getNbTalked("npc3") + 1);
  player.direction = originalDirection;

  onDialogueComplete(() => {
    entity.isTalking = false;
    entity.pauseWander = false;
    entity.trigger("dialogue-ended");
  });
}

export async function startInteraction(k, npc3, player) {
  await handleFallbackDialogue(k, npc3, player, "npc3Portrait");
}

export function endInteraction(npc3) {
  playAnimIfNotPlaying(npc3, "npc3-down");
}

export function attachNpc3ToScene(k, parent, pos) {
  const npc3Components = generateNpc3Components(k, pos);
  const npc3 = parent.add([...npc3Components]);
  npc3.lastAnim = "down";
  addWanderBehavior(k, npc3);
  return npc3;
}
