// File: src/scenes/bath.js

import {
  endInteraction as endOldmanInteraction,
  generateOldManComponents,
  startInteraction as startOldmanInteraction,
} from "../entities/characters/oldman.js";

import {
  generateSignBathComponents,
  startSignInteraction as startSignBathInteraction,
} from "../entities/items/signBath.js";

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
import { addWanderBehavior } from "../entities/wanderAI.js";

let nearbyItem = null;

export default async function bath(k) {
  gameState.setCurrentScene("bath");
  audioManager.playMusic(k, "bathMusic");

  colorizeBackground(k, 210, 240, 255);

  const mapData = await fetchMapData("./assets/maps/bath.json");
  const map = k.add([k.pos(0, 0)]);
  const interactPrompt = createInteractPrompt(k);
  const heartBarInstance = healthBar(k);
  enableEscapeToCredits(k);

  const entities = {
    player: null,
    oldman: null,
    sign: null,
    bathDoor: null,
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

        if (obj.name === "player") {
          entities.player = map.add(generatePlayerComponents(k, pos));
          k.camPos(pos);
          continue;
        }

        if (obj.name === "oldman" || obj.name === "old-man") {
          entities.oldman = map.add(generateOldManComponents(k, pos));
          addWanderBehavior(k, entities.oldman, {
            speed: 14,
            cooldown: 3.5,
            shouldPause: () => entities.oldman.pauseWander || entities.oldman.isTalking,
          });
          continue;
        }

        if (obj.name === "signbath") {
          entities.sign = map.add(generateSignBathComponents(k, pos));
          entities.sign.itemName = "signbath";
          continue;
        }

        if (obj.name === "bathDoor") {
          entities.bathDoor = map.add([
            k.rect(32, 64),
            k.pos(pos),
            k.area(),
            k.body({ isStatic: true }),
            k.opacity(0),
            "door",
            "bathDoor",
          ]);
          continue;
        }
      }

      continue;
    }

    const zIndex = layerName === "Upmost" ? 999 : 0;
    drawTiles(k, map, layer, mapData.tileheight, mapData.tilewidth, zIndex);
  }

  k.camScale(4);
  setPlayerControls(k, entities.player);

  k.onUpdate(() => {
    const target = entities.player.worldPos();
    const current = k.camPos();
    const newPos = current.lerp(target, 0.1);
    k.camPos(newPos);

    if (nearbyItem) {
      interactPrompt.setPosition(nearbyItem.worldPos());
    }
  });

  entities.player.onCollide("door-exit", () => {
    gameState.setPreviousScene("bath");
    audioManager.stopMusic();
    k.go("world");
  });

  entities.player.onCollide("oldman", async () => {
    if (entities.oldman && !entities.oldman.isTalking) {
      await startOldmanInteraction(k, entities.oldman, entities.player, heartBarInstance);
    }
  });

  entities.player.onCollideEnd("oldman", () => {
    endOldmanInteraction(entities.oldman);
  });

  entities.player.onCollide("item", (obj) => {
    if (!obj || !obj.itemName) return;
    nearbyItem = obj;
    interactPrompt.show();
  });

  entities.player.onCollideEnd("item", () => {
    nearbyItem = null;
    interactPrompt.hide();
  });

  k.onKeyPress("e", async () => {
    if (!nearbyItem) return;

    if (nearbyItem.itemName === "signbath") {
      await startSignBathInteraction(k);
    }
  });

  watchPlayerHealth(k);
}
