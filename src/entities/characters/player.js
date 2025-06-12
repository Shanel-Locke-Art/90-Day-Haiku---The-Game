import { gameState, playerState } from "../../state/stateManagers.js";
import { areAnyOfTheseKeysDown, playAnimIfNotPlaying } from "../../utils.js";

export function generatePlayerComponents(k, pos) {
  return [
    k.sprite("assets", {
      anim: "player-idle-down",
    }),
    { origin: "center" },
    k.area({ shape: new k.Rect(k.vec2(3, 4), 10, 12) }),
    k.body(),
    k.pos(pos),
    k.z(100),
    k.opacity(),
    {
      speed: 100,
      attackPower: 1,
      direction: "down",
      isAttacking: false,
      isFrozen: false,
    },
    "player",
  ];
}

export function generateItemComponents(k, pos, name) {
  return [
    k.sprite("assets", { anim: `item-${name}` }),
    k.area({ shape: new k.Rect(k.vec2(-4, -4), 24, 24) }),
    k.body({ isStatic: true }),
    k.pos(pos.x, pos.y + 6),
    k.z(),
    "item",
    { itemName: name },
  ];
}

export function watchPlayerHealth(k) {
  k.onUpdate(() => {
    if (playerState.getHealth() <= 0) {
      playerState.setHealth(playerState.getMaxHealth());
      k.go("world");
    }
  });
}

export function setPlayerControls(k, player) {
  const controlState = { left: false, right: false, up: false, down: false };

  const movePlayer = () => {
    if (gameState.getFreezePlayer()) return;
    const { left, right, up, down } = controlState;

    if (left) {
      player.flipX = true;
      playAnimIfNotPlaying(player, "player-side");
      player.move(-player.speed, 0);
      player.direction = "left";
    } else if (right) {
      player.flipX = false;
      playAnimIfNotPlaying(player, "player-side");
      player.move(player.speed, 0);
      player.direction = "right";
    } else if (up) {
      playAnimIfNotPlaying(player, "player-up");
      player.move(0, -player.speed);
      player.direction = "up";
    } else if (down) {
      playAnimIfNotPlaying(player, "player-down");
      player.move(0, player.speed);
      player.direction = "down";
    } else {
      player.stop();
    }
  };

  k.onUpdate(movePlayer);

  k.onKeyDown((key) => {
    if (gameState.getFreezePlayer()) return;
    if (["left", "a"].includes(key)) controlState.left = true;
    if (["right", "d"].includes(key)) controlState.right = true;
    if (["up", "w"].includes(key)) controlState.up = true;
    if (["down", "s"].includes(key)) controlState.down = true;
  });

  k.onKeyRelease((key) => {
    if (["left", "a"].includes(key)) controlState.left = false;
    if (["right", "d"].includes(key)) controlState.right = false;
    if (["up", "w"].includes(key)) controlState.up = false;
    if (["down", "s"].includes(key)) controlState.down = false;
    player.stop();
  });

  // Touch UI Support
  const makeTouchButton = (label, x, y, onHold, onRelease) => {
    const btn = k.add([
      k.rect(40, 40, { radius: 6 }),
      k.pos(x, y),
      k.color(200, 200, 200),
      k.z(1000),
      k.fixed(),
      k.area(),
      "touch-btn"
    ]);

    btn.add([
      k.text(label, { size: 16 }),
      k.pos(10, 10),
      k.z(1001),
    ]);

    btn.onUpdate(() => {
      const mouse = k.mousePos();
      const pressed = k.isMouseDown("left");
      const withinBounds =
        mouse.x >= x &&
        mouse.x <= x + 40 &&
        mouse.y >= y &&
        mouse.y <= y + 40;

      if (gameState.getFreezePlayer()) {
        onRelease();
        return;
      }

      if (withinBounds && pressed) {
        onHold();
      } else {
        onRelease();
      }
    });
  };

  makeTouchButton("←", 40, k.height() - 90,
    () => controlState.left = true,
    () => controlState.left = false
  );
  makeTouchButton("→", 120, k.height() - 90,
    () => controlState.right = true,
    () => controlState.right = false
  );
  makeTouchButton("↑", 80, k.height() - 130,
    () => controlState.up = true,
    () => controlState.up = false
  );
  makeTouchButton("↓", 80, k.height() - 50,
    () => controlState.down = true,
    () => controlState.down = false
  );

  k.on("attack", () => {
    if (gameState.getFreezePlayer() || !playerState.getIsSwordEquipped()) return;
    player.isAttacking = true;

    if (k.get("swordHitBox").length === 0) {
      const swordHitBoxPosX = {
        left: player.worldPos().x - 2,
        right: player.worldPos().x + 10,
        up: player.worldPos().x + 5,
        down: player.worldPos().x + 2,
      };

      const swordHitBoxPosY = {
        left: player.worldPos().y + 5,
        right: player.worldPos().y + 5,
        up: player.worldPos().y,
        down: player.worldPos().y + 10,
      };

      k.add([
        k.area({ shape: new k.Rect(k.vec2(0), 8, 8) }),
        k.pos(swordHitBoxPosX[player.direction], swordHitBoxPosY[player.direction]),
        "swordHitBox",
      ]);

      k.wait(0.1, () => {
        k.destroyAll("swordHitBox");
        playAnimIfNotPlaying(player, `player-${player.direction}`);
        player.stop();
      });
    }

    playAnimIfNotPlaying(player, `player-attack-${player.direction}`);
  });
}
