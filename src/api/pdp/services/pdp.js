'use strict';

/**
 * pdp service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::pdp.pdp');
