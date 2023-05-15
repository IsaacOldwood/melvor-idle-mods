export function setup(ctx) {
  ctx.settings.section("General").add([
    {
      type: "switch",
      name: "completion-only",
      label: "Apply multiplier to first drop only",
      default: true,
    },
  ]);

  ctx.settings.section("General").add([
    {
      type: "number",
      name: "multiplier-threshold",
      label: "Apply multiplier to drops with lower drop chance than:",
      default: 0.01,
    },
  ]);

  ctx.settings.section("Multipliers").add([
    {
      type: "number",
      name: "max-kill-count-multiplier",
      label: "Max Kill Count Multiplier",
      default: 5,
      min: 1,
    },
  ]);

  function updateCombatDropChances(monster) {
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
      let drop = lootTable.drops[i];
      let item = drop.item;
      let dropWeight = drop.weight;
      let dropChance = (dropWeight / totalWeight) * lootChance;

      // Get user settings
      let multiplierThreshold = ctx.settings
        .section("General")
        .get("multiplier-threshold");

      if (dropChance > multiplierThreshold) {
        continue;
      }

      // Get user settings
      let maxUserKillCountMultiplier = ctx.settings
        .section("Multipliers")
        .get("max-kill-count-multiplier");

      let completionOnly = ctx.settings
        .section("General")
        .get("completion-only");

      let itemFindCount = game.stats.itemFindCount(item);
      // If the item has been found and user setting is for first time only then don't modify
      if (completionOnly && itemFindCount > 0) {
        continue;
      }

      // Stop 0 kill count causing divide by inf
      let killCountMultiplier = Math.max(Math.ceil(killCount * dropChance), 1);
      // Calculate new weight
      let newWeight =
        dropWeight * Math.min(killCountMultiplier, maxUserKillCountMultiplier);

      // Update weight and total weight accordingly
      lootTable.drops[i].weight = newWeight;
      lootTable.totalWeight = lootTable.totalWeight + (newWeight - dropWeight);
    }
  }

  ctx.onCharacterLoaded(() => {
    game.monsters.forEach(updateCombatDropChances);
  });
}
