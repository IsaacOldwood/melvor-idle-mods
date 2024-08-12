export function assertDungeonPet(dungeon) {
  if (!dungeon.hasOwnProperty("pet")) {
    return false;
  }

  // Don't run for pets that unlock on fixed number of clears
  if (dungeon.fixedPetClears) {
    return false;
  }

  // Don't run for pets that unlock on first completion else return true
  return dungeon.pet.weight != 1;
}

export function updateDungeonPetChance(dungeon) {
  if (!assertDungeonPet(dungeon)) {
    return;
  }

  const pet = dungeon.pet;

  let completionCount = game.combat.getDungeonCompleteCount(dungeon);
  let petMultiplier = Math.max(Math.ceil(completionCount / pet.origWeight), 1);
  pet.weight = Math.floor(pet.origWeight / petMultiplier);
}

export function resetDungeonPetChance(dungeon) {
  if (!assertDungeonPet(dungeon)) {
    return;
  }

  const pet = dungeon.pet;
  pet.weight = pet.origWeight;
}

export function updateDungeonPetTooltip(dungeon) {
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
    console.error("[DDC] Failed to update tooltip for dungeon pet: " + dungeon._name);
  }
}

export function updateStrongholdPetChance(stronghold) {
  if (!stronghold.hasOwnProperty("pet")) {
    return false;
  }
  const pet = stronghold.pet;

  let completionCount = stronghold.timesCompleted;
  let petMultiplier = Math.max(Math.ceil(completionCount / pet.origWeight), 1);
  pet.weight = Math.floor(pet.origWeight / petMultiplier);
}

export function resetStrongholdPetChance(stronghold) {
  if (!stronghold.hasOwnProperty("pet")) {
    return false;
  }
  const pet = stronghold.pet;
  pet.weight = pet.origWeight;
}

export function updateStrongholdPetTooltip(stronghold) {
  if (!stronghold.hasOwnProperty("pet")) {
    return false;
  }
  const pet = stronghold.pet;

  // Update tooltip
  try {
    let petCompletionLog = completionLogMenu.pets.get(pet.pet);
    let tooltip = petCompletionLog.tooltip.popper.children[0].children[0].children[0].children[1];

    // Set value
    tooltip.innerHTML = tooltip.origText + "<br>Unlock chance: 1/" + pet.weight.toString();
  } catch (e) {
    console.error("[DDC] Failed to update tooltip for stronghold pet: " + stronghold._name);
  }
}

export function updateSlayerAreaPetChance(slayerArea) {
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

export function resetSlayerAreaPetChance(slayerArea) {
  if (!slayerArea.hasOwnProperty("pet")) {
    return;
  }
  const pet = slayerArea.pet;
  pet.weight = pet.origWeight;
}

export function updateSlayerAreaPetTooltip(slayerArea) {
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
