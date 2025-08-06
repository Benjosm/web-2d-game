/**
 * Asset Manifest Utility
 *
 * Provides functions to load and query the asset manifest.
 *
 * The manifest (src/assetManifest.json) contains metadata for each game asset,
 * including its logical name, relative path, type, version, and an optional hash.
 *
 * The utility caches the manifest after the first load to avoid unnecessary I/O.
 */
const fs = require('fs');
const path = require('path');

// Absolute path to the manifest file
const MANIFEST_PATH = path.resolve(__dirname, 'assetManifest.json');

// Internal cache
let _manifestCache = null;

/**
 * Load the manifest from disk (or from cache).
 * @returns {Object} Parsed manifest JSON.
 * @throws {Error} If the manifest cannot be read or parsed.
 */
function loadManifest() {
  if (_manifestCache) {
    return _manifestCache;
  }
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  try {
    _manifestCache = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse asset manifest at ${MANIFEST_PATH}: ${e.message}`);
  }
  return _manifestCache;
}

/**
 * Retrieve an asset entry by its logical name.
 * @param {string} name - The asset's logical name (e.g., 'playerSprite').
 * @returns {Object|null} Asset entry or null if not found.
 */
function getAsset(name) {
  const manifest = loadManifest();
  const entry = manifest.assets.find(a => a.name === name);
  return entry || null;
}

/**
 * List all assets of a specific type.
 * @param {string} type - Asset type filter ('image', 'audio', etc.).
 * @returns {Array<Object>} Array of matching asset entries.
 */
function listAssetsByType(type) {
  const manifest = loadManifest();
  return manifest.assets.filter(a => a.type === type);
}

/**
 * Get the current manifest version.
 * @returns {string} Semantic version string.
 */
function getVersion() {
  const manifest = loadManifest();
  return manifest.version;
}

module.exports = {
  loadManifest,
  getAsset,
  listAssetsByType,
  getVersion,
};
