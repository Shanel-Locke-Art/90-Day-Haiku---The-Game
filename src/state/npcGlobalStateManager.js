export default function npcGlobalStateManager() {
  let instance = null;

  function createInstance() {
    const npcState = {};

    function initNpcState(npcName, initialState = {}) {
      if (!npcState[npcName]) {
        npcState[npcName] = {
          hasSpoken: false,
          repeatIndex: 0,
          nbTalked: 0,
          hasGivenHeart: false,
          talkedScenes: {
            world: 0,
            bath: 0,
          },
          ...initialState,
        };
      }
    }

    return {
      // Initialization
      initNpc(npcName, initialState) {
        initNpcState(npcName, initialState);
      },

      // hasSpoken flag
      setHasSpoken(npcName, value) {
        initNpcState(npcName);
        npcState[npcName].hasSpoken = value;
      },
      getHasSpoken(npcName) {
        initNpcState(npcName);
        return npcState[npcName].hasSpoken;
      },

      // repeatIndex counter
      getRepeatIndex(npcName) {
        initNpcState(npcName);
        return npcState[npcName].repeatIndex;
      },
      incrementRepeatIndex(npcName) {
        initNpcState(npcName);
        npcState[npcName].repeatIndex += 1;
      },
      resetRepeatIndex(npcName) {
        initNpcState(npcName);
        npcState[npcName].repeatIndex = 0;
      },

      // nbTalked
      setNbTalked(npcName, value) {
        initNpcState(npcName);
        npcState[npcName].nbTalked = value;
      },
      getNbTalked(npcName) {
        initNpcState(npcName);
        return npcState[npcName].nbTalked;
      },

      // hasGivenHeart flag
      setHasGivenHeart(npcName, value) {
        initNpcState(npcName);
        npcState[npcName].hasGivenHeart = value;
      },
      getHasGivenHeart(npcName) {
        initNpcState(npcName);
        return npcState[npcName].hasGivenHeart;
      },

      // Per-scene dialogue tracking (by count)
      setSceneTalked(npcName, scene) {
        initNpcState(npcName);
        npcState[npcName].talkedScenes[scene] =
          (npcState[npcName].talkedScenes[scene] || 0) + 1;
      },
      getSceneTalkCount(npcName, scene) {
        initNpcState(npcName);
        return npcState[npcName].talkedScenes[scene] || 0;
      },
      hasTalkedEnoughInScenes(npcName, sceneCounts) {
        initNpcState(npcName);
        return Object.entries(sceneCounts).every(([scene, minCount]) => {
          return (npcState[npcName].talkedScenes[scene] || 0) >= minCount;
        });
      },

      // Utility: check if all NPCs were talked to
      haveTalkedToAll(npcList) {
        return npcList.every((npc) => {
          initNpcState(npc);
          return npcState[npc].hasSpoken;
        });
      },

      // Reset all
      reset() {
        Object.keys(npcState).forEach((npc) => {
          npcState[npc] = {
            hasSpoken: false,
            repeatIndex: 0,
            nbTalked: 0,
            hasGivenHeart: false,
            talkedScenes: {
              world: 0,
              bath: 0,
            },
          };
        });
      },
    };
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
}
