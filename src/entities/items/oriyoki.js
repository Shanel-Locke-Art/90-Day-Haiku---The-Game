import { dialogue } from "../../uiComponents/dialogue.js";
import { playerState } from "../../state/stateManagers.js";

const oriyokoHaiku = [
  "Bowls stacked with quiet—\nEach grain earned with mindful hands.\nOld monks still recall.",
];

export function generateOriyokiComponents(k, pos) {
  return [
    k.sprite("assets", {
      anim: "oriyoki",
    }),
    k.area({ shape: new k.Rect(k.vec2(0, 0), 20, 25) }),
    k.body({ isStatic: true }),
    k.pos(pos),
    k.z(1),
    k.scale(1),
    "item",
    { itemName: "oriyoki" },
  ];
}

export async function startOriyokiInteraction(k, itemObj, interactPrompt) {
  const header = "Oriyoki Set";

  await dialogue(
    k,
    k.vec2(0, 0),
    oriyokoHaiku,
    true,
    null,
    [],
    null,
    header
  );

  k.play("soundUI", { volume: 0.4 });

  playerState.setHasOriyoki?.(true); // Set player flag to true
  interactPrompt.hide();
  k.destroy(itemObj);
}
