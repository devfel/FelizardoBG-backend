'use strict';

/**
 * board-game service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::board-game.board-game');
