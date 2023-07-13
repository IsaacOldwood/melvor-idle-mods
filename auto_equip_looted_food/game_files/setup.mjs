export function setup(ctx) {
  // Get currently selected food
  const currentFood = () => game.combat.player.food.slots[game.combat.player.food.selectedSlot].item;

  function processItem(item, quantity) {
    // If looted item is the same as the currently selected food
    if (currentFood() != item) {
      return;
    }
    // Equip the food
    game.combat.player.equipFood(item, quantity);
  }

  // Patches the add item to bank function
  ctx.patch(Bank, "addItem").after((didAddItem, item, quantity, ...args) => {
    if (didAddItem) {
      processItem(item, quantity);
    }
  });
}
