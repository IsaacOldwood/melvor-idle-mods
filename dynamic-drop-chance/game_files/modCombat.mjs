export function updateCombatDropChances(
  monster,
  lootChanceMultiplier,
  multiplierThreshold,
  maxUserKillCountMultiplier,
  completionOnly,
  customMultiplier
) {
  if (!monster) {
    return;
  }
  let lootTable = monster.lootTable;
  if (!lootTable) {
    return;
  }

  // Set new loot chance
  let lootChance = Math.min(monster.origLootChance * lootChanceMultiplier, 100);
  monster.lootChance = lootChance;

  // Convert original loot chance to decimal for use in calcs
  let lootChanceDecimal = monster.origLootChance / 100;

  // Get kill count for monster
  let killCount = game.stats.monsterKillCount(monster);

  // Save original data for reverting
  let totalWeight = lootTable.origTotalWeight;
  let newTotalWeight = 0;

  for (const drop of lootTable.drops) {
    let item = drop.item;
    let dropWeight = drop.origWeight;
    let dropChance = (dropWeight / totalWeight) * lootChanceDecimal;

    // If drop chance is higher than threshold then don't modify
    if (dropChance > multiplierThreshold) {
      // Reset weight
      drop.weight = dropWeight;
      newTotalWeight += dropWeight;
      continue;
    }

    let itemFindCount = game.stats.itemFindCount(item);
    // If the item has been found and user setting is for first time only then don't modify
    if (completionOnly && itemFindCount > 0) {
      // Reset weight
      drop.weight = dropWeight;
      newTotalWeight += dropWeight;
      continue;
    }

    // Stop 0 kill count causing divide by inf
    let killCountMultiplier = Math.max(Math.ceil(killCount * dropChance), 1);
    // Calculate new weight
    let newWeight = dropWeight * Math.min(killCountMultiplier, maxUserKillCountMultiplier) * customMultiplier;

    // Update weight and total weight accordingly
    drop.weight = Math.floor(newWeight);
    newTotalWeight += Math.floor(newWeight);
  }
  // Set new total weight
  lootTable.totalWeight = newTotalWeight;
}
