'use strict';

module.exports = [
  {
    method: 'POST',
    path: `/:slug/save`,
    handler: 'admin.save',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'admin::hasPermissions',
          config: {
            actions: ['plugin::version-manager.save'],
          },
        },
      ],
    },
  },
  {
    method: 'PUT',
    path: `/:slug/activate`,
    handler: 'admin.activate',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'admin::hasPermissions',
          config: {
            actions: ['plugin::version-manager.activate'],
          },
        },
      ],
    },
  },
  {
    method: 'GET',
    path: `/:slug/:contentId`,
    handler: 'admin.get',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'admin::hasPermissions',
          config: {
            actions: ['plugin::version-manager.get'],
          },
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/versions/content-types/:slug',
    handler: 'admin.getAll',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin'
      ],
    },
  }
];
