module.exports = {
  run: function () {
    try {
      const towers = _.filter(Game.structures, s => s.structureType === STRUCTURE_TOWER);
      towers.forEach(tower => {
        const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile && !global.allies.has(closestHostile.owner.username)) {
          tower.attack(closestHostile);
        } else if (tower.store.getUsedCapacity(RESOURCE_ENERGY) > 600) {

          const targets = tower.room.find(FIND_STRUCTURES, {
            filter: (structure) =>
              structure.hits < structure.hitsMax &&
              (
                structure.structureType === STRUCTURE_CONTAINER ||
                (structure.structureType === STRUCTURE_ROAD && structure.hits < structure.hitsMax * 0.8) ||
                structure.structureType === STRUCTURE_STORAGE ||
                structure.structureType === STRUCTURE_SPAWN ||
                structure.structureType === STRUCTURE_EXTENSION ||
                structure.structureType === STRUCTURE_TOWER ||
                (structure.structureType === STRUCTURE_RAMPART && structure.hits < 150000) ||
                (structure.structureType === STRUCTURE_WALL && structure.hits < 150000)
              )
          });

          if (targets.length > 0) {
            const priority = structure => {
              switch (structure.structureType) {
                case STRUCTURE_CONTAINER: return 1;
                case STRUCTURE_TOWER:
                case STRUCTURE_STORAGE:
                case STRUCTURE_SPAWN:
                case STRUCTURE_EXTENSION: return 2;
                case STRUCTURE_ROAD: return 3;
                case STRUCTURE_RAMPART:
                case STRUCTURE_WALL: return 4;
                default: return 5;
              }
            };

            // Prioritize containers first, then roads fully until max, then others
            targets.sort((a, b) => {
              const pA = priority(a);
              const pB = priority(b);
              if (pA !== pB) return pA - pB;

              // If it's a road, prioritize those that aren't yet full (after 80% threshold)
              if (a.structureType === STRUCTURE_ROAD && b.structureType === STRUCTURE_ROAD) {
                return a.hits - b.hits;
              }

              return (a.hits / a.hitsMax) - (b.hits / b.hitsMax);
            });

            tower.repair(targets[0]);
          }
        }
      });
    } catch (e) {
      console.log(`Error in towerManager.run(): ${e}`);
    }
  }
};
