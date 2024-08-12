// Setup combat
export function setupMonster(monster) {
  // Save original game data to allow reverting overwrites
  if (!monster.hasOwnProperty("origLootChance")) {
    monster.origLootChance = monster.lootChance;
  }

  let lootTable = monster.lootTable;

  if (!lootTable.hasOwnProperty("origTotalWeight")) {
    lootTable.origTotalWeight = lootTable.totalWeight;
  }

  lootTable.drops.forEach((drop) => {
    if (!drop.hasOwnProperty("origWeight")) {
      drop.origWeight = drop.weight;
    }
  });
}

// Setup pets
export function setupDungeonPet(modPetsService, dungeon) {
  if (!modPetsService.assertDungeonPet(dungeon)) {
    return;
  }

  // Save original game data to allow reverting overwrites
  if (!dungeon.pet.hasOwnProperty("origWeight")) {
    dungeon.pet.origWeight = dungeon.pet.weight;
  }
}

export function setupPetTooltip(pet) {
  // Update tooltip
  try {
    let petCompletionLog = completionLogMenu.pets.get(pet);
    let tooltip = petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1];

    // Save original game data to allow reverting overwrites
    if (!tooltip.hasOwnProperty("origText")) {
      tooltip.origText = petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1].innerHTML;
    }
  } catch (e) {
    console.error("[DDC] Failed to update tooltip for pet: " + pet._name);
  }
}

export function setupDungeonPetTooltip(modPetsService, dungeon) {
  if (!modPetsService.assertDungeonPet(dungeon)) {
    return;
  }
  // Update tooltip
  setupPetTooltip(dungeon.pet.pet);
}

export function setupStrongholdPet(stronghold) {
  if (!stronghold.hasOwnProperty("pet")) {
    return false;
  }

  // Save original game data to allow reverting overwrites
  if (!stronghold.pet.hasOwnProperty("origWeight")) {
    stronghold.pet.origWeight = stronghold.pet.weight;
  }
}

export function setupStrongholdPetTooltip(stronghold) {
  // Update tooltip
  setupPetTooltip(stronghold.pet.pet);
}

export function setupSlayerAreaPet(slayerArea) {
  // Don't run for slayer areas without pets
  if (!slayerArea.hasOwnProperty("pet")) {
    return;
  }

  // Save original game data to allow reverting overwrites
  if (!slayerArea.pet.hasOwnProperty("origWeight")) {
    slayerArea.pet.origWeight = slayerArea.pet.weight;
  }
}

export function setupSlayerAreaPetTooltip(slayerArea) {
  // Don't run for slayer areas without pets
  if (!slayerArea.hasOwnProperty("pet")) {
    return;
  }

  // Update tooltip
  setupPetTooltip(slayerArea.pet.pet);
}

export function setupStrongholdGem(stronghold) {
  if (!stronghold.dropsLoot) {
    return false;
  }

  let gem = stronghold.tiers.Superior.rewards;

  // Save original game data to allow reverting overwrites
  if (!gem.hasOwnProperty("origChance")) {
    gem.origChance = gem.chance;
  }
}