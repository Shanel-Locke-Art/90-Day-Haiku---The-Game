import { dialogue } from "../../uiComponents/dialogue.js";
import { playerState } from "../../state/stateManagers.js";

const antiqueKeyLines = [
  "Randy's pod glows soft—\nMisnamed towns in bold shirts blur,\nDreams flirt, never stay.",
];

export function generateAntiqueKeyComponents(k, pos) {
  return [
    k.sprite("assets", {
      anim: "antiqueKey",
    }),
    k.area({ shape: new k.Rect(k.vec2(0, 0), 20, 25) }),
    k.body({ isStatic: true }),
    k.pos(pos),
    k.z(1), 
    k.scale(1),
    "item",
    { itemName: "antiqueKey" },
  ];
}

export async function startAntiqueKeyInteraction(k, keyObj, interactPrompt) {
  const header = "Antique Key";

  await dialogue(
    k,
    k.vec2(0, 0),
    antiqueKeyLines,
    true,
    null,
    [],
    null,
    header
  );

  k.play("soundUI", { volume: 0.4 }); 
  
  playerState.setHasKey(true);
    interactPrompt.hide();
    k.destroy(keyObj);
  }








