import { gameState, npcState } from "../state/stateManagers.js";
import { playAnimIfNotPlaying } from "../utils.js";
import { endingCharacters } from "../content/endingCharacterData.js";
import { audioManager } from "../state/audioManager.js";

export default function endingSelection(k) {
  gameState.setCurrentScene("endingSelection");
  gameState.setFreezePlayer(false);
  audioManager.playMusic(k, "endingMusic");

  const tileSize = 1000;
  const tileCols = Math.ceil(k.width() / tileSize) + 2;
  const tileRows = Math.ceil(k.height() / tileSize) + 2;

  // 💖 Heart tile background
  for (let i = 0; i < tileCols; i++) {
    for (let j = 0; j < tileRows; j++) {
      k.add([
        k.sprite("heart-bg"),
        k.pos(i * tileSize, j * tileSize),
        k.scale(1),
        k.opacity(.65),
        k.z(-10),
        k.fixed(),
      ]);
    }
  }

  k.add([
    k.text("Choose Your Love to Bring Back to the U.S.", { size: 40 }),
    k.pos(k.center().x, 50),
    k.anchor("center"),
    k.color(0, 0, 0),
    k.z(1000),
  ]);

  const characters = endingCharacters;
  const spacingX = 300;
  const spacingY = 300;
  const columns = 4;
  const totalRows = Math.ceil(characters.length / columns);
  const startX = k.center().x - ((columns - 1) * spacingX) / 2;
  const startY = k.center().y - ((totalRows - 1) * spacingY) / 2 + 40;

  const slots = [];

  characters.forEach((char, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const xPos = startX + col * spacingX;
    const yPos = startY + row * spacingY;
    const hasHeart = npcState.getHasGivenHeart(char.key);
    const isRandy = char.key === "player";
    const isActive = hasHeart || isRandy;

    k.add([
      k.sprite("assets", { anim: `${char.key}-idle-down` }),
      k.pos(xPos - 35, yPos - 165),
      k.scale(5),
      k.z(500),
      { npcKey: char.key },
      isActive ? "selectable" : "locked",
      k.opacity(isActive ? 1 : 0.3),
    ]);

    if (hasHeart && !isRandy) {
      k.add([
        k.sprite("full-heart"),
        k.pos(xPos, yPos - 95),
        k.scale(2),
        k.z(501),
      ]);
    }

    k.add([
      k.text(char.name, {
        size: 30,
        width: 180,
        align: "center",
      }),
      k.pos(xPos - 90, yPos - 75),
      k.anchor("topleft"),
      k.color(0, 0, 0),
      k.z(502),
    ]);

    k.add([
      k.text(char.description, {
        size: 16,
        width: 275,
        align: "left",
      }),
      k.pos(xPos - 90, yPos),
      k.anchor("topleft"),
      k.color(0, 0, 0),
      k.z(502),
    ]);

    slots.push({ x: xPos, y: yPos, character: char, active: isActive });
  });

  let selectedIndex = slots.findIndex((s) => s.character.key === "player" || s.active);
  if (selectedIndex === -1) selectedIndex = 0;

  const selector = k.add([
    k.sprite("full-heart"),
    k.pos(slots[selectedIndex].x, slots[selectedIndex].y),
    k.anchor("center"),
    k.z(999),
    k.scale(1.3),
  ]);

  function updateSelector() {
    const currentSlot = slots[selectedIndex];
    selector.pos.x = currentSlot.x;
    selector.pos.y = currentSlot.y - 95;
    selector.opacity = currentSlot.active ? 1 : 0.3;
  }

  updateSelector();

  function chooseCharacter(charKey) {
    gameState.setChosenEnding(charKey);
    audioManager.stopMusic();
    if (charKey === "player") {
      k.go("endingAlone");
    } else {
      k.go(`ending_${charKey}`);
    }
  }

  k.onKeyPress("left", () => {
    let tries = 0;
    do {
      selectedIndex = (selectedIndex - 1 + slots.length) % slots.length;
      tries++;
    } while (!slots[selectedIndex].active && slots[selectedIndex].character.key !== "player" && tries < slots.length);
    updateSelector();
  });

  k.onKeyPress("right", () => {
    let tries = 0;
    do {
      selectedIndex = (selectedIndex + 1) % slots.length;
      tries++;
    } while (!slots[selectedIndex].active && slots[selectedIndex].character.key !== "player" && tries < slots.length);
    updateSelector();
  });

  k.onKeyPress("enter", () => {
    const selected = slots[selectedIndex];
    if (selected && (selected.active || selected.character.key === "player")) {
      chooseCharacter(selected.character.key);
    }
  });

  k.onClick(() => {
    const mouseX = k.mousePos().x;
    const mouseY = k.mousePos().y;
    const clicked = slots.find(
      (s) =>
        (s.active || s.character.key === "player") &&
        Math.abs(s.x - mouseX) < spacingX / 2 &&
        Math.abs(s.y - mouseY) < spacingY / 2
    );
    if (clicked) {
      chooseCharacter(clicked.character.key);
    }
  });

  const prompt = k.add([
    k.text("Use ← → or touch to choose. Press ENTER to confirm.", { size: 30 }),
    k.pos(k.center().x, k.height() - 20),
    k.anchor("center"),
    k.color(0, 0, 0),
    k.z(1000),
  ]);

  let blinkTimer = 0;
  k.onUpdate(() => {
    blinkTimer += k.dt();
    prompt.hidden = Math.floor(blinkTimer * 1) % 2 === 0;
  });
}
