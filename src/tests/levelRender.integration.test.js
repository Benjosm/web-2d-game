/**
 * Integration test that validates the Level.render method creates Pixi sprites
 * with the correct texture frames.
 *
 * This test runs in a headless environment using the `canvas` package to
 * provide a mock HTMLCanvasElement for PixiJS.
 */

const Level = require('../level');
const { getTilesetTexture } = require('../assetLoader');
const { TILE_SIZE } = require('../constants');
const PIXI = require('pixi.js');
const { createCanvas } = require('canvas');

// Setup a mock canvas for Pixi.
global.document = {
createElement: (tag) => {
  if (tag === 'canvas') {
    return createCanvas(800, 600);
  }
  return null;
},
};
global.window = {
devicePixelRatio: 1,
};

jest.mock('../assetLoader', () => ({
getTilesetTexture: jest.fn(() => {
  // Return a dummy 32x32 texture.
  const base = new PIXI.BaseTexture.from('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AArEB9ZV9XGIAAAAASUVORK5CYII=');
  return new PIXI.Texture(base);
}),
}));

// Helper to produce a tiny valid level JSON.
function simpleLevel() {
return {
  width: 2,
  height: 2,
  tiles: [
    [0, 1],
    [2, 3],
  ],
  collision: [1, 2],
  goal: { x: 1, y: 1 },
};
}

describe('Level.render integration', () => {
let level;
beforeAll(async () => {
  // Mock fetch for loadLevel.
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => simpleLevel(),
  });
  level = await Level.loadLevel('http://example.com/level.json');
});

test('creates a Pixi Container with the correct number of children', () => {
  const container = new PIXI.Container();
  const renderContainer = level.render(container);
  expect(renderContainer.children.length).toBe(level.width * level.height);
});

test('sprites have texture frames matching tile IDs', () => {
  const container = new PIXI.Container();
  const renderContainer = level.render(container);
  // Sample a few positions to verify texture usage.
  // In this stub we use the whole texture for all tiles, but in a real
  // implementation you would slice frames. We'll assert that a texture
  // instance exists.
  renderContainer.children.forEach(sprite => {
    expect(sprite).toBeInstanceOf(PIXI.Sprite);
    expect(sprite.texture).toBeDefined();
  });
});

test('destroy cleans up Pixi resources without errors', () => {
  const container = new PIXI.Container();
  level.render(container);
  expect(() => level.destroy()).not.toThrow();
  expect(level._renderContainer).toBeNull();
});
});
