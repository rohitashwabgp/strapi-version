'use strict';

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin('quill_editor')
      .service('myService')
      .getWelcomeMessage();
  },
};
