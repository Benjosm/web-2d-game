/**
 * Asset Loader stub.
 * The real implementation should load textures and expose them via getter functions.
 * For now we expose a placeholder PIXI.Texture that can be used in tests.
 */
const PIXI = require('pixi.js'); // Assume pixi.js is installed as a dependency

let tilesetTexture = null;

/**
 * Loads the tileset image and creates a base texture.
 * In a real project this would be asynchronous and handle errors.
 */
function loadTileset(path) {
// Placeholder implementation – load a dummy 1x1 white texture.
const baseTexture = PIXI.BaseTexture.from(path);
tilesetTexture = new PIXI.Texture(baseTexture);
}

/**
 * Returns the already‑loaded tileset texture.
 * Throws if the texture has not been loaded yet.
 */
function getTilesetTexture() {
if (!tilesetTexture) {
  throw new Error('Tileset texture not loaded. Call loadTileset() first.');
}
return tilesetTexture;
}

module.exports = {
loadTileset,
getTilesetTexture,
};
