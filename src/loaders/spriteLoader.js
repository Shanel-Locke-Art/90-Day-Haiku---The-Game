export default function loadSprites(k) {
  // 🖼️ Backgrounds & Screens
  k.loadSprite("endingCredits", "/public/assets/images/endcreditbackground.png");
  k.loadSprite("heart-bg", "/public/assets/images/heart-bg.png");
  k.loadSprite("endingAlone", "/public/assets/images/endingAlone.png");
  k.loadSprite("endingYuki", "/public/assets/images/endingYuki.png");
  k.loadSprite("endingSatoshi", "/public/assets/images/endingSatoshi.png");
  k.loadSprite("endingKoji", "/public/assets/images/endingKoji.png");
  k.loadSprite("endingMari", "/public/assets/images/endingMari.png");
  k.loadSprite("endingNaoko", "/public/assets/images/endingNaoko.png");
  k.loadSprite("endingHana", "/public/assets/images/endingHana.png");
  k.loadSprite("endingOldman", "/public/assets/images/endingOldman.png");
  k.loadSprite("instructions", "/public/assets/images/instructions.png");

  // 🧍 Main character & NPCs
  k.loadSprite("assets", "/public/assets/topdownasset.png", {
    sliceX: 39,
    sliceY: 31,
    anims: {
      // 🎮 Player (Randy)
      "player-idle-down": 1014,
      "player-down": { from: 1014, to: 1017, loop: true },
      "player-idle-side": 1053,
      "player-side": { from: 1053, to: 1056, loop: true },
      "player-idle-up": 1092,
      "player-up": { from: 1092, to: 1095, loop: true },

      // 👴 Oldman
      "oldman-idle-down": 1159,
      "oldman-down": { from: 1159, to: 1162, loop: true },
      "oldman-idle-side": 1198,
      "oldman-side": { from: 1198, to: 1201, loop: true },
      "oldman-idle-up": 1202,
      "oldman-up": { from: 1202, to: 1205, loop: true },

      // 🧃 Yuki
      "yuki-down": 1034,
      "yuki-idle-down": 1034,
      "yuki-side": 1073,
      "yuki-up": 1112,

      // 🧠 Satoshi
      "satoshi-idle-down": 1018,
      "satoshi-down": { from: 1018, to: 1021, loop: true },
      "satoshi-idle-side": 1057,
      "satoshi-side": { from: 1057, to: 1060, loop: true },
      "satoshi-idle-up": 1096,
      "satoshi-up": { from: 1096, to: 1099, loop: true },

      // 🚉 Koji
      "koji-idle-down": 1026,
      "koji-down": { from: 1026, to: 1029, loop: true },
      "koji-idle-side": 1065,
      "koji-side": { from: 1065, to: 1068, loop: true },
      "koji-idle-up": 1104,
      "koji-up": { from: 1104, to: 1107, loop: true },

      // 🎀 Mari
      "mari-down": 1030,
      "mari-idle-down": 1030,
      "mari-side": 1069,
      "mari-up": 1110,

      // 📚 Naoko
      "naoko-idle-down": 1022,
      "naoko-down": { from: 1022, to: 1025, loop: true },
      "naoko-idle-side": 1061,
      "naoko-side": { from: 1061, to: 1064, loop: true },
      "naoko-idle-up": 1102,
      "naoko-up": { from: 1100, to: 1103, loop: true },

      // 🌸 Hana
      "hana-idle-down": 1038,
      "hana-down": { from: 1038, to: 1041, loop: true },
      "hana-idle-side": 1077,
      "hana-side": { from: 1077, to: 1080, loop: true },
      "hana-idle-up": 1116,
      "hana-up": { from: 1116, to: 1119, loop: true },

      // NPC 1
      "npc1-idle-down": 1042,
      "npc1-down": { from: 1042, to: 1045, loop: true },
      "npc1-idle-side": 1081,
      "npc1-side": { from: 1081, to: 1084, loop: true },
      "npc1-idle-up": 1120,
      "npc1-up": { from: 1120, to: 1123, loop: true },

      // NPC 2
      "npc2-idle-down": 1155,
      "npc2-down": { from: 1155, to: 1158, loop: true },
      "npc2-idle-side": 1194,
      "npc2-side": { from: 1194, to: 1197, loop: true },
      "npc2-idle-up": 1163,
      "npc2-up": { from: 1163, to: 1166, loop: true },

      // NPC 3
      "npc3-idle-down": 1147,
      "npc3-down": { from: 1147, to: 1150, loop: true },
      "npc3-idle-side": 1186,
      "npc3-side": { from: 1186, to: 1189, loop: true },
      "npc3-idle-up": 1190,
      "npc3-up": { from: 1190, to: 1193, loop: true },

      // NPC 4
      "npc4-down": 1143,
      "npc4-side": 1146,
      "npc4-up": 1145,

      // NPC 5
      "npc5-down": 1182,
      "npc5-side": 1183,

      // 🪧 Signs and Props
      "signhotel": 839,
      "signbath": 837,
      "signtrain": 837,
      "bedrandy": 188,
      "whitevending": 56,
      "orangevending": 54,
      "mangabookshelf": 134,
      "antiqueKey": 38,
      "sword": 75,
      "antiqueDoor": 28,
      "antiqueDoorOpen": 27,
      "strawberry": 125,
      "mangaBook": 49,
      "oriyoki": 93,
    },
  });

  // ❤️ Health Bar Hearts
  k.loadSpriteAtlas("/public/assets/topdownasset.png", {
    "full-heart": { x: 288, y: 16, width: 48, height: 48 },
    "half-heart": { x: 336, y: 16, width: 48, height: 48 },
    "empty-heart": { x: 384, y: 16, width: 48, height: 48 },
  });

  // Sunset Background
  k.loadSprite("sunset", "/public/assets/images/sunset.png",{
  sliceX: 4,
  anims: {
    loop: { from: 0, to: 3, loop: true, speed: 8 }, 
  },
});

}