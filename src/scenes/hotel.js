// File: src/scenes/hotel.js

import {
  endInteraction as endSatoshiInteraction,
  generateSatoshiComponents,
  startInteraction as startSatoshiInteraction,
  attachSatoshiToScene,
} from "../entities/characters/satoshi.js";

import {
  generateSignHotelComponents,
  startSignInteraction as startSignHotelInteraction,
} from "../entities/items/signHotel.js";

import {
  generateBedRandyComponents,
  startBedRandyInteraction,
} from "../entities/items/bedRandy.js";

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

export default async function hotel(k) {
  gameState.setCurrentScene("hotel");
  audioManager.playMusic(k, "hotelMusic");

  colorizeBackground(k, 27, 29, 52);

  const mapData = await fetchMapData("./assets/maps/hotel.json");
  const map = k.add([k.pos(480, 200)]);
  const interactPrompt = createInteractPrompt(k);
  const heartBarInstance = healthBar(k);
  enableEscapeToCredits(k);

  const entities = {
    player: null,
    satoshi: null,
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

          case "satoshi": {
            entities.satoshi = attachSatoshiToScene(k, map, pos);
            break;
          }

          case "signhotel": {
            const sign = map.add([...generateSignHotelComponents(k, pos)]);
            sign.itemName = "signhotel";
            break;
          }

          case "bedrandy": {
            const bed = map.add([...generateBedRandyComponents(k, pos)]);
            bed.itemName = "bedrandy";
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

  let isTalkingToSatoshi = false;
  entities.player.onCollide("satoshi", async () => {
    if (isTalkingToSatoshi || !entities.satoshi || entities.satoshi.isTalking) return;
    isTalkingToSatoshi = true;
    await startSatoshiInteraction(k, entities.satoshi, entities.player, heartBarInstance);
    isTalkingToSatoshi = false;
  });

  entities.player.onCollideEnd("satoshi", () => {
    endSatoshiInteraction(entities.satoshi);
  });

  entities.player.onCollide("door-exit", () => {
    gameState.setPreviousScene("hotel");
    audioManager.stopMusic();
    k.go("world");
  });

  k.onKeyPress("e", async () => {
    if (!nearbyItem) return;

    switch (nearbyItem.itemName) {
      case "signhotel":
        await startSignHotelInteraction(k);
        break;
      case "bedrandy":
        await startBedRandyInteraction(k);
        break;
    }
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
