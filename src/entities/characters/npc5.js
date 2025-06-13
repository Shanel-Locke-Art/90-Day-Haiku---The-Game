import { playerState, npcState, gameState } from "../../state/stateManagers.js";
import { dialogue, onDialogueComplete } from "../../uiComponents/dialogue.js";
import { playAnimIfNotPlaying } from "../../utils.js";
import { healthBar } from "../../uiComponents/healthbar.js";

export function generateNpc5Components(k, pos) {
  return [
    k.sprite("assets", { anim: "npc5-down" }),
    k.pos(pos),
    k.body({ isStatic: false }),
    k.area({ shape: new k.Rect(k.vec2(), 20, 20) }),
    k.z(1),
    "npc5",
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
    playAnimIfNotPlaying(npc, "npc5-side");
  } else {
    playAnimIfNotPlaying(npc, "npc5-down");
  }
}

async function handleFallbackDialogue(k, entity, player, portraitKey) {
  const originalDirection = player.direction;
  player.direction = "down";
  entity.isTalking = true;
  entity.pauseWander = true;

  facePlayerToNPC(entity, player);

  const fallbackText = [
    "Ink curls on the page—\nWorlds unfold between each line.",
    "Shh... plot twist coming.\nLife imitates manga art.\nSilence is sacred.",
    "I shelve volume ten—\nBut I lived volume eleven.\nSpoilers hurt sometimes."
  ];
  const fallbackVoices = ["npc5_extra1", "npc5_extra2", "npc5_extra3"];
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

  npcState.setNbTalked("npc5", npcState.getNbTalked("npc5") + 1);
  player.direction = originalDirection;

  entity.isTalking = false;
  entity.pauseWander = false;
  entity.trigger("dialogue-ended");
}

export async function startInteraction(k, npc5, player) {
  await handleFallbackDialogue(k, npc5, player, "npc5Portrait");
}

export function endInteraction(npc5) {
  playAnimIfNotPlaying(npc5, "npc5-down");
}

export function attachNpc5ToScene(k, parent, pos) {
  const npc5Components = generateNpc5Components(k, pos);
  const npc5 = parent.add([...npc5Components]);
  npc5.lastAnim = "down";
  return npc5;
}
