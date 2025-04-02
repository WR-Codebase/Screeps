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

 ## Remote mining
- Rework the remote miner to:
  - Pick up energy on the way there. Build / repair any roads along the way
- Rework the remote hauler to have 1 work and to repair roads and containers along the way

## Movement
- Ultimately, it would be better to not use traveler and make your own movement method.
1. Traffic manager without monkey patching
2. Find path via Pathfinder.search() with your own costMatrix
3. Cache the result and reuse the path.
4. Invalidate cached path when it's needed