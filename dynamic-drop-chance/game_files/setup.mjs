// Run on startup
export async function setup(ctx) {
  // Loads JS files from the mod folder
  const modSettingsService = await ctx.loadModule("modSettings.mjs");
  const modSetupService = await ctx.loadModule("modSetup.mjs");
  const modPetsService = await ctx.loadModule("modPets.mjs");
  const modCombatService = await ctx.loadModule("modCombat.mjs");

  // Render mod settings
  modSettingsService.renderModSettings(ctx, modCombatService, modPetsService);

  // After game data is loaded
  ctx.onModsLoaded(async (ctx) => {
    // Setup combat
    console.log("[DDC] Saving default drop chances");
    game.monsters.forEach((monster) => {
      modSetupService.setupMonster(monster);
    });
  });

  // Update all drop chances on character load BEFORE offline progress
  ctx.onCharacterLoaded((ctx) => {
    // Setup pets
    console.log("[DDC] Saving default pet drop chances");
    game.dungeons.forEach((dungeon) => {
      modSetupService.setupDungeonPet(modPetsService, dungeon);
    });

    game.strongholds.forEach((stronghold) => {
      modSetupService.setupStrongholdPet(stronghold);
    });

    game.slayerAreas.forEach((slayerArea) => {
      modSetupService.setupSlayerAreaPet(slayerArea);
    });

    // If dynamic pet chances are enabled, update pet drop chances
    if (ctx.settings.section("Pets").get("pets-enabled")) {
      console.log("[DDC] Updating pet drop chances");
      game.dungeons.forEach((dungeon) => {
        modPetsService.updateDungeonPetChance(dungeon);
      });
      game.strongholds.forEach((stronghold) => {
        modPetsService.updateStrongholdPetChance(stronghold);
      });
      game.slayerAreas.forEach((slayerArea) => {
        modPetsService.updateSlayerAreaPetChance(slayerArea);
      });
    }

    // Update combat drop chances
    console.log("[DDC] Updating combat drop chances");
    game.monsters.forEach((monster) => {
      modCombatService.updateCombatDropChances(
        monster,
        ctx.settings.section("Combat").get("loot-chance-multiplier"),
        ctx.settings.section("Combat").get("multiplier-threshold"),
        ctx.settings.section("Combat").get("max-multiplier"),
        ctx.settings.section("Combat").get("completion-only"),
        ctx.settings.section("Combat").get("custom-multiplier")
      );
    });

    console.log("[DDC] Drop chances updated");
  });

  // Execute code after offline progress has been calculated and all in-game user interface elements have been created.
  ctx.onInterfaceReady(async (ctx) => {
    // Setup pet tooltips
    console.log("[DDC] Updating pet tooltips");
    game.dungeons.forEach((dungeon) => {
      modSetupService.setupDungeonPetTooltip(modPetsService, dungeon);
      modPetsService.updateDungeonPetTooltip(dungeon);
    });

    game.strongholds.forEach((stronghold) => {
      modSetupService.setupStrongholdPetTooltip(stronghold);
      modPetsService.updateStrongholdPetTooltip(stronghold);
    });

    game.slayerAreas.forEach((slayerArea) => {
      modSetupService.setupSlayerAreaPetTooltip(slayerArea);
      modPetsService.updateSlayerAreaPetTooltip(slayerArea);
    });
  });

  // Patch enemy death to update drop chances
  ctx.patch(CombatManager, "onEnemyDeath").after(function () {
    modCombatService.updateCombatDropChances(
      this.enemy.monster,
      ctx.settings.section("Combat").get("loot-chance-multiplier"),
      ctx.settings.section("Combat").get("multiplier-threshold"),
      ctx.settings.section("Combat").get("max-multiplier"),
      ctx.settings.section("Combat").get("completion-only"),
      ctx.settings.section("Combat").get("custom-multiplier")
    );
  });
}