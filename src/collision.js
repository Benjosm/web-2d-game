/**
 * Pure collision detection utility.
 *
 * Determines whether a player’s axis‑aligned bounding box collides with any solid tile
 * in a Level instance. The function is side‑effect free and can be safely unit‑tested.
 */

const { TILE_SIZE } = require('./constants');

/**
 * @param {{x:number, y:number, width:number, height:number}} playerRect – world‑space AABB of the player.
 * @param {Object} level – Instance of the Level class (must implement isSolid(x, y)).
 * @returns {boolean} true if the player overlaps any solid tile; false otherwise.
 */
function detectCollision(playerRect, level) {
if (
  !playerRect ||
  typeof playerRect.x !== 'number' ||
  typeof playerRect.y !== 'number' ||
  typeof playerRect.width !== 'number' ||
  typeof playerRect.height !== 'number'
) {
  throw new Error('Invalid playerRect supplied to detectCollision');
}
if (!level || typeof level.isSolid !== 'function') {
  throw new Error('Invalid level object supplied to detectCollision');
}

// Convert world coordinates to tile indices.
const startX = Math.floor(playerRect.x / TILE_SIZE);
const startY = Math.floor(playerRect.y / TILE_SIZE);
const endX = Math.floor((playerRect.x + playerRect.width) / TILE_SIZE);
const endY = Math.floor((playerRect.y + playerRect.height) / TILE_SIZE);

// Iterate over all tiles the player potentially overlaps.
for (let ty = startY; ty <= endY; ty++) {
  for (let tx = startX; tx <= endX; tx++) {
    if (level.isSolid(tx, ty)) {
      return true; // Early exit on first solid tile.
    }
  }
}
return false;
}

module.exports = {
detectCollision,
};
