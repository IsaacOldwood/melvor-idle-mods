// Run on startup
export function setup(ctx) {
  // After game data is loaded
  ctx.onModsLoaded(async (ctx) => {
    // Setup combat
    game.monsters.forEach((monster) => {
      setupMonster(monster);
    });

    // Setup thieving
    game.thieving.areas.forEach((area) => {
      setupThievingArea(area);
    });
  });

  // Execute code after offline progress has been calculated and all in-game user interface elements have been created.
  ctx.onInterfaceReady(async (ctx) => {
    // Setup dungeon pets
    game.dungeons.forEach((dungeon) => {
      setupDungeonPet(dungeon);
    });

    game.slayerAreas.forEach((slayerArea) => {
      setupSlayerAreaPet(slayerArea);
    });
  });
}

// #########################################################################################
// SETUP
// #########################################################################################

// Setup combat
function setupMonster(monster) {
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
function setupDungeonPet(dungeon) {
  // Don't run for dungeons without pets
  if (!dungeon.hasOwnProperty("pet")) {
    return;
  }

  // Don't run for pets that unlock on fixed number of clears
  if (dungeon.fixedPetClears) {
    return;
  }

  // Don't run for pets that unlock on first completion
  if (dungeon.pet.weight == 1) {
    return;
  }

  // Save original game data to allow reverting overwrites
  if (!dungeon.pet.hasOwnProperty("origWeight")) {
    dungeon.pet.origWeight = dungeon.pet.weight;
  }

  // Update tooltip
  try {
    let petCompletionLog = completionLogMenu.pets.get(dungeon.pet.pet);
    let tooltip = petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1];

    // Save original game data to allow reverting overwrites
    if (!tooltip.hasOwnProperty("origText")) {
      tooltip.origText = petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1].innerHTML;
    }
  } catch (e) {
    console.error("Failed to update tooltip for dungeon pet: " + dungeon._name);
  }
}

function setupSlayerAreaPet(slayerArea) {
  // Don't run for slayer areas without pets
  if (!slayerArea.hasOwnProperty("pet")) {
    return;
  }

  // Save original game data to allow reverting overwrites
  if (!slayerArea.pet.hasOwnProperty("origWeight")) {
    slayerArea.pet.origWeight = slayerArea.pet.weight;
  }

  // Update tooltip
  try {
    let petCompletionLog = completionLogMenu.pets.get(slayerArea.pet.pet);
    let tooltip = petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1];

    // Save original data for reverting
    if (!tooltip.hasOwnProperty("origText")) {
      tooltip.origText = petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1].innerHTML;
    }
  } catch (e) {
    console.error("Failed to update tooltip for slayer area pet: " + slayerArea._name);
  }
}

// Setup thieving
function setupThievingArea(area) {
  area.npcs.forEach((npc) => {
    setupThievingNPC(npc);
  });
}
function setupThievingNPC(npc) {
  // Initialize action counter
  if (!npc.hasOwnProperty("thievingCount")) {
    npc.thievingCount = 0;
  }

  let lootTable = npc.lootTable;

  // Don't run for NPCs without loot
  if (lootTable.totalWeight == 0) {
    return;
  }

  // Save original game data to allow reverting overwrites
  lootTable.drops.forEach((drop) => {
    if (!drop.hasOwnProperty("origWeight")) {
      drop.origWeight = drop.weight;
    }
  });
}
