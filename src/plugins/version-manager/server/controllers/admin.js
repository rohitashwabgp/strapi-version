'use strict';

const { getService } = require('../utils');

module.exports = {
  async save(ctx) {
    const { slug } = ctx.request.params;
    const { body: data } = ctx.request;
    const { user } = ctx.state;
    const { createVersion } = getService('core-api');
    return await createVersion(slug, data, user);
  },
  async activate(ctx) {
    const { slug } = ctx.request.params;
    const { body: data } = ctx.request;
    const { user } = ctx.state;
    const { activate } = getService('core-api');
    return await activate(slug, data, user);
  },
  async get(ctx) {
    const { slug, contentId } = ctx.request.params;
    const { versionNumber } = ctx.request.query;
    const { getVersion } = getService('core-api');
    return await getVersion(slug, contentId, versionNumber );
  },
  async getAll(ctx) {
    const { slug } =  ctx.request.params;
    const data = await strapi
    .plugin('version-manager')
    .service('core-api')
    .getAllContentTypesVersion(slug);
    ctx.send(data)  
  }
};
