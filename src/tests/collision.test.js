/**
 * Jest tests for the pure collision detection function.
 */

const { detectCollision } = require('../collision');
const { TILE_SIZE } = require('../constants');

describe('detectCollision', () => {
// Mock Level with a 5x5 grid where (2,2) and (3,2) are solid.
const mockLevel = {
  isSolid: (x, y) => {
    return (x === 2 && y === 2) || (x === 3 && y === 2);
  },
};

test('returns false when player is entirely in non‑solid area', () => {
  const rect = { x: 0, y: 0, width: TILE_SIZE, height: TILE_SIZE };
  expect(detectCollision(rect, mockLevel)).toBe(false);
});

test('returns true when player overlaps a solid tile partially', () => {
  // Player positioned so that it straddles tile (2,2).
  const rect = {
    x: (2 * TILE_SIZE) - TILE_SIZE / 2,
    y: (2 * TILE_SIZE) - TILE_SIZE / 2,
    width: TILE_SIZE,
    height: TILE_SIZE,
  };
  expect(detectCollision(rect, mockLevel)).toBe(true);
});

test('returns true when player is exactly aligned with edge of solid tile', () => {
  const rect = {
    x: 2 * TILE_SIZE,
    y: 2 * TILE_SIZE,
    width: TILE_SIZE,
    height: TILE_SIZE,
  };
  expect(detectCollision(rect, mockLevel)).toBe(true);
});

test('returns true when player covers multiple solid tiles', () => {
  const rect = {
    x: (2 * TILE_SIZE) - 4,
    y: (2 * TILE_SIZE) - 4,
    width: TILE_SIZE * 2,
    height: TILE_SIZE,
  };
  expect(detectCollision(rect, mockLevel)).toBe(true);
});

test('returns false when player is outside level bounds', () => {
  const rect = { x: -100, y: -100, width: TILE_SIZE, height: TILE_SIZE };
  expect(detectCollision(rect, mockLevel)).toBe(false);
});

test('does not mutate input objects', () => {
  const rect = { x: 0, y: 0, width: TILE_SIZE, height: TILE_SIZE };
  const rectCopy = { ...rect };
  detectCollision(rect, mockLevel);
  expect(rect).toEqual(rectCopy);
});

test('throws on invalid playerRect', () => {
  expect(() => detectCollision(null, mockLevel)).toThrow();
  expect(() => detectCollision({ x: 0 }, mockLevel)).toThrow();
});

test('throws on invalid level object', () => {
  const rect = { x: 0, y: 0, width: TILE_SIZE, height: TILE_SIZE };
  expect(() => detectCollision(rect, null)).toThrow();
  expect(() => detectCollision(rect, {})).toThrow();
});
});
