// File: src/scenes/teahouse.js

import {
  endInteraction as endYukiInteraction,
  generateYukiComponents,
  startInteraction as startYukiInteraction,
} from "../entities/characters/yuki.js";

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

export default async function teahouse(k) {
  gameState.setCurrentScene("teahouse");
  audioManager.playMusic(k, "teashopMusic");

  colorizeBackground(k, 27, 29, 52);

  const mapData = await fetchMapData("./assets/maps/teahouse.json");
  const map = k.add([k.pos(530, 222)]);
  const interactPrompt = createInteractPrompt(k);
  const heartBarInstance = healthBar(k);
  enableEscapeToCredits(k);

  const entities = {
    player: null,
    yuki: null,
  };

  for (const layer of mapData.layers) {
    const layerName = layer.name;

    if (layerName === "Boundaries") {
      drawBoundaries(k, map, layer);
      continue;
    }

    if (layer.name === "SpawnPoints") {
      for (const obj of layer.objects) {
        const pos = k.vec2(obj.x, obj.y);

        if (obj.name === "player") {
          entities.player = map.add(generatePlayerComponents(k, pos));
          k.camPos(pos);
          console.log("🧍 Player spawned at", pos);

          k.onLoad(() => {
            k.play("chime-bell", { volume: 0.4 });
          });
          continue;
        }

        if (obj.name === "yuki") {
          entities.yuki = map.add(generateYukiComponents(k, pos));
          continue;
        }
      }

      continue;
    }

    const zIndex = layerName === "Upmost" ? 999 : 0;
    drawTiles(
      k,
      map,
      layer,
      mapData.tileheight,
      mapData.tilewidth,
      zIndex
    );
  }

  k.camScale(3.6);
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

  // 🚪 Exit to world
  entities.player.onCollide("door-exit", () => {
    gameState.setPreviousScene("teahouse");
    audioManager.stopMusic();
    k.go("world");
  });

  // 🗨️ Yuki interaction
  let isTalkingToYuki = false;
  entities.player.onCollide("yuki", async () => {
    if (isTalkingToYuki || !entities.yuki || entities.yuki.isTalking) return;
    isTalkingToYuki = true;
    await startYukiInteraction(k, entities.yuki, entities.player, heartBarInstance);
    isTalkingToYuki = false;
  });

  entities.player.onCollideEnd("yuki", () => {
    endYukiInteraction(entities.yuki);
  });

  // 🧠 Item interaction prompt support
  entities.player.onCollide("item", (obj) => {
    if (!obj?.itemName) return;
    nearbyItem = obj;
    interactPrompt.show();
  });

  entities.player.onCollideEnd("item", () => {
    nearbyItem = null;
    interactPrompt.hide();
  });

  k.onKeyPress("e", async () => {
    if (!nearbyItem) return;
  });

  watchPlayerHealth(k);
}
