export default function globalStateManager() {
  let instance = null;

  function createInstance() {
    // Initialize state variables
    let previousScene = null;
    let currentScene = null;
    let freezePlayer = false;
    let locale = "english";
    let fontSize = 25;
    let isGhostDefeated = false;
    let isSonSaved = false;
    let chosenEnding = null; 
    let hasKey = false;
    let hasSword = false;
    let flags = {};

    return {
      // Previous scene management
      setPreviousScene(sceneName) {
        previousScene = sceneName;
      },
      getPreviousScene() {
        return previousScene;
      },

      // Current scene management
      setCurrentScene(sceneName) {
        currentScene = sceneName;
      },
      getCurrentScene() {
        return currentScene;
      },

      // Freeze player state
      setFreezePlayer(value) {
        freezePlayer = value;
      },
      getFreezePlayer() {
        return freezePlayer;
      },

      // Locale
      setLocale(language) {
        locale = language;
      },
      getLocale() {
        return locale;
      },

      // Font size
      setFontSize(size) {
        fontSize = size;
      },
      getFontSize() {
        return fontSize;
      },

      // Ghost defeat status
      setIsGhostDefeated(value) {
        isGhostDefeated = value;
      },
      getIsGhostDefeated() {
        return isGhostDefeated;
      },

      // Son saved status
      setIsSonSaved(value) {
        isSonSaved = value;
      },
      getIsSonSaved() {
        return isSonSaved;
      },

      // ✅ Chosen Ending setter/getter
      setChosenEnding(value) {
        chosenEnding = value;
      },
      getChosenEnding() {
        return chosenEnding;
      },
      
      setHasKey(value) {
        hasKey = value;
      },
      getHasKey() {
        return hasKey;
      },

      setHasSword(value) {
        hasSword = value;
      },
      getHasSword() {
        return hasSword;
      },

      setFlag(key, value) {
        flags[key] = value;
      },
      getFlag(key) {
        return flags[key] || false;
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
