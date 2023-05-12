export function setup(ctx) {
  ctx.settings.section("Multipliers").add([
    {
      type: "number",
      name: "max-kill-count-multiplier",
      label: "Max Kill Count Multiplier",
      default: 5,
      min: 1,
    },
  ]);

  const updateDropChances = () => {
    game.monsters.forEach(function (monster) {
      if (!monster) {
        return;
      }
      let lootTable = monster.lootTable;
      let lootChance = monster.lootChance / 100;
      let killCount = game.stats.monsterKillCount(monster);
      if (!lootTable) {
        return;
      }
      let totalWeight = lootTable.totalWeight;
      for (let i = 0; i < lootTable.drops.length; i++) {
        let dropWeight = lootTable.drops[i].weight;
        let dropChance = (dropWeight / totalWeight) * lootChance;

        // 1%
        if (dropChance < 0.01) {
          let maxUserKillCountMultiplier = ctx.settings
            .section("Multipliers")
            .get("max-kill-count-multiplier");
          // Stop 0 kill count causing divide by inf
          let killCountMultiplier = Math.max(
            Math.ceil(killCount * dropChance),
            1
          );
          lootTable.drops[i].weight =
            dropWeight *
            Math.min(killCountMultiplier, maxUserKillCountMultiplier);
        }
      }
    });
  };

  ctx.onInterfaceReady(() => {
    updateDropChances();
  });
}
