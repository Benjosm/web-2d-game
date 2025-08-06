/**
 * Level Loader & Runtime Representation
 *
 * This module implements:
 *  - Loading a level JSON file via fetch().
 *  - Validation against the JSON Schema in `src/schemas/levelSchema.json`.
 *  - Construction of a collision grid (`true` = solid).
 *  - Goal handling (coordinate validation and retrieval).
 *  - Rendering of tile sprites using PixiJS (ParticleContainer when possible).
 *  - Event emission for level completion.
 *
 * The implementation intentionally avoids any game‑loop logic; it only provides
 * the data and utilities required by the rest of the engine.
 */

const logger = require('./logger');
const { getTilesetTexture } = require('./assetLoader');
const Ajv = require('ajv');
const { TILE_SIZE, MAX_PARTICLE_TILES } = require('./constants');
const EventEmitter = require('events');
const PIXI = require('pixi.js'); // assume pixi.js is installed

// Load and compile the JSON schema once.
const ajv = new Ajv({ allErrors: true, schemas: [] });
const levelSchema = require('./schemas/levelSchema.json');
const validate = ajv.compile(levelSchema);

class Level extends EventEmitter {
/**
 * @param {Object} rawData - The parsed level JSON that already passed schema validation.
 */
constructor(rawData) {
  super();
  this.width = rawData.width;
  this.height = rawData.height;
  this.tiles = rawData.tiles;
  this.collisionTileIds = new Set(rawData.collision);
  this.goal = rawData.goal; // {x, y}

  // Validate goal is within bounds.
  if (
    this.goal.x < 0 ||
    this.goal.y < 0 ||
    this.goal.x >= this.width ||
    this.goal.y >= this.height
  ) {
    const msg = `Goal position out of bounds: (${this.goal.x}, ${this.goal.y})`;
    logger.error(msg);
    throw new Error(msg);
  }

  // Build a 2‑D boolean collision grid.
  this.collisionGrid = new Array(this.height);
  for (let y = 0; y < this.height; y++) {
    this.collisionGrid[y] = new Array(this.width);
    for (let x = 0; x < this.width; x++) {
      const tileId = this.tiles[y][x];
      this.collisionGrid[y][x] = this.collisionTileIds.has(tileId);
    }
  }

  // Rendering container (created lazily in render()).
  this._renderContainer = null;
}

/** Static loader ------------------------------------------------------- */
static loadLevel(url) {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok (status ${response.status})`);
      }
      return response.json();
    })
    .then(json => {
      const valid = validate(json);
      if (!valid) {
        const errors = ajv.errorsText(validate.errors);
        logger.error(`Level JSON validation failed: ${errors}`);
        throw new Error(`Invalid level JSON: ${errors}`);
      }
      return new Level(json);
    })
    .catch(err => {
      logger.error(`Failed to load level from ${url}: ${err.message}`);
      throw err;
    });
}

/** Collision API ------------------------------------------------------- */
/**
 * Returns true if the tile at (x, y) is solid.
 * @param {number} x - Tile X coordinate (integer).
 * @param {number} y - Tile Y coordinate (integer).
 */
isSolid(x, y) {
  if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
    return false; // Out‑of‑bounds tiles are treated as non‑solid.
  }
  return this.collisionGrid[y][x];
}

/** Goal API ----------------------------------------------------------- */
/**
 * Returns the goal coordinate object `{x, y}`.
 */
getGoalPosition() {
  return { x: this.goal.x, y: this.goal.y };
}

/**
 * Checks whether the supplied player AABB overlaps the goal tile.
 * Emits a "levelComplete" event the first time the goal is reached.
 * @param {{x:number, y:number, width:number, height:number}} playerRect
 * @returns {boolean} true if the goal is reached.
 */
checkGoal(playerRect) {
  const goalWorldX = this.goal.x * TILE_SIZE;
  const goalWorldY = this.goal.y * TILE_SIZE;
  const goalRect = {
    x: goalWorldX,
    y: goalWorldY,
    width: TILE_SIZE,
    height: TILE_SIZE,
  };

  const overlap =
    playerRect.x < goalRect.x + goalRect.width &&
    playerRect.x + playerRect.width > goalRect.x &&
    playerRect.y < goalRect.y + goalRect.height &&
    playerRect.y + playerRect.height > goalRect.y;

  if (overlap && !this._goalReached) {
    this._goalReached = true;
    this.emit('levelComplete');
  }
  return overlap;
}

/** Rendering ----------------------------------------------------------- */
/**
 * Renders the level into the provided Pixi Container.
 * If `container` is omitted, the method will create a new container and return it.
 * Uses ParticleContainer for batching when tile count ≤ MAX_PARTICLE_TILES.
 * @param {PIXI.Container} [container]
 * @returns {PIXI.Container} The container that now holds the tile sprites.
 */
render(container) {
  const totalTiles = this.width * this.height;
  const useParticle = totalTiles <= MAX_PARTICLE_TILES;
  const texture = getTilesetTexture();

  // Create appropriate container.
  const renderContainer = useParticle
    ? new PIXI.ParticleContainer(totalTiles, {
        scale: true,
        position: true,
        rotation: true,
        uvs: true,
        alpha: true,
      })
    : new PIXI.Container();

  if (!useParticle) {
    logger.warn(
      `Tile count (${totalTiles}) exceeds MAX_PARTICLE_TILES (${MAX_PARTICLE_TILES}); using regular Container.`
    );
  }

  // Generate sprites / particle data.
  for (let y = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++) {
      const tileId = this.tiles[y][x];
      // Assume each tile ID maps to a frame in the tileset texture.
      // For simplicity we use the whole texture; real implementation should use texture.frame.
      const sprite = new PIXI.Sprite(texture);
      sprite.x = x * TILE_SIZE;
      sprite.y = y * TILE_SIZE;
      sprite.width = TILE_SIZE;
      sprite.height = TILE_SIZE;
      renderContainer.addChild(sprite);
    }
  }

  // Attach to supplied container or stage.
  if (container) {
    container.addChild(renderContainer);
  } else {
    // No external container supplied – return the newly created one.
    // Caller can add it to the stage.
  }

  // Store reference for later destruction.
  this._renderContainer = renderContainer;
  return renderContainer;
}

/** Cleanup ------------------------------------------------------------ */
/**
 * Destroys all Pixi resources allocated for this level.
 * Should be called before loading a new level.
 */
destroy() {
  if (this._renderContainer) {
    this._renderContainer.destroy({ children: true, texture: false, baseTexture: false });
    this._renderContainer = null;
  }
  // Remove all listeners to avoid memory leaks.
  this.removeAllListeners();
}
}

module.exports = Level;
