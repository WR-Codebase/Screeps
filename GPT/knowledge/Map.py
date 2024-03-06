# Adjusting the map to correctly represent the Y-axis (top to bottom) and map swamps in green.
# Also, we will map objects on the map based on the updated request.

# Re-reading the terrain data to include adjustments and additional features.
with open('/mnt/data/E51N15.json') as file:
    terrain_data = json.load(file)

# Initialize a 50x50 grid to represent the room, default to 0 (plain), 1 for wall, 2 for swamp
room_map = [[0 for _ in range(50)] for _ in range(50)]

# Update the grid with the terrain data
for item in terrain_data['terrain']:
    x = item['x']
    y = item['y']
    if item['type'] == 'wall':
        room_map[49 - y][x] = 1  # Invert y-axis and mark walls
    elif item['type'] == 'swamp':
        room_map[49 - y][x] = 2  # Invert y-axis and mark swamps

# Preparing to map objects: sources, controller, and minerals
# Map sources as 3, controller as 4, minerals as 5
for obj in terrain_data['objects']:
    x = obj['x']
    y = obj['y']
    if obj['type'] == 'source':
        room_map[49 - y][x] = 3
    elif obj['type'] == 'controller':
        room_map[49 - y][x] = 4
    elif obj['type'] == 'mineral':
        room_map[49 - y][x] = 5

# Plot the updated room map with objects
plt.figure(figsize=(10, 10))
# Use a custom colormap to differentiate terrain types and objects
from matplotlib.colors import ListedColormap
cmap = ListedColormap(['lightgrey', 'black', 'green', 'yellow', 'blue', 'magenta'])
plt.imshow(room_map, cmap=cmap, origin='lower')
plt.title('Room E51N15 Terrain and Objects Map')
plt.xlabel('X Coordinate')
plt.ylabel('Y Coordinate')
plt.grid(which='major', color='black', linestyle='-', linewidth=0.5)
plt.xticks(range(0, 50, 5))
plt.yticks(range(0, 50, 5))

# Create a custom legend for the map
import matplotlib.patches as mpatches
legend_handles = [
    mpatches.Patch(color='lightgrey', label='Plain'),
    mpatches.Patch(color='black', label='Wall'),
    mpatches.Patch(color='green', label='Swamp'),
    mpatches.Patch(color='yellow', label='Source'),
    mpatches.Patch(color='blue', label='Controller'),
    mpatches.Patch(color='magenta', label='Mineral')
]
plt.legend(handles=legend_handles, bbox_to_anchor=(1.05, 1), loc='upper left')

plt.show()
