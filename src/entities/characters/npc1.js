import { playerState, npcState, gameState } from "../../state/stateManagers.js";
import { dialogue, onDialogueComplete } from "../../uiComponents/dialogue.js";
import { playAnimIfNotPlaying } from "../../utils.js";
import { healthBar } from "../../uiComponents/healthbar.js";
import { addWanderBehavior } from "../wanderAI.js";

export function generateNpc1Components(k, pos) {
  return [
    k.sprite("assets", { anim: "npc1-down" }),
    k.pos(pos),
    k.body({ isStatic: false }),
    k.area({ shape: new k.Rect(k.vec2(), 20, 20) }),
    k.z(1),
    "npc1",
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
    playAnimIfNotPlaying(npc, "npc1-side");
  } else {
    if (dy < 0) {
      playAnimIfNotPlaying(npc, "npc1-up");
    } else {
      playAnimIfNotPlaying(npc, "npc1-down");
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
    "I once saw a bird\nwearing a hat made of leaves.\nOr maybe it dreamed.",
    "Rain falls on the roof.\nSometimes I forget my name.\nStill, I answer it.",
    "I guard this corner—\nFrom what, no one really knows.\nStill, I do my job."
  ];

  const fallbackVoices = ["npc1_extra1", "npc1_extra2", "npc1_extra3"];
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

  npcState.setNbTalked("npc1", npcState.getNbTalked("npc1") + 1);
  player.direction = originalDirection;

  onDialogueComplete(() => {
    entity.isTalking = false;
    entity.pauseWander = false;
    entity.trigger("dialogue-ended");
  });
}

export async function startInteraction(k, npc1, player) {
  await handleFallbackDialogue(k, npc1, player, "npc1Portrait");
}

export function endInteraction(npc1) {
  playAnimIfNotPlaying(npc1, "npc1-down");
}

export function attachNpc1ToScene(k, parent, pos) {
  const npc1Components = generateNpc1Components(k, pos);
  const npc1 = parent.add([...npc1Components]);
  npc1.lastAnim = "down";
  addWanderBehavior(k, npc1);
  return npc1;
}
