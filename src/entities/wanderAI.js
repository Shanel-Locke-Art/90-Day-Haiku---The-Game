// ✅ wanderAI.js — Koji + Old Man + Satoshi + Naoko movement system
export function addWanderBehavior(k, npc) {
  npc.isTalking = false;
  npc.lastDir = "down";

  let dir = k.vec2(0, 0);
  let moveTime = 0;
  let waitTime = 0;
  let isMoving = false;

  const npcKey = npc.is("oldman")
    ? "oldman"
    : npc.is("satoshi")
    ? "satoshi"
    : npc.is("naoko")
    ? "naoko"
    : npc.is("hana")
    ? "hana"
    : npc.is("npc1")
    ? "npc1"
    : npc.is("npc2")
    ? "npc2"
    : npc.is("npc3")
    ? "npc3"
    : "koji";

  const logName =
    npcKey === "oldman"
      ? "Old Man"
      : npcKey === "satoshi"
      ? "Satoshi"
      : npcKey === "naoko"
      ? "Naoko"
      : npcKey === "hana"
      ? "Hana"
      : npcKey === "npc1"
      ? "npc1"
      : npcKey === "npc2"
      ? "npc2"
      : npcKey === "npc3"
      ? "npc3"
      : "Koji";

  const speed =
    npcKey === "oldman"
      ? 14
      : npcKey === "satoshi"
      ? 22
      : npcKey === "naoko"
      ? 18
      : npcKey === "hana"
      ? 18
      : npcKey === "npc1"
      ? 20
      : npcKey === "npc2"
      ? 21
      : npcKey === "npc3"
      ? 21
      : 20;

  function chooseNewDirection() {
    const directions = [k.vec2(0, -1), k.vec2(0, 1), k.vec2(-1, 0), k.vec2(1, 0)];
    dir = k.choose(directions);
    moveTime = k.rand(1, 2);
    waitTime = 0;
    isMoving = true;
    npc.play(`${npcKey}-down`);
    npc.lastDir = "down";
  }

  function stopMovement() {
    isMoving = false;
    waitTime = k.rand(1, 2);
    npc.stop();
    npc.play(`${npcKey}-idle-${npc.lastDir}`);
  }

  k.onUpdate(() => {
    if (!npc || !npc.exists()) return;

    if (npc.isTalking || npc.pauseWander) {
      npc.stop();
      return;
    }

    if (isMoving && moveTime > 0) {
      const delta = dir.scale(speed * k.dt());
      const newPos = npc.pos.add(delta);

      const hit = k.get("wall").some((wall) => {
        if (!wall.area) return false;
        const area = wall.area.world;
        return area && area.contains(newPos.add(k.vec2(8, 8)));
      });

      if (!hit) {
        npc.pos = newPos;
      } else {
        console.log(`🧱 Blocked: ${logName} can't move.`);
        stopMovement();
        return;
      }

      moveTime -= k.dt();

      if (dir.x !== 0) {
        npc.flipX = dir.x < 0;
        if (npc.curAnim() !== `${npcKey}-side`) npc.play(`${npcKey}-side`);
        npc.lastDir = "side";
      } else if (dir.y < 0) {
        if (npc.curAnim() !== `${npcKey}-up`) npc.play(`${npcKey}-up`);
        npc.lastDir = "up";
      } else {
        if (npc.curAnim() !== `${npcKey}-down`) npc.play(`${npcKey}-down`);
        npc.lastDir = "down";
      }

      if (moveTime <= 0) {
        stopMovement();
      }
    } else {
      waitTime -= k.dt();
      if (waitTime <= 0) {
        chooseNewDirection();
      }
    }
  });

  npc.on("dialogue-ended", () => {
    k.wait(0, () => {
      npc.isTalking = false;
      dir = dir.scale(-1);
      moveTime = k.rand(0.5, 1.2);
      waitTime = 0;
      isMoving = true;
      npc.play(`${npcKey}-${npc.lastDir}`);
      console.log(`🔁 ${logName} resumes moving opposite after dialogue`);
    });
  });

  chooseNewDirection();
}
