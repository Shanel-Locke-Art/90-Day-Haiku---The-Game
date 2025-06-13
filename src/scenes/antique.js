import {
  endInteraction as endHanaInteraction,
  startInteraction as startHanaInteraction,
  attachHanaToScene,
} from "../entities/characters/hana.js";

import {
  generateSwordComponents,
  startSwordInteraction,
} from "../entities/items/sword.js";

import {
  generateAntiqueDoorComponents,
  startAntiqueDoorInteractions,
} from "../entities/items/antiqueDoor.js";

import {
  generateOriyokiComponents,
  startOriyokiInteraction,
} from "../entities/items/oriyoki.js";

import {
  generatePlayerComponents,
  setPlayerControls,
  watchPlayerHealth,
} from "../entities/characters/player.js";

import { gameState, playerState } from "../state/stateManagers.js";
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

export default async function antique(k) {
  gameState.setCurrentScene("antique");
  audioManager.playMusic(k, "antiqueMusic");

  colorizeBackground(k, 60, 50, 30);

  const mapData = await fetchMapData("./assets/maps/antique.json");
  const map = k.add([k.pos(480, 200)]);
  const interactPrompt = createInteractPrompt(k);
  const heartBarInstance = healthBar(k);
  enableEscapeToCredits(k);

  const entities = {
    player: null,
    hana: null,
    sword: null,
    antiqueDoor: null,
    oriyoki: null,
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

          case "hana": {
            entities.hana = attachHanaToScene(k, map, pos);
            break;
          }

          case "sword": {
            const sword = map.add([...generateSwordComponents(k, pos)]);
            sword.itemName = "sword";
            entities.sword = sword;
            break;
          }

          case "antiqueDoor": {
            const door = map.add(generateAntiqueDoorComponents(k, pos));
            door.itemName = "antiqueDoor";
            entities.antiqueDoor = door;
            break;
          }

          case "oriyoki": {
            const oriyoki = map.add([...generateOriyokiComponents(k, pos)]);
            oriyoki.itemName = "oriyoki";
            entities.oriyoki = oriyoki;
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
    gameState.setPreviousScene("antique");
    audioManager.stopMusic();
    k.go("world");
  });

  let isTalkingToHana = false;
  entities.player.onCollide("hana", async () => {
    if (isTalkingToHana || !entities.hana || entities.hana.isTalking) return;
    isTalkingToHana = true;
    await startHanaInteraction(k, entities.hana, entities.player, heartBarInstance);
    isTalkingToHana = false;
  });

  entities.player.onCollideEnd("hana", () => {
    endHanaInteraction(entities.hana);
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

    if (nearbyItem.itemName === "sword") {
      await startSwordInteraction(k, nearbyItem, interactPrompt);
    }

    if (nearbyItem.itemName === "antiqueDoor") {
      await startAntiqueDoorInteractions(k, nearbyItem);
    }

    if (nearbyItem.itemName === "oriyoki") {
      await startOriyokiInteraction(k, nearbyItem, interactPrompt);
    }
  });

  watchPlayerHealth(k);
}
