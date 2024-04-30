'use strict';

/**
 * external-bg service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::external-bg.external-bg');
