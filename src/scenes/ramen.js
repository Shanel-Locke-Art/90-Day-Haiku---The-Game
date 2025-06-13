// File: src/scenes/ramen.js

import {
  endInteraction as endNaokoInteraction,
  generateNaokoComponents,
  startInteraction as startNaokoInteraction,
  attachNaokoToScene,
} from "../entities/characters/naoko.js";

import {
  endInteraction as endNPC4Interaction,
  generateNpc4Components,
  startInteraction as startNPC4Interaction,
} from "../entities/characters/npc4.js";

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

export default async function ramen(k) {
  gameState.setCurrentScene("ramen");
  audioManager.playMusic(k, "ramenMusic");

  colorizeBackground(k, 30, 18, 12);

  const mapData = await fetchMapData("./assets/maps/ramen.json");
  const map = k.add([k.pos(480, 200)]);
  const interactPrompt = createInteractPrompt(k);
  const heartBarInstance = healthBar(k);
  enableEscapeToCredits(k);

  const entities = {
    player: null,
    naoko: null,
    npc4: null,
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
          case "player": {
            entities.player = map.add([...generatePlayerComponents(k, pos)]);
            k.camPos(pos);
            k.onLoad(() => k.play("chime-bell", { volume: 0.4 }));
            break;
          }

          case "naoko": {
            entities.naoko = attachNaokoToScene(k, map, pos);
            break;
          }

          case "npc4": {
            entities.npc4 = map.add(generateNpc4Components(k, pos));
            break;
          }
        }
      }
      continue;
    }

    const zIndex = layerName === "Upmost" ? 999 : 0;
    drawTiles(k, map, layer, mapData.tileheight, mapData.tilewidth, zIndex);
  }

  k.camScale(4);
  setPlayerControls(k, entities.player);

  entities.player.onCollide("item", (obj) => {
    if (!obj?.itemName) return;
    nearbyItem = obj;
    interactPrompt.show();
  });

  entities.player.onCollideEnd("item", () => {
    nearbyItem = null;
    interactPrompt.hide();
  });

  // Naoko interaction
  let isTalkingToNaoko = false;
  entities.player.onCollide("naoko", async () => {
    if (isTalkingToNaoko || !entities.naoko || entities.naoko.isTalking) return;
    isTalkingToNaoko = true;
    await startNaokoInteraction(k, entities.naoko, entities.player, heartBarInstance);
    isTalkingToNaoko = false;
  });

  entities.player.onCollideEnd("naoko", () => {
    endNaokoInteraction(entities.naoko);
  });

  // NPC4 interaction
  let isTalkingToNpc4 = false;
  entities.player.onCollide("npc4", async () => {
    if (isTalkingToNpc4 || !entities.npc4 || entities.npc4.isTalking) return;
    isTalkingToNpc4 = true;
    await startNPC4Interaction(k, entities.npc4, entities.player, heartBarInstance);
    isTalkingToNpc4 = false;
  });

  entities.player.onCollideEnd("npc4", () => {
    endNPC4Interaction(entities.npc4);
  });

  entities.player.onCollide("door-exit", () => {
    gameState.setPreviousScene("ramen");
    audioManager.stopMusic();
    k.go("world");
  });

  k.onKeyPress("e", async () => {
    if (!nearbyItem) return;
  });

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
