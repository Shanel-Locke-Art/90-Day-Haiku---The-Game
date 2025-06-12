import { playerState, npcState, gameState } from "../../state/stateManagers.js";
import { dialogue, onDialogueComplete } from "../../uiComponents/dialogue.js";
import { playAnimIfNotPlaying } from "../../utils.js";
import { mariLines } from "../../dialogue/characters/mariDialogue.js";
import { healthBar } from "../../uiComponents/healthbar.js";

export function generateMariComponents(k, pos) {
  return [
    k.sprite("assets", { anim: "mari-down" }),
    k.area({ shape: new k.Rect(k.vec2(), 15, 15) }),
    k.body({ isStatic: true }),
    k.pos(pos),
    "mari",
  ];
}

function facePlayerToNPC(npc, player) {
  const dx = player.pos.x - npc.pos.x;
  const dy = player.pos.y - npc.pos.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    npc.flipX = dx < 0;
    playAnimIfNotPlaying(npc, "mari-side");
  } else {
    if (dy < 0) {
      playAnimIfNotPlaying(npc, "mari-up");
    } else {
      playAnimIfNotPlaying(npc, "mari-down");
    }
  }
}

async function handleSharedDialogue(k, entity, player, npcKey, linesData, portraitKey, heartBarInstance) {
  const originalDirection = player.direction;
  player.direction = "down";
  entity.isTalking = true;

  facePlayerToNPC(entity, player);

  const scene = gameState.getCurrentScene();
  const gaveManga = playerState.getHasGivenMangaToMari?.();
  const hasManga = playerState.getHasManga?.();

  if (hasManga && !gaveManga) {
    await dialogue(
      k,
      k.vec2(0, 0),
      ["Pages steamed my lens—\nI came for swords, stayed for abs.\nPlot? Who even cares?"],
      false,
      [portraitKey],
      ["mari_manga"],
      ["Mari"]
    );

    playerState.setHasGivenMangaToMari(true);
    playerState.setHasManga(false);

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
    fallbackRandyVoices = []
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
      ["Mari", "Randy"]
    );
  } else {
    const fallbackOptions = {
      manga: [
        "Late night manga binge—\nMy charger sighs in protest.\nStill, one more chapter...",
        "Battery at five—\nJust like my social meter.\nBoth will soon shut down.",
        "I post, then I scroll—\nLooking for a sign or meme.\nMostly just thirst traps."
      ]
    };
    const voiceOptions = {
      manga: ["mari_extra1", "mari_extra2", "mari_extra3"]
    };

    const linesArray = fallbackOptions[scene] || fallbackOptions.manga;
    const voiceArray = voiceOptions[scene] || voiceOptions.manga;
    const randIndex = Math.floor(Math.random() * linesArray.length);

    await dialogue(
      k,
      k.vec2(0, 0),
      [linesArray[randIndex]],
      false,
      [portraitKey],
      [voiceArray[randIndex]],
      ["Mari"]
    );
  }

  if (shouldGiveHeart && playerState.getCurrentMaxHealth() < playerState.getTrueMaxHealth()) {
    playerState.setCurrentMaxHealth(playerState.getCurrentMaxHealth() + 1);
    playerState.setHealth(playerState.getCurrentMaxHealth());
    k.destroyAll("healthContainer");
    heartBarInstance.giveHeartToNPC("mari");
    heartBarInstance.update();
    npcState.setHasGivenHeart(npcKey, true);
  }

  npcState.setNbTalked(npcKey, nbTalked + 1);
  player.direction = originalDirection;

  onDialogueComplete(() => {
    entity.isTalking = false;
    entity.trigger("dialogue-ended");
  });
}

export async function startInteraction(k, mari, player, heartBarInstance) {
  await handleSharedDialogue(k, mari, player, "mari", mariLines, "mariPortrait", heartBarInstance);
}

export function endInteraction(mari) {
  playAnimIfNotPlaying(mari, "mari-down");
}
