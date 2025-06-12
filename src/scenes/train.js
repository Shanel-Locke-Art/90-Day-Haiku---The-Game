// File: src/scenes/train.js

import {
  endInteraction as endKojiInteraction,
  generateKojiComponents,
  startInteraction as startKojiInteraction,
  attachKojiToScene,
} from "../entities/characters/koji.js";

import {
  generateSignTrainComponents,
  startSignInteraction as startSignTrainInteraction,
} from "../entities/items/signTrain.js";

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

import {
  generateAntiqueKeyComponents,
  startAntiqueKeyInteraction,
} from "../entities/items/antiqueKey.js"

import {
  gameState,
  playerState,
} from "../state/stateManagers.js";

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

let isConfirmingExit = false;
let nearbyItem = null;

export default async function train(k) {
  gameState.setCurrentScene("train");
  audioManager.playMusic(k, "trainMusic");
  colorizeBackground(k, 70, 70, 70);

  const mapData = await fetchMapData("./assets/maps/trainstation.json");
  const map = k.add([k.pos(480, 200)]);
  const interactPrompt = createInteractPrompt(k);
  const heartBarInstance = healthBar(k);
  enableEscapeToCredits(k);

  const entities = {
    player: null,
    koji: null,
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
            k.onLoad(() => k.play("door-open", { volume: 0.8 }));
            break;
          }

          case "koji": {
            entities.koji = attachKojiToScene(k, map, pos);
            break;
          }

          case "signtrain": {
            const sign = map.add([...generateSignTrainComponents(k, pos)]);
            sign.itemName = "signtrain";
            sign.z = 1;
            break;
          }

          case "orange-vending": {
            const orange = map.add([...generateOrangeVendingComponents(k, pos)]);
            orange.itemName = "orange-vending";
            orange.z = 1;
            break;
          }

          case "white-vending": {
            const white = map.add([...generateWhiteVendingComponents(k, pos)]);
            white.itemName = "white-vending";
            white.z = 1;
            break;
          }

          case "antiqueKey": {
            const key = map.add([...generateAntiqueKeyComponents(k, pos)]);
            key.itemName = "antiqueKey";
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

  let isTalkingToKoji = false;
  entities.player.onCollide("koji", async () => {
    if (isTalkingToKoji || !entities.koji || entities.koji.isTalking) return;
    isTalkingToKoji = true;
    await startKojiInteraction(k, entities.koji, entities.player, heartBarInstance);
    isTalkingToKoji = false;
  });

  entities.player.onCollideEnd("koji", () => {
    endKojiInteraction(entities.koji);
  });

  entities.player.onCollide("door-exit", () => {
    gameState.setPreviousScene("train");
    audioManager.stopMusic();
    k.go("world");
  });

  entities.player.onCollide("end", () => {
    if (isConfirmingExit) return;
    isConfirmingExit = true;

    const centerX = k.center().x;
    const centerY = k.center().y;
    const boxWidth = 300;
    const boxHeight = 130;

    k.add([
      k.rect(boxWidth, boxHeight, { radius: 12 }),
      k.color(255, 255, 255),
      k.pos(centerX - boxWidth / 2, centerY - boxHeight / 2),
      k.z(2000),
      k.opacity(0.95),
      "confirmExitBox",
      k.fixed(),
    ]);

    k.add([
      k.text("Would you like to go home\nand end the game?\n\nY = Yes     N = No", {
        size: 18,
        align: "center",
        width: boxWidth - 20,
      }),
      k.color(0, 0, 0),
      k.pos(centerX, centerY),
      k.anchor("center"),
      k.z(2001),
      "confirmExitText",
      k.fixed(),
    ]);

    const cleanupPrompt = () => {
      k.destroyAll("confirmExitBox");
      k.destroyAll("confirmExitText");
      isConfirmingExit = false;
    };

    k.onKeyPress("y", () => {
      if (!isConfirmingExit) return;
      cleanupPrompt();
      audioManager.stopMusic();
      k.go("endingCredits");
    });

    k.onKeyPress("n", () => {
      if (!isConfirmingExit) return;
      cleanupPrompt();
    });
  });

  k.onKeyPress("e", async () => {
    if (!nearbyItem) return;

    switch (nearbyItem.itemName) {
      case "signtrain":
        await startSignTrainInteraction(k);
        break;
      case "orange-vending":
        await startOrangeVendingInteraction(k);
        break;
      case "white-vending":
        await startWhiteVendingInteraction(k);
        break;
      case "antiqueKey":
        await startAntiqueKeyInteraction(k, nearbyItem, interactPrompt);
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
