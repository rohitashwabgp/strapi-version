"use strict";

const { getService } = require("../../../utils");
const uuid = require("uuid");

// if versioning is enabled set default version and vuid
module.exports = async ({ oldContentTypes, contentTypes }) => {
  const { isVersionedContentType } = getService("content-types");
  const { createVersion } = getService('core-api');
  if (!oldContentTypes) {
    return;
  }
  for (const uid in contentTypes) {
    if (!oldContentTypes[uid]) {
      continue;
    }
    const oldContentType = oldContentTypes[uid];
    const contentType = contentTypes[uid];
    if (!isVersionedContentType(oldContentType) && isVersionedContentType(contentType)) {
      const existingContentTypes = await strapi.db.query(uid).findMany();
      for (const contentType of existingContentTypes) {
        return await createVersion(uid, contentType, null );
      }
    }
  }
};
