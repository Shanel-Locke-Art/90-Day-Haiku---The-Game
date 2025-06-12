import k from "./src/kaboomContext.js";
import loadFonts from "./src/loaders/fontLoader.js";
import loadSounds from "./src/loaders/soundLoader.js";
import loadSprites from "./src/loaders/spriteLoader.js";
import loadScenes from "./src/loaders/sceneLoader.js";

loadFonts(k);
loadSounds(k);
loadSprites(k);
loadScenes(k);

k.go("mainMenu");