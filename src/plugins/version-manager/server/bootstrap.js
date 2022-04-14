"use strict";

const { getService } = require("./utils");

module.exports = async ({ strapi }) => {
  const { actions } = getService("permissions");
  strapi.server.router.use("/content-manager/collection-types/:model", async (ctx, next) => {
    const { model } = ctx.params;
    if (ctx.method === "GET") {
      const modelDef = strapi.getModel(model);
      if (!getService("content-types").isVersionedContentType(modelDef)) {
        return next();
      }
    }
    if (ctx.method === "POST") {
      delete ctx.request.body.versionNumber;
    }
    return next();
  });

  strapi.server.router.use("/content-manager/collection-types/:slug/:contentId", async (ctx, next) => {
    const { getVersion } = getService('core-api');
    const { slug, contentId } = ctx.request.params;
    if (ctx.method === "GET") {
      const { version } = ctx.request.query;
      if (version) {
        let viewVersionedContentType = await getVersion(slug, contentId, version);
        return ctx.send(viewVersionedContentType.viewJson);
      }
    }
    return next();
  });

  strapi.server.router.use("/content-manager/single-types/:slug", async (ctx, next) => {
    const { getVersion } = getService('core-api');
    const { slug } = ctx.request.params;
    if (ctx.method === "GET") {
      const { version, contentId} = ctx.request.query;
      if (version) {
        let viewVersionedContentType = await getVersion(slug, contentId, version);
        return ctx.send(viewVersionedContentType.viewJson);
      }
    }
    return next();
  });

  await actions.registerVersionsActions();
  registerModelsHooks();
};

const registerModelsHooks = () => {
  const versionedModelUIDs = Object.values(strapi.contentTypes).filter((contentType) => getService("content-types").isVersionedContentType(contentType)).map((contentType) => contentType.uid);

  if (versionedModelUIDs.length > 0) {
    strapi.db.lifecycles.subscribe({
      models: versionedModelUIDs,
      async afterCreate(event) {
        await getService("lifecycles").afterCreate(event);
      },
      async afterUpdate(event) {
        await getService("lifecycles").afterUpdate(event);
      },

    });
  }
};
