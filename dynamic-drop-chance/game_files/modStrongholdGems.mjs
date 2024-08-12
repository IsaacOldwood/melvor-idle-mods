export function updateStrongholdGem(stronghold, completionOnly) {
  if (!stronghold.dropsLoot) {
    return false;
  }

  let gem = stronghold.tiers.Superior.rewards;
  let item = gem.items[0].item;
  let itemFindCount = game.stats.itemFindCount(item);
  // If the gem has been found and user setting is for first time only then don't modify
  if (completionOnly && itemFindCount > 0) {
    // Reset chance
    gem.chance = gem.origChance;
    return;
  }

  // Chance is % as int
  let chanceAsDecimal = gem.origChance / 100;
  let completionCount = stronghold.timesCompleted;
  // eg origChance = 1, decimal = 0.01, completionCount = 99
  // multiplier = floor(99 * 0.01) = floor(0.99) = 0
  let gemMultiplier = Math.max(Math.floor(completionCount * chanceAsDecimal), 1);
  // Chance = 1 * (1 + 0) = 1
  gem.chance = Math.floor(gem.origChance * (1 + gemMultiplier));
}
