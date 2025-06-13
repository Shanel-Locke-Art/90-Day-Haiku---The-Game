import { dialogue } from "../../uiComponents/dialogue.js";
import { playerState } from "../../state/stateManagers.js";

const mangaPickupHaiku = [
  "Shirtless samurai—\nplot? Who cares! Their lips just touched.\nI read for the art."
];

export function generateMangaComponents(k, pos) {
  return [
    k.sprite("assets", {
      anim: "mangaBook",
    }),
    k.area({ shape: new k.Rect(k.vec2(0, 0), 20, 25) }),
    k.body({ isStatic: true }),
    k.pos(pos),
    k.z(1),
    k.scale(1),
    "item",
    { itemName: "manga" },
  ];
}

export async function startMangaInteraction(k, mangaObj, interactPrompt) {
  const header = "Special Manga Book";

  await dialogue(
    k,
    k.vec2(0, 0),
    mangaPickupHaiku,
    true,
    null,
    [],
    null,
    header
  );

  k.play("soundUI", { volume: 0.4 });

  // Set state flag to show player has the manga
  playerState.setHasManga(true);

  interactPrompt.hide();
  k.destroy(mangaObj);
}
