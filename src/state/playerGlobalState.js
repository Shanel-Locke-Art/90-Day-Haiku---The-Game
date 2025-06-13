export default function playerGlobalStateManager() {
  let instance = null;

  function createInstance() {
    let isSwordEquipped = false;
    const trueMaxHealth = 8;        // Hard cap
    let currentMaxHealth = 1;       // Player's unlockable max
    let health = 1;                 // Starting health
    let hasKey = false;
    let hasSword = false;
    let hasGivenSwordToNaoko = false;
    let hasStrawberries = false;
    let hasGivenStrawberriesToSatoshi = false;
    let hasManga = false;
    let hasGivenMangaToMari = false;
    let hasOriyoki = false;
    let hasGivenOriyokiToKoji = false;

    return {
      setIsSwordEquipped(value) {
        isSwordEquipped = value;
      },
      getIsSwordEquipped: () => isSwordEquipped,

      // NEW
      getTrueMaxHealth: () => trueMaxHealth,

      setCurrentMaxHealth(value) {
        currentMaxHealth = Math.min(value, trueMaxHealth);
        if (health > currentMaxHealth) {
          health = currentMaxHealth;
        }
      },
      getCurrentMaxHealth: () => currentMaxHealth,

      setHealth(value) {
        health = Math.max(0, Math.min(value, currentMaxHealth));
      },
      getHealth: () => health,

      setHasKey(value) {
        hasKey = value;
      },
      getHasKey: () => hasKey,

      setHasSword(value) {
        hasSword = value;
      },
      getHasSword() {
        return hasSword;
      },

      setHasGivenSwordToNaoko(value) {
        hasGivenSwordToNaoko = value;
      },
      getHasGivenSwordToNaoko() {
        return hasGivenSwordToNaoko;
      },

      setHasStrawberries(value) {
        hasStrawberries = value;
      },
      getHasStrawberries() {
        return hasStrawberries;
      },

      setHasGivenStrawberriesToSatoshi(value) {
        hasGivenStrawberriesToSatoshi = value;
      },
      getHasGivenStrawberriesToSatoshi() {
        return hasGivenStrawberriesToSatoshi;
      },

      setHasManga(value) {
        hasManga = value;
      },
      getHasManga() {
        return hasManga;
      },

      setHasGivenMangaToMari(value) {
        hasGivenMangaToMari = value;
      },
      getHasGivenMangaToMari() {
        return hasGivenMangaToMari;
      },

      setHasOriyoki(value) {
        hasOriyoki = value;
      },
      getHasOriyoki() {
        return hasOriyoki;
      },

      setHasGivenOriyokiToKoji(value) {
        hasGivenOriyokiToKoji = value;
      },
      getHasGivenOriyokiToKoji() {
        return hasGivenOriyokiToKoji;
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

