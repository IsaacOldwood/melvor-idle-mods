// Stores all mod settings and related functions
export function renderModSettings(ctx, modCombatService, modPetsService, modStrongholdGemsService) {
  ctx.settings.section("Combat").add([
    {
      type: "switch",
      name: "completion-only",
      label: "Apply multiplier to first drop only",
      default: true,
      onChange: (val) => {
        game.monsters.forEach((monster) => {
          modCombatService.updateCombatDropChances(
            monster,
            ctx.settings.section("Combat").get("loot-chance-multiplier"),
            ctx.settings.section("Combat").get("multiplier-threshold"),
            ctx.settings.section("Combat").get("max-multiplier"),
            val,
            ctx.settings.section("Combat").get("custom-multiplier")
          );
        });
      },
    },
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
          modCombatService.updateCombatDropChances(
            monster,
            ctx.settings.section("Combat").get("loot-chance-multiplier"),
            val,
            ctx.settings.section("Combat").get("max-multiplier"),
            ctx.settings.section("Combat").get("completion-only"),
            ctx.settings.section("Combat").get("custom-multiplier")
          );
        });
      },
      default: 0.01,
    },
    {
      type: "number",
      name: "max-multiplier",
      label: "Maximum Multiplier",
      hint: "Maximum multiplier that can be applied to drop chances",
      default: 5,
      min: 1,
      onChange: (val) => {
        game.monsters.forEach((monster) => {
          modCombatService.updateCombatDropChances(
            monster,
            ctx.settings.section("Combat").get("loot-chance-multiplier"),
            ctx.settings.section("Combat").get("multiplier-threshold"),
            val,
            ctx.settings.section("Combat").get("completion-only"),
            ctx.settings.section("Combat").get("custom-multiplier")
          );
        });
      },
    },
    {
      type: "number",
      name: "loot-chance-multiplier",
      label: "Loot Chance Multiplier",
      hint: "If an enemy's loot chance is less than 100%, increase the loot chance (max 100%)",
      default: 1,
      min: 1,
      onChange: (val) => {
        game.monsters.forEach((monster) => {
          modCombatService.updateCombatDropChances(
            monster,
            val,
            ctx.settings.section("Combat").get("multiplier-threshold"),
            ctx.settings.section("Combat").get("max-multiplier"),
            ctx.settings.section("Combat").get("completion-only"),
            ctx.settings.section("Combat").get("custom-multiplier")
          );
        });
      },
    },
    {
      type: "number",
      name: "custom-multiplier",
      label: "Custom Multiplier",
      hint: "Custom multiplier that can be applied to drop chances",
      default: 1,
      min: 1,
      onChange: (val) => {
        game.monsters.forEach((monster) => {
          modCombatService.updateCombatDropChances(
            monster,
            ctx.settings.section("Combat").get("loot-chance-multiplier"),
            ctx.settings.section("Combat").get("multiplier-threshold"),
            ctx.settings.section("Combat").get("max-multiplier"),
            ctx.settings.section("Combat").get("completion-only"),
            val
          );
        });
      },
    },
  ]);

  ctx.settings.section("Stronghold gems").add([
    {
      type: "switch",
      name: "gems-completion-only",
      label: "Apply multiplier to first drop only",
      default: true,
      onChange: (val) => {
        game.strongholds.forEach((stronghold) => {
          modStrongholdGemsService.updateStrongholdGem(stronghold, val);
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
            modPetsService.updateDungeonPetChance(dungeon, ctx.settings.section("Pets").get("custom-multiplier"));
            modPetsService.updateDungeonPetTooltip(dungeon);
          });
          game.abyssDepths.forEach((dungeon) => {
            modPetsService.updateDungeonPetChance(dungeon, ctx.settings.section("Pets").get("custom-multiplier"));
            modPetsService.updateDungeonPetTooltip(dungeon);
          });
          game.strongholds.forEach((stronghold) => {
            modPetsService.updateStrongholdPetChance(stronghold, ctx.settings.section("Pets").get("custom-multiplier"));
            modPetsService.updateStrongholdPetTooltip(stronghold);
          });
          game.slayerAreas.forEach((slayerArea) => {
            modPetsService.updateSlayerAreaPetChance(slayerArea, ctx.settings.section("Pets").get("custom-multiplier"));
            modPetsService.updateSlayerAreaPetTooltip(slayerArea);
          });
        } else {
          game.dungeons.forEach((dungeon) => {
            modPetsService.resetDungeonPetChance(dungeon);
            modPetsService.updateDungeonPetTooltip(dungeon);
          });
          game.abyssDepths.forEach((dungeon) => {
            modPetsService.resetDungeonPetChance(dungeon);
            modPetsService.updateDungeonPetTooltip(dungeon);
          });
          game.strongholds.forEach((stronghold) => {
            modPetsService.resetStrongholdPetChance(stronghold);
            modPetsService.updateStrongholdPetTooltip(stronghold);
          });
          game.slayerAreas.forEach((slayerArea) => {
            modPetsService.resetSlayerAreaPetChance(slayerArea);
            modPetsService.updateSlayerAreaPetTooltip(slayerArea);
          });
        }
      },
    },
    {
      type: "number",
      name: "custom-multiplier",
      label: "Custom Multiplier",
      hint: "Custom multiplier applied to pet drop chance. Pet drop rate cannot exceed 1/2",
      default: 1,
      min: 1,
      onChange: (val) => {
        game.dungeons.forEach((dungeon) => {
          modPetsService.updateDungeonPetChance(dungeon, val);
          modPetsService.updateDungeonPetTooltip(dungeon);
        });
        game.abyssDepths.forEach((dungeon) => {
          modPetsService.updateDungeonPetChance(dungeon, val);
          modPetsService.updateDungeonPetTooltip(dungeon);
        });
        game.strongholds.forEach((stronghold) => {
          modPetsService.updateStrongholdPetChance(stronghold, val);
          modPetsService.updateStrongholdPetTooltip(stronghold);
        });
        game.slayerAreas.forEach((slayerArea) => {
          modPetsService.updateSlayerAreaPetChance(slayerArea, val);
          modPetsService.updateSlayerAreaPetTooltip(slayerArea);
        });
      },
    },
  ]);
}
