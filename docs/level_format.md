# Level File Format

The game uses a simple JSON format to describe each level.  
All level files must conform to the JSON Schema located at `src/schemas/levelSchema.json`.

## Top‑Level Properties

| Property | Type | Description |
|----------|------|-------------|
| `width`  | integer (≥1) | Number of tiles horizontally. |
| `height` | integer (≥1) | Number of tiles vertically. |
| `tiles`  | array of arrays | A **height**‑length array where each element is an array of **width** tile IDs. Tile IDs are integers that map to a frame in the tileset texture. |
| `collision` | array of integers | Tile IDs that should be treated as solid (player cannot pass through). |
| `goal`   | object | Coordinates of the goal tile. Must be within the map bounds (`0 ≤ x < width`, `0 ≤ y < height`). |
| &nbsp;`goal.x` | integer | X coordinate (in tile units). |
| &nbsp;`goal.y` | integer | Y coordinate (in tile units). |

## Example Level