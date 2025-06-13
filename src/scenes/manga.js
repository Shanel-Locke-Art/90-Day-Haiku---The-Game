import {
  endInteraction as endMariInteraction,
  generateMariComponents,
  startInteraction as startMariInteraction,
} from "../entities/characters/mari.js";

import {
  endInteraction as endNpc5Interaction,
  generateNpc5Components,
  startInteraction as startNpc5Interaction,
  attachNpc5ToScene,
} from "../entities/characters/npc5.js";

import {
  generateBooksComponents,
  startBooksInteraction,
} from "../entities/items/books.js";

import {
  generateMangaComponents,
  startMangaInteraction,
} from "../entities/items/manga.js";

import {
  generatePlayerComponents,
  setPlayerControls,
  watchPlayerHealth,
} from "../entities/characters/player.js";

import { gameState } from "../state/stateManagers.js";
import { healthBar } from "../uiComponents/healthbar.js";
import {
  colorizeBackground,
  drawBoundaries,
  drawTiles,
  fetchMapData,
  enableEscapeToCredits,
} from "../utils.js";

import { audioManager } from "../state/audioManager.js";
import { createInteractPrompt } from "../uiComponents/itemPrompt.js";

let nearbyItem = null;

export default async function manga(k) {
  gameState.setCurrentScene("manga");
  audioManager.playMusic(k, "mangaMusic");

  colorizeBackground(k, 240, 220, 250); // Soft pastel tone for manga café

  const mapData = await fetchMapData("/assets/maps/manga.json");
  const map = k.add([k.pos(480, 200)]);
  const interactPrompt = createInteractPrompt(k);
  const heartBarInstance = healthBar(k);
  enableEscapeToCredits(k);

  const entities = {
    player: null,
    mari: null,
    npc5: null,
  };

  for (const layer of mapData.layers) {
    const layerName = layer.name;

    if (layerName === "Boundaries") {
      drawBoundaries(k, map, layer);
      continue;
    }

    if (layerName === "SpawnPoints") {
      for (const obj of layer.objects) {
        const pos = k.vec2(obj.x, obj.y);

        switch (obj.name) {
          case "player":
            entities.player = map.add([...generatePlayerComponents(k, pos)]);
            k.camPos(pos);
            k.onLoad(() => k.play("chime-bell", { volume: 0.4 }));
            break;

          case "mari":
            entities.mari = map.add(generateMariComponents(k, pos));
            break;

          case "books":
            const books = map.add(generateBooksComponents(k, pos));
            books.itemName = "books";
            break;

          case "npc5":
            entities.npc5 = attachNpc5ToScene(k, map, pos);
            break;
          
          case "manga":
            const mangaItem = map.add(generateMangaComponents(k, pos));
            mangaItem.itemName = "manga";
            break;
        }
      }
      continue;
    }

    const zIndex = layerName === "Upmost" ? 999 : 0;
    drawTiles(k, map, layer, mapData.tileheight, mapData.tilewidth, zIndex);
  }

  k.camScale(4);
  setPlayerControls(k, entities.player);

  // 📦 Item interactions
  entities.player.onCollide("item", (obj) => {
    if (!obj?.itemName) return;
    nearbyItem = obj;
    interactPrompt.show();
  });

  entities.player.onCollideEnd("item", () => {
    nearbyItem = null;
    interactPrompt.hide();
  });

  // 💬 Mari
  let isTalkingToMari = false;
  entities.player.onCollide("mari", async () => {
    if (isTalkingToMari || !entities.mari || entities.mari.isTalking) return;
    isTalkingToMari = true;
    await startMariInteraction(k, entities.mari, entities.player, heartBarInstance);
    isTalkingToMari = false;
  });

  entities.player.onCollideEnd("mari", () => {
    endMariInteraction(entities.mari);
  });

  // 💬 NPC5
  let isTalkingToNpc5 = false;
  entities.player.onCollide("npc5", async () => {
    if (isTalkingToNpc5 || !entities.npc5 || entities.npc5.isTalking) return;
    isTalkingToNpc5 = true;
    await startNpc5Interaction(k, entities.npc5, entities.player, heartBarInstance);
    isTalkingToNpc5 = false;
  });

  entities.player.onCollideEnd("npc5", () => {
    endNpc5Interaction(entities.npc5);
  });

  // 🚪 Exit
  entities.player.onCollide("door-exit", () => {
    gameState.setPreviousScene("manga");
    audioManager.stopMusic();
    k.go("world");
  });

  // 🧠 Interact prompt
    k.onKeyPress("e", async () => {
    if (!nearbyItem) return;
    switch (nearbyItem.itemName) {
      case "books":
        await startBooksInteraction(k);
        break;
      case "manga":
        await startMangaInteraction(k, nearbyItem, interactPrompt);
        break;
    }
  });

  // 🎥 Camera follow
  let cameraTimer = 0;
  k.onUpdate(() => {
    if (!entities.player) return;

    cameraTimer += k.dt();
    if (cameraTimer > 0.016) {
      const target = entities.player.worldPos();
      const current = k.camPos();
      k.camPos(current.lerp(target, 0.2));
      cameraTimer = 0;
    }

    if (nearbyItem) {
      interactPrompt.setPosition(nearbyItem.worldPos());
    }
  });

  watchPlayerHealth(k);
}
