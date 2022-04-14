'use strict';

/**
 * version-test-uid service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::version-test-uid.version-test-uid');
