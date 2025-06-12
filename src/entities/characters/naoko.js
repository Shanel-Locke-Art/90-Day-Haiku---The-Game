import { playerState, npcState, gameState } from "../../state/stateManagers.js";
import { dialogue, onDialogueComplete } from "../../uiComponents/dialogue.js";
import { playAnimIfNotPlaying } from "../../utils.js";
import { naokoLines } from "../../dialogue/characters/naokoDialogue.js";
import { healthBar } from "../../uiComponents/healthbar.js";
import { addWanderBehavior } from "../wanderAI.js";
import { generateStrawberryComponents } from "../items/strawberry.js";

export function generateNaokoComponents(k, pos) {
  return [
    k.sprite("assets", { anim: "naoko-down" }),
    k.pos(pos),
    k.body({ isStatic: false }),
    k.area({ shape: new k.Rect(k.vec2(2, 4), 12, 12) }),
    k.z(1),
    "naoko",
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
    playAnimIfNotPlaying(npc, "naoko-side");
  } else {
    if (dy < 0) {
      playAnimIfNotPlaying(npc, "naoko-up");
    } else {
      playAnimIfNotPlaying(npc, "naoko-down");
    }
  }
}

const naokoSwordSequence = [
  {
    speaker: "Naoko",
    text: "A blade brought with care—\nits edge holds your quiet strength.\nStrawberries bloom now.",
    voice: "naoko_sword1",
  },
  {
    speaker: "Naoko",
    text: "By the shop’s bright lights—\nI thought I saw something red.\nFruit? Or just a dream?",
    voice: "naoko_hint1",
  },
];

async function handleSharedDialogue(k, entity, player, npcKey, linesData, portraitKey, heartBarInstance) {
  if (entity.isTalking || entity.canTalk === false) return;
  entity.isTalking = true;
  entity.pauseWander = true;
  entity.canTalk = false;

  const originalDirection = player.direction;
  player.direction = "down";
  facePlayerToNPC(entity, player);

  const scene = gameState.getCurrentScene();

  const gaveSword = playerState.getHasGivenSwordToNaoko?.();
  const hasSword = playerState.getHasSword?.();

  if (hasSword && !gaveSword) {
    const lines = naokoSwordSequence.map((entry) => entry.text);
    const voices = naokoSwordSequence.map((entry) => entry.voice);
    const speakers = naokoSwordSequence.map((entry) => entry.speaker);
    const portraits = speakers.map(() => portraitKey);

    await dialogue(
      k,
      k.vec2(0, 0),
      lines,
      false,
      portraits,
      voices,
      speakers
    );

    playerState.setHasGivenSwordToNaoko(true);

    if (!npcState.getHasGivenHeart(npcKey) && playerState.getCurrentMaxHealth() < playerState.getTrueMaxHealth()) {
      playerState.setCurrentMaxHealth(playerState.getCurrentMaxHealth() + 1);
      playerState.setHealth(playerState.getCurrentMaxHealth());
      k.destroyAll("healthContainer");
      if (heartBarInstance?.update) {
        heartBarInstance.giveHeartToNPC(npcKey);
        heartBarInstance.update();
      } else {
        healthBar(k);
      }
      npcState.setHasGivenHeart(npcKey, true);
      k.play("sparkle");
    }

    if (!gameState.getFlag("strawberrySpawned")) {
      gameState.setFlag("strawberrySpawned", true);
      const strawberry = k.add(generateStrawberryComponents(k, k.vec2(200, 180)));
      k.get("world")?.add?.(strawberry);
    }

    onDialogueComplete(() => {
      entity.isTalking = false;
      entity.pauseWander = false;
      setTimeout(() => (entity.canTalk = true), 1500);
      entity.trigger("dialogue-ended");
    });

    setTimeout(() => gameState.setFreezePlayer(false), 1000);
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
      [entry1.speaker, entry2.speaker]
    );
    npcState.setNbTalked(npcKey, nbTalked + 1);
  } else {
    const fallback = [
      "This bowl holds secrets—\nbroth brewed in midnight silence.\nAre you slurping truth?",
      "Ramen steam hides ghosts—\nthey whisper through rising swirls.\nI nod. They return."
    ];
    const fallbackVoices = ["naoko_extra1", "naoko_extra2"];
    const randIndex = Math.floor(Math.random() * fallback.length);

    await dialogue(
      k,
      k.vec2(0, 0),
      [fallback[randIndex]],
      false,
      [portraitKey],
      [fallbackVoices[randIndex]],
      ["Naoko"]
    );
  }

  onDialogueComplete(() => {
    entity.isTalking = false;
    entity.pauseWander = false;
    setTimeout(() => (entity.canTalk = true), 1500);
    entity.trigger("dialogue-ended");
  });

  setTimeout(() => gameState.setFreezePlayer(false), 1000);
  player.direction = originalDirection;
}

export async function startInteraction(k, naoko, player, heartBarInstance) {
  await handleSharedDialogue(k, naoko, player, "naoko", naokoLines, "naokoPortrait", heartBarInstance);
}

export function endInteraction(naoko) {
  playAnimIfNotPlaying(naoko, "naoko-down");
}

export function attachNaokoToScene(k, parent, pos) {
  const naokoComponents = generateNaokoComponents(k, pos);
  const naoko = parent.add([...naokoComponents]);
  naoko.lastAnim = "down";
  addWanderBehavior(k, naoko);
  return naoko;
}