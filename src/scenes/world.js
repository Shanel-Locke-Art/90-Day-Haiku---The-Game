import {
  endInteraction as endOldmanInteraction,
  generateOldManComponents,
  startInteraction as startOldmanInteraction,
} from "../entities/characters/oldman.js";

import {
  endInteraction as endNPC1Interaction,
  generateNpc1Components,
  startInteraction as startNPC1Interaction,
} from "../entities/characters/npc1.js";

import {
  endInteraction as endNPC2Interaction,
  generateNpc2Components,
  startInteraction as startNPC2Interaction,
} from "../entities/characters/npc2.js";

import {
  endInteraction as endNPC3Interaction,
  generateNpc3Components,
  startInteraction as startNPC3Interaction,
} from "../entities/characters/npc3.js";

import {
  generateSignBathComponents,
  startSignInteraction as startSignBathInteraction,
} from "../entities/items/signBath.js";

import {
  generateSignTrainComponents,
  startSignInteraction as startSignTrainInteraction,
} from "../entities/items/signTrain.js";

import {
  generateSignHotelComponents,
  startSignInteraction as startSignHotelInteraction,
} from "../entities/items/signHotel.js";

import {
  generateOrangeVendingComponents,
  startOrangeVendingInteraction,
} from "../entities/items/orangeVending.js";

import {
  generateWhiteVendingComponents,
  startWhiteVendingInteraction,
} from "../entities/items/whiteVending.js";

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

export default async function world(k) {
  gameState.setCurrentScene("world");
  const previousScene = gameState.getPreviousScene();

  audioManager.playMusic(k, "worldMusic");
  colorizeBackground(k, 76, 170, 255);

  const mapData = await fetchMapData("./assets/maps/world.json");
  const map = k.add([k.pos(0, 0)]);
  const interactPrompt = createInteractPrompt(k);
  const heartBarInstance = healthBar(k);
  enableEscapeToCredits(k);

  const entities = {
    player: null,
    oldman: null,
    npc1: null,
    npc2: null,
    npc3: null,
  };

  for (const layer of mapData.layers) {
    const layerName = layer.name;

    if (layerName === "Boundaries") {
      drawBoundaries(k, map, layer);
      continue;
    }

    if (layerName === "SpawnPoints") {
      let playerSpawned = false;

      for (const obj of layer.objects) {
        const pos = k.vec2(obj.x, obj.y);

        if (obj.name === "oldman" || obj.name === "old-man") {
          entities.oldman = map.add(generateOldManComponents(k, pos));
          addWanderBehavior(k, entities.oldman);
          continue;
        }

        if (obj.name === "npc1") {
          entities.npc1 = map.add(generateNpc1Components(k, pos));
          addWanderBehavior(k, entities.npc1);
          continue;
        }

        if (obj.name === "npc2") {
          entities.npc2 = map.add(generateNpc2Components(k, pos));
          addWanderBehavior(k, entities.npc2);
          continue;
        }

        if (obj.name === "npc3") {
          entities.npc3 = map.add(generateNpc3Components(k, pos));
          addWanderBehavior(k, entities.npc3);
          continue;
        }

        if (obj.name === "signbath") {
          const item = map.add(generateSignBathComponents(k, pos));
          item.itemName = "signbath";
          item.z = 1;
        }

        if (obj.name === "signtrain") {
          const item = map.add(generateSignTrainComponents(k, pos));
          item.itemName = "signtrain";
          item.z = 1;
        }

        if (obj.name === "signhotel") {
          const item = map.add(generateSignHotelComponents(k, pos));
          item.itemName = "signhotel";
          item.z = 1;
        }

        if (obj.name === "orange-vending") {
          const item = map.add(generateOrangeVendingComponents(k, pos));
          item.itemName = "orange-vending";
          item.z = 1;
        }

        if (obj.name === "white-vending") {
          const item = map.add(generateWhiteVendingComponents(k, pos));
          item.itemName = "white-vending";
          item.z = 1;
        }

        if (playerSpawned) continue;

        const spawnMatch =
          (obj.name === "player-teahouse" && previousScene === "teahouse") ||
          (obj.name === "player-bath" && previousScene === "bath") ||
          (obj.name === "player-train" && previousScene === "train") ||
          (obj.name === "player-hotel" && previousScene === "hotel") ||
          (obj.name === "player-manga" && previousScene === "manga") ||
          (obj.name === "player-ramen" && previousScene === "ramen") ||
          (obj.name === "player-cstore" && previousScene === "cstore") ||
          (obj.name === "player-antique" && previousScene === "antique") ||
          (obj.name === "player" && (!previousScene || previousScene === "mainMenu"));

        if (spawnMatch) {
          const player = map.add(generatePlayerComponents(k, pos));
          player.z = 2;
          entities.player = player;
          k.camPos(pos);
          playerSpawned = true;
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

  entities.player.onCollide("tea-door-entrance", () => {
    audioManager.stopMusic();
    k.go("teahouse");
  });

  entities.player.onCollide("hotel-door-entrance", () => {
    audioManager.stopMusic();
    k.go("hotel");
  });

  entities.player.onCollide("bath-door-entrance", () => {
    audioManager.stopMusic();
    k.go("bath");
  });

  entities.player.onCollide("train-door-entrance", () => {
    audioManager.stopMusic();
    k.go("train");
  });

  entities.player.onCollide("manga-door-entrance", () => {
    audioManager.stopMusic();
    k.go("manga");
  });

  entities.player.onCollide("ramen-door-entrance", () => {
    audioManager.stopMusic();
    k.go("ramen");
  });

  entities.player.onCollide("cstore-door-entrance", () => {
    audioManager.stopMusic();
    k.go("cstore");
  });

  entities.player.onCollide("antique-door-entrance", () => {
    audioManager.stopMusic();
    k.go("antique");
  });

  entities.player.onCollide("oldman", async () => {
    if (entities.oldman && !entities.oldman.isTalking) {
      await startOldmanInteraction(k, entities.oldman, entities.player, heartBarInstance);
    }
  });

  entities.player.onCollideEnd("oldman", () => {
    if (entities.oldman) endOldmanInteraction(entities.oldman);
  });

  entities.player.onCollide("npc1", async () => {
    if (entities.npc1 && !entities.npc1.isTalking) {
      await startNPC1Interaction(k, entities.npc1, entities.player);
    }
  });

  entities.player.onCollideEnd("npc1", () => {
    if (entities.npc1) endNPC1Interaction(entities.npc1);
  });

  entities.player.onCollide("npc2", async () => {
    if (entities.npc2 && !entities.npc2.isTalking) {
      await startNPC2Interaction(k, entities.npc2, entities.player);
    }
  });

  entities.player.onCollideEnd("npc2", () => {
    if (entities.npc2) endNPC2Interaction(entities.npc2);
  });

  entities.player.onCollide("npc3", async () => {
    if (entities.npc3 && !entities.npc3.isTalking) {
      await startNPC3Interaction(k, entities.npc3, entities.player);
    }
  });

  entities.player.onCollideEnd("npc3", () => {
    if (entities.npc3) endNPC3Interaction(entities.npc3);
  });

  k.onKeyPress("e", async () => {
    if (!nearbyItem) return;

    if (nearbyItem.itemName === "signbath") {
      await startSignBathInteraction(k);
    }

    if (nearbyItem.itemName === "signtrain") {
      await startSignTrainInteraction(k);
    }

    if (nearbyItem.itemName === "signhotel") {
      await startSignHotelInteraction(k);
    }

    if (nearbyItem.itemName === "orange-vending") {
      await startOrangeVendingInteraction(k);
    }

    if (nearbyItem.itemName === "white-vending") {
      await startWhiteVendingInteraction(k);
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
