import { playerState } from "../../state/stateManagers.js";
import { dialogue } from "../../uiComponents/dialogue.js";

const lockedDoorHaiku = [
  "No key in your hand—\nThe past stays shut, unmoving.\nOld wood guards secrets.",
];

export function generateAntiqueDoorComponents(k, pos) {
  return [
    k.sprite("assets", { anim: "antiqueDoor" }),
    k.area({ shape: new k.Rect(k.vec2(0, 0), 20, 15) }),
    k.body({ isStatic: true }),
    k.pos(pos),
    k.z(1),
    "item",
    { itemName: "antiqueDoor", isOpen: false },
  ];
}

export async function startAntiqueDoorInteractions(k, doorObj) {
  if (doorObj.isOpen) return;

  if (playerState.getHasKey()) {
    k.play("door-open", { volume: 0.8 });

    // Replace sprite animation
    doorObj.use(k.sprite("assets", { anim: "antiqueDoorOpen" }));

    // ✅ Disable collision and remove interaction tag
    doorObj.area.hidden = true;
    doorObj.unuse("item");
    doorObj.unuse("body"); // ✅ Remove body so player can pass through

    doorObj.isOpen = true;
  } else {
    k.play("soundUI");

    await dialogue(
      k,
      k.vec2(0, 0),
      lockedDoorHaiku,
      true,
      null,
      [],
      null,
      "Antique Door"
    );
  }
}
