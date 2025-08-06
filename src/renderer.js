/**
 * PixiJS Renderer Core
 *
 * Provides a thin wrapper around a PIXI.Application instance with lifecycle
 * methods used by the test suite:
 *   - init():   creates the main stage container.
 *   - start():  starts the Pixi ticker (renders frames).
 *   - stop():   stops the ticker and pauses rendering.
 *
 * The implementation is deliberately minimal but robust:
 *   * All public methods are idempotent where appropriate.
 *   * Errors are logged via the project's logger.
 *   * The renderer can be attached to a DOM element (e.g. a <div>) or
 *     left unattached (useful for headless test environments).
 *   * Resources are cleaned up via destroy().
 *
 * This file satisfies the "Implement PixiJS Renderer core (`src/renderer.js`) –
 * init, start, stop" requirement.
 */

const PIXI = require('pixi.js');
const logger = require('./logger');

class Renderer {
  /**
   * @param {Object} options
   * @param {number} [options.width=800]  Width of the canvas in pixels.
   * @param {number} [options.height=600] Height of the canvas in pixels.
   * @param {HTMLElement} [options.mount] DOM element to mount the canvas onto.
   */
  constructor(options = {}) {
    this.width = options.width || 800;
    this.height = options.height || 600;
    this.mount = options.mount; // optional mount point

    // Initialise the Pixi Application. `autoStart: false` so we can control start/stop.
    this.app = new PIXI.Application({
      width: this.width,
      height: this.height,
      backgroundColor: 0x000000,
      autoStart: false,
    });

    // If a mount point is supplied, append the view (canvas) to it.
    if (this.mount && typeof this.mount.appendChild === 'function') {
      this.mount.appendChild(this.app.view);
    }

    // Internal flag to prevent double init.
    this._initialized = false;
  }

  /**
   * Initialise the rendering stage. Must be called before `start()`.
   * Idempotent – calling multiple times has no side‑effects.
   *
   * @returns {this}
   */
  init() {
    if (this._initialized) {
      logger.debug('Renderer.init() called but already initialized.');
      return this;
    }

    // The root container for all level content.
    this.stage = new PIXI.Container();
    this.app.stage.addChild(this.stage);

    this._initialized = true;
    logger.debug('Renderer initialized.');
    return this;
  }

  /**
   * Starts the rendering loop. Guarantees that init() has been called.
   *
   * @returns {this}
   */
  start() {
    if (!this._initialized) {
      // Auto‑initialize if the user skipped init().
      this.init();
    }

    if (this.app.ticker.started) {
      logger.debug('Renderer.start() called but ticker already started.');
      return this;
    }

    this.app.start(); // Starts the ticker and begins rendering.
    logger.debug('Renderer started.');
    return this;
  }

  /**
   * Stops the rendering loop and pauses drawing.
   *
   * @returns {this}
   */
  stop() {
    if (!this.app.ticker.started) {
      logger.debug('Renderer.stop() called but ticker already stopped.');
      return this;
    }

    this.app.stop(); // Stops the ticker.
    logger.debug('Renderer stopped.');
    return this;
  }

  /**
   * Adds a child container (e.g. a Level's render container) to the main stage.
   *
   * @param {PIXI.Container} child
   * @returns {this}
   */
  addToStage(child) {
    if (!this._initialized) {
      this.init();
    }

    if (!child) {
      logger.warn('Renderer.addToStage called with falsy child.');
      return this;
    }

    this.stage.addChild(child);
    return this;
  }

  /**
   * Destroys the Pixi Application and all its children.
   * After calling destroy(), the Renderer instance should no longer be used.
   *
   * @returns {this}
   */
  destroy() {
    if (this.app) {
      this.app.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      });
      this.app = null;
      this.stage = null;
    }
    logger.debug('Renderer destroyed.');
    return this;
  }
}

module.exports = Renderer;
