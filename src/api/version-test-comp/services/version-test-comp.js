'use strict';

/**
 * version-test-comp service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::version-test-comp.version-test-comp');
