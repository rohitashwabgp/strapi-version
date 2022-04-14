"use strict";

const afterCreate = require("./lifecycles/afterCreate");
const afterUpdate = require("./lifecycles/afterUpdate");

module.exports = () => ({
  afterCreate,
  afterUpdate,
});
