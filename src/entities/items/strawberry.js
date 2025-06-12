import { playerState } from "../../state/stateManagers.js";
import { dialogue } from "../../uiComponents/dialogue.js";

const pickupLine = [
  "Red with gentle seeds—\nTurtles march for sweet delight.\nJoy snug in your palm."
];

export function generateStrawberryComponents(k, pos) {
  return [
    k.sprite("assets", { anim: "strawberry" }),
    k.area({ shape: new k.Rect(k.vec2(-4, -4), 20, 20) }),
    k.body({ isStatic: true }),
    k.pos(pos),
    k.z(1),
    "item",
    { itemName: "strawberry" },
  ];
}

export async function startStrawberryInteraction(k, strawberryObj, interactPrompt) {
  const header = "Fresh Strawberries";

  await dialogue(
    k,
    k.vec2(0, 0),
    pickupLine,
    true,
    null,
    [],
    null,
    header
  );

  // ✅ Set state AFTER dialogue, before destroying item
  playerState.setHasStrawberries(true);

  interactPrompt.hide();
  k.destroy(strawberryObj);
}
