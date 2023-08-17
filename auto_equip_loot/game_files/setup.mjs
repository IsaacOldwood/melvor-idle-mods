export function setup(ctx) {
  // Get currently equipped food
  function getCurrentFood() {
    var currentFood = [];
    for (let i = 0; i < game.combat.player.food.slots.length; i++) {
      if (game.combat.player.food.slots[i].item) {
        currentFood.push(game.combat.player.food.slots[i].item);
      }
    }
    return currentFood;
  }

  // Get currently equipped summoning tablets
  function getCurrentSummon1(currentSlot) {
    return game.combat.player.equipmentSets[currentSlot].equipment.slots.Summon1.item;
  }

  function getCurrentSummon2(currentSlot) {
    return game.combat.player.equipmentSets[currentSlot].equipment.slots.Summon2.item;
  }

  function processItem(item, quantity) {
    // If looted item is the same as the currently selected food
    if (getCurrentFood().includes(item)) {
      // Equip the food
      game.combat.player.equipFood(item, quantity);
    }

    // If looted item is the same as the currently selected summoning tablet
    var currentSelectedEquipmentSet = game.combat.player.selectedEquipmentSet;
    if (getCurrentSummon1(currentSelectedEquipmentSet) == item) {
      // Equip the summoning tablet
      game.combat.player.equipItem(item, currentSelectedEquipmentSet, "Summon1", quantity);
    }

    if (getCurrentSummon2(currentSelectedEquipmentSet) == item) {
      // Equip the summoning tablet
      game.combat.player.equipItem(item, currentSelectedEquipmentSet, "Summon2", quantity);
    }
  }

  // Patches the add item to bank function
  ctx.patch(Bank, "addItem").after((didAddItem, item, quantity, ...args) => {
    if (didAddItem) {
      processItem(item, quantity);
    }
  });
}
