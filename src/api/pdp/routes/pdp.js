'use strict';

/**
 * pdp router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::pdp.pdp');
