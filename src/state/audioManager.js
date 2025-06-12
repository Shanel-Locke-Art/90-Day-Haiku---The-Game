let currentMusic = null;
const soundEffects = {}; // Object to hold loaded sound effects

export const audioManager = {
  // Play background music
  playMusic(k, name, options = {}) {
    // Stop existing music if playing
    if (currentMusic && currentMusic.stop) {
      currentMusic.stop();
      currentMusic = null;
    }

    try {
      currentMusic = k.play(name, {
        loop: true,
        volume: options.volume ?? 0.2, // Use provided volume or default to 0.2
      });
    } catch (err) {
      console.error(`❌ Failed to play music: "${name}"`, err);
    }

    return currentMusic;
  },

  // Stop the current background music
  stopMusic() {
    if (currentMusic && currentMusic.stop) {
      currentMusic.stop();
      currentMusic = null;
    }
  },

  // Load a sound effect
  loadSound(k, name, filePath) {
    soundEffects[name] = k.load(filePath); // Load sound effect into memory
  },

  // Play a sound effect
  playSound(k, name, options = {}) {
    if (soundEffects[name]) {
      soundEffects[name].play({
        volume: options.volume ?? 0.4, // Default to 0.4 if no volume is provided
      });
    } else {
      console.warn(`❌ Sound effect "${name}" not loaded.`);
    }
  },

  // Stop a specific sound effect
  stopSound(name) {
    if (soundEffects[name] && soundEffects[name].stop) {
      soundEffects[name].stop();
    } else {
      console.warn(`❌ No sound effect found to stop for "${name}".`);
    }
  },
};
