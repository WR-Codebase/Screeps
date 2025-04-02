const Traveler = require('Traveler');
const trafficManager = require('trafficManager');

const roleHarvester = {
  run: function (creep) {
    // === Creep Setup ===
    if (!creep.memory.role) creep.memory.role = 'harvester';

    // === Assign Source ===
    if (!creep.memory.sourceId) {
      const sources = creep.room.find(FIND_SOURCES);
      const harvesters = _.filter(Game.creeps, (c) => c.memory.role === 'harvester' && c.memory.sourceId);
      for (const source of sources) {
        if (!harvesters.find(h => h.memory.sourceId === source.id)) {
          creep.memory.sourceId = source.id;
          break;
        }
      }
    }

    const source = Game.getObjectById(creep.memory.sourceId);
    if (!source) return;

    const container = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (s) => s.structureType === STRUCTURE_CONTAINER
    })[0];

    const link = source.pos.findInRange(FIND_MY_STRUCTURES, 2, {
      filter: (s) => s.structureType === STRUCTURE_LINK
    })[0];

    const targetPos = container ? container.pos : source.pos;

    // === Move Only Once ===
    if (!creep.pos.isEqualTo(targetPos)) {
      creep.moveTo(targetPos, {
        visualizePathStyle: { stroke: '#fa0' },
        ignoreCreeps: true // 🟢 Always true per Royal Decree
      });
      return;
    }

    // === Harvest or Transfer ===
    // If free capacity is greater than 4 * number of work parts, harvest, else transfer
    const workParts = creep.body.filter(part => part.type === WORK).length;
    if (creep.store.getFreeCapacity() > 4 * workParts) {
      creep.harvest(source);
    } else {
      if (link && link.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        creep.transfer(link, RESOURCE_ENERGY);
      } else {
        creep.drop(RESOURCE_ENERGY);
      }
    }
  }
};

module.exports = roleHarvester;