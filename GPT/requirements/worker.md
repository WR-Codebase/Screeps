# Worker Role Requirements Document
## Overview
This document outlines the requirements for a dynamic worker role in Screeps. The worker creep will have its body type and task selection dynamically determined based on the available energy capacity in the room and the types of work needed at any given moment. The goal is to create a versatile and efficient worker capable of adapting to the evolving needs of the colony.

## Requirements
1. Body Type Determination Based on Available Energy Capacity
   The worker's body composition (i.e., the combination and number of WORK, CARRY, MOVE parts, etc.) should be dynamically generated based on the current available energy capacity in the spawn room.
   The system must ensure that the total cost of the body parts does not exceed the available energy capacity, making the creep buildable.
   The algorithm should prioritize a balanced distribution of MOVE parts to ensure the creep can move effectively, considering the weight of other parts.
   As the energy capacity of the room increases, the complexity and capability of the worker's body should scale accordingly, allowing for more specialized parts based on the tasks required.
2. Body Type Determination Based on Types of Work Needed
   The worker's body composition should also take into consideration the types of tasks that need to be performed in the colony. This includes but is not limited to harvesting resources, building structures, upgrading controllers, and repairing structures.
   The system must include logic to assess the current needs of the colony (e.g., construction projects, repair status of structures, energy levels of controllers) and adjust the body type of new workers to meet these needs.
   The decision-making process should weigh the colony's immediate and short-term needs to prioritize the inclusion of certain body parts over others. For example, a higher proportion of WORK parts may be needed if there are many construction sites, while more CARRY parts may be prioritized if resource transportation is a bottleneck.
3. Task Selection and Execution
   Workers must contain the logic to perform a wide range of commands, encompassing all potential tasks within the colony.
   The system should implement a task prioritization and selection mechanism, allowing workers to choose their next task based on the colony's current needs and the worker's own capabilities.
   Task selection must consider the worker's body composition, ensuring that tasks are chosen that the worker is physically capable of performing efficiently. For example, a worker with a higher proportion of CARRY parts should prioritize transport tasks.
   The task selection algorithm should be dynamic, allowing workers to switch tasks as the colony's needs change or as tasks are completed.
4. Implementation Notes
   The implementation must ensure that the dynamic selection of body types and tasks does not lead to resource wastage or inefficiencies in task execution.
   Workers should be designed with fallback routines to handle scenarios where they cannot perform any tasks due to physical limitations or lack of work matching their capabilities.
   The code structure should be modular, allowing for easy updates and modifications to task and body type selection algorithms as the game evolves or as the player's strategy changes.
   Conclusion
   The development of a dynamic worker role as outlined in this document aims to enhance the adaptability and efficiency of Screeps colonies. By tailoring workers to the specific needs of the colony and enabling them to select tasks based on their capabilities and the colony's priorities, players can optimize their resource use and accelerate their developmental goals.
