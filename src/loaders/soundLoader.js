// File: src/loaders/soundLoader.js
export default function loadSounds(k) {
  const music = [
    "antique", "credits", "dayinmylife", "gamerblamer", "kawaii",
    "news_chill", "nightfullofstars", "ocean", "retro", "time_alone", "trainstation", "lonelyEndingMusic", "instructions" 
  ];

  const aliases = {
    menuMusic: "ocean",
    worldMusic: "dayinmylife",
    teashopMusic: "gamerblamer",
    hotelMusic: "nightfullofstars",
    bathMusic: "time_alone",
    trainMusic: "trainstation",
    endingMusic: "credits",
    mangaMusic: "kawaii",
    ramenMusic: "retro",
    cstoreMusic: "news_chill",
    antiqueMusic: "antique",
    lonelyEndingMusic: "lonelyEndingMusic",
    instructionsMusic: "instructions",
  };

  const uiSounds = ["door_chime", "pickupCoin", "sliding_door"];

  const voiceAliasMap = {
  oldman: [
      "oldman_world1", "oldman_world2", "oldman_world3", "oldman_world4", "oldman_world5",
      "oldman_bath1", "oldman_bath2", "oldman_bath3",
      "oldman_extra1", "oldman_extra2", "oldman_extra3", "oldman_extra4",
      "oldman_bath_extra1", "oldman_bath_extra2", "oldman_bath_extra3", "oldman_bath_extra4"
    ],
  yuki: [
      "yuki_tea1", "yuki_tea2", "yuki_tea3", "yuki_tea4",
      "yuki_cstore1", "yuki_cstore2", "yuki_cstore3", "yuki_cstore4", "yuki_cstore5",
      "yuki_extra1", "yuki_extra2", "yuki_extra3", "yuki_extra4",
      "yuki_tea_extra1", "yuki_tea_extra2", "yuki_tea_extra3", "yuki_tea_extra4"
    ],
  satoshi: [
      "satoshi_hotel1", "satoshi_hotel2", "satoshi_hotel3",
      "satoshi_extra1", "satoshi_extra2", "satoshi_extra3",
      "satoshi_gift"
    ],
  koji: [
      "koji_train1", "koji_train2", "koji_train3", "koji_train4", "koji_train5", "koji_train6",
      "koji_extra1", "koji_extra2", "koji_extra3", "koji_extra4",
      "koji_oriyoki"
    ],
  mari: [
      "mari_manga1", "mari_manga2", "mari_manga3", "mari_manga4", "mari_manga5",
      "mari_extra1", "mari_extra2", "mari_extra3",
      "mari_manga"
    ],
  naoko: [
      "naoko_ramen1", "naoko_ramen2", "naoko_ramen3", "naoko_ramen4",
      "naoko_extra1", "naoko_extra2", "naoko_sword1",
      "naoko_hint1",
    ],
  hana: [
      "hana_antique1", "hana_antique2", "hana_antique3", "hana_antique4", "hana_antique5", "hana_antique6",
      "hana_extra1", "hana_extra2", "hana_extra3", "hana_extra4"
    ],
  randy: [
      // Yuki's lines
      "randy_tea1", "randy_tea2", "randy_tea3", "randy_tea4",
      "randy_cstore1", "randy_cstore2", "randy_cstore3", "randy_cstore4", "randy_cstore5",
      // Oldman's lines
      "randy_oldman1", "randy_oldman2", "randy_oldman3", "randy_oldman4", "randy_oldman5",
      "randy_oldmanbath1", "randy_oldmanbath2", "randy_oldmanbath3",
      // Hana's lines
      "randy_hana1", "randy_hana2", "randy_hana3", "randy_hana4", "randy_hana5", "randy_hana6",
      // Koji's lines
      "randy_koji1", "randy_koji2", "randy_koji3", "randy_koji4", "randy_koji5", "randy_koji6",
      // Mari's lines
      "randy_mari1", "randy_mari2", "randy_mari3", "randy_mari4", "randy_mari5",
      // Naoko's lines
      "randy_naoko1", "randy_naoko2", "randy_naoko3", "randy_naoko4",
      // Satoshi's lines
      "randy_satoshi1", "randy_satoshi2", "randy_satoshi3",
    ],
  npc1: [
      "npc1_extra1", "npc1_extra2", "npc1_extra3"
    ],
  npc2: [
      "npc2_extra1", "npc2_extra2", "npc2_extra3"
    ],
  npc3: [
      "npc3_extra1", "npc3_extra2", "npc3_extra3"
    ],
  npc4: [
      "npc4_extra1", "npc4_extra2", "npc4_extra3"
    ],
  npc5: [
      "npc5_extra1", "npc5_extra2", "npc5_extra3"
    ],
  };

  for (const name of music) {
    k.loadSound(name, `/assets/sounds/music/${name}.mp3`);
  }

  for (const [alias, target] of Object.entries(aliases)) {
    k.loadSound(alias, `/assets/sounds/music/${target}.mp3`);
  }

  for (const name of uiSounds) {
    k.loadSound(name, `/assets/sounds/uiSounds/${name}.mp3`);
  }

  k.loadSound("soundUI", `/assets/sounds/uiSounds/pickupCoin.mp3`);
  k.loadSound("chime-bell", `/assets/sounds/uiSounds/door_chime.mp3`);
  k.loadSound("door-open", `/assets/sounds/uiSounds/sliding_door.mp3`);
  k.loadSound("sparkle", '/assets/sounds/uiSounds/sparkle.mp3');

  for (const [char, suffixes] of Object.entries(voiceAliasMap)) {
    suffixes.forEach((voiceFileName) => {
      const filePath = `/assets/sounds/voices/${char}/${voiceFileName}.mp3`;
      k.loadSound(voiceFileName, filePath);
      k.loadSound(`${char}_${voiceFileName}`, filePath);
    });
  }
}
