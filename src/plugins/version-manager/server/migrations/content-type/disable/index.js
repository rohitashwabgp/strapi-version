"use strict";

const { getService } = require("../../../utils");

// Disable versioning on CT -> Delete all older versions of entities
module.exports = async ({ oldContentTypes, contentTypes }) => {
  const { isVersionedContentType } = getService("content-types");

  
};
