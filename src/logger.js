/**
 * Simple logger utility used throughout the project.
 * In production this could be replaced with a more sophisticated logger (e.g., Winston).
 */
const logger = {
info: (...args) => console.info('[INFO]', ...args),
warn: (...args) => console.warn('[WARN]', ...args),
error: (...args) => console.error('[ERROR]', ...args),
debug: (...args) => console.debug('[DEBUG]', ...args),
};

module.exports = logger;
