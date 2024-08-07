var ddc_params = {
  completionOnlyInput: null,
  multiplierThresholdInput: null,
  maxUserKillCountMultiplierInput: null,
  lootChanceMultiplierInput: null,
  petEnabledInput: null,
};

export function setup(ctx) {
  // Pass ctx to all functions
  ddc_params.ctx = ctx;

  // Render mod settings
  render_mod_settings(ctx);

  // Update all drop chances on character load BEFORE offline progress
  ctx.onCharacterLoaded(() => {
    console.log("[DDC] Updating drop chances");
    game.monsters.forEach(updateCombatDropChances.bind(ddc_params));
    console.log("[DDC] Combat drop chances updated");
    game.dungeons.forEach(updateDungeonPetChance.bind(ddc_params));
    console.log("[DDC] Dungeon pet drop chances updated");
    game.slayerAreas.forEach(updateSlayerAreaPetChance.bind(ddc_params));
    console.log("[DDC] Slayer area pet drop chances updated");
  });

  // Update combat drop chances on enemy death
  ctx.patch(CombatManager, "onEnemyDeath").after(function () {
    updateCombatDropChances.bind(ddc_params, this.enemy.monster);
    game.slayerAreas.forEach(updateSlayerAreaPetChance.bind(ddc_params));
    game.dungeons.forEach(updateDungeonPetChance.bind(ddc_params));
    return;
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
      onChange: (val) => {
        ddc_params.completionOnlyInput = val;
        game.monsters.forEach(updateCombatDropChances.bind(ddc_params));
      },
      default: true,
    },
  ]);

  ctx.settings.section("Combat").add([
    {
      type: "number",
      name: "multiplier-threshold",
      label: "Apply multiplier to drops with lower drop chance than:",
      onChange: (val) => {
        ddc_params.multiplierThresholdInput = val;
        game.monsters.forEach(updateCombatDropChances.bind(ddc_params));
      },
      default: 0.01,
    },
  ]);

  ctx.settings.section("Combat").add([
    {
      type: "number",
      name: "max-kill-count-multiplier",
      label: "Max Kill Count Multiplier",
      onChange: (val) => {
        ddc_params.maxUserKillCountMultiplierInput = val;
        game.monsters.forEach(updateCombatDropChances.bind(ddc_params));
      },
      default: 5,
      min: 1,
    },
  ]);

  ctx.settings.section("Combat").add([
    {
      type: "number",
      name: "loot-chance-multiplier",
      label: "Loot Chance Multiplier",
      hint: "If an enemy's loot chance is less than 100%, multiply the loot chance (max 100%)",
      onChange: (val) => {
        ddc_params.lootChanceMultiplierInput = val;
        game.monsters.forEach(updateCombatDropChances.bind(ddc_params));
      },
      default: 1,
      min: 1,
    },
  ]);

  ctx.settings.section("Pets").add([
    {
      type: "switch",
      name: "pets-enabled",
      label: "Enable Dynamic Drop Chances for pets",
      onChange: (val) => {
        ddc_params.petEnabledInput = val;
        game.dungeons.forEach(updateDungeonPetChance.bind(ddc_params));
        game.slayerAreas.forEach(updateSlayerAreaPetChance.bind(ddc_params));
      },
      default: true,
    },
  ]);
}

// #########################################################################################
// PETS
// #########################################################################################

function updateDungeonPetChance(dungeon) {
  if (!dungeon.hasOwnProperty("pet")) {
    return;
  }

  // Don't run for pets that unlock on fixed number of clears
  if (dungeon.fixedPetClears) {
    return;
  }

  // Save original data for reverting
  if (!dungeon.pet.hasOwnProperty("origWeight")) {
    dungeon.pet.origWeight = dungeon.pet.weight;
  } else {
    // Reset values
    dungeon.pet.weight = dungeon.pet.origWeight;
  }

  // Don't run for pets that unlock on first completion
  if (dungeon.pet.origWeight == 1) {
    return;
  }

  let monsters = dungeon.monsters;
  let boss = monsters[monsters.length - 1];
  if (!boss.isBoss) {
    console.log("[DDC] Last monster for dungeon: ", dungeon.name, " is not boss");
    return;
  }
  let bossKills = game.stats.monsterKillCount(boss);

  // Get user settings
  let petsEnabled =
    this.petEnabledInput != null ? this.petEnabledInput : this.ctx.settings.section("Pets").get("pets-enabled");

  if (!petsEnabled) {
    return;
  }

  let petMultiplier = Math.max(Math.ceil(bossKills / dungeon.pet.origWeight), 1);
  dungeon.pet.weight = Math.floor(dungeon.pet.origWeight / petMultiplier);

  // Update tooltip
  let petCompletionLog = completionLogMenu.pets.get(dungeon.pet.pet);
  let tooltip = petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1];

  // Save original data for reverting
  if (!tooltip.hasOwnProperty("origText")) {
    tooltip.origText = petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1].innerHTML;
  } else {
    // Reset values
    petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1].innerHTML = tooltip.origText;
  }

  petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1].innerHTML =
    tooltip.origText + "<br>Unlock chance: 1/" + dungeon.pet.weight.toString();
}

function updateSlayerAreaPetChance(slayerArea) {
  if (!slayerArea.hasOwnProperty("pet")) {
    return;
  }

  // Get user settings
  let petsEnabled =
    this.petEnabledInput != null ? this.petEnabledInput : this.ctx.settings.section("Pets").get("pets-enabled");

  if (!petsEnabled) {
    return;
  }

  // Save original data for reverting
  if (!slayerArea.pet.hasOwnProperty("origWeight")) {
    slayerArea.pet.origWeight = slayerArea.pet.weight;
  } else {
    // Reset values
    slayerArea.pet.weight = slayerArea.pet.origWeight;
  }

  // Get slayer area monsters
  var areaMonsters = slayerArea.monsters;

  // Get slayer area kills
  var areaKills = 0;
  for (let i = 0; i < areaMonsters.length; i++) {
    let monsterKills = game.stats.monsterKillCount(areaMonsters[i]);
    areaKills += monsterKills;
  }

  // Set new drop chance
  let petMultiplier = Math.max(Math.ceil(areaKills / slayerArea.pet.origWeight), 1);
  slayerArea.pet.weight = Math.floor(slayerArea.pet.origWeight / petMultiplier);

  // Update tooltip
  let petCompletionLog = completionLogMenu.pets.get(slayerArea.pet.pet);
  let tooltip = petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1];

  // Save original data for reverting
  if (!tooltip.hasOwnProperty("origText")) {
    tooltip.origText = petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1].innerHTML;
  } else {
    // Reset values
    petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1].innerHTML = tooltip.origText;
  }

  petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1].innerHTML =
    tooltip.origText + "<br>Unlock chance: 1/" + slayerArea.pet.weight.toString();
}

// #########################################################################################
// COMBAT
// #########################################################################################

function updateCombatDropChances(monster) {
  if (!monster) {
    return;
  }
  let lootTable = monster.lootTable;

  // Save original data for reverting
  if (!monster.hasOwnProperty("origLootChance")) {
    monster.origLootChance = monster.lootChance;
  } else {
    // Reset values
    monster.lootChance = monster.origLootChance;
  }

  // Get user settings
  let lootChanceMultiplier =
    this.lootChanceMultiplierInput != null
      ? this.lootChanceMultiplierInput
      : this.ctx.settings.section("Combat").get("loot-chance-multiplier");
  let lootChance = Math.min(monster.origLootChance * lootChanceMultiplier, 100);

  // Set new loot chance
  monster.lootChance = lootChance;

  // Convert original loot chance to decimal for use in calcs
  let lootChanceDecimal = monster.origLootChance / 100;

  let killCount = game.stats.monsterKillCount(monster);
  if (!lootTable) {
    return;
  }

  // Save original data for reverting
  if (!lootTable.hasOwnProperty("origTotalWeight")) {
    lootTable.origTotalWeight = lootTable.totalWeight;
  } else {
    // Reset values
    lootTable.totalWeight = lootTable.origTotalWeight;
  }
  let totalWeight = lootTable.origTotalWeight;
  let newTotalWeight = 0;

  for (let i = 0; i < lootTable.drops.length; i++) {
    // Save original data for reverting
    if (!lootTable.drops[i].hasOwnProperty("origWeight")) {
      lootTable.drops[i].origWeight = lootTable.drops[i].weight;
    } else {
      // Reset values
      lootTable.drops[i].weight = lootTable.drops[i].origWeight;
    }

    let drop = lootTable.drops[i];
    let item = drop.item;
    let dropWeight = drop.origWeight;
    let dropChance = (dropWeight / totalWeight) * lootChanceDecimal;

    // Get user settings
    let multiplierThreshold =
      this.multiplierThresholdInput != null
        ? this.multiplierThresholdInput
        : this.ctx.settings.section("Combat").get("multiplier-threshold");

    if (dropChance > multiplierThreshold) {
      newTotalWeight += dropWeight;
      continue;
    }

    // Get user settings
    let maxUserKillCountMultiplier =
      this.maxUserKillCountMultiplierInput != null
        ? this.maxUserKillCountMultiplierInput
        : this.ctx.settings.section("Combat").get("max-kill-count-multiplier");

    let completionOnly =
      this.completionOnlyInput != null
        ? this.completionOnlyInput
        : this.ctx.settings.section("Combat").get("completion-only");

    let itemFindCount = game.stats.itemFindCount(item);
    // If the item has been found and user setting is for first time only then don't modify
    if (completionOnly && itemFindCount > 0) {
      newTotalWeight += dropWeight;
      continue;
    }

    // Stop 0 kill count causing divide by inf
    let killCountMultiplier = Math.max(Math.ceil(killCount * dropChance), 1);
    // Calculate new weight
    let newWeight = dropWeight * Math.min(killCountMultiplier, maxUserKillCountMultiplier);

    // Update weight and total weight accordingly
    lootTable.drops[i].weight = Math.floor(newWeight);
    newTotalWeight += Math.floor(newWeight);
  }
  lootTable.totalWeight = newTotalWeight;
}
