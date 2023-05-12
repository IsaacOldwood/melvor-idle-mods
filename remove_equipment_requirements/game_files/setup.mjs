export async function setup({ onInterfaceReady }) {
  onInterfaceReady(() => {
    game.items.forEach(function (item) {
      if (!item) {
        return;
      }
      let equipRequirements = item.equipRequirements;
      if (!equipRequirements) {
        return;
      }
      for (let i = 0; i < equipRequirements.length; i++) {
        let requirement = equipRequirements[i];
        if (requirement.type == "DungeonCompletion") {
          item.equipRequirements.splice(i, 1);
        }
      }
    });
  });
}
