import mainMenu from "../scenes/mainMenu.js";
import world from "../scenes/world.js";
import teahouse from "../scenes/teahouse.js";
import hotel from "../scenes/hotel.js";
import bath from "../scenes/bath.js";
import train from "../scenes/train.js";
import endingCredits from "../scenes/endingCredits.js";
import manga from "../scenes/manga.js";
import ramen from "../scenes/ramen.js";
import cstore from "../scenes/cstore.js";
import antique from "../scenes/antique.js";
import endingSelection from "../scenes/endingSelection.js";
import endingAlone from "../scenes/endingAlone.js";
import ending_hana from "../scenes/ending_hana.js";
import ending_naoko from "../scenes/ending_naoko.js";
import ending_oldman from "../scenes/ending_oldman.js";
import ending_yuki from "../scenes/ending_yuki.js";
import ending_satoshi from "../scenes/ending_satoshi.js";
import ending_koji from "../scenes/ending_koji.js";
import ending_mari from "../scenes/ending_mari.js";
import instructions from "../scenes/instructions.js";

const scenes = {
  mainMenu,
  world,
  teahouse,
  hotel,
  bath,
  train,
  endingCredits,
  manga,
  ramen,
  cstore,
  antique,
  endingSelection,
  endingAlone,
  ending_hana,
  ending_naoko,
  ending_oldman,
  ending_yuki,
  ending_satoshi,
  ending_koji,
  ending_mari,
  instructions,
};

export default function loadScenes(k) {
  for (const name in scenes) {
    k.scene(name, () => scenes[name](k));
  }
}


