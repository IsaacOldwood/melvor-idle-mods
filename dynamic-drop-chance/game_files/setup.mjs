// Run on startup
export function setup(ctx) {
  // Render mod settings
  render_mod_settings(ctx);

  // After game data is loaded
  ctx.onModsLoaded(async (ctx) => {
    // Setup combat
    console.log("[DDC] Saving default drop chances");
    game.monsters.forEach((monster) => {
      setupMonster(monster);
    });

    // Setup thieving
    console.log("[DDC] Loading thieving data and saving default drop chances");
    game.thieving.areas.forEach((area) => {
      setupThievingArea(area);
    });
  });

  // Execute code after offline progress has been calculated and all in-game user interface elements have been created.
  ctx.onInterfaceReady(async (ctx) => {
    // Setup dungeon pets
    console.log("[DDC] Saving default pet drop chances");
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

// #########################################################################################
// MOD SETTINGS
// #########################################################################################

function render_mod_settings(ctx) {
  ctx.settings.section("Combat").add([
    {
      type: "switch",
      name: "completion-only",
      label: "Apply multiplier to first drop only",
      // onChange: (val) => {
      //   ddc_params.completionOnlyInput = val;
      //   game.monsters.forEach(updateCombatDropChances.bind(ddc_params));
      // },
      default: true,
    },
  ]);

  ctx.settings.section("Combat").add([
    {
      type: "number",
      name: "multiplier-threshold",
      label: "Apply multiplier to drops with lower drop chance than:",
      hint: "Decimal format (0.01 = 1%)",
      onChange: (val) => {
        if (val >= 1) {
          return "Threshold must be in decimal format and less than 1";
        } else if (val <= 0) {
          return "Threshold must be in decimal format and greater than 0";
        }
      },
      // onChange: (val) => {
      //   ddc_params.multiplierThresholdInput = val;
      //   game.monsters.forEach(updateCombatDropChances.bind(ddc_params));
      // },
      default: 0.01,
    },
  ]);

  ctx.settings.section("Combat").add([
    {
      type: "number",
      name: "max-multiplier",
      label: "Maximum Multiplier",
      hint: "Maximum multiplier that can be applied to drop chances",
      // onChange: (val) => {
      //   ddc_params.maxUserKillCountMultiplierInput = val;
      //   game.monsters.forEach(updateCombatDropChances.bind(ddc_params));
      // },
      default: 5,
      min: 1,
    },
  ]);

  ctx.settings.section("Combat").add([
    {
      type: "number",
      name: "loot-chance-multiplier",
      label: "Loot Chance Multiplier",
      hint: "If an enemy's loot chance is less than 100%, increase the loot chance (max 100%)",
      // onChange: (val) => {
      //   ddc_params.lootChanceMultiplierInput = val;
      //   game.monsters.forEach(updateCombatDropChances.bind(ddc_params));
      // },
      default: 1,
      min: 1,
    },
  ]);

  ctx.settings.section("Pets").add([
    {
      type: "switch",
      name: "pets-enabled",
      label: "Enable Dynamic Drop Chances for pets",
      // onChange: (val) => {
      //   ddc_params.petEnabledInput = val;
      //   game.dungeons.forEach(updateDungeonPetChance.bind(ddc_params));
      //   game.slayerAreas.forEach(updateSlayerAreaPetChance.bind(ddc_params));
      // },
      default: true,
    },
  ]);
}
