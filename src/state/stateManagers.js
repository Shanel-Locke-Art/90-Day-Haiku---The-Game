import globalStateManager from "./globalState.js";
import playerGlobalStateManager from "./playerGlobalState.js";
import npcGlobalStateManager from "./npcGlobalStateManager.js";

export const gameState = globalStateManager().getInstance();
export const playerState = playerGlobalStateManager().getInstance();


export const npcState = npcGlobalStateManager().getInstance();



  
  
  
