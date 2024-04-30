'use strict';

/**
 * external-bg router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::external-bg.external-bg');
