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
  });

  // Update all drop chances on character load BEFORE offline progress
  ctx.onCharacterLoaded((ctx) => {
    // Setup pets
    console.log("[DDC] Saving default pet drop chances");
    game.dungeons.forEach((dungeon) => {
      setupDungeonPet(dungeon);
    });

    game.slayerAreas.forEach((slayerArea) => {
      setupSlayerAreaPet(slayerArea);
    });

    // If dynamic pet chances are enabled, update pet drop chances
    if (ctx.settings.section("Pets").get("pets-enabled")) {
      console.log("[DDC] Updating pet drop chances");
      game.dungeons.forEach((dungeon) => {
        updateDungeonPetChance(dungeon);
      });
      game.slayerAreas.forEach((slayerArea) => {
        updateSlayerAreaPetChance(slayerArea);
      });
    }

    // Update combat drop chances
    console.log("[DDC] Updating combat drop chances");
    game.monsters.forEach((monster) => {
      updateCombatDropChances(
        monster,
        ctx.settings.section("Combat").get("loot-chance-multiplier"),
        ctx.settings.section("Combat").get("multiplier-threshold"),
        ctx.settings.section("Combat").get("max-multiplier"),
        ctx.settings.section("Combat").get("completion-only")
      );
    });

    console.log("[DDC] Drop chances updated");
  });

  // Execute code after offline progress has been calculated and all in-game user interface elements have been created.
  ctx.onInterfaceReady(async (ctx) => {
    // Setup pet tooltips
    console.log("[DDC] Updating pet tooltips");
    game.dungeons.forEach((dungeon) => {
      setupDungeonPetTooltip(dungeon);
      updateDungeonPetTooltip(dungeon);
    });

    game.slayerAreas.forEach((slayerArea) => {
      setupSlayerAreaPetTooltip(slayerArea);
      updateSlayerAreaPetTooltip(slayerArea);
    });
  });

  // Patch enemy death to update drop chances
  ctx.patch(CombatManager, "onEnemyDeath").after(function () {
    updateCombatDropChances(
      this.enemy.monster,
      ctx.settings.section("Combat").get("loot-chance-multiplier"),
      ctx.settings.section("Combat").get("multiplier-threshold"),
      ctx.settings.section("Combat").get("max-multiplier"),
      ctx.settings.section("Combat").get("completion-only")
    );
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
      default: true,
      onChange: (val) => {
        game.monsters.forEach((monster) => {
          updateCombatDropChances(
            monster,
            ctx.settings.section("Combat").get("loot-chance-multiplier"),
            ctx.settings.section("Combat").get("multiplier-threshold"),
            ctx.settings.section("Combat").get("max-multiplier"),
            val
          );
        });
      },
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

        game.monsters.forEach((monster) => {
          updateCombatDropChances(
            monster,
            ctx.settings.section("Combat").get("loot-chance-multiplier"),
            val,
            ctx.settings.section("Combat").get("max-multiplier"),
            ctx.settings.section("Combat").get("completion-only")
          );
        });
      },
      default: 0.01,
    },
  ]);

  ctx.settings.section("Combat").add([
    {
      type: "number",
      name: "max-multiplier",
      label: "Maximum Multiplier",
      hint: "Maximum multiplier that can be applied to drop chances",
      default: 5,
      min: 1,
      onChange: (val) => {
        game.monsters.forEach((monster) => {
          updateCombatDropChances(
            monster,
            ctx.settings.section("Combat").get("loot-chance-multiplier"),
            ctx.settings.section("Combat").get("multiplier-threshold"),
            val,
            ctx.settings.section("Combat").get("completion-only")
          );
        });
      },
    },
  ]);

  ctx.settings.section("Combat").add([
    {
      type: "number",
      name: "loot-chance-multiplier",
      label: "Loot Chance Multiplier",
      hint: "If an enemy's loot chance is less than 100%, increase the loot chance (max 100%)",
      default: 1,
      min: 1,
      onChange: (val) => {
        game.monsters.forEach((monster) => {
          updateCombatDropChances(
            monster,
            val,
            ctx.settings.section("Combat").get("multiplier-threshold"),
            ctx.settings.section("Combat").get("max-multiplier"),
            ctx.settings.section("Combat").get("completion-only")
          );
        });
      },
    },
  ]);

  ctx.settings.section("Pets").add([
    {
      type: "switch",
      name: "pets-enabled",
      label: "Enable Dynamic Drop Chances for pets",
      default: true,
      onChange: (val) => {
        if (val) {
          game.dungeons.forEach((dungeon) => {
            updateDungeonPetChance(dungeon);
            updateDungeonPetTooltip(dungeon);
          });
          game.slayerAreas.forEach((slayerArea) => {
            updateSlayerAreaPetChance(slayerArea);
            updateSlayerAreaPetTooltip(slayerArea);
          });
        }
      },
    },
  ]);
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
  if (!assertDungeonPet(dungeon)) {
    return;
  }

  // Save original game data to allow reverting overwrites
  if (!dungeon.pet.hasOwnProperty("origWeight")) {
    dungeon.pet.origWeight = dungeon.pet.weight;
  }
}

function setupDungeonPetTooltip(dungeon) {
  if (!assertDungeonPet(dungeon)) {
    return;
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
    console.error("[DDC] Failed to update tooltip for dungeon pet: " + dungeon._name);
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
}

function setupSlayerAreaPetTooltip(slayerArea) {
  // Don't run for slayer areas without pets
  if (!slayerArea.hasOwnProperty("pet")) {
    return;
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
    console.error("[DDC] Failed to update tooltip for slayer area pet: " + slayerArea._name);
  }
}

// #########################################################################################
// PETS
// #########################################################################################

function assertDungeonPet(dungeon) {
  if (!dungeon.hasOwnProperty("pet")) {
    return false;
  }

  // Don't run for pets that unlock on fixed number of clears
  if (dungeon.fixedPetClears) {
    return false;
  }

  // Don't run for pets that unlock on first completion else return true
  return dungeon.pet.origWeight != 1;
}

function updateDungeonPetChance(dungeon) {
  if (!assertDungeonPet(dungeon)) {
    return;
  }

  const pet = dungeon.pet;

  let completionCount = game.combat.getDungeonCompleteCount(dungeon);
  let petMultiplier = Math.max(Math.ceil(completionCount / pet.origWeight), 1);
  pet.weight = Math.floor(pet.origWeight / petMultiplier);
}

function updateDungeonPetTooltip(dungeon) {
  if (!assertDungeonPet(dungeon)) {
    return;
  }

  const pet = dungeon.pet;

  // Update tooltip
  try {
    let petCompletionLog = completionLogMenu.pets.get(pet.pet);
    let tooltip = petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1];

    // Set value
    tooltip.innerHTML = tooltip.origText + "<br>Unlock chance: 1/" + pet.weight.toString();
  } catch (e) {
    console.error("[DDC] Failed to update tooltip for dungeon pet: " + slayerArea._name);
  }
}

function updateSlayerAreaPetChance(slayerArea) {
  if (!slayerArea.hasOwnProperty("pet")) {
    return;
  }

  // Get slayer area monsters
  let areaMonsters = slayerArea.monsters;

  // Get slayer area kills
  let areaKills = 0;
  for (const monster of areaMonsters) {
    let monsterKills = game.stats.monsterKillCount(monster);
    areaKills += monsterKills;
  }

  // Set new drop chance
  let petMultiplier = Math.max(Math.ceil(areaKills / slayerArea.pet.origWeight), 1);
  slayerArea.pet.weight = Math.floor(slayerArea.pet.origWeight / petMultiplier);
}

function updateSlayerAreaPetTooltip(slayerArea) {
  if (!slayerArea.hasOwnProperty("pet")) {
    return;
  }
  // Update tooltip
  try {
    let petCompletionLog = completionLogMenu.pets.get(slayerArea.pet.pet);
    let tooltip = petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1];

    tooltip.innerHTML = tooltip.origText + "<br>Unlock chance: 1/" + slayerArea.pet.weight.toString();
  } catch (e) {
    console.error("[DDC] Failed to update tooltip for slayer area pet: " + slayerArea._name);
  }
}

// #########################################################################################
// COMBAT
// #########################################################################################

function updateCombatDropChances(
  monster,
  lootChanceMultiplier,
  multiplierThreshold,
  maxUserKillCountMultiplier,
  completionOnly
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
    let newWeight = dropWeight * Math.min(killCountMultiplier, maxUserKillCountMultiplier);

    // Update weight and total weight accordingly
    drop.weight = Math.floor(newWeight);
    newTotalWeight += Math.floor(newWeight);
  }
  // Set new total weight
  lootTable.totalWeight = newTotalWeight;
}
