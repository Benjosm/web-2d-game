/**
 * Jest unit tests for the Level loader (src/level.js).
 *
 * These tests mock `fetch` and the Asset Loader to run without a network
 * or real Pixi resources.
 */

const Level = require('../level');
const logger = require('../logger');
const { getTilesetTexture } = require('../assetLoader');
const { TILE_SIZE } = require('../constants');

// Mock fetch globally.
global.fetch = jest.fn();

// Mock logger to suppress console noise and allow verification.
jest.mock('../logger', () => ({
info: jest.fn(),
warn: jest.fn(),
error: jest.fn(),
debug: jest.fn(),
}));

// Mock assetLoader – return a dummy texture.
jest.mock('../assetLoader', () => ({
getTilesetTexture: jest.fn(() => ({
  // Minimal texture stub that Pixi can accept.
  baseTexture: { width: 256, height: 256 },
  width: 32,
  height: 32,
})),
}));

// Helper to create a valid level JSON object.
function createValidLevel() {
return {
  width: 4,
  height: 3,
  tiles: [
    [0, 1, 0, 2],
    [0, 0, 2, 2],
    [1, 1, 0, 0],
  ],
  collision: [1, 2],
  goal: { x: 3, y: 2 },
};
}

describe('Level.loadLevel', () => {
afterEach(() => {
  jest.clearAllMocks();
});

test('loads a valid level and constructs the collision grid', async () => {
  const levelJson = createValidLevel();
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => levelJson,
  });

  const level = await Level.loadLevel('http://example.com/level.json');

  // Verify basic properties.
  expect(level.width).toBe(levelJson.width);
  expect(level.height).toBe(levelJson.height);
  expect(level.collisionGrid.length).toBe(levelJson.height);
  expect(level.collisionGrid[0].length).toBe(levelJson.width);

  // Check that solid tiles match the collision array.
  expect(level.isSolid(1, 0)).toBe(true); // tile ID 1
  expect(level.isSolid(3, 0)).toBe(true); // tile ID 2
  expect(level.isSolid(0, 0)).toBe(false); // tile ID 0
  expect(level.getGoalPosition()).toEqual({ x: 3, y: 2 });
});

test('rejects when fetch fails', async () => {
  fetch.mockResolvedValueOnce({ ok: false, status: 404 });
  await expect(Level.loadLevel('bad/url')).rejects.toThrow('Network response was not ok');
  expect(logger.error).toHaveBeenCalled();
});

test('rejects when JSON is malformed', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => 'this is not an object',
  });
  await expect(Level.loadLevel('url')).rejects.toThrow();
  expect(logger.error).toHaveBeenCalled();
});

test('rejects when JSON fails schema validation (missing tiles)', async () => {
  const broken = { ...createValidLevel() };
  delete broken.tiles;
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => broken,
  });
  await expect(Level.loadLevel('url')).rejects.toThrow('Invalid level JSON');
  expect(logger.error).toHaveBeenCalled();
});
});
