# Screeps Documentation Index
## API Reference
[API Reference](https://docs.screeps.com/api)
## Overview
[Overview](https://docs.screeps.com/index.html)
- [Tutorial](https://screeps.com/a/#!/sim/tutorial)
- [API Reference](https://docs.screeps.com/api)
- [Contributed Articles](https://docs.screeps.com/contributed/rules.html)
- [Chat](http://chat.screeps.com/)
## Gameplay
### Introduction
[Introduction](https://docs.screeps.com/introduction.html)

### Creeps
[Creeps](https://docs.screeps.com/creeps.html)

You build (spawn) units called **creeps** the same way as in other strategy games, but with one exception: you construct the "body" of a new creep out of 7 available **body part types**, the resulting body being a sequence up to 50 parts. It allows thousands of creep types and their roles: ordinary workers, huge construction machines able to build or repair a structure within a few cycles, weaselly couriers, heavy capacious trucks, fast and cheap scouts, well-equipped fighters with regeneration ability, etc. It may even be creeps resembling towers or fortresses for mining, defending, or seizing, with very little speed (couple of tiles per minute), but monstrous characteristics. Everything is up to you, your tactics and imagination.

![](https://docs.screeps.com/img/bodyparts.png)

However, remember that any creep has a life cycle of 1500 game ticks (approx. 30-60 minutes depending on the tick duration). Then it "ages" and dies. So you not only need to control existing creeps but set up manufacturing and automatic control of superseding generations of your creeps as well.

A standard spawn (structure) can only spawn regular creeps with the total cost of up to **300 energy units**. Spawning more expensive creeps requires a **spawn extension** in the room. Each extension can contain up to **50 extra energy units** that may be spent on creation of a creep. The exact location of extensions within a room does not matter, but they should be in the same room with the spawn (one extension can be used by several spawns). All the necessary energy should be in the spawn and extensions in the beginning of the creep creation.

The amount of extensions available for construction depends on the Room Controller in the room. Read more in [Global control](https://docs.screeps.com/control.html).

#### Creeps Skills

Possible part types of a creep body:

-   `WORK` -- ability to harvest energy, construct and repair structures, upgrade controllers.
-   `MOVE` -- ability to move.
-   `CARRY` -- ability to transfer energy.
-   `ATTACK` -- ability of short-range attack.
-   `RANGED_ATTACK` -- ability of ranged attack.
-   `HEAL` -- ability to heal others.
-   `CLAIM` -- ability to claim territory control.
-   `TOUGH` -- "empty" part with the sole purpose of defense.

The effectiveness of an ability depends on the amount of parts of a corresponding type. For example, a worker creep with 3 parts of the `WORK` type will work 3 times as effectively as a creep with only 1 `WORK`part. The same applies to all the other types and actions.

#### Movement

Each body part has its own physical weight: the more parts a creep bears, the more difficult it is for it to move. Each body part (except `MOVE`) generates fatigue points when the creep moves: 1 point per body part on roads, 2 on plain land, 10 on swamp. Each `MOVE` body part decreases fatigue points by 2 per tick. The creep cannot move when its fatigue is greater than zero.

> To maintain the maximum movement speed of 1 square per tick, a creep needs to have as many `MOVE` parts as all the other parts of its body combined.

In other words, one `MOVE` part can move one other part one square per tick. If a creep has less `MOVE` parts, its movement will be proportionally slowed which is seen by the increasing fatigue.

It's worth noting that empty `CARRY` parts don't generate fatigue.

Samples:

-   Creep `[CARRY, WORK, MOVE]` will move 1 square per tick if it does not bear energy, and 1 square per 2 ticks if loaded.
-   Creep `[TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE]` will move at maximum speed of 1 square per tick.
-   Creep `[TOUGH, ATTACK, ATTACK, MOVE, MOVE]` will move 1 square per 2 ticks because of rounding up.

#### Damage

The total amount of hits a creep has depends on the amount of its body parts -- 100 hits per each part. The order in which the parts were specified during the spawning of a creep also has a bearing. Under attack, the first parts to take hits are those specified first. Full damage to a part leads to complete disabling of it -- the creep can no longer perform this function.

### Control
[Control](https://docs.screeps.com/control.html)

#### Global Control Level

To expand your empire in the game world, you need to develop your main game indicator -- your **Global Control Level** (GCL). It affects two important factors:

-   **Your CPU Limit.** On the official server you begin the game with a 20 CPU limit which allows you to control just a small number of creeps. However, if your CPU is unlocked with a "CPU Unlock" item, you gain 10 CPU for each GCL level until your limit reaches 300 CPU. Then it stops increasing.
-   **The amount of rooms you can control.** For example, to control 3 rooms, you need to have GCL 3.

Your current Global Control Level is displayed at your [overview page](https://screeps.com/a/#!/overview).

![](https://docs.screeps.com/img/gcl-cpu.png)

#### Room Controller Level

In order to build any facilities in a room, you need to control it. In the majority of rooms (but not all), there are special objects called **Room Controllers**. In your first room, the Controller is owned by you by default. Any neutral Controller can be [claimed](https://docs.screeps.com/api/#Creep.claimController) by your creeps with the `CLAIM` body part, which instantly puts the room under your control.

![](https://docs.screeps.com/img/c1.png)

A newly-seized Controller allows you to build one spawn in the room. In order for you to build extra spawns, roads, and extensions, you have to upgrade the Room Controller Level (RCL) by pumping energy into the controller using [`Creep.upgradeController`](https://docs.screeps.com/api/#Creep.upgradeController) method.

![](https://docs.screeps.com/img/c2.png)

#### Available structures per RCL

| RCL | Energy to upgrade | Structures |
| --- |  --- |  --- |
| 0 | --- | Roads, 5 Containers |
| 1 | 200 | Roads, 5 Containers, 1 Spawn |
| 2 | 45,000 | Roads, 5 Containers, 1 Spawn, 5 Extensions (50 capacity), Ramparts (300K max hits), Walls |
| 3 | 135,000 | Roads, 5 Containers, 1 Spawn, 10 Extensions (50 capacity), Ramparts (1M max hits), Walls, 1 Tower |
| 4 | 405,000 | Roads, 5 Containers, 1 Spawn, 20 Extensions (50 capacity), Ramparts (3M max hits), Walls, 1 Tower, Storage |
| 5 | 1,215,000 | Roads, 5 Containers, 1 Spawn, 30 Extensions (50 capacity), Ramparts (10M max hits), Walls, 2 Towers, Storage, 2 Links |
| 6 | 3,645,000 | Roads, 5 Containers, 1 Spawn, 40 Extensions (50 capacity), Ramparts (30M max hits), Walls, 2 Towers, Storage, 3 Links, Extractor, 3 Labs, Terminal |
| 7 | 10,935,000 | Roads, 5 Containers, 2 Spawns, 50 Extensions (100 capacity), Ramparts (100M max hits), Walls, 3 Towers, Storage, 4 Links, Extractor, 6 Labs, Terminal, Factory |
| 8 | --- | Roads, 5 Containers, 3 Spawns, 60 Extensions (200 capacity), Ramparts (300M max hits), Walls, 6 Towers, Storage, 6 Links, Extractor, 10 Labs, Terminal, Factory, Observer, Power Spawn, Nuker |

#### Attacking controllers

A Controller cannot be damaged or destroyed. However, a Controller not affected by an [`upgradeController`](https://docs.screeps.com/api/#Creep.upgradeController) action will run a downgrade timer losing 20,000 game ticks at RCL 1, or 5,000 game ticks at RCL 2 to 150,000 game ticks at RCL 8. All timers are listed in the [`StructureController`](https://docs.screeps.com/api/#StructureController) prototype. As soon as its level reaches 0, a Controller becomes neutral, and another player can reclaim it. Make sure that you upgrade your Controllers from time to time to keep their levels!

You can attack another player's controller downgrade timer by applying [`attackController`](https://docs.screeps.com/api/#Creep.attackController) on it.

![](https://docs.screeps.com/img/controllerDowngrade.png)

#### Raising GCL

Upgrading GCL requires pumping energy into your Controllers -- GCL grows in parallel with the level of your Controllers. Any contribution to any of your Controllers affects your GCL, even if the Controller is fully upgraded to the level 8.

Having upgraded your GCL once, you will never lose it. Even after complete fail in the game and loss of all your rooms, your GCL is stored in your account forever. It allows you to respawn at a new place and quickly regain your former glory.

If some day in the future you plan to claim a room that requires a higher GCL than you have, you can still [reserve](https://docs.screeps.com/api/#Creep.reserveController) its Controller. Also, reserving a Controller in a neutral room restores energy sources to their full capacity.

### Defending your room
[Defense](https://docs.screeps.com/defense.html)

### Respawning
[Respawning](https://docs.screeps.com/respawn.html)

### Start Areas
[Start Areas](https://docs.screeps.com/start-areas.html)

### Resources
[Resources](https://docs.screeps.com/resources.html)

There are 4 kinds of resources in the game: **energy**, **minerals**, **power**, and **commodities**. Resources can be harvested, processed, traded on the market, carried by creeps, and stored in structures. All resource kinds have different purposes, and you start playing only with access to the most basic one: energy.

#### Energy

> **Where to get:** a [`Source`](https://docs.screeps.com/api/#Source) in almost any room.
> **How to get:** send a creep with a `WORK` part and [`harvest`](https://docs.screeps.com/api/#Creep.harvest) it.
> **Needed for:** spawning creeps, building structures.

Energy is the main construction material in the Screeps world. Your base works on energy, so harvesting plenty of it is vital for any colony. You can harvest energy not only in your home room, but also in other rooms remotely to increase energy income.

#### Minerals

> **Where to get:** a [`Mineral`](https://docs.screeps.com/api/#Mineral) in almost any room.
> **How to get:** build a [`StructureExtractor`](https://docs.screeps.com/api/#StructureExtractor), send a creep with a `WORK` part, and [`harvest`](https://docs.screeps.com/api/#Creep.harvest) it.
> **Needed for:** boosting creeps' capabilities, and also for producing trade commodities.

By mining and processing minerals, you can significantly speed up your economy and boost the effectiveness of your creeps.

Working with minerals consists of 3 steps:

##### Harvesting

There are 7 types of base minerals shown in the picture below.

![](https://docs.screeps.com/img/minerals-01.png)

Each room contains only one mineral type, so in order to handle them effectively you need either access to several suitable rooms or trade relationships with other players.

![](https://docs.screeps.com/img/mining_minerals.png)A mineral deposit is located in a room at a spot marked by a special symbol. To start mining the deposit, you need to construct the special structure [**Extractor**](https://docs.screeps.com/api/#StructureExtractor) on top of it (available at Room Controller Level 6). Upon building it, you can start applying the method [`harvest`](https://docs.screeps.com/api/#Creep.harvest) to the deposit thus mining the corresponding mineral in the same way you harvest energy.

##### Mineral compounds

Base minerals are useless on their own. In order to impart some useful capabilities to them, you have to combine them according to special formulas in the structure called [**Lab**](https://docs.screeps.com/api/#StructureLab).

![](https://docs.screeps.com/img/minerals-02.png)

One reaction requires three labs: two as reagent sources, and the third one as the produce collector. The labs should be within the range of 2 squares from each other. One lab cannot contain more than one mineral type at the same time.

![](https://docs.screeps.com/img/2016-03-09_10-32-33.gif)

```
var labs = room.find(FIND_MY_STRUCTURES,
    {filter: {structureType: STRUCTURE_LAB}});

labs[0].runReaction(labs[1], labs[2]);

// on the next tick...

console.log(labs[0].mineralType) // -> OH
console.log(labs[1].mineralType) // -> O
console.log(labs[2].mineralType) // -> H
```

##### Creep boosts

Apart from running chemical reactions with minerals, a lab can use resulting compounds to permanently upgrade your creeps boosting their specific properties.

Each compound is applied to one body part of the creep of a certain type using the [`StructureLab.boostCreep`](https://docs.screeps.com/api/#StructureLab.boostCreep) method according to the table below and boosts the effectiveness of one of the actions of this creep. The boosted part works as two, three, or even four corresponding parts. To boost the whole creep, you need to boost all its parts of the given type.

Boosting one body part takes 30 mineral compound units and 20 energy units. One body part can be boosted only with one compound type.

Mineral compounds

| Name | Formula | Time | Body part | Effect |
| --- |  --- |  --- |  --- |  --- |
| Base compounds |||||
| ![](https://static.screeps.com/upload/mineral-icons/OH.png)hydroxide | ![](https://static.screeps.com/upload/mineral-icons/H.png) + ![](https://static.screeps.com/upload/mineral-icons/O.png) | 20 | --- | --- |
| ![](https://static.screeps.com/upload/mineral-icons/ZK.png)zynthium keanite | ![](https://static.screeps.com/upload/mineral-icons/Z.png) + ![](https://static.screeps.com/upload/mineral-icons/K.png) | 5 | --- | --- |
| ![](https://static.screeps.com/upload/mineral-icons/UL.png)utrium lemergite | ![](https://static.screeps.com/upload/mineral-icons/U.png) + ![](https://static.screeps.com/upload/mineral-icons/L.png) | 5 | --- | --- |
| ![](https://static.screeps.com/upload/mineral-icons/G.png)ghodium | ![](https://static.screeps.com/upload/mineral-icons/ZK.png) + ![](https://static.screeps.com/upload/mineral-icons/UL.png) | 5 | --- | --- |
| Tier 1 compounds |||||
| ![](https://static.screeps.com/upload/mineral-icons/UH.png)utrium hydride | ![](https://static.screeps.com/upload/mineral-icons/U.png) + ![](https://static.screeps.com/upload/mineral-icons/H.png) | 10 | `ATTACK` | +100% `attack` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/UO.png)utrium oxide | ![](https://static.screeps.com/upload/mineral-icons/U.png) + ![](https://static.screeps.com/upload/mineral-icons/O.png) | 10 | `WORK` | +200% `harvest` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/KH.png)keanium hydride | ![](https://static.screeps.com/upload/mineral-icons/K.png) + ![](https://static.screeps.com/upload/mineral-icons/H.png) | 10 | `CARRY` | +50 capacity |
| ![](https://static.screeps.com/upload/mineral-icons/KO.png)keanium oxide | ![](https://static.screeps.com/upload/mineral-icons/K.png) + ![](https://static.screeps.com/upload/mineral-icons/O.png) | 10 | `RANGED_ATTACK` | +100% `rangedAttack` and `rangedMassAttack` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/LH.png)lemergium hydride | ![](https://static.screeps.com/upload/mineral-icons/L.png) + ![](https://static.screeps.com/upload/mineral-icons/H.png) | 15 | `WORK` | +50% `repair` and `build` effectiveness without increasing the energy cost |
| ![](https://static.screeps.com/upload/mineral-icons/LO.png)lemergium oxide | ![](https://static.screeps.com/upload/mineral-icons/L.png) + ![](https://static.screeps.com/upload/mineral-icons/O.png) | 10 | `HEAL` | +100% `heal` and `rangedHeal` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/ZH.png)zynthium hydride | ![](https://static.screeps.com/upload/mineral-icons/Z.png) + ![](https://static.screeps.com/upload/mineral-icons/H.png) | 20 | `WORK` | +100% `dismantle` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/ZO.png)zynthium oxide | ![](https://static.screeps.com/upload/mineral-icons/Z.png) + ![](https://static.screeps.com/upload/mineral-icons/O.png) | 10 | `MOVE` | +100% fatigue decrease speed |
| ![](https://static.screeps.com/upload/mineral-icons/GH.png)ghodium hydride | ![](https://static.screeps.com/upload/mineral-icons/G.png) + ![](https://static.screeps.com/upload/mineral-icons/H.png) | 10 | `WORK` | +50% `upgradeController` effectiveness without increasing the energy cost |
| ![](https://static.screeps.com/upload/mineral-icons/GO.png)ghodium oxide | ![](https://static.screeps.com/upload/mineral-icons/G.png) + ![](https://static.screeps.com/upload/mineral-icons/O.png) | 10 | `TOUGH` | \-30% damage taken |
| Tier 2 compounds |||||
| ![](https://static.screeps.com/upload/mineral-icons/UH2O.png)utrium acid | ![](https://static.screeps.com/upload/mineral-icons/UH.png) + ![](https://static.screeps.com/upload/mineral-icons/OH.png) | 5 | `ATTACK` | +200% `attack` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/UHO2.png)utrium alkalide | ![](https://static.screeps.com/upload/mineral-icons/UO.png) + ![](https://static.screeps.com/upload/mineral-icons/OH.png) | 5 | `WORK` | +400% `harvest` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/KH2O.png)keanium acid | ![](https://static.screeps.com/upload/mineral-icons/KH.png) + ![](https://static.screeps.com/upload/mineral-icons/OH.png) | 5 | `CARRY` | +100 capacity |
| ![](https://static.screeps.com/upload/mineral-icons/KHO2.png)keanium alkalide | ![](https://static.screeps.com/upload/mineral-icons/KO.png) + ![](https://static.screeps.com/upload/mineral-icons/OH.png) | 5 | `RANGED_ATTACK` | +200% `rangedAttack` and `rangedMassAttack` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/LH2O.png)lemergium acid | ![](https://static.screeps.com/upload/mineral-icons/LH.png) + ![](https://static.screeps.com/upload/mineral-icons/OH.png) | 10 | `WORK` | +80% `repair` and `build` effectiveness without increasing the energy cost |
| ![](https://static.screeps.com/upload/mineral-icons/LHO2.png)lemergium alkalide | ![](https://static.screeps.com/upload/mineral-icons/LO.png) + ![](https://static.screeps.com/upload/mineral-icons/OH.png) | 5 | `HEAL` | +200% `heal` and `rangedHeal` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/ZH2O.png)zynthium acid | ![](https://static.screeps.com/upload/mineral-icons/ZH.png) + ![](https://static.screeps.com/upload/mineral-icons/OH.png) | 40 | `WORK` | +200% `dismantle` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/ZHO2.png)zynthium alkalide | ![](https://static.screeps.com/upload/mineral-icons/ZO.png) + ![](https://static.screeps.com/upload/mineral-icons/OH.png) | 5 | `MOVE` | +200% fatigue decrease speed |
| ![](https://static.screeps.com/upload/mineral-icons/GH2O.png)ghodium acid | ![](https://static.screeps.com/upload/mineral-icons/GH.png) + ![](https://static.screeps.com/upload/mineral-icons/OH.png) | 15 | `WORK` | +80% `upgradeController` effectiveness without increasing the energy cost |
| ![](https://static.screeps.com/upload/mineral-icons/GHO2.png)ghodium alkalide | ![](https://static.screeps.com/upload/mineral-icons/GO.png) + ![](https://static.screeps.com/upload/mineral-icons/OH.png) | 30 | `TOUGH` | \-50% damage taken |
| Tier 3 compounds |||||
| ![](https://static.screeps.com/upload/mineral-icons/XUH2O.png)catalyzed utrium acid | ![](https://static.screeps.com/upload/mineral-icons/UH2O.png) + ![](https://static.screeps.com/upload/mineral-icons/X.png) | 60 | `ATTACK` | +300% `attack` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/XUHO2.png)catalyzed utrium alkalide | ![](https://static.screeps.com/upload/mineral-icons/UHO2.png) + ![](https://static.screeps.com/upload/mineral-icons/X.png) | 60 | `WORK` | +600% `harvest` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/XKH2O.png)catalyzed keanium acid | ![](https://static.screeps.com/upload/mineral-icons/KH2O.png) + ![](https://static.screeps.com/upload/mineral-icons/X.png) | 60 | `CARRY` | +150 capacity |
| ![](https://static.screeps.com/upload/mineral-icons/XKHO2.png)catalyzed keanium alkalide | ![](https://static.screeps.com/upload/mineral-icons/KHO2.png) + ![](https://static.screeps.com/upload/mineral-icons/X.png) | 60 | `RANGED_ATTACK` | +300% `rangedAttack` and `rangedMassAttack` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/XLH2O.png)catalyzed lemergium acid | ![](https://static.screeps.com/upload/mineral-icons/LH2O.png) + ![](https://static.screeps.com/upload/mineral-icons/X.png) | 65 | `WORK` | +100% `repair` and `build` effectiveness without increasing the energy cost |
| ![](https://static.screeps.com/upload/mineral-icons/XLHO2.png)catalyzed lemergium alkalide | ![](https://static.screeps.com/upload/mineral-icons/LHO2.png) + ![](https://static.screeps.com/upload/mineral-icons/X.png) | 60 | `HEAL` | +300% `heal` and `rangedHeal` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/XZH2O.png)catalyzed zynthium acid | ![](https://static.screeps.com/upload/mineral-icons/ZH2O.png) + ![](https://static.screeps.com/upload/mineral-icons/X.png) | 160 | `WORK` | +300% `dismantle` effectiveness |
| ![](https://static.screeps.com/upload/mineral-icons/XZHO2.png)catalyzed zynthium alkalide | ![](https://static.screeps.com/upload/mineral-icons/ZHO2.png) + ![](https://static.screeps.com/upload/mineral-icons/X.png) | 60 | `MOVE` | +300% fatigue decrease speed |
| ![](https://static.screeps.com/upload/mineral-icons/XGH2O.png)catalyzed ghodium acid | ![](https://static.screeps.com/upload/mineral-icons/GH2O.png) + ![](https://static.screeps.com/upload/mineral-icons/X.png) | 80 | `WORK` | +100% `upgradeController` effectiveness without increasing the energy cost |
| ![](https://static.screeps.com/upload/mineral-icons/XGHO2.png)catalyzed ghodium alkalide | ![](https://static.screeps.com/upload/mineral-icons/GHO2.png) + ![](https://static.screeps.com/upload/mineral-icons/X.png) | 150 | `TOUGH` | \-70% damage taken |

#### Commodities

> **Where to get:** a [`Deposit`](https://docs.screeps.com/api/#Deposit) in "highway" rooms.
> **How to get:** send a creep with a `WORK` part and [`harvest`](https://docs.screeps.com/api/#Creep.harvest) it.
> **Needed for:** producing trade commodities and earning credits.

Trade commodities are resources that NPC market traders are most interested in. These resources have no other purpose other than to be sold and generate credits. Producing high-level commodities is the most profitable business in the game.

##### Harvesting

You harvest raw commodities from a [`Deposit`](https://docs.screeps.com/api/#Deposit) in "highway" rooms that divide living sectors on the map. There are 4 types of raw resources: Metal, Silicon, Biomass, Mist. They are distributed unevenly across the world map: one resource type per map quadrant (NW, NE, SW, SE).

![](https://docs.screeps.com/img/commodities.png)

Unlike minerals, these deposits exhaust as you harvest them: the more you harvest, the longer cooldown becomes. They vanish when you stop harvesting it after some time, and reappear elsewhere nearby. Also, a new deposit will appear in the sector if all other deposits are exhausted below some level.

##### Basic commodities

Selling raw resources may be not very profitable. This is why it's a better idea to build a [**Factory**](https://docs.screeps.com/api/#StructureFactory) (available at RCL 7) in order to [`produce`](https://docs.screeps.com/api/#StructureFactory.produce) more complex commodities.

A newly built factory has no level which means it can produce just a few basic commodities out of all kinds of existing resources ("any level" tier in the tables below). They also can be used to store resources in a "compressed" form.

Compressing commodities ![](https://docs.screeps.com/img/commodities1.png)

| Product | Factory | Components | Cooldown |
| --- |  --- |  --- |  --- |
| ![](https://static.screeps.com/upload/mineral-icons/utrium_bar.png)Utrium bar × *100* | Any level | ![](https://static.screeps.com/upload/mineral-icons/U.png)Utrium × *500*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/lemergium_bar.png)Lemergium bar × *100* | Any level | ![](https://static.screeps.com/upload/mineral-icons/L.png)Lemergium × *500*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/zynthium_bar.png)Zynthium bar × *100* | Any level | ![](https://static.screeps.com/upload/mineral-icons/Z.png)Zynthium × *500*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/keanium_bar.png)Keanium bar × *100* | Any level | ![](https://static.screeps.com/upload/mineral-icons/K.png)Keanium × *500*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/ghodium_melt.png)Ghodium melt × *100* | Any level | ![](https://static.screeps.com/upload/mineral-icons/G.png)Ghodium × *500*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/oxidant.png)Oxidant × *100* | Any level | ![](https://static.screeps.com/upload/mineral-icons/O.png)Oxygen × *500*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/reductant.png)Reductant × *100* | Any level | ![](https://static.screeps.com/upload/mineral-icons/H.png)Hydrogen × *500*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/purifier.png)Purifier × *100* | Any level | ![](https://static.screeps.com/upload/mineral-icons/X.png)Catalyst × *500*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/battery.png)Battery × *50* | Any level | ![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *600* | 10 ticks |

You can decompress to recover raw resources when you need them.

 Decompressing commodities ![](https://docs.screeps.com/img/commodities2.png)

| Product | Factory | Components | Cooldown |
| --- |  --- |  --- |  --- |
| ![](https://static.screeps.com/upload/mineral-icons/U.png)Utrium × *500* | Any level | ![](https://static.screeps.com/upload/mineral-icons/utrium_bar.png)Utrium bar × *100*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/L.png)Lemergium × *500* | Any level | ![](https://static.screeps.com/upload/mineral-icons/lemergium_bar.png)Lemergium bar × *100*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/Z.png)Zynthium × *500* | Any level | ![](https://static.screeps.com/upload/mineral-icons/zynthium_bar.png)Zynthium bar × *100*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/K.png)Keanium × *500* | Any level | ![](https://static.screeps.com/upload/mineral-icons/keanium_bar.png)Keanium bar × *100*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/G.png)Ghodium × *500* | Any level | ![](https://static.screeps.com/upload/mineral-icons/ghodium_melt.png)Ghodium melt × *100*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/O.png)Oxygen × *500* | Any level | ![](https://static.screeps.com/upload/mineral-icons/oxidant.png)Oxidant × *100*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/H.png)Hydrogen × *500* | Any level | ![](https://static.screeps.com/upload/mineral-icons/reductant.png)Reductant × *100*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/X.png)Catalyst × *500* | Any level | ![](https://static.screeps.com/upload/mineral-icons/purifier.png)Purifier × *100*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *200* | 20 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *500* | Any level | ![](https://static.screeps.com/upload/mineral-icons/battery.png)Battery × *50* | 10 ticks |

When you gain access to regional deposit resources, you can start producing additional basic commodities from them.

Basic regional commodities ![](https://docs.screeps.com/img/commodities3.png)

| Product | Factory | Components | Cooldown |
| --- |  --- |  --- |  --- |
| ![](https://static.screeps.com/upload/mineral-icons/wire.png)Wire × *20* | Any level | ![](https://static.screeps.com/upload/mineral-icons/utrium_bar.png)Utrium bar × *20*![](https://static.screeps.com/upload/mineral-icons/silicon.png)Silicon × *100*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *40* | 8 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/cell.png)Cell × *20* | Any level | ![](https://static.screeps.com/upload/mineral-icons/lemergium_bar.png)Lemergium bar × *20*![](https://static.screeps.com/upload/mineral-icons/biomass.png)Biomass × *100*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *40* | 8 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/alloy.png)Alloy × *20* | Any level | ![](https://static.screeps.com/upload/mineral-icons/zynthium_bar.png)Zynthium bar × *20*![](https://static.screeps.com/upload/mineral-icons/metal.png)Metal × *100*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *40* | 8 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/condensate.png)Condensate × *20* | Any level | ![](https://static.screeps.com/upload/mineral-icons/keanium_bar.png)Keanium bar × *20*![](https://static.screeps.com/upload/mineral-icons/mist.png)Mist × *100*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *40* | 8 ticks |
All commodities above can be produced in a factory of any level.

##### Higher commodities

The full use of factories is possible with [Operators](https://docs.screeps.com/power.html#Power-Creeps) only, and their `OPERATE_FACTORY` power. When an Operator uses this power on a factory without a level, the level of the factory is permanently set to the level of the power, and the same effect is applied on the factory. It enables the factory to produce commodities of the corresponding level. The factory can only produce commodities of exactly the same level, or "any level" commodities. Once set, the factory level cannot be changed. When the effect duration ends, the factory simply becomes inactive, but its level remains the same ("any level" commodities are still available though). You need an Operator with the same power level to reactivate it again. Another level cannot be applied, the only way to change the factory level is to rebuild it.

Each of high-level commodities requires lower level commodities to be produced which forms production chains. There are four production chains, one for each of new resource types: **Mechanical** (consumes Metal), **Electronical** (consumes Silicon), **Biological** (consumes Biomass), and **Mystical** (consumes Mist), as well as common components. These commodities have the most lucrative prices on the market.

Common higher commodities ![](https://docs.screeps.com/img/commodities4.png)

| Product | Factory | Components | Cooldown |
| --- |  --- |  --- |  --- |
| ![](https://static.screeps.com/upload/mineral-icons/composite.png)Composite × *20* | Lvl 1 | ![](https://static.screeps.com/upload/mineral-icons/utrium_bar.png)Utrium bar × *20*![](https://static.screeps.com/upload/mineral-icons/zynthium_bar.png)Zynthium bar × *20*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *20* | 50 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/crystal.png)Crystal × *6* | Lvl 2 | ![](https://static.screeps.com/upload/mineral-icons/lemergium_bar.png)Lemergium bar × *6*![](https://static.screeps.com/upload/mineral-icons/keanium_bar.png)Keanium bar × *6*![](https://static.screeps.com/upload/mineral-icons/purifier.png)Purifier × *6*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *45* | 21 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/liquid.png)Liquid × *12* | Lvl 3 | ![](https://static.screeps.com/upload/mineral-icons/oxidant.png)Oxidant × *12*![](https://static.screeps.com/upload/mineral-icons/reductant.png)Reductant × *12*![](https://static.screeps.com/upload/mineral-icons/ghodium_melt.png)Ghodium melt × *12*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *90* | 60 ticks |

 Mechanical chain ![](https://docs.screeps.com/img/commodities5.png)

| Product | Factory | Components | Cooldown |
| --- |  --- |  --- |  --- |
| ![](https://static.screeps.com/upload/mineral-icons/tube.png)Tube × *2* | Lvl 1 | ![](https://static.screeps.com/upload/mineral-icons/alloy.png)Alloy × *40*![](https://static.screeps.com/upload/mineral-icons/zynthium_bar.png)Zynthium bar × *16*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *8* | 45 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/fixtures.png)Fixtures | Lvl 2 | ![](https://static.screeps.com/upload/mineral-icons/composite.png)Composite × *20*![](https://static.screeps.com/upload/mineral-icons/alloy.png)Alloy × *41*![](https://static.screeps.com/upload/mineral-icons/oxidant.png)Oxidant × *161*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *8* | 115 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/frame.png)Frame | Lvl 3 | ![](https://static.screeps.com/upload/mineral-icons/fixtures.png)Fixtures × *2*![](https://static.screeps.com/upload/mineral-icons/tube.png)Tube × *4*![](https://static.screeps.com/upload/mineral-icons/reductant.png)Reductant × *330*![](https://static.screeps.com/upload/mineral-icons/zynthium_bar.png)Zynthium bar × *31*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *16* | 125 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/hydraulics.png)Hydraulics | Lvl 4 | ![](https://static.screeps.com/upload/mineral-icons/liquid.png)Liquid × *150*![](https://static.screeps.com/upload/mineral-icons/fixtures.png)Fixtures × *3*![](https://static.screeps.com/upload/mineral-icons/tube.png)Tube × *15*![](https://static.screeps.com/upload/mineral-icons/purifier.png)Purifier × *208*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *32* | 800 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/machine.png)Machine | Lvl 5 | ![](https://static.screeps.com/upload/mineral-icons/hydraulics.png)Hydraulics × *1*![](https://static.screeps.com/upload/mineral-icons/frame.png)Frame × *2*![](https://static.screeps.com/upload/mineral-icons/fixtures.png)Fixtures × *3*![](https://static.screeps.com/upload/mineral-icons/tube.png)Tube × *12*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *64* | 600 ticks |

 Biological chain ![](https://docs.screeps.com/img/commodities6.png)

| Product | Factory | Components | Cooldown |
| --- |  --- |  --- |  --- |
| ![](https://static.screeps.com/upload/mineral-icons/phlegm.png)Phlegm × *2* | Lvl 1 | ![](https://static.screeps.com/upload/mineral-icons/cell.png)Cell × *20*![](https://static.screeps.com/upload/mineral-icons/oxidant.png)Oxidant × *36*![](https://static.screeps.com/upload/mineral-icons/lemergium_bar.png)Lemergium bar × *16*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *8* | 35 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/tissue.png)Tissue × *2* | Lvl 2 | ![](https://static.screeps.com/upload/mineral-icons/phlegm.png)Phlegm × *10*![](https://static.screeps.com/upload/mineral-icons/cell.png)Cell × *10*![](https://static.screeps.com/upload/mineral-icons/reductant.png)Reductant × *110*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *16* | 164 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/muscle.png)Muscle | Lvl 3 | ![](https://static.screeps.com/upload/mineral-icons/tissue.png)Tissue × *3*![](https://static.screeps.com/upload/mineral-icons/phlegm.png)Phlegm × *3*![](https://static.screeps.com/upload/mineral-icons/zynthium_bar.png)Zynthium bar × *50*![](https://static.screeps.com/upload/mineral-icons/reductant.png)Reductant × *50*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *16* | 250 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/organoid.png)Organoid | Lvl 4 | ![](https://static.screeps.com/upload/mineral-icons/muscle.png)Muscle × *1*![](https://static.screeps.com/upload/mineral-icons/tissue.png)Tissue × *5*![](https://static.screeps.com/upload/mineral-icons/purifier.png)Purifier × *208*![](https://static.screeps.com/upload/mineral-icons/oxidant.png)Oxidant × *256*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *32* | 800 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/organism.png)Organism | Lvl 5 | ![](https://static.screeps.com/upload/mineral-icons/organoid.png)Organoid × *1*![](https://static.screeps.com/upload/mineral-icons/liquid.png)Liquid × *150*![](https://static.screeps.com/upload/mineral-icons/tissue.png)Tissue × *6*![](https://static.screeps.com/upload/mineral-icons/cell.png)Cell × *310*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *64* | 600 ticks |

 Electronical chain ![](https://docs.screeps.com/img/commodities7.png)

| Product | Factory | Components | Cooldown |
| --- |  --- |  --- |  --- |
| ![](https://static.screeps.com/upload/mineral-icons/switch.png)Switch × *5* | Lvl 1 | ![](https://static.screeps.com/upload/mineral-icons/wire.png)Wire × *40*![](https://static.screeps.com/upload/mineral-icons/oxidant.png)Oxidant × *95*![](https://static.screeps.com/upload/mineral-icons/utrium_bar.png)Utrium bar × *35*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *20* | 70 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/transistor.png)Transistor | Lvl 2 | ![](https://static.screeps.com/upload/mineral-icons/switch.png)Switch × *4*![](https://static.screeps.com/upload/mineral-icons/wire.png)Wire × *15*![](https://static.screeps.com/upload/mineral-icons/reductant.png)Reductant × *85*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *8* | 59 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/microchip.png)Microchip | Lvl 3 | ![](https://static.screeps.com/upload/mineral-icons/transistor.png)Transistor × *2*![](https://static.screeps.com/upload/mineral-icons/composite.png)Composite × *50*![](https://static.screeps.com/upload/mineral-icons/wire.png)Wire × *117*![](https://static.screeps.com/upload/mineral-icons/purifier.png)Purifier × *25*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *16* | 250 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/circuit.png)Circuit | Lvl 4 | ![](https://static.screeps.com/upload/mineral-icons/microchip.png)Microchip × *1*![](https://static.screeps.com/upload/mineral-icons/transistor.png)Transistor × *5*![](https://static.screeps.com/upload/mineral-icons/switch.png)Switch × *4*![](https://static.screeps.com/upload/mineral-icons/oxidant.png)Oxidant × *115*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *32* | 800 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/device.png)Device | Lvl 5 | ![](https://static.screeps.com/upload/mineral-icons/circuit.png)Circuit × *1*![](https://static.screeps.com/upload/mineral-icons/microchip.png)Microchip × *3*![](https://static.screeps.com/upload/mineral-icons/crystal.png)Crystal × *110*![](https://static.screeps.com/upload/mineral-icons/ghodium_melt.png)Ghodium melt × *150*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *64* | 600 ticks |

 Mystical chain ![](https://docs.screeps.com/img/commodities8.png)

| Product | Factory | Components | Cooldown |
| --- |  --- |  --- |  --- |
| ![](https://static.screeps.com/upload/mineral-icons/concentrate.png)Concentrate × *3* | Lvl 1 | ![](https://static.screeps.com/upload/mineral-icons/condensate.png)Condensate × *30*![](https://static.screeps.com/upload/mineral-icons/keanium_bar.png)Keanium bar × *15*![](https://static.screeps.com/upload/mineral-icons/reductant.png)Reductant × *54*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *12* | 41 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/extract.png)Extract × *2* | Lvl 2 | ![](https://static.screeps.com/upload/mineral-icons/concentrate.png)Concentrate × *10*![](https://static.screeps.com/upload/mineral-icons/condensate.png)Condensate × *30*![](https://static.screeps.com/upload/mineral-icons/oxidant.png)Oxidant × *60*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *16* | 128 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/spirit.png)Spirit | Lvl 3 | ![](https://static.screeps.com/upload/mineral-icons/extract.png)Extract × *2*![](https://static.screeps.com/upload/mineral-icons/concentrate.png)Concentrate × *6*![](https://static.screeps.com/upload/mineral-icons/reductant.png)Reductant × *90*![](https://static.screeps.com/upload/mineral-icons/purifier.png)Purifier × *20*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *16* | 200 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/emanation.png)Emanation | Lvl 4 | ![](https://static.screeps.com/upload/mineral-icons/spirit.png)Spirit × *2*![](https://static.screeps.com/upload/mineral-icons/extract.png)Extract × *2*![](https://static.screeps.com/upload/mineral-icons/concentrate.png)Concentrate × *3*![](https://static.screeps.com/upload/mineral-icons/keanium_bar.png)Keanium bar × *112*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *32* | 800 ticks |
| ![](https://static.screeps.com/upload/mineral-icons/essence.png)Essence | Lvl 5 | ![](https://static.screeps.com/upload/mineral-icons/emanation.png)Emanation × *1*![](https://static.screeps.com/upload/mineral-icons/spirit.png)Spirit × *3*![](https://static.screeps.com/upload/mineral-icons/crystal.png)Crystal × *110*![](https://static.screeps.com/upload/mineral-icons/ghodium_melt.png)Ghodium melt × *150*![](https://static.screeps.com/upload/mineral-icons/energy.png)Energy × *64* | 600 ticks |

#### Power

> **Where to get:** a [`StructurePowerBank`](https://docs.screeps.com/api/#StructurePowerBank) in "highway" rooms.
> **How to get:** destroy the structure and loot the dropped resource.
> **Needed for:** creating Power Creeps.

See this article for more info: [Power](https://docs.screeps.com/power.html).

### Market System
[Market](https://docs.screeps.com/market.html)

The market in Screeps allows to trade various resources between players by means of special structures called [Terminals](https://docs.screeps.com/api/#StructureTerminal). They are able to instantly transfer resources to other rooms at any distance.

Trading on this market requires the in-game currency called **Credits**. Your credits are tied to your account and serve to execute your market orders.

> In order to get your first credits, deal with someone who already has a market buy order.

#### Market orders

The market system is based on **sell and buy orders** tied to your terminals. By creating an order, you designate the terminal, type, and amount of the resource to sell or buy, as well as its price for one unit in credits. Each placed order is visible to all the players in all the game world at the [Market](https://screeps.com/a/#!/market) page or via API method [`Game.market.getAllOrders`](https://docs.screeps.com/api/#Game.market.getAllOrders). Creating any order is subject to a 5% fee in credits.

To execute a trade, the second party also has to have a terminal to receive the resource (when buying from a sell order) or to send out (when selling to a buy order). You complete a trade by using the market interface or the method [`Game.market.deal`](https://docs.screeps.com/api/#Game.market.deal) and designating the other player's order, your terminal, and the amount of resources wanted. Then the two terminals automatically carry out the transaction, the buyer's account is charged with the corresponding amount of credits, and this amount is passed to the seller.

> The energy expenses to transfer resources from one terminal to another are always on the party who executes the deal rather than the order's owner, even in the case of buying a resource upon a sell order. The same is true for terminal cooldown.

An order cannot be executed until the selling terminal has enough resource to sell, or the user has enough credits to buy. Until that happens, the order remains inactive.

#### Examples

Here are a few examples to understand the underlying mechanics.

-   Assume that the player Alice creates a buy order for 1000 units of utrium acid at the price 10 Cr a unit. To create this order, Alice designates her terminal in the room W1N1 and instantly pays a 500 Cr fee.
-   Player Bob discovers Alice's order and decides to sell 200 units of utrium acid from his reserves. Bob's terminal is in the room W4N2, i.e. 3 rooms away. Therefore, his expenses on sending 200 units of the resource will be 60 of energy. Bob executes the trade on the given order, and 200 of ultrium acid are automatically transported from W4N2 to W1N1, Bob gets 2,000 Cr, and Bob's terminal in W4N2 loses 60 energy units.
-   Now Bob wants to spend these credits and buy some energy from the player Charlie who offers it through his sell order in the room W1N5 at the price of 0.5 Cr per unit. The 2,000 Cr that Bob earned get him 4,000 energy units. However, the 4-room distance requires covering energy costs of 1,600 energy units. This amount should have been in the Bob's terminal prior to the trade deal execution. Charlie gets 2,000 Cr and doesn't spend any energy on the transfer.

This story results in the following balance shift between the players involved:

-   Alice (created a buy order, 1000 utrium acid): +200 utrium acid, -500-2000 credits.
-   Charlie (sell order, energy): -4000 energy, +2000 credits.
-   Bob (dealer): -200 utrium acid, +4000-60-1600 energy, +2000-2000 credits.

#### NPC Terminals

All the "highway crossroads" between sectors (i.e. in the rooms W0N0, W10N0, W10N10, etc.) contain neutral NPC Terminals. You can trade with these terminals the same way as with real players using the market interface or the object [`Game.market`](https://docs.screeps.com/api/#Game.market). The orders in NPC terminals have limited resources amounts and get replenished according to a set of rules. Although they don't boast the most competitive prices, they allow you to convert your resource surplus into credits, and vice versa.

### NPC Invaders
[NPC Invaders](https://docs.screeps.com/invaders.html)

### Power
[Power](https://docs.screeps.com/power.html)

## Scripting
### Scripting Basics
[Scripting Basics](https://docs.screeps.com/scripting-basics.html)

### Global Objects
[Global Objects](https://docs.screeps.com/global-objects.html)

### Modules
[Modules](https://docs.screeps.com/modules.html)

### Debugging
[Debugging](httpsdocs.screeps.com/debugging.html)

### Understanding game loop, time and ticks
[Game Loop](https://docs.screeps.com/game-loop.html)

### Committing scripts using external tools
[External Commit](https://docs.screeps.com/commit.html)

### Simultaneous execution of creep actions
[Simultaneous Actions](https://docs.screeps.com/simultaneous-actions.html)

### How does CPU limit work
[CPU Limit](https://docs.screeps.com/cpu-limit.html)

## Other
### Server-side architecture overview
[Server-side Architecture](https://docs.screeps.com/architecture.html)

### Public Test Realm (PTR)
[Public Test Realm (PTR)](https://docs.screeps.com/ptr.html)
