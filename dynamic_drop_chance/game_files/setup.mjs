var ddc_params = {
  completionOnlyInput: null,
  multiplierThresholdInput: null,
  maxUserKillCountMultiplierInput: null,
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
    ddc_pet_dungeon_ids.forEach(updateDungeonPetChance.bind(ddc_params));
    console.log("[DDC] Dungeon pet drop chances updated");
  });

  // Update combat drop chances on enemy death
  ctx.patch(CombatManager, "onEnemyDeath").after(function () {
    updateCombatDropChances.bind(ddc_params, this.enemy.monster);
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

  ctx.settings.section("Pets").add([
    {
      type: "switch",
      name: "pets-enabled",
      label: "Enable Dynamic Drop Chances for pets",
      onChange: (val) => {
        ddc_params.petEnabledInput = val;
        ddc_pet_dungeon_ids.forEach(updateDungeonPetChance.bind(ddc_params));
      },
      default: true,
    },
  ]);
}

// #########################################################################################
// PETS
// #########################################################################################

var ddc_pet_dungeon_ids = [
  "melvorD:Chicken_Coop",
  "melvorD:Undead_Graveyard",
  "melvorD:Spider_Forest",
  "melvorD:Frozen_Cove",
  "melvorD:Deep_Sea_Ship",
  "melvorD:Volcanic_Cave",
  "melvorD:Bandit_Base",
  "melvorD:Hall_of_Wizards",
  "melvorF:Air_God_Dungeon",
  "melvorF:Water_God_Dungeon",
  "melvorF:Earth_God_Dungeon",
  "melvorF:Fire_God_Dungeon",
  "melvorF:Dragons_Den",
  "melvorF:Miolite_Caves",
  "melvorF:Infernal_Stronghold",
  "melvorTotH:Ancient_Sanctuary",
  "melvorTotH:Underground_Lava_Lake",
  "melvorTotH:Lightning_Region",
  "melvorTotH:Lair_of_the_Spider_Queen",
  "melvorTotH:Cursed_Forest",
  "melvorTotH:Necromancers_Palace",
];

function updateDungeonPetChance(dungeon_id) {
  let dungeon = game.dungeons.getObjectByID(dungeon_id);
  let monsters = dungeon.monsters;
  let boss = monsters[monsters.length - 1];
  if (!boss.isBoss) {
    console.log("[DDC] Last monster for dungeon: ", dungeon.name, " is not boss");
    return;
  }
  let bossKills = game.stats.monsterKillCount(boss);

  // Save original data for reverting
  if (!dungeon.pet.hasOwnProperty("origWeight")) {
    dungeon.pet.origWeight = dungeon.pet.weight;
  } else {
    // Reset values
    dungeon.pet.weight = dungeon.pet.origWeight;
  }

  // Get user settings
  let petsEnabled =
    this.petEnabledInput != null ? this.petEnabledInput : this.ctx.settings.section("Pets").get("pets-enabled");

  if (!petsEnabled) {
    return;
  }

  let petMultiplier = Math.max(Math.ceil(bossKills / dungeon.pet.origWeight), 1);
  dungeon.pet.weight = dungeon.pet.origWeight / petMultiplier;
}

// #########################################################################################
// COMBAT
// #########################################################################################

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

  // Save original data for reverting
  if (!lootTable.hasOwnProperty("origTotalWeight")) {
    lootTable.origTotalWeight = lootTable.totalWeight;
  } else {
    // Reset values
    lootTable.totalWeight = lootTable.origTotalWeight;
  }
  let totalWeight = lootTable.origTotalWeight;

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
    let dropChance = (dropWeight / totalWeight) * lootChance;

    // Get user settings
    let multiplierThreshold =
      this.multiplierThresholdInput != null
        ? this.multiplierThresholdInput
        : this.ctx.settings.section("Combat").get("multiplier-threshold");

    if (dropChance > multiplierThreshold) {
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
      continue;
    }

    // Stop 0 kill count causing divide by inf
    let killCountMultiplier = Math.max(Math.ceil(killCount * dropChance), 1);
    // Calculate new weight
    let newWeight = dropWeight * Math.min(killCountMultiplier, maxUserKillCountMultiplier);

    // Update weight and total weight accordingly
    lootTable.drops[i].weight = newWeight;
    lootTable.totalWeight = lootTable.origTotalWeight + (newWeight - dropWeight);
  }
}
