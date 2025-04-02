const shortStructures = {
    's': STRUCTURE_SPAWN,
    'e': STRUCTURE_EXTENSION,
    'r': STRUCTURE_ROAD,
    'l': STRUCTURE_LINK,
    'S': STRUCTURE_STORAGE,
    't': STRUCTURE_TOWER,
    'O': STRUCTURE_OBSERVER,
    'P': STRUCTURE_POWER_SPAWN,
    'L': STRUCTURE_LAB,
    'T': STRUCTURE_TERMINAL,
    'c': STRUCTURE_CONTAINER,
    'N': STRUCTURE_NUKER,
    'F': STRUCTURE_FACTORY
}


const stamps = {

    rapidCluster: [
        ' rrrrr ',
        'reeceer',
        'rererer',
        'rselesr',
        'rererer',
        'reeceer',
        ' rrrrr '
    ],

    core: [
        ' rrr ',
        'rrPsr',
        'rSrlr',
        'rFTNr',
        ' rrr '
    ],

    towers: [
        ' rrr ',
        'rtttr',
        'rtctr',
        'rrtrr',
        ' rrr '
    ],

    labs: [
        'rrrrO',
        'rLLrr',
        'LLrLr',
        'LrLLr',
        'rLLrr'
    ],

    nursury: [
        'eer',
        'ere',
        'ree'
    ],
}

const stampsMax = {
    rapidCluster: 1,
    core: 1,
    towers: 1,
    labs: 1,
    extensions: 60
}


const run = function (room) {
    if (!room) return ERR_NOT_FOUND
    memInit(room)
    if (room.memory.roomPlanner.stampsPlaced["rapidCluster"] < stampsMax["rapidCluster"]) {
        let startingPos = findBestSpot(room, 6, distanceTransform(room))
        room.memory.roomPlanner.startingPos = startingPos
        placeStamp(room, stamps["rapidCluster"], startingPos)
        room.memory.roomPlanner.stampsPlaced["rapidCluster"]++
    }
    else if (room.memory.roomPlanner.stampsPlaced["core"] < stampsMax["core"]) {
        let anchorPos = new RoomPosition(room.memory.roomPlanner.startingPos.x, room.memory.roomPlanner.startingPos.y, room.name)
        let bestPos = findBestSpot(room, 2, distanceTransform(room), anchorPos)
        placeStamp(room, stamps["core"], bestPos)
        room.memory.corePos = bestPos
        room.memory.roomPlanner.stampsPlaced["core"]++
    }
    else if (room.memory.roomPlanner.stampsPlaced["towers"] < stampsMax["towers"]) {
        let anchorPos = new RoomPosition(room.memory.corePos.x, room.memory.corePos.y, room.name)
        let bestPos = findBestSpot(room, 2, distanceTransform(room), anchorPos)
        placeStamp(room, stamps["towers"], bestPos)
        room.memory.towerPos = bestPos
        room.memory.roomPlanner.stampsPlaced["towers"]++
    }
    else if (room.memory.roomPlanner.stampsPlaced["labs"] < stampsMax["labs"]) {
        let anchorPos = new RoomPosition(room.memory.corePos.x, room.memory.corePos.y, room.name)
        let bestPos = findBestSpot(room, 3, distanceTransform(room), anchorPos)
        placeStamp(room, stamps["labs"], bestPos)
        room.memory.labPos = bestPos
        room.memory.roomPlanner.stampsPlaced["labs"]++
    }
    else if (room.memory.roomPlanner.stampsPlaced["extensions"] < stampsMax["extensions"]) {
        placeExtensoins(room, distanceTransform(room))
    }
    else {
        return OK
    }
}

const memInit = function (room) {
    if (!room.memory.roomPlanner) {
        room.memory.roomPlanner = {}
        room.memory.roomPlanner.structures = []
        room.memory.roomPlanner.startingPos = {}
        room.memory.roomPlanner.extensionsRange = 5
        room.memory.roomPlanner.stampsPlaced = {
            rapidCluster: 0,
            core: 0,
            towers: 0,
            labs: 0,
            extensions: 0
        }
        room.memory.corePos = {}
        room.memory.towerPos = {}
        room.memory.labPos = {}
    }
}

const placeExtensoins = function (room, distanceCM) {
    if (room && room.memory.roomPlanner && room.memory.roomPlanner.startingPos) {
        let startingPos = room.memory.roomPlanner.startingPos
        for (let y = startingPos.y - room.memory.roomPlanner.extensionsRange; y < startingPos.y + room.memory.roomPlanner.extensionsRange; y++) {
            for (let x = startingPos.x - room.memory.roomPlanner.extensionsRange; x < startingPos.x + room.memory.roomPlanner.extensionsRange; x++) {
                if (y > 0 && y < 49 && x > 0 && x < 49 && distanceCM.get(x, y) != 0 && room.memory.roomPlanner.stampsPlaced["extensions"] <= stampsMax["extensions"]) {
                    if (x % 2 == y % 2) {
                        let structure = {
                            x: x,
                            y: y,
                            t: "r"
                        }
                        if (room.memory.roomPlanner.structures.indexOf(JSON.stringify(structure)) == -1) {
                            console.log(JSON.stringify(structure) + " was not in memory. added!")
                            room.memory.roomPlanner.structures.push(JSON.stringify(structure))
                        }
                    }
                    else {
                        let structure = {
                            x: x,
                            y: y,
                            t: "e"
                        }
                        if (room.memory.roomPlanner.structures.indexOf(JSON.stringify(structure)) == -1) {
                            console.log(JSON.stringify(structure) + " was not in memory. added!")
                            room.memory.roomPlanner.structures.push(JSON.stringify(structure))
                            room.memory.roomPlanner.stampsPlaced["extensions"]++
                        }
                    }
                }
            }
        }
        if (room.memory.roomPlanner.stampsPlaced["extensions"] <= stampsMax["extensions"]) {
            room.memory.roomPlanner.extensionsRange++
        }
    }
}

const placeStamp = function (
    room,
    stamp,
    pos,
    distanceCM,
    enableVisuals = true
) {
    if (!room || !pos || !stamp) return ERR_INVALID_ARGS
    for (let y = 0; y < stamp.length; y++) {
        for (let x = 0; x < stamp[y].length; x++) {
            if (shortStructures[stamp[y][x]]) {
                let structure = {
                    x: x + (pos.x - Math.floor(stamp[y].length / 2)),
                    y: y + (pos.y - Math.floor(stamp.length / 2)),
                    t: stamp[y][x]
                }
                if (room.memory.roomPlanner.structures.indexOf(JSON.stringify(structure)) == -1 && room.getTerrain().get(structure.x, structure.y) !== TERRAIN_MASK_WALL) {
                    console.log(JSON.stringify(structure) + " was not in memory. added!")
                    if (enableVisuals) (room.visual.text(stamp[y][x], x + (pos.x - Math.floor(stamp[y].length / 2)), y + (pos.y - Math.floor(stamp.length / 2)), { stroke: "#000" }))
                    room.memory.roomPlanner.structures.push(JSON.stringify(structure))
                    if (stamp[y][x] == "c") {
                        let structureRoad = {
                            x: x + (pos.x - Math.floor(stamp[y].length / 2)),
                            y: y + (pos.y - Math.floor(stamp.length / 2)),
                            t: "r"
                        }
                        console.log(JSON.stringify(structureRoad) + " also added road to the container!")
                        room.memory.roomPlanner.structures.push(JSON.stringify(structure))
                    }
                }
            }
        }
    }
}

const findBestSpot = function (
    room,
    stampSize,
    distanceCM,
    anchorPos = undefined,
    enableVisuals = true
) {
    const source0 = room.find(FIND_SOURCES)[0]
    const source1 = room.find(FIND_SOURCES)[1]
    const mineral = room.find(FIND_MINERALS)[0]
    const controller = room.controller
    if (source0 && source1 && mineral && controller) {
        let bestPos = {
            x: 0,
            y: 0,
            value: 500
        }
        for (let y = 1; y < 49; y++) {
            for (let x = 1; x < 49; x++) {
                if (distanceCM.get(x, y) == stampSize) {
                    let pos = new RoomPosition(x, y, room.name)
                    let pathFindOpt = { ignoreCreeps: true, ignoreRoads: true, ignoreDestructibleStructures: true, range: 1 }
                    let value = 1
                    if (anchorPos == undefined) {
                        value = (pos.findPathTo(source0, pathFindOpt).length) +
                            (pos.findPathTo(source1, pathFindOpt).length) +
                            (pos.findPathTo(mineral, pathFindOpt).length) +
                            (pos.findPathTo(controller, pathFindOpt).length) +
                            (pos.getRangeTo(controller.pos) * 3)
                    }
                    else {
                        value = pos.findPathTo(anchorPos, pathFindOpt).length
                    }
                    if (value < bestPos.value) {
                        bestPos.value = value
                        bestPos.x = x
                        bestPos.y = y
                    }
                    if (enableVisuals) {
                        room.visual.text(value, x, y + 0.5, { font: 0.5 })
                        room.visual.rect(x - 0.5, y - 0.5, 1, 1, { stroke: "#f00", fill: "transparent" })
                    }
                }
            }
        }
        if (enableVisuals) {
            room.visual.rect(bestPos.x - 0.5, bestPos.y - 0.5, 1, 1, { stroke: "transparent", fill: "#0f0" })
        }
        if (bestPos.value < 500) {
            return bestPos
        }
    }
}



let roomDimensions = 50
const distanceTransform = function (
    room,
    enableVisuals = true,
    x1 = 1,
    y1 = 1,
    x2 = 48,
    y2 = 48
) {
    if (!room) return ERR_NOT_FOUND
    const roomName = room.name;
    const terrain = new Room.Terrain(roomName);
    const initialCM = new PathFinder.CostMatrix();
    for (let y = 0; y < 50; y++) {
        for (let x = 0; x < 50; x++) {
            const tile = terrain.get(x, y);
            const weight =
                tile === TERRAIN_MASK_WALL ? 255 : // wall  => unwalkable
                    tile === TERRAIN_MASK_SWAMP ? 5 : // swamp => weight:  5
                        1; // plain => weight:  1
            initialCM.set(x, y, weight);
        }
    }

    let exits = room.find(FIND_EXIT)

    for (let i in exits) {
        let exit = exits[i]
        for (let x = exit.x - 4; x < exit.x + 4; x++) {
            for (let y = exit.y - 4; y < exit.y + 4; y++) {
                if (y >= 0 && y <= 49 && x >= 0 && x <= 49) {
                    initialCM.set(x, y, 255)
                }
            }
        }
    }

    let roomObjects = [
        room.controller,
        ...room.find(FIND_SOURCES),
        ...room.find(FIND_MINERALS)
    ]

    for (let i in roomObjects) {
        let object = roomObjects[i].pos
        if (object) {
            initialCM.set(object.x - 1, object.y - 1, 255) // top left
            initialCM.set(object.x, object.y - 1, 255) // top
            initialCM.set(object.x + 1, object.y - 1, 255) // top right
            initialCM.set(object.x + 1, object.y, 255) // right
            initialCM.set(object.x + 1, object.y + 1, 255) // bottom right
            initialCM.set(object.x, object.y + 1, 255) // bottom
            initialCM.set(object.x - 1, object.y + 1, 255) // bottom left
            initialCM.set(object.x - 1, object.y, 255) // left

        }
    }

    if (room.memory.roomPlanner) {
        let structures = room.memory.roomPlanner.structures
        // Fill CostMatrix with default terrain costs for future analysis:
        for (let i in structures) {
            let structure = JSON.parse(structures[i])
            initialCM.set(structure.x, structure.y, 255)
        }
    }
    // if(room.structures.length > 0){
    //     for(i in room.structures){
    //         let strPos = room.structures[i].pos
    //         initialCM.set(strPos.x, strPos.y, 255);
    //     }
    // }


    // Use a costMatrix to record distances

    const distanceCM = new PathFinder.CostMatrix()

    let x
    let y

    for (x = Math.max(x1 - 1, 0); x < Math.min(x2 + 1, roomDimensions - 1); x += 1) {
        for (y = Math.max(y1 - 1, 0); y < Math.min(y2 + 1, roomDimensions - 1); y += 1) {
            distanceCM.set(x, y, initialCM.get(x, y) === 255 ? 0 : 255)
        }
    }

    let top
    let left
    let topLeft
    let topRight
    let bottomLeft

    // Loop through the xs and ys inside the bounds

    for (x = x1; x <= x2; x += 1) {
        for (y = y1; y <= y2; y += 1) {
            top = distanceCM.get(x, y - 1)
            left = distanceCM.get(x - 1, y)
            topLeft = distanceCM.get(x - 1, y - 1)
            topRight = distanceCM.get(x + 1, y - 1)
            bottomLeft = distanceCM.get(x - 1, y + 1)

            distanceCM.set(x, y, Math.min(Math.min(top, left, topLeft, topRight, bottomLeft) + 1, distanceCM.get(x, y)))
        }
    }

    let bottom
    let right
    let bottomRight

    // Loop through the xs and ys inside the bounds

    for (x = x2; x >= x1; x -= 1) {
        for (y = y2; y >= y1; y -= 1) {
            bottom = distanceCM.get(x, y + 1)
            right = distanceCM.get(x + 1, y)
            bottomRight = distanceCM.get(x + 1, y + 1)
            topRight = distanceCM.get(x + 1, y - 1)
            bottomLeft = distanceCM.get(x - 1, y + 1)

            distanceCM.set(
                x,
                y,
                Math.min(Math.min(bottom, right, bottomRight, topRight, bottomLeft) + 1, distanceCM.get(x, y)),
            )
        }
    }

    if (enableVisuals) {
        // Loop through the xs and ys inside the bounds

        for (x = x1; x <= x2; x += 1) {
            for (y = y1; y <= y2; y += 1) {
                if (distanceCM.get(x, y) !== 0) {
                    room.visual.rect(x - 0.5, y - 0.5, 1, 1, {
                        // fill: `hsl(10%, ${200}${distanceCM.get(x, y) * 10}, 60%)`,
                        fill: `hsl(${5}${distanceCM.get(x, y) * 19}, 70%, 60%)`,
                        opacity: 0.4,
                    })
                    room.visual.text(distanceCM.get(x, y), x, y)
                }
            }
        }
    }

    return distanceCM
}

const debugVis = function () {
    //Debug info for real time updates.
    //
    const roomName = Memory.rooms[0].name; // Change this to a room you have vision in
    const vis = new RoomVisual(roomName);
    if (Memory.peakcpu === undefined) {
        Memory.peakcpu = 0;
    }

    const peakcpu = Memory.peakcpu;

    if (Game.cpu.getUsed() > peakcpu) {
        Memory.peakcpu = Game.cpu.getUsed().toFixed(2);
    }

    if (peakcpu > (Game.cpu.limit)) {
        vis.text(PEAK CPU: ${ peakcpu }, 1, 2, {
            align: 'left',
            color: '#ff1111',
            font: '2 Courier New'
        });
    }
    else if (peakcpu <= (Game.cpu.limit) && peakcpu > (Game.cpu.limit / 2)) {
        vis.text(PEAK CPU: ${ peakcpu }, 1, 2, {
            align: 'left',
            color: '#ff6644',
            font: '2 Courier New'
        });
    }
    else if (peakcpu < (Game.cpu.limit / 2)) {
        vis.text(PEAK CPU: ${ peakcpu }, 1, 2, {
            align: 'left',
            color: '#11ff11',
            font: '2 Courier New'
        });
    }


    vis.text(CPU: ${ Game.cpu.getUsed().toFixed(2) } / ${ Game.cpu.limit }, 1, 4, {
        align: 'left',
        color: '#1166ff',
        font: '2 Courier New'
    });

    vis.text(Bucket: ${ Game.cpu.bucket }, 1, 6, {
        align: 'left',
        color: '#1166ff',
        font: '2 Courier New'
    });

    vis.text(Controller Level: ${ Game.rooms[roomName].controller.level }, 1, 7, {
        align: 'left',
        color: '#1166ff',
        font: '0.5 Courier New'
    });
    vis.text(Room controller Progress: ${ Game.rooms[roomName].controller.progress + '/' + Game.rooms[roomName].controller.progressTotal }, 1, 7.5, {

        align: 'left',
        color: '#1166ff',
        font: '0.5 Courier New'
    });
    vis.text(Energy: ${ Game.rooms[roomName].energyAvailable } / ${ Game.rooms[roomName].energyCapacityAvailable }, 1, 8, {
        align: 'left',
        color: '#1166ff',
        font: '0.5 Courier New'
    });
    if (Game.cpu.bucket === 10000) {
        Game.cpu.generatePixel();
    }


}

module.exports.run = run
module.exports.shortStructures = shortStructures
// module.exports.memInit = memInit
// module.exports.placeStamp = placeStamp
// module.exports.findBestSpot = findBestSpot
// module.exports.distanceTransform = distanceTransform
// module.exports.diagonalDistanceTransform = diagonalDistanceTransform

