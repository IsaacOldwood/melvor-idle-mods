export async function setup({ onModsLoaded }) {
  onModsLoaded(() => {
    game.items.forEach(function (item) {
      if (!item) {
        return;
      }
      let equipRequirements = item.equipRequirements;
      if (!equipRequirements) {
        return;
      }
      for (let i = equipRequirements.length - 1; i >= 0; i--) {
        let requirement = equipRequirements[i];
        if (requirement.type == "DungeonCompletion") {
          item.equipRequirements[i].count = 0;
        }
        if (requirement.type == "SkillLevel") {
          item.equipRequirements[i].level = 1;
        }
      }
    });
  });
}
