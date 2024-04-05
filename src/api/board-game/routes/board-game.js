"use strict";

/**
 * board-game router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::board-game.board-game");
