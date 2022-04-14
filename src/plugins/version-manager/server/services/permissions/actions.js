const actions = [
  {
    section: "plugins",
    displayName: "Save version",
    uid: "save",
    pluginName: "version-manager",
  },
  {
    section: "plugins",
    displayName: "activate version",
    uid: "activate",
    pluginName: "version-manager",
  },
  {
    section: "plugins",
    displayName: "get version",
    uid: "get",
    pluginName: "version-manager",
  }
];

const registerVersionsActions = async () => {
  const { actionProvider } = strapi.admin.services.permission;
  await actionProvider.registerMany(actions);
};

module.exports = { registerVersionsActions };
