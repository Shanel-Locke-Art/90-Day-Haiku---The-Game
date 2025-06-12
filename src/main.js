import k from "./kaboomContext.js";
import loadFonts from "./loaders/fontLoader.js";
import loadSounds from "./loaders/soundLoader.js";
import loadSprites from "./loaders/spriteLoader.js";
import loadScenes from "./loaders/sceneLoader.js";

loadFonts(k);
loadSounds(k);
loadSprites(k);
loadScenes(k);

k.go("mainMenu");