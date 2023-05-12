export async function setup({ onInterfaceReady }) {
  onInterfaceReady(() => {
    game.monsters.forEach(function (monster) {
      if (!monster) {
        return;
      }
      let lootTable = monster.lootTable;
      let lootChance = monster.lootChance / 100;
      let killCount = game.stats.monsterKillCount(monster);
      if (!lootTable) {
        return;
      }
      let totalWeight = lootTable.totalWeight;
      for (let i = 0; i < lootTable.drops.length; i++) {
        let dropWeight = lootTable.drops[i].weight;
        let dropChance = (dropWeight / totalWeight) * lootChance;

        // 1%
        if (dropChance < 0.01) {
          lootTable.drops[i].weight =
            dropWeight * Math.ceil(killCount * dropChance);
        }
      }
    });
  });
}
