# TODO

## Spawn Manager

- Move all spawn code out of roomManager.js and into its own spawnManager.js
- Add a "spawn queue" to global heap to manage what to spawn next at which spawn in which room
  - Which creep is needed next in the room
  - How much energy is available?
  - How urgently do we need the creep (prioritize energy infrastructure, nurses over work / minerals)
  - Minimum and maximum energy to spend on each creep
    - Wait for maximum energy flag to handle different situations?
  - Add a TTL check and pre queue before they die based on body size/spawn time

## Pickers and Haulers
 - Pickers and Haulers are idle when they hold resources and they are waiting to collect more but none are available. Instead they should deliver what they have unless more appear for them to collect.

 ## Remote mining
- Rework the remote miner to:
  - Pick up energy on the way there. Build / repair any roads along the way
  - When arriving, build/repair a container at the source
- Rework the remote hauler to have 1 work and to repair roads and containers along the way
- When Long Range Hauelrs (distinct from remote haulers) have no deficit room to deliver to, dump their remaining resources in the nearest storage then become remote haulers