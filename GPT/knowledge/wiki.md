# Automatic base building

Automatic base building is the process of finding, claiming and, building up a claimed room without using the UI and direct user input. For many, a fully automatic bot is the end-goal, and automatic base building is a large step towards it.

## Contents

-   [1Types](https://wiki.screepspl.us/index.php/Automatic_base_building#Types)
    -   [1.1Bunker](https://wiki.screepspl.us/index.php/Automatic_base_building#Bunker)
    -   [1.2Stamp/Tile-sets](https://wiki.screepspl.us/index.php/Automatic_base_building#Stamp/Tile-sets)
        -   [1.2.1Extensions](https://wiki.screepspl.us/index.php/Automatic_base_building#Extensions)
        -   [1.2.2Labs](https://wiki.screepspl.us/index.php/Automatic_base_building#Labs)
        -   [1.2.3Towers](https://wiki.screepspl.us/index.php/Automatic_base_building#Towers)
        -   [1.2.4Anchor & central fill clusters](https://wiki.screepspl.us/index.php/Automatic_base_building#Anchor_&_central_fill_clusters)
    -   [1.3Dynamic/Pattern Generation](https://wiki.screepspl.us/index.php/Automatic_base_building#Dynamic/Pattern_Generation)
-   [2Useful Algorithms](https://wiki.screepspl.us/index.php/Automatic_base_building#Useful_Algorithms)
    -   [2.1Distance-Transform](https://wiki.screepspl.us/index.php/Automatic_base_building#Distance-Transform)
    -   [2.2Flood Fill](https://wiki.screepspl.us/index.php/Automatic_base_building#Flood_Fill)
    -   [2.3Minimum Cut](https://wiki.screepspl.us/index.php/Automatic_base_building#Minimum_Cut)

## Types

There's a few types of automatic bases, depending on method used.

### Bunker

The easiest by far is to have a pre-defined 'bunker' object containing all structures and their locations that you intend to place. An anchor, or the center of the bunker's intended location, can give an offset from where you can place your bunker. So long as an area has enough space, bunkers are a great start with automated basing.

[![BunkerExample.png](https://wiki.screepspl.us/images/4/45/BunkerExample.png)](https://wiki.screepspl.us/index.php/File:BunkerExample.png)

### Stamp/Tile-sets

Normally using a core tile/stamp, you can then determine locations for other pre-defined tile-sets/stamps to be placed around your anchor dependent on the terrain in the room. This allows for more flexibility in rooms that do not have large-open spaces that bunkers can not fit in, while still allowing for already designed and known-to-work types of tiles insuring for example, that labs are in-range of other labs for reactions, extensions are in reachable and manageable locations, spawns have open area for creeps to exit, and so on.

Stamps, while more difficult to place and manage, can be an optimal improvement to bunkers, as they can better exploit terrain to reduce the need for barricades. Moreover they can allow for more optimal filling, as well as tower placement based around common attack locations or high-damage positions.

[![Stamp Example.png](https://wiki.screepspl.us/images/9/91/Stamp_Example.png)](https://wiki.screepspl.us/index.php/File:Stamp_Example.png)

Expand for examples of Extension tile sets, or don't, If you want to make your own.

#### Extensions

Extension 'field' or groups come in many different shapes and sizes, and can be one-set, or many smaller tiles. Roads often surround or weave to allow for haulers with a 2:1 carry to move ratio.[![](https://wiki.screepspl.us/images/2/2f/Plus.png)](https://wiki.screepspl.us/index.php/File:Plus.png)
A plus, tile able extension field.

[![](https://wiki.screepspl.us/images/f/f2/LargePlus.png)](https://wiki.screepspl.us/index.php/File:LargePlus.png)
A large plus.

[![](https://wiki.screepspl.us/images/4/4d/Hallway.png)](https://wiki.screepspl.us/index.php/File:Hallway.png)
A hallway tile type

[![](https://wiki.screepspl.us/images/b/b5/DissiFlower.png)](https://wiki.screepspl.us/index.php/File:DissiFlower.png)
A Dissi Flower extension field

[![](https://wiki.screepspl.us/images/e/e7/RapidFillCluster.png)](https://wiki.screepspl.us/index.php/File:RapidFillCluster.png)
A rapid-fill cluster.

[![](https://wiki.screepspl.us/images/0/0f/EyeofEzic.png)](https://wiki.screepspl.us/index.php/File:EyeofEzic.png)
An extension field some-what resembling the Ezic's symbol from 'Papers Please'

Expand for example of lab tile sets.

#### Labs

Labs are often placed so every lab is in range of 2 to 2 'source labs' to allow for optimal compound production. When placing labs you should also consider their ability to engage in lab rotation with boost production, alongside ease of boosting and unboosting. Containers are often placed adjacent to labs to allow for unboosting resources to drop into them.[![](https://wiki.screepspl.us/images/f/fe/Infinilabs.png)](https://wiki.screepspl.us/index.php/File:Infinilabs.png)
Labs in a figure 8 or 'infinity' symbol shape, hallway allows pass-though and 2 position filling of all labs

[![](https://wiki.screepspl.us/images/2/27/LabStack.png)](https://wiki.screepspl.us/index.php/File:LabStack.png)
A stack of labs, where all 8 production labs can reach 2 source labs.

CollapseExpand for examples of Tower tile sets.

#### Towers

Towers can be clustered in a single area to allow for ease of refilling, though consequently they will likely have reduced damage.[![](https://wiki.screepspl.us/images/a/a5/TowerA.png)](https://wiki.screepspl.us/index.php/File:TowerA.png)
A single-tile-to-fill cluster of towers

[![](https://wiki.screepspl.us/images/c/c4/TowerB.png)](https://wiki.screepspl.us/index.php/File:TowerB.png)
A Hallway style tile single-fill tower cluster.

CollapseExpand for examples of Anchor tile sets.

#### Anchor & central fill clusters

A 'hub', 'anchor' or 'center' fill location can often take 1~ creeps to manage and can be relatively small. They will likely include the terminal and storage, alongside the factory, power spawn and possibly nuker and spawns, and may have the rest of the base planned around it.

[![](https://wiki.screepspl.us/images/c/cc/AnchorExample.png)](https://wiki.screepspl.us/index.php/File:AnchorExample.png)
An example of a single-fill-creep position for multiple structures.

### Dynamic/Pattern Generation

Using a given open area, you can generate a structure or set of structures grouped together based on some basic rules. Some examples would include generating extension fields for one or more fillers to fill, calculating the best position for towers to sit for maximum damage on walls (instead of in a tight fill-group pattern), and so on.

[![Dynamic Base.png](https://wiki.screepspl.us/images/4/4c/Dynamic_Base.png)](https://wiki.screepspl.us/index.php/File:Dynamic_Base.png)

## Useful Algorithms

There are several useful algorithms to take into consideration when automatically building your base.

### Distance-Transform

[Distance Transformation](https://en.wikipedia.org/wiki/Distance_transform) can be paired with room terrain data, such walls and non-walls, to score each room position (in something like a CostMatrix) based on their distance from the closest wall. This is great for finding large open locations to place things like bunkers.

[![Distance Transform Example.png](https://wiki.screepspl.us/images/7/7e/Distance_Transform_Example.png)](https://wiki.screepspl.us/index.php/File:Distance_Transform_Example.png)

### Flood Fill

[Flood Fill](https://en.wikipedia.org/wiki/Flood_fill) is useful for defining or testing areas to make sure they are secure (like if there are barricades all around a base) or sectioning areas into groups. Filling an area and gathering room positions allows you to use these positions later, for whatever purpose you see fit.

[![PrototypeFloodFill.png](https://wiki.screepspl.us/images/4/44/PrototypeFloodFill.png)](https://wiki.screepspl.us/index.php/File:PrototypeFloodFill.png)

### Minimum Cut

[Minimum Cut](https://en.wikipedia.org/wiki/Minimum_cut "wikipedia:Minimum cut") is useful for rampart and wall placement based around weighted graphs, meaning barricades can be placed at terrain chokepoints, for example.

[![MincutResult.png](https://wiki.screepspl.us/images/0/05/MincutResult.png)](https://wiki.screepspl.us/index.php/File:MincutResult.png)[![Mincutbase.png](https://wiki.screepspl.us/images/7/78/Mincutbase.png)](https://wiki.screepspl.us/index.php/File:Mincutbase.png)

[Category](https://wiki.screepspl.us/index.php/Special:Categories "Special:Categories"): 

-   [Strategy](https://wiki.screepspl.us/index.php/Category:Strategy "Category:Strategy")

# Creep

A creep is the main unit of Screeps. They are created from [spawns](https://wiki.screepspl.us/index.php/StructureSpawn "StructureSpawn") and have bodies made of several different [parts](https://wiki.screepspl.us/index.php?title=Parts&action=edit&redlink=1 "Parts (page does not exist)") up to a total of 50. The configuration is entirely up to the user as long as enough [energy](https://wiki.screepspl.us/index.php/Energy "Energy") is available in the [room](https://wiki.screepspl.us/index.php/Room "Room") to spawn them. Their role in a colony is entirely dependent on the user, as beyond the body giving different abilities to creep, there is no predefined role for any given configuration.

You can learn more about creeps by visiting its [API](https://docs.screeps.com/api/#Creep) page or [Docs](https://docs.screeps.com/creeps.html) page



# Energy

Energy is overwhelmingly gathered through the mining of [Sources](https://wiki.screepspl.us/index.php/Source "Source"), but can also be gathered through [Market](https://wiki.screepspl.us/index.php/Market "Market") transactions. In some cases, Energy is used by players as a form of currency, and can be used to indirectly transfer credits to other players, as energy prices are (relatively) stable and can be easily sold.

Energy management is key to success in Screeps. [Storages](https://wiki.screepspl.us/index.php/StructureStorage "StructureStorage"), [Links](https://wiki.screepspl.us/index.php/StructureLink "StructureLink"), [Containers](https://wiki.screepspl.us/index.php?title=StructureContainer&action=edit&redlink=1 "StructureContainer (page does not exist)"), all help provide ways to manage and store energy.

## Contents

-   [1Getting Energy](https://wiki.screepspl.us/index.php/Energy#Getting_Energy)
    -   [1.1Harvesting](https://wiki.screepspl.us/index.php/Energy#Harvesting)
    -   [1.2Purchasing from the market](https://wiki.screepspl.us/index.php/Energy#Purchasing_from_the_market)
    -   [1.3Recycling & Dead creeps](https://wiki.screepspl.us/index.php/Energy#Recycling_&_Dead_creeps)
-   [2Transporting Energy](https://wiki.screepspl.us/index.php/Energy#Transporting_Energy)
    -   [2.1Using Creeps](https://wiki.screepspl.us/index.php/Energy#Using_Creeps)
        -   [2.1.1Bucket Chain](https://wiki.screepspl.us/index.php/Energy#Bucket_Chain)
        -   [2.1.2Haulers & Transports](https://wiki.screepspl.us/index.php/Energy#Haulers_&_Transports)
    -   [2.2Using Links](https://wiki.screepspl.us/index.php/Energy#Using_Links)
    -   [2.3Using Extensions, Spawning & Recycling](https://wiki.screepspl.us/index.php/Energy#Using_Extensions,_Spawning_&_Recycling)
-   [3Storing Energy](https://wiki.screepspl.us/index.php/Energy#Storing_Energy)
    -   [3.1Storage](https://wiki.screepspl.us/index.php/Energy#Storage)
    -   [3.2Containers](https://wiki.screepspl.us/index.php/Energy#Containers)
    -   [3.3Terminals](https://wiki.screepspl.us/index.php/Energy#Terminals)
    -   [3.4Factory & Batteries](https://wiki.screepspl.us/index.php/Energy#Factory_&_Batteries)

## Getting Energy

There are a few different ways to acquire energy.

### Harvesting

The most basic and first way to acquire energy is to harvest it. This simply requires a creep with one or more WORK parts adjacent to a source execute a harvest action on the source. If the creep has CARRY parts and available room within those parts, the energy harvested will be stored automatically there. Any energy that is harvested that will not fit within a creep's CARRY parts will be 'dropped' to the ground, if there is a container underneath the creep w/ available room in its store when this happens, the energy will be transferred into the container's store. Like with the creep, if there is no room in the container, or there is no container, the energy will be deposited to the ground as a 'dropped' resource. It will start to decay (evaporate/sublimate) at a rate dependent on how much energy is in the pool/pile ( Code wise: `ceil(amount/1000)` ) per tick.

Harvesting generally starts out at low-to-start RCL with generic workers or harvester roles gathering energy to start building up the room, however [static mining](https://wiki.screepspl.us/index.php/Static_Harvesting "Static Harvesting") / harvesting is normally swapped to in short order as a specialized or specific creep can more easily strip a source of its energy before regeneration. It is important to mine out the energy before the regeneration as a source will only regenerate to its 'maximum' (3000 normally in an owned/claimed room) and no higher. So if a source is not harvested fully in the time before its regeneration, generally this means that energy that could be used for the colony is 'lost', or a different way of thinking is that the energy that 'could' have been generated from an empty source, was not as there was still some energy, thus reducing the 'maximum' amount of energy you can harness. Example: A source starts with 3000 energy, creeps harvest it to 1200 energy, when the regeneration timer triggers, the source is now 3000 energy again but only 'generated' 1800 energy to get back to its maximum instead of the fully 3000 it 'could' have.

Effective energy harvesting allows for more work a room/colony can do. It is up to the user to determine/implement the best strategy they can.

### Purchasing from the market

Another common way on RCL 6 and after to get energy is from the [market](https://wiki.screepspl.us/index.php/Market "Market"). Some users do not use all the energy they have, and as such sell it. While other users for various reasons need more energy to do more than they could harvest in their area. Normally the 'best' way to purchase energy is from creating a buy order. This is because when any terminal transaction is done, the dealer of the transaction must pay energy to complete it. If you purchase energy from a sell order, energy must be spent 'acquiring' the energy, and less overall energy is gained. That's not to say its not done, or impossible to profit from doing it different, it just requires careful calculation of how it will benefit your script.

### Recycling & Dead creeps

A creep that has 'fulfilled its purpose' can be recycled by a spawn calling [recycle creep](https://docs.screeps.com/api/#StructureSpawn.recycleCreep) on it. While the energy is limited to 125 per part, and is adjusted for its remaining/how much ticks-to-live it has, if the creep you were using has a specific mission it has completed and it is no longer needed, it is possible to recoup some of the energy spent on it. The energy will be 'stored' in the creeps tombstone for the ticks it exists, then dropped to the floor.

Similarly, a creep or [invader](https://wiki.screepspl.us/index.php/Invader "Invader") that dies (as long as the invader was not spawned by the user) will drop some energy on-death. While not a ton, opportune harvesting of this resource allows for more input with little effort spent/energy spent.

## Transporting Energy

There are a few different ways to transport energy around a room/colony.

### Using Creeps

Creeps could be considered the 'main' way to transport energy around a room, but their by no means the only way.

#### Bucket Chain

A 'Bucket Chain' is when two or more creeps use [transfer](https://docs.screeps.com/api/#Creep.transfer) to send energy along multiple adjacent creeps from one destination to another (like people handing buckets of water along a chain of people to combat a fire), normally from a source of energy to a desired use (like upgrading) or storage (like a container/storage). Energy held/transported in this matter keeps it from 'decaying' on the ground, insures rapid transit along the chain, and requires little-to-no movement from the creeps in the chain. However, due to [intents](https://wiki.screepspl.us/index.php/Intent "Intent") each transfer call does cost the flat 0.2 tax as such it can get CPU expensive quickly. It is up to the user how to balance their CPU vs energy maintained and how to best implement their desired method.

#### Haulers & Transports

Likely the most common form of energy transportation, creeps with primarily CARRY & MOVE parts withdraw/pickup energy from a source and bring it to a place of storage or use. How these creeps are structured and utilized quite varies from bot-to-bot. Some common implementations include:

-   Using specific-sized 'haulers' to go one route between a source & storage, never changing and hauling the same route
-   Using generic/large sized 'haulers' to acquire energy on a mission or task based system, where depending on need they are assigned to pickup/withdraw energy from one source, and transport it where needed.

When creating hauler(s) generally keep in mind:

-   how big does one or more haulers have to be? Too large, and its wasted energy/time spawning, too small and it won't bring in enough to be worth the cost.
-   How many haulers do I need? Too few, or too many again, wastes energy.
-   How are they going to determine where/when they need to fetch energy/return it?
-   How do I want to budget CPU for their trips/searching?

### Using Links

[Links](https://wiki.screepspl.us/index.php/StructureLink "StructureLink") are commonly used mid-to-late RCL methods of transporting energy, that cost 3% of energy being transmitted via link along with a short cool-down before they can fire again, dependent on range. They have multiple uses within a colony, check out the [links](https://wiki.screepspl.us/index.php/StructureLink "StructureLink") page to see some implementations.

### Using Extensions, Spawning & Recycling

Another way of transporting energy is to use [extensions](https://docs.screeps.com/api/#StructureExtension). Primarily this method involves a creep transferring energy into extensions (normally by a source, or other 'source' of energy), then using a spawn spawnCreep's `energyStructures` opt to specify what extensions are going to be used in the spawning process. The spawn will then use these in order of the array provided to spawn the specified creep. Once spawned, the creep can be immediately recycled, which results in the energy spent being deposited (up to 125 per part/dependent on TTL) into a tombstone. That energy can then be withdrawn/picked up by creeps and transferred to other extensions, spawns, containers or storages. This makes it a very fast way to transfer sums of energy around a room without too much loss. There are some limitations to this method, as previously mentioned only 125 energy per-part is available as such larger/more costly parts such as CLAIM, RANGED\_ATTACK and HEAL, will always 'lose' energy (as their cost is higher than 125). This also requires the spawn to be spawning a creep (at 3 ticks per body part), which does use up time it could be spawning other creeps.

## Storing Energy

Keeping energy for later use, or for high-demand times such as defense or repair is key.

### Storage

At RCL 4 and beyond, a [storage](https://docs.screeps.com/api/#StructureStorage) is a very useful and high capacity energy storage option. With 1,000,000 capacity for resources, and the ability to expand it even further for periods of time using [powerCreeps](https://wiki.screepspl.us/index.php/Power "Power") it is hard to beat. Storages are often used as the 'center' storage location that most creeps deposit to, and then energy is withdrawn from it for various tasks within the room.

### Containers

Available at RCL 0 (meaning you can build them even in unclaimed rooms), you can have up to five containers in a room. Containers offer a modest 2000 resource storage capacity and decay at a rate dependent on ownership of the room, but are very flexible as they are pathable (walkable) by creeps, can take energy 'dropped' onto them into their storage without calling transfer and make for good buffer or short-term storages. Containers have all sorts of use-cases, from [drop mining](https://wiki.screepspl.us/index.php/Static_Harvesting "Static Harvesting"), mineral mining, capacitors for spawning, holding energy for upgraders/spawners, storing the result of unboosting creeps and so on. It is up to the user how best to spend their five containers a room, if they even wish to use all five.

### Terminals

Terminals are available at RCL 6 and onward in a room, they can store up to 300,000 resources and send resources to other rooms/make market details at the cost of energy and a short cooldown (which can be reduced with a powerCreep's power). They are very useful in sending energy from a high-gaining room to a lower one, to be used more effectively or in reinforcing/restocking a room that is under siege (though power creeps in power enabled rooms can reduce their effectiveness)

### Factory & Batteries

A factory available at RCL 7, does have a medium 50,000 storage capacity for resource on its own, however it does shine in helping store energy via the 'compression' or conversion of energy into batteries. Batteries cost 600 energy to produce a quantity of 50, meaning a 'cost' of 100 energy to store 500 energy in a smaller form and can be 'decompressed' or converted back into energy at the cost of 50 batteries into 500 energy. While some energy is lost in the conversion, this allows more energy to be stored in a 'smaller' space, or more energy to be sent via terminal with less cost (as terminals cost energy to send resources, the 'more' of a resource you send, the higher the cost.)

[Categories](https://wiki.screepspl.us/index.php/Special:Categories "Special:Categories"): 

-   [Stubs](https://wiki.screepspl.us/index.php/Category:Stubs "Category:Stubs")
-   [In-Game Objects](https://wiki.screepspl.us/index.php/Category:In-Game_Objects "Category:In-Game Objects")
-   [Game Knowledge](https://wiki.screepspl.us/index.php/Category:Game_Knowledge "Category:Game Knowledge")
-   [In-Game Resources](https://wiki.screepspl.us/index.php/Category:In-Game_Resources "Category:In-Game Resources")



# Generic Creeps

The term 'Generic Creeps' normally refers to creeps that do not have one specific [role](https://wiki.screepspl.us/index.php/Roles "Roles") that they preform for all time, but are suited and tasked with preforming multiple functions inside a colony. While these creeps tend to be less-specialized than a role creep, they are far more flexible able to take on many different tasks.

## Contents

-   [1Generic Make-up](https://wiki.screepspl.us/index.php/Generic_Creeps#Generic_Make-up)
-   [2Identifying the Creeps](https://wiki.screepspl.us/index.php/Generic_Creeps#Identifying_the_Creeps)
-   [3Room-Level or Colony-Level management](https://wiki.screepspl.us/index.php/Generic_Creeps#Room-Level_or_Colony-Level_management)
    -   [3.1Common Tasks/States](https://wiki.screepspl.us/index.php/Generic_Creeps#Common_Tasks/States)
-   [4Generic Creep 'role' or action context](https://wiki.screepspl.us/index.php/Generic_Creeps#Generic_Creep_'role'_or_action_context)
    -   [4.1Switch-case the target object](https://wiki.screepspl.us/index.php/Generic_Creeps#Switch-case_the_target_object)
    -   [4.2RoomPosition movement](https://wiki.screepspl.us/index.php/Generic_Creeps#RoomPosition_movement)
    -   [4.3States](https://wiki.screepspl.us/index.php/Generic_Creeps#States)
    -   [4.4Missions/Task/Encoding](https://wiki.screepspl.us/index.php/Generic_Creeps#Missions/Task/Encoding)

## Generic Make-up

Though by no means required, most generic creeps consist of three body parts `WORK`, `CARRY` & `MOVE`. the WORK parts allow for the actions of harvesting, building, upgrading and repairing, while CARRY insures a reserve of energy to do its assigned task and MOVE of course, to get to the task assigned. Balancing these is up to the user, more WORK and the faster a task gets done, but the more expensive the creep is. More CARRY, and the less trips back-and-forth getting or harvesting energy is required, but it takes up space and makes the creep larger. More MOVE and the creep can move over plains and/or swamps with little difficulty, however this energy/parts could be spent on more creeps. One could make an argument for one config over the other, but it is ultimately up to the user to decide what is best for their bot & creeps. And by no means do they need to even have WORK parts, its quite possible to apply generic logic to 'generic haulers' or other types of creeps.

## Identifying the Creeps

Generic creeps should be easily sortable & assignable. You can flag them via `Memory` as a role creep would, parse/use their name to determine what creeps are generic and to a specific room/region, or whatever method you see fit. Further sorting by their assigned task/state & goal, allows for easier manipulation and updating as-needed. If you have to spend time going back-over or filtering a list rather than using one at tick-start, consider grouping/management/assigning them differently to easily allow for access to whatever 'group' you need to. For example, if a creep is done its assigned task/goal/state/mission, the previous tick, it can be moved/updated into a 'needs energy' state, and then grouped with other creeps that also need energy to help preform this action on all creeps that need it that tick.

## Room-Level or Colony-Level management

Once you have sorted your generic creeps, you can get conditions at room-level or colony level, then assign tasks as-needed. For example, at a room-level, you can check for construction sites that need to be built. If this tick, you have available generic workers with energy, that are not currently assigned a task/goal, you can loop over your workers and assign as many as you feel are needed to work on this task from the pool of available workers. At a colony level, say you needed to haul or retrieve energy from a [proxy harvest](https://wiki.screepspl.us/index.php/Remote_Harvesting "Remote Harvesting") location. You go to your creeps that need, or do not have energy, check who is closest or best (in context of the action) to assign, then assign the the task/mission/goal. A large benefit of doing it this way over role creeps is that 'generally' a role creep will preform the check itself, which if multiple of the same rolecreep, leads to redundant or repeated checks of the same room-level conditions. For example, say you have three role specific 'builders', these builders one after the other all look for energy (to harvest or withdraw) each having to check in-turn when their role is called by the handler. They then have to take a look for construction sites, and pick out what one is best for them. Now, there is no reason that role-specific creeps could not have 'room level' management or handlers to their assignments (such as caching construction sites, or energy sources) but in general a room-level manager with the generic creep mindset will handle/assign these tasks/goals/missions and the generic creep only needs to handle the context of its assignment rather then checking conditions.

### Common Tasks/States

Some common tasks/states would be:

-   Harvest Energy
-   Build construction site
-   Upgrade controller
-   Repair object
-   Fill extensions/spawn/tower
-   Move Energy/Resource

These are no by 'the only' tasks, and of course, it is up again to the user how to order these in priority and how many creeps need to be preforming a task at once.

## Generic Creep 'role' or action context

Once a creep as been assigned a goal/task/state/action, the main idea of their role runner/ code is to take their assignment and complete it. This manager/runner should be able to take various different mission contexts and run the appropriate action for them. How you want to do this, of course, is up to the user.

### Switch-case the target object

If you are targeting objects specifically, then you can switch-case the type of the object to understand the context. For example, if your target object is a controller, then likely you are upgrading it and as such can call/move to the target. If your creep has no energy and its target is a storage, likely you are withdrawing, and you can then moveTo and withdraw from it.

### RoomPosition movement

If you are storing the acquired [roomPosition](https://wiki.screepspl.us/index.php/RoomPosition "RoomPosition") for your creeps' assigned task, then it is very easy to check if the creep is 'there' in context of needing to move to or next to the object. Of course, you would still need more information to preform an action, unless you are already storing roomPositions somewhere in context of their action (like having a group of roomPositions for upgrading, or a group for harvesting)

### States

Another way to have the creep process its assignment is to have specific logic run for a state. For example, if you sort a creep that 'needs energy' in to a 'need energy' state, you can run logic specific to that state in the creep's runner.

### Missions/Task/Encoding

To take it further, it is quite possible to fully encode a creep's task/mission and use its assigned task to preform the actions without strictly hard-coding. For example, the role runner could assign a creep to 'build' a construction site. With the ID of the construction site it needs to preform the action on, it could then assign the creep a 'mission' containing details of what it needs to do, such as: `build` for 'action' type (method to use), `3` for the 'range' the creep 'needs to' be within its target, Similarly you could assign it a roomPosition to move to, or simply feed it the target object & range to move to. In this case, the runner does not 'need' to know what type of object it is acting on as the mission gives it an action to preform on the object. It is quite possible to make these missions into small strings to store in a creep's `Memory` then decode when running its logic.


# Remote Harvesting

[Jump to navigation](https://wiki.screepspl.us/index.php/Remote_Harvesting#mw-head)[Jump to search](https://wiki.screepspl.us/index.php/Remote_Harvesting#searchInput)

*This article is a stub. You can help Screeps Wiki by editing to add more information.*

Remote harvesting is a strategy used by many players to harvest more energy than is available in the rooms they own. It involves sending creeps into a nearby room, either an unowned room or a Source Keeper room, and harvesting the energy from those rooms and bringing it back.

## Contents

-   [1Restrictions](https://wiki.screepspl.us/index.php/Remote_Harvesting#Restrictions)
-   [2Strategies](https://wiki.screepspl.us/index.php/Remote_Harvesting#Strategies)
    -   [2.1Generic & Long-range harvesters](https://wiki.screepspl.us/index.php/Remote_Harvesting#Generic_&_Long-range_harvesters)
    -   [2.2Miners & Haulers](https://wiki.screepspl.us/index.php/Remote_Harvesting#Miners_&_Haulers)
        -   [2.2.1Miner](https://wiki.screepspl.us/index.php/Remote_Harvesting#Miner)
        -   [2.2.2Hauler](https://wiki.screepspl.us/index.php/Remote_Harvesting#Hauler)
    -   [2.3Reserving](https://wiki.screepspl.us/index.php/Remote_Harvesting#Reserving)
    -   [2.4Defense](https://wiki.screepspl.us/index.php/Remote_Harvesting#Defense)
    -   [2.5Transport & Storage](https://wiki.screepspl.us/index.php/Remote_Harvesting#Transport_&_Storage)
    -   [2.6In-Depth Analysis](https://wiki.screepspl.us/index.php/Remote_Harvesting#In-Depth_Analysis)
        -   [2.6.1Summary:](https://wiki.screepspl.us/index.php/Remote_Harvesting#Summary:)
-   [3Source Keeper Rooms](https://wiki.screepspl.us/index.php/Remote_Harvesting#Source_Keeper_Rooms)

## Restrictions
There are multiple obstacles with remote mining. These include gaining [vision](https://wiki.screepspl.us/index.php/Vision "Vision") to the room, making sure your code supports multiple room [pathing](https://wiki.screepspl.us/index.php/Pathing "Pathing"), hauling resources back from the remove rooms, the threat of [invaders](https://wiki.screepspl.us/index.php/Invader "Invader"), and the logistics of reserving the room.

## Strategies

### Generic & Long-range harvesters

The first and most basic of remote harvesting, generally generic body creeps or 'harvesters' can be allowed to either roam, or target adjacent rooms to look for more energy. On finding a source, they harvest their fill as their carry parts allow and return to their home room to use it on whatever task/goal/role they are assigned. While this can be a very easy method of gaining more energy than you could normally with the one-to-two sources provided in your default room, it does take your generic creeps outside the safety of your home room and, unless alot of creeps are involved it is hard to maximize the sources as time is required for the creeps to travel back and forth.

### Miners & Haulers

The most common tactic for harvesting a nearby room for energy, each source is normally set up with a miner to dedicatedly harvest the energy and hauler(s) to transport it.

#### Miner

A Miner's job when spawned is to go to its designated [source](https://wiki.screepspl.us/index.php/Source "Source") or [roomPosition](https://wiki.screepspl.us/index.php/RoomPosition "RoomPosition") and spend its life-time solely harvesting energy. Known as [Static Harvesting](https://wiki.screepspl.us/index.php/Basic_Harvesting "Basic Harvesting") the creep can normally be configured in a number of ways. If there are roads to the location, less move parts are needed saving energy spawning the creep, but requiring repair of the roads. There is also a trade-off to be gained with the number of work parts the miner was spawned with. Larger (more work parts) miners can strip a source faster, thus saving CPU by issuing less harvest [intents](https://wiki.screepspl.us/index.php/Intent "Intent") they are however more expensive to spawn. Conversely, a smaller (less work parts) miner costs less to spawn but will have to issue more harvest intents to strip the source, using more CPU. Ultimately it is up to the user to determine what trade off is right for them/their bot.

#### Hauler

A Hauler's job is primarily to transport energy from the location the miner is mining, back to the home-room for storage/use. Similar to miners, hauler's bodies can come in different sizes/forms. Larger haulers can be used to fetch large amounts of energy and do so from multiple locations but cost more to spawn, while smaller haulers can be used to constantly transport back and forth but tend to stick to one location. To maintain roads, some users even attach work part(s) to haulers to enable them to repair as they move back and forth. This does of course, cost energy on spawning and use some of their energy in-transit but does save on having a dedicated repair creep make the journey.

### Reserving

Sources start out with 1500 energy in non-claimed or reserved rooms, so reserving them allows the sources to regenerate up to 3000 instead, allowing for more energy to be gained from the room. However, claim parts are expensive and so is having a creep constantly spam [intents](https://wiki.screepspl.us/index.php/Intent "Intent"), which increases the more rooms you reserve. A creep with claim parts can reserve the controller in a proxy room (as long as it is not claimed) for one tick each claim part it has, and the 'reservation' will decay one each tick. The controller can have up to 5000 'reserved ticks' (effectively 4999 shown at any time), meaning you can have quite some time without a creep attending it. As claim (reserve) part creeps last only 600 ticks, balancing sending a creep to reserve and for how long, is important to both save energy & CPU.

### Defense

As with any room you harvest energy in, around every 100,000 energy harvested, as long as there is one exit open to a neutral room [invaders](https://wiki.screepspl.us/index.php/Invader "Invader") will attack. As creeps that harvest/transport/claim are normally non-combat creeps, and invaders by default live for 1500 ticks, simply letting them be can result in a large loss of energy. Effectively detecting, spawning and, deploying a combat creep to deal with the invaders automatically in a timely manner helps improve overall energy gains due to not needing downtime to avoid/respawn harvesting creeps.

With the advent of [strongholds](https://wiki.screepspl.us/index.php/Invader "Invader") invaderCores can now spawn in rooms that are not owned by a user and start attacking/reserving a controller which can block your creeps from being able to harvest. As invaderCores are 'alien' technology and can not be dismantled by worker/harvester creeps, a creep needs to be dispatched to attack and remove the invaderCore. As some strongholds can spawn these quite often, dealing with them quickly and in a timely manner is critical.

Beyond NPC threats, other users can also disrupt your proxy harvesting. Other user's attacks tend to be more dynamic / threating so require some [combat](https://wiki.screepspl.us/index.php/Combat "Combat") code to effectively deal with. But at base level, detecting the threat and responding to it is more or less the same as with an invader.

### Transport & Storage

Once the energy has been hauled back to the main room, transporting it and storing it is the next step. With a generic/long range harvesters they can generally go about whatever task until they have to harvest energy again, while haulers normally will bring the energy back to one spot to be distributed to other tasks. This job is normally taken up by the [Storage](https://docs.screeps.com/api/#StructureStorage) as it has a large capacity. [Links](https://wiki.screepspl.us/index.php/StructureLink "StructureLink"), can also be used to help cut down on the movement [intents](https://wiki.screepspl.us/index.php/Intent "Intent") when moving the energy around the main room. Known as edge links, haulers can transfer their energy into the link close to the rooms edge, and head back for another load allowing for faster back-and-forth travel from the proxy mining site. The link can then send the energy to another link in the room to be taken into storage or used for whatever purpose it needs.

### In-Depth Analysis

Roles
|  | Miner | Hauler | Reserver | Guard | Repairer |
| Reserved | \[3M1C6W\](800e) | n\*\[1M2C\](n\*150e) | n\*\[1M2Cl\](n\*1250)e | 10M8R2H(2200e) | 10M7C3W(1150e) |
| Unreserved | 2M1C3W(550e) | as above |  |  |  |

Structures Involved: Roads & Containers

ALL CALCULATION ARE BASED ON energy (e) PER TICK BASIS

Cost for each role involved:

-   Miner == 800e / (1500 - dist);
  
-   Hauler == 150e \* n;
    -   for 100 carryCapacity every n multiple 100 carryCapacity can serve single source for dist == 5
    -   n == dist / 5;
    -   A hauler can do m times round trip during 1500 ticks
    -   m == Math.floor(1500 / (2 \* dist)) == Math.floor(750 / dist);
    -   where the remaining ticks, not enough to make a round trip, is wasted.
    -   The hauler is then effectively lived for
        -   t == (2 \* dist) \* Math.floor(750 / dist);
        -   cost == (150e \* dist / 5) / ((2 \* dist) \* Math.floor(750 / dist));
            -   cost == 15e / Math.floor(750 / dist);

-   Reserver reserves the controller for 2 \* (600 - dist) ticks.
    -   cost == 1250e / (2 \* (600 - dist));
        -   final cost == 625e / (600 - dist);

-   Guard can guard for 9rooms while standing at the center room.
    -   9 rooms can contain up to 12 sources.
        -   cost == 2200e / (12 \* 1500);
            -   final cost == 0.122e;

-   Repairer can repair the roads of 9 rooms while patrolling.
    -   Assume the roads leading to 12 sources has been take care of
        -   cost == 1150e / (12 \* 1500);
            -   final cost == 0.064e;

-   Container
    -   Miner should repair its own container.
    -   Cost of container == 50e / 100 == 0.5e;

-   Roads
-   Number of roads involved == dist;
    -   cost of natural decay == dist;
        -   To calculate total decay, for each creep stepping on it, The body size is divided by walking interval, times the dist
        -   Decay of miner stepping on it:
            -   decay == 10 body every (1500 - dist) ticks;
                -   decay == 10 \* dist / (1500 - dist);
        -   Decay of hauler stepping on it:
            -   decay == 3 \* n every tick
                -   decay == 3 \* dist / 5 == 0.6 \* dist
        -   Decay of reserver stepping on it:
            -   decay == 3 \* dist every (2 \* (600 - dist)) ticks
                -   decay == 1.5 \* dist / (600 - dist);
        -   Guard and repairer should use off-road mode, while performing their duty.
            -   decay == 0;
    -   Total decay == dist + 10 \* dist / (1500 - dist) + 0.6 \* dist + 1.5 \* dist / (600 - dist);
        -   Total decay == 1.6 \* dist + 10 \* dist / (1500 - dist) + 1.5 \* dist / (600 - dist);
        -   Total road cost == (1.6 \* dist + 10 \* dist / (1500 - dist) + 1.5 \* dist / (600 - dist)) \* 0.001e;

#### Summary:

The cost of remote mining per tick versus dist:

```
**cost == 800e / (1500 - dist) + 15e / Math.floor(750 / dist) + 625e / (600 - dist) + 0.122e + 0.064e + 0.5e + (1.6 \* dist + 10 \* dist / (1500 - dist) + 1.5 \* dist / (600 - dist)) \* 0.001e;**

```
```
**cost == 800e / (1500 - dist) + 15e / Math.floor(750 / dist) + 625e / (600 - dist) + 0.686e + (1.6 \* dist + 10 \* dist / (1500 - dist) +  1.5 \* dist / (600 - dist)) \* 0.001e;**

```

With hauler being major cost, and the road costs about half of the miner cost.

Single source room (reserved)
| Dist | Cost | Efficiency |
| 0 | 2.261 | 77% |
| 50 | 3.455 | 65% |
| 100 | 4.811 | 52% |
| 150 | 5.909 | 41% |
| 200 | 8.186 | 19% |
| 250 | 8.515 | 15% |
| 251 | 11.02 | \-10% |

\*Note: Efficiency is obtained by subtracting the cost from 10e

Mining speed is 10e per source.

Double source room (reserved)
| Dist | Cost | Efficiency |
| 0 | 1.740 | 82% |
| 50 | 2,886 | 71% |
| 100 | 4.186 | 58% |
| 150 | 5.214 | 48% |
| 200 | 7.404 | 26% |
| 250 | 7.621 | 24% |
| 251 | 10.12 | \-2.4% |

*Note: Efficiency is obtained by subtracting the cost from 10e*

Mining speed is 10e per source.

Unreserved room (1 or 2 sources)
| Dist | Cost | Efficiency |
| 0 | 1.019 | 80% |
| 50 | 1,596 | 68% |
| 100 | 2.245 | 55% |
| 150 | 2.752 | 45% |
| 200 | 3.832 | 23% |
| 250 | 3.912 | 22% |
| 251 | 5.164 | \-3.2% |

*Note: Efficiency is obtained by subtracting the cost from 5e, since without reserving, the mining speed is 5e.*

## Source Keeper Rooms

Each 10x10 sector of the map contains 8 source keeper rooms in a ring around the center. These rooms have no controller, so they cannot be owned. However, they contain 3 sources each, and each source contains a maximum of 4000 energy rather than 3000. This makes them a good source of energy. They also contain a mineral, just like other rooms, with an extractor already built on top that allows for harvesting.

However, these rooms are guarded by non-player Source Keepers, which will attack creeps that try to harvest the sources. In addition, non-player Invaders will appear in greater numbers with increased frequency and strength. Extra precautions must be taken to ensure the safety of your harvesters.

[Categories](https://wiki.screepspl.us/index.php/Special:Categories "Special:Categories"): 

-   [Stubs](https://wiki.screepspl.us/index.php/Category:Stubs "Category:Stubs")
-   [Strategy](https://wiki.screepspl.us/index.php/Category:Strategy "Category:Strategy")

# Room Control Level

[Jump to navigation](https://wiki.screepspl.us/index.php/Room_Control_Level#mw-head)[Jump to search](https://wiki.screepspl.us/index.php/Room_Control_Level#searchInput)

A room's control level (RCL) determines what and how much a player can build in a given room, and ultimately how useful it will be to the player. It only applies to owned rooms, and it can be upgraded by a creep using energy. When a room is first claimed, it is at RCL 1. Each level takes exponentially more energy to complete, until the transition from RCL 7 to 8, which costs 10,935,000 energy.

## Contents

-   [1Increasing RCL](https://wiki.screepspl.us/index.php/Room_Control_Level#Increasing_RCL)
-   [2Maintaining RCL](https://wiki.screepspl.us/index.php/Room_Control_Level#Maintaining_RCL)
-   [3Decreasing RCL](https://wiki.screepspl.us/index.php/Room_Control_Level#Decreasing_RCL)
-   [4Levels](https://wiki.screepspl.us/index.php/Room_Control_Level#Levels)
    -   [4.1Level 0](https://wiki.screepspl.us/index.php/Room_Control_Level#Level_0)
    -   [4.2Level 1](https://wiki.screepspl.us/index.php/Room_Control_Level#Level_1)
    -   [4.3Level 2](https://wiki.screepspl.us/index.php/Room_Control_Level#Level_2)
    -   [4.4Level 3](https://wiki.screepspl.us/index.php/Room_Control_Level#Level_3)
    -   [4.5Level 4](https://wiki.screepspl.us/index.php/Room_Control_Level#Level_4)
    -   [4.6Level 5](https://wiki.screepspl.us/index.php/Room_Control_Level#Level_5)
    -   [4.7Level 6](https://wiki.screepspl.us/index.php/Room_Control_Level#Level_6)
    -   [4.8Level 7](https://wiki.screepspl.us/index.php/Room_Control_Level#Level_7)
    -   [4.9Level 8](https://wiki.screepspl.us/index.php/Room_Control_Level#Level_8)

## Increasing RCL

A room's level can be increased by `upgrade()`ing its [controller](https://wiki.screepspl.us/index.php/StructureController "StructureController") using a creep with a work [part](https://wiki.screepspl.us/index.php?title=Parts&action=edit&redlink=1 "Parts (page does not exist)") carrying energy. The energy used will be added to the RCL at a 1:1 ratio by default. This ratio can be improved by applying any [boost](https://wiki.screepspl.us/index.php/Boost "Boost") of the GH category to the creep's work [parts](https://wiki.screepspl.us/index.php?title=Parts&action=edit&redlink=1 "Parts (page does not exist)"). The resulting amount of points added to the room's control level is automatically added to the player's [GCL](https://wiki.screepspl.us/index.php/GCL "GCL") as well.

## Maintaining RCL

At RCL 8 there is no next level, and as such there is no further progress to be made on the room's controller. However, you can still upgrade the controller for up to 15 per tick, or more by using a [power creep's power](https://wiki.screepspl.us/index.php/Power#Operate_Controller "Power"). Doing so does contribute to your GCL as it did while upgrading.
Whether or not the room controller is maxed, it is also necessary to upgrade every now and then, as otherwise the controller will decay and ultimately downgrade after a given number of ticks, depending on the controller's level. By default each tick with an upgrade action performed on the controller increases the decay timer by 100 (a higher number being better, as it is a countdown).

## Decreasing RCL

Decreasing a room controller's level is generally only a strategy for [combat](https://wiki.screepspl.us/index.php/Combat "Combat"). By [attacking](https://docs.screeps.com/control.html#Attacking-controllers) the controller the decay is fast forwarded by a number of ticks, depending on the number of [claim parts](https://wiki.screepspl.us/index.php?title=Parts&action=edit&redlink=1 "Parts (page does not exist)") the attacking creeps have. In addition the controller is blocked from being upgraded for a given number of ticks.

## Levels

After claiming a room (or spawning in) it starts out at level 1 and can be raised up to level 8. The higher the level, the more [structures](https://wiki.screepspl.us/index.php/Structure "Structure") can be built. The full detailed list of structures available to each RCL is available at the official docs for [Control](https://docs.screeps.com/control.html#Available-structures-per-RCL). In the following a short list of notable structures per level. Note that many structures are not available to their full capacity from when they're first introduced. Many of them will give you a certain amount to be able to be built and add more every or every other level. One exception are ramparts, which dont have their numbers, but their `maxHits` increased instead.

### Level 0

[Roads](https://wiki.screepspl.us/index.php?title=StructureRoad&action=edit&redlink=1 "StructureRoad (page does not exist)") and [containers](https://wiki.screepspl.us/index.php?title=StructureContainer&action=edit&redlink=1 "StructureContainer (page does not exist)") can be built in any room, regardless of a presence or absence of a controller.

### Level 1

The most notable (and only new) structure at level 1 is the [spawn](https://wiki.screepspl.us/index.php/StructureSpawn "StructureSpawn"), which enables a room to be self-sufficient as it can now spawn its own creeps.

### Level 2

Level 2 adds [ramparts](https://wiki.screepspl.us/index.php/StructureRampart "StructureRampart") and [extensions](https://wiki.screepspl.us/index.php?title=StructureExtension&action=edit&redlink=1 "StructureExtension (page does not exist)"). The former is good for safety purposes, but the latter is what helps with progressing faster.

### Level 3

RCL 3 is regarded as one of the "milestones", as it adds the first [tower](https://wiki.screepspl.us/index.php/StructureTower "StructureTower"), giving the player access to passive defense that is easily implemented code-wise.

### Level 4

At level 4 the [storage](https://wiki.screepspl.us/index.php/StructureStorage "StructureStorage") can be built, which enables the player to manage their energy (and potentially other resources) more effectively, as they now have a much bigger buffer.

### Level 5

Level 5 adds the first [links](https://wiki.screepspl.us/index.php/StructureLink "StructureLink"), which are immensely useful for increasing a room's efficiency as they remove the need for haulers between the positions they're built in. This way spawn availability is freed up and energy for spawning said haulers is saved.

### Level 6

With RCL 6 the room has access to the [terminal](https://wiki.screepspl.us/index.php?title=StructureTerminal&action=edit&redlink=1 "StructureTerminal (page does not exist)"), which enables market activities and market-independent inter-room transfers across the whole shard. In addition to that the room can now build [labs](https://wiki.screepspl.us/index.php/StructureLab "StructureLab") and the [extractor](https://wiki.screepspl.us/index.php?title=StructureExtractor&action=edit&redlink=1 "StructureExtractor (page does not exist)"), which are important for getting economic access to [boosts](https://wiki.screepspl.us/index.php/Boost "Boost").

### Level 7

Level 7 gives access to the [factory](https://wiki.screepspl.us/index.php/StructureFactory "StructureFactory"), which is used for either compressing resources or creating [commodities](https://wiki.screepspl.us/index.php?title=Commodities&action=edit&redlink=1 "Commodities (page does not exist)") to be traded for credits on the [market](https://wiki.screepspl.us/index.php/Market "Market"). A second Spawn is available now, effectively doubling spawn speed, and Extensions' capacity also gets doubled, enabling spawning of much larger creeps than before.

### Level 8

This is the highest level a room can reach and gives access to the [nuker](https://wiki.screepspl.us/index.php?title=StructureNuker&action=edit&redlink=1 "StructureNuker (page does not exist)") and the [power spawn](https://wiki.screepspl.us/index.php?title=StructurePowerSpawn&action=edit&redlink=1 "StructurePowerSpawn (page does not exist)"). With the last Spawn and another doubling of Extension capacity spawn speed and available creep size are increased again.

[Categories](https://wiki.screepspl.us/index.php/Special:Categories "Special:Categories"): 

-   [Stubs](https://wiki.screepspl.us/index.php/Category:Stubs "Category:Stubs")
-   [Game Knowledge](https://wiki.screepspl.us/index.php/Category:Game_Knowledge "Category:Game Knowledge")
-   [In-Game Resources](https://wiki.screepspl.us/index.php/Category:In-Game_Resources "Category:In-Game Resources")

# Static Harvesting

Many harvesting strategies revolve around static mining. Static mining refers to a harvester which does not move from the [source](https://wiki.screepspl.us/index.php/Source "Source") after arriving. This allows the player to spawn a creep with fewer move parts. Another creep, usually called a 'courier' or 'hauler', is used to carry the energy to where it is needed. For example, the 'hauler' can bring energy to [storage](https://wiki.screepspl.us/index.php/StructureStorage "StructureStorage"), a [container](https://docs.screeps.com/api/#StructureContainer), or directly to [spawns](https://wiki.screepspl.us/index.php/StructureSpawn "StructureSpawn") or [extensions](https://docs.screeps.com/api/#StructureExtension).

## Contents

-   [1Drop Mining](https://wiki.screepspl.us/index.php/Static_Harvesting#Drop_Mining)
    -   [1.1No Carry Parts](https://wiki.screepspl.us/index.php/Static_Harvesting#No_Carry_Parts)
    -   [1.2Carry part buffer](https://wiki.screepspl.us/index.php/Static_Harvesting#Carry_part_buffer)
-   [2Container Mining](https://wiki.screepspl.us/index.php/Static_Harvesting#Container_Mining)
    -   [2.1Uses](https://wiki.screepspl.us/index.php/Static_Harvesting#Uses)
    -   [2.2Variations](https://wiki.screepspl.us/index.php/Static_Harvesting#Variations)
    -   [2.3Potential Problems](https://wiki.screepspl.us/index.php/Static_Harvesting#Potential_Problems)
-   [3Link Mining](https://wiki.screepspl.us/index.php/Static_Harvesting#Link_Mining)
    -   [3.1Uses](https://wiki.screepspl.us/index.php/Static_Harvesting#Uses_2)
    -   [3.2Variations](https://wiki.screepspl.us/index.php/Static_Harvesting#Variations_2)
    -   [3.3Potential Problems](https://wiki.screepspl.us/index.php/Static_Harvesting#Potential_Problems_2)

## Drop Mining

Drop mining is the harvesting of resources without a container or link nearby. While it is the simplest form of static mining, it can still be very efficient.

### No Carry Parts
When a harvester without carry parts mines a source, all of the energy drops onto the ground. This energy is subject to [resource decay](https://docs.screeps.com/api/#Resource). This dropped energy will decay at a rate of 1 per 1000 (rounded up) energy per tick. To minimize the loss of energy due to decay, the 'hauler' would need to stay near the harvester. These savings would need to compared against the cost of the 'hauler's lifetime.

### Carry part buffer

Rather than dropping the harvested energy directly on the ground, you can use a static miner with carry parts as a buffer. Note, energy harvested above the buffer will still drop onto the ground. In this scenario, the static miner would need to transfer the energy to another creep for transportation.

Mining with a buffer can be more efficient than container mining (below), however it is best to calculate for yourself based on [spawn](https://wiki.screepspl.us/index.php/StructureSpawn "StructureSpawn") time, [terrain](https://wiki.screepspl.us/index.php/Terrain "Terrain"), and the travel distance.

## Container Mining
[![An example of container mining](https://wiki.screepspl.us/images/a/a8/Canmining.gif)](https://wiki.screepspl.us/index.php/File:Canmining.gif "An example of container mining")

Container Mining (sometimes referred to as "can" mining) is the process of using [Containers](https://docs.screeps.com/api/#StructureExtension) to store mined [resources](https://docs.screeps.com/resources.html) while waiting for a hauler to gather them, rather than dropping the resource and allowing it to decay, such as in [drop mining](https://wiki.screepspl.us/index.php/Static_Harvesting#drop_mining) or storing the resource internally.

### Uses

Container mining can be seen as the combination of drop mining's high capacity and internal mining's high efficiency. Containers are cheap and have a low decay rate, and any resource that falls on the tile in question will fall into the container. For an energy source, this ends up reducing losses compared to drop mining by about 90%.

### Variations

Some people choose to drop mine at earlier [Room Control Levels](https://wiki.screepspl.us/index.php/Room_Control_Level "Room Control Level"), then container mine later when they decide they can afford to build the containers, instead of building the containers as early as possible.

Repairing the container due to its decay can be done by the mining creep, or other workers in the room. If the miner maintains it, it will need at least 1 CARRY part to hold the energy used in the repairs. Once the creep tries to harvest more than it's carryCapacity, it will continue to drop the energy into the container.

[Remote Mining](https://wiki.screepspl.us/index.php/Remote_Mining "Remote Mining") and [Source Keeper](https://wiki.screepspl.us/index.php/Source_Keeper "Source Keeper") mining also often takes the form of container mining to deal with the large amounts of energy mined or higher travel times the carriers require to return the energy to a claimed room. The benefit is less clear in non-owned rooms though, because of the increased (\*5) decay rate (see [doc](http://support.screeps.com/hc/en-us/articles/208435885-StructureContainer) )
[Mineral Mining](https://wiki.screepspl.us/index.php/Mineral_Mining "Mineral Mining") often takes the form of can mining to minimize the loss of valuable minerals.

### Potential Problems

The player must be able to repair the container occasionally. This is often handled by the harvester.

You will also need to identify a way to ensure a newly spawned miner stands on top of the assigned container before it starts mining, or it will turn into [Drop Mining](https://wiki.screepspl.us/index.php/Static_Harvesting#Drop_Mining) again, and the container maintenance costs are wasted.

The carriers/workers you develop for this type of static mining will have to be able to withdraw() from the containers for it to be effective. You will also have to check to see if the container has overflowed, and pickup() the energy like [Drop Mining](https://wiki.screepspl.us/index.php/Static_Harvesting#Drop_Mining) to save it from decay.

## Link Mining

Link mining is a static mining method for [Sources](https://wiki.screepspl.us/index.php/Source "Source"). It takes advantage of [links](https://wiki.screepspl.us/index.php/StructureLink "StructureLink") to transfer the energy instead of Creep carriers.

[![An example of link mining](https://wiki.screepspl.us/images/9/99/Link_mining.gif)](https://wiki.screepspl.us/index.php/File:Link_mining.gif "An example of link mining")

### Uses

Link mining is commonly used to mine out-of-the-way sources in your rooms without needing so many haulers. Since links are limited in number, care should be used in deciding when a Source should be link mined or other methods should be used. Sending from one link to another incurs a 3% loss during the transfer, so care should also be used in determining savings versus other mining practices.

### Variations

Links can also be used to help transfer energy from other rooms, especially remote mining and source keeper rooms. This way, haulers have less distance to travel to bring energy to the next room.

Since links have a cool down based on distance, some players will place a link between two other links to reduce cool down times. This would incur a loss of 5.91% loss instead of 3% for a single link transfer.

Some players combine this method with [container mining](https://wiki.screepspl.us/index.php/Static_Harvesting#Container_Mining) to store surplus energy until it can be linked elsewhere in the room.

### Potential Problems

Links are only available at RCL 5 and above. Also, rooms are capped at 6 links even at RCL 8, so players must budget their link usage wisely.

Links have a cool-down equal to the distance they transfer energy. This may limit the amount of energy that can be transferred through a link.

The destination link needs to be emptied constantly, or the link may back up, failing over to an alternate method of harvesting or simply stopping altogether.

[Category](https://wiki.screepspl.us/index.php/Special:Categories "Special:Categories"): 

-   [Strategy](https://wiki.screepspl.us/index.php/Category:Strategy "Category:Strategy")


# StructureLab
[Jump to navigation](https://wiki.screepspl.us/index.php/StructureLab#mw-head)[Jump to search](https://wiki.screepspl.us/index.php/StructureLab#searchInput)

A lab is a mid-to-late room structure that allows for the creation of boosts/compounds using minerals and boosting creep's body parts to improve their effectiveness. You get three labs at RCL six, six total at RCL seven and, ten total at RCL eight.

## Contents

-   [1Creating Boosts](https://wiki.screepspl.us/index.php/StructureLab#Creating_Boosts)
    -   [1.1Compounds](https://wiki.screepspl.us/index.php/StructureLab#Compounds)
-   [2Boosting](https://wiki.screepspl.us/index.php/StructureLab#Boosting)
-   [3Un-Boosting](https://wiki.screepspl.us/index.php/StructureLab#Un-Boosting)
-   [4Reverse Reaction](https://wiki.screepspl.us/index.php/StructureLab#Reverse_Reaction)
-   [5Basic Automatic Lab usage.](https://wiki.screepspl.us/index.php/StructureLab#Basic_Automatic_Lab_usage.)

## Creating Boosts
To create a boost/compound you need to have two labs supply the minerals you are using, and at least one other lab running the reaction. However multiple labs can run a reaction in the same tick as long as they are in a range of two from each supplying lab and the lab does not have a cooldown. At RCL eight, if placed correctly this means you can have two supplying labs and eight reacting labs per room. The user can also set up their labs however they wish, including making chains of labs where different tiers of compounds/boosts are produced in sequence as the previous part of the chain creates them. A cooldown is placed on the lab on running the reaction, it varies in length depending on the boost/compound created.
Boosts have three tiers numbered one though three, each level increasing the effect that the boost gives to the creep's body part effected. The first tier is created by combining a mineral/compound with either hydrogen or oxygen to create a base boost.
The second tier is combining the first tier boosts with the compound Hydroxide, Hydroxide is produced by labs when Hydrogen is reacted with Oxygen.
The third and final tier is created by combining a second tier boost with the mineral Catalyst. As this creates the most powerful version of boosts, catalyst tends to be the most valuable mineral.

### Compounds
Though not directly used as boosts, compounds can be created in the lab from the base minerals for use in creating boosts or as fuel for some special actions in-game. The most basic compound is Hydroxide, which is hydrogen and oxygen reacted in a lab, which is used in the creation of tier two boosts. Zynthium-Keanite and Utrium-lemergite are created by combining the minerals Zynthium & Keanite and Utrium & Lemergium respectively. These compounds at current have no use of their own beyond market value but are used by combining the two to make the compound Ghodium.
Ghodium is a very useful resource as it is not only used in the creation of very powerful boosts, but it is also used as the warhead for nukers and, can be used at an owned controller to increase its number of safemodes.

## Boosting
A lab containing a boost and energy can be used to boost a creep's bodyparts with the contained boost at a rate of 30 boost compounds and 20 energy. If there is not enough contained to boost all the creep's body parts they are done in order of the creep's body to whatever amount can be afforded. Once boosted, depending on the type of boost applied to the bodypart, that bodypart is given increased effectiveness. This can be useful for various economy tasks however, it is direly useful in late-game combat and healing. Boosted creeps can easily out-preform one or multiple non-boosted ones, and have an easier time getting or tanking though room defenses.

## Un-Boosting
A lab can remove the boosts from a creep and drop half of the used boost on the ground. You can then pick the reosurces up, or catch them with a container to be used again. This does however, apply a cooldown which dependent on total-lab reaction time in all steps, can be quite large. While the lab is in cooldown it can not react or unboost.

## Reverse Reaction
Labs can also be used to break down boosts & compounds into their base parts. This is useful if you have too much, or if you simply want the base elements. In a swap from running a reaction, you need only 1 lab that is providing the boost/compound to break down and can use however many other labs to receive the result, however keep in mind this will be two compounds.

## Basic Automatic Lab usage.
To automatically create compounds and boosts you need a few systems. First, you will need a creep or creeps to supply the source labs with the mineral/compounds to use in the reaction. Then, you need a system to detect when the source-lab has enough resource to continue the reaction and, that the reacting labs are not on a cooldown. After reaction(s), you then need a creep or creeps to withdraw the produced boost/compound and transfer it to a storage.
That is the very basic setup, however it can get far more complicated chaining boosts. You first, need a source of the mineral/compounds you want to use either by mining them in a room, purchasing them form the market, or reacting them from other elements in the lab. You can set a threshold or condition to stop production of whatever your working on, and then move on to the next production target. This requires emptying all the labs, then filling the source labs with the new mineral/compounds. Using provided constants in the game, you can figure out dependent on what you have on hand what boosts you can make.
If you chain-link labs in-order of tier, it is possible to produce though all tiers of a boost, however you will need at some point to produce/buy Hydroxide as it is needed for Tier 2.

Some complications you can find will be:
-   As labs have a limited store size of 3000, supplying and maintaining an amount requires a creep to only put in an amount needed, possibly leaving leftovers being carried if care is not taken to manage it.
-   When switching over to a new boost, if all labs are not emptied properly this can cause loss of efficiency and wasted runReaction checks.
-   Maintaining levels of compounds/boosts on-hand to produce more, while not sliding back into another level of production as soon as your condition/level is met.
-   Determining what order & importance any given boost needs to be in the production considerations.
-   Sending information from your lab-system back to your creep if an error has happened, or if something is preventing a reaction.

[Categories](https://wiki.screepspl.us/index.php/Special:Categories "Special:Categories"): 
-   [Game Knowledge](https://wiki.screepspl.us/index.php/Category:Game_Knowledge "Category:Game Knowledge")
-   [In-Game Objects](https://wiki.screepspl.us/index.php/Category:In-Game_Objects "Category:In-Game Objects")


# StructureTower
[Jump to navigation](https://wiki.screepspl.us/index.php/StructureTower#mw-head)[Jump to search](https://wiki.screepspl.us/index.php/StructureTower#searchInput)

A tower is a powerful defensive structure that users can build in an owned room. A user gets one tower at RCL 3, an additional one at both RCL 5 and 7 and, three more at RCL 8 for a total of six when at RCL 8. Towers can Attack, Heal and repair, at the cost of ten energy per action taken.

## Tower's range
A tower's range is unlimited in its room, however it has a falloff of effectiveness dependent on the range to the target. Any target within five or less tiles/roomPositions of the tower will be at its max effect (600 hits for attack, 400 hits for heal and, 800 hits for repair), anything at a range of 20 tiles/RoomPositions or more will be capped out at a minimum (150 hits for attack, 100 hits for heal and, 200 hits for repair). Anything between these values varies dependent on the range, `amount -= amount * C.TOWER_FALLOFF * (range - C.TOWER_OPTIMAL_RANGE) / (C.TOWER_FALLOFF_RANGE - C.TOWER_OPTIMAL_RANGE);` is the calculation (see: <https://github.com/screeps/engine/blob/master/src/processor/intents/towers/attack.js#L38> for source) Where amount starts off as the maximum effectiveness and is reduced based on range.

## Tower placement
Tower placement in a room is very important due to several factors. First, due to the range falloff, for a tower to be at its maximum effect (either attacking, healing or repairing) they should be closest to what action you wish to have them preform. For example, if you intend to use your towers only for defense, then you want them as close to any defensive walls you have so the other side/roomPosition of the wall is within its maximum range, same goes for healing.
Some players also will group their towers into an area so all are reachable from one room position, this allows for easy refilling with creeps in a speedy manor without having to travel long distances. This also allows for all towers to be similarly effective at w/e range they are 'centered' around, this does however weaken the power they could have in other spots if they were placed differently.
Its up to the user to determine their use case for their towers, many different users have many different placements.

## Tower repairing vs creep repairing
Since a tower has unlimited range, it can be fairly convenient to repair decaying structures in an owned room with towers. Depending on case, this can save on creep travel to the structure to repair/get energy, however due to fall-off and each action costing ten energy, vs a creep's one per work part, it can quite vary in effectiveness.
Again, it is up to the user to determine their use-case.

[Categories](https://wiki.screepspl.us/index.php/Special:Categories "Special:Categories"):
-   [Game Knowledge](https://wiki.screepspl.us/index.php/Category:Game_Knowledge "Category:Game Knowledge")
-   [In-Game Objects](https://wiki.screepspl.us/index.php/Category:In-Game_Objects "Category:In-Game Objects")
