/*
 * linkManager
 *
 * This module manages the transfer of energy between links in a room.
 */

module.exports = {
  run: function (room) {
    if (!room.storage) return;

    const links = room.find(FIND_STRUCTURES, {
      filter: (structure) => structure.structureType === STRUCTURE_LINK
    });

    if (links.length === 0) return;

    const targetLink = room.storage.pos.findClosestByRange(links);
    const sourceLinks = links.filter(link => link.id !== targetLink.id);

    const targetFreeCapacity = targetLink.store.getFreeCapacity(RESOURCE_ENERGY);
    for (const sourceLink of sourceLinks) {
      if (sourceLink.cooldown === 0 && targetFreeCapacity > 0) {
        sourceLink.transferEnergy(targetLink, targetFreeCapacity);
      }
    }
  }
};