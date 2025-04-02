/*
 * linkManager
 *
 * This module manages the transfer of energy between links in a room.
 */

export default {
  run: function (room: Room) {
    if (!room.storage) return;

    const links = room.find(FIND_STRUCTURES, {
      filter: (structure) => structure.structureType === STRUCTURE_LINK
    });

    if (links.length === 0) return;

    const targetLink: StructureLink | null = room.storage.pos.findClosestByRange(links);

    if (!targetLink) return;

    const sourceLinks = links.filter(link => link.id !== targetLink.id);

    // only transfer when the target link is EMPTY
    const targetFreeCapacity = targetLink.store.getFreeCapacity(RESOURCE_ENERGY);
    for (const sourceLink of sourceLinks) {
      if (sourceLink.cooldown === 0 && targetLink.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        sourceLink.transferEnergy(targetLink, targetFreeCapacity);
      }
    }
  }
};