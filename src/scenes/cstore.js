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

import {
  generateStrawberryComponents,
  startStrawberryInteraction
} from "../entities/items/strawberry.js";

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

export default async function cstore(k) {
  gameState.setCurrentScene("cstore");
  audioManager.playMusic(k, "cstoreMusic");

  colorizeBackground(k, 240, 200, 120);

  const mapData = await fetchMapData("/assets/maps/cstore.json");
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

          k.onLoad(() => {
            k.play("chime-bell", { volume: 0.4 });
          });
          continue;
        }

        if (obj.name === "yuki") {
          entities.yuki = map.add(generateYukiComponents(k, pos));
          continue;
        }

        if (obj.name === "strawberrySpawn" && gameState.getFlag("strawberrySpawned")) {
          const strawberry = map.add(generateStrawberryComponents(k, pos));
          strawberry.itemName = "strawberry";
        }
      }
      continue;
    }

    let zIndex = 0;
      if (layerName === "Upmost") zIndex = 999;
      if (layerName === "Register") zIndex = 1050;
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
    k.camPos(current.lerp(target, 0.1));

    if (nearbyItem) {
      interactPrompt.setPosition(nearbyItem.worldPos());
    }
  });

  entities.player.onCollide("door-exit", () => {
    gameState.setPreviousScene("cstore");
    audioManager.stopMusic();
    k.go("world");
  });

  entities.player.onCollide("yuki", async () => {
    if (entities.yuki && !entities.yuki.isTalking) {
      await startYukiInteraction(k, entities.yuki, entities.player, heartBarInstance);
    }
  });

  entities.player.onCollideEnd("yuki", () => {
    endYukiInteraction(entities.yuki);
  });

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

    if (nearbyItem.itemName === "strawberry") {
      await startStrawberryInteraction(k, nearbyItem, interactPrompt);
    }
  });

  watchPlayerHealth(k);
}
