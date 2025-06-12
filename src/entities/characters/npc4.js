import { playerState, npcState, gameState } from "../../state/stateManagers.js";
import { dialogue, onDialogueComplete } from "../../uiComponents/dialogue.js";
import { playAnimIfNotPlaying } from "../../utils.js";
import { healthBar } from "../../uiComponents/healthbar.js";

export function generateNpc4Components(k, pos) {
  return [
    k.sprite("assets", { anim: "npc4-side" }),
    k.pos(pos),
    k.body({ isStatic: false }),
    k.area({ shape: new k.Rect(k.vec2(), 20, 25) }),
    k.z(1),
    "npc4", // ✅ Fixed tag
    "wall",
    "npc",
    "solid",
  ];
}

function facePlayerToNPC(npc, player) {
  const dx = player.pos.x - npc.pos.x;
  const dy = player.pos.y - npc.pos.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    playAnimIfNotPlaying(npc, "npc4-side");
  } else {
    if (dy < 0) {
      playAnimIfNotPlaying(npc, "npc4-up");
    } else {
      playAnimIfNotPlaying(npc, "npc4-down");
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
    "A soft breeze whispers—\nEven chairs long for a walk.",
    "They think I sit still—\nBut thoughts travel far from here.",
    "I watched clouds for years.\nThey always move on. I stayed.\nMaybe that’s the point."
  ];
  const fallbackVoices = ["npc4_extra1", "npc4_extra2", "npc4_extra3"];
  const randIndex = Math.floor(Math.random() * fallbackText.length);

  await dialogue(
    k,
    k.vec2(0, 0),
    [fallbackText[randIndex]],
    false,
    portraitKey,
    [fallbackVoices[randIndex]],
    "Stranger"
  );

  npcState.setNbTalked("npc4", npcState.getNbTalked("npc4") + 1);
  player.direction = originalDirection;

  onDialogueComplete(() => {
    entity.isTalking = false;
    entity.pauseWander = false;
    entity.trigger("dialogue-ended");
  });
}

export async function startInteraction(k, npc4, player) {
  await handleFallbackDialogue(k, npc4, player, "npc4Portrait");
}

export function endInteraction(npc4) {
  playAnimIfNotPlaying(npc4, "npc4-side");
}

export function attachNpc4ToScene(k, parent, pos) {
  const npc4Components = generateNpc4Components(k, pos);
  const npc4 = parent.add([...npc4Components]);
  npc4.lastAnim = "side";
  return npc4;
}
