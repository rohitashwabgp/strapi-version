"use strict";

const uuid = require("uuid");
const _ = require("lodash");
const { getService } = require("../utils");

module.exports = {

  /**
   * get the details of a version
   * @param {string} slug 
   * @param {number} contentId 
   * @param {number} versionNumber 
   * @returns 
   */
  async getVersion(slug, contentId, versionNumber = null) {
    if (versionNumber) {
      return await strapi.db.query("plugin::version-manager.content-type-version").findOne({
        where: { contentType: slug, contentId, versionNumber },
        populate: { createdBy: true },
      });
    } else {
      return await strapi.db.query("plugin::version-manager.content-type-version").findMany({
        where: { contentType: slug, contentId },
        populate: { createdBy: true },
      });
    }
  },
  /**
   * gets all versions of a content type
   * @param {string} slug 
   * @returns 
   */
  async getAllContentTypesVersion(slug) {
    let data = await strapi.db.query("plugin::version-manager.content-type-version").findMany({
      where: { contentType: slug },
      populate: { createdBy: true },
    });
    return data;
  },
  /**
   * activates a version 
   * @param {string} slug 
   * @param {object} data 
   * @param {object} user 
   * @returns 
   */
  async activate(slug, data, user) {
    let result;
    let contentType = await strapi.db.query("plugin::version-manager.content-type-version").findMany({
      where:
        { contentId: data.id, versionNumber: data.versionNumber, contentType: slug }, populate: { createdBy: true }
    });
    for (let item of contentType) {
      if (item.versionNumber == data.versionNumber) {
        item.dataJson.updatedBy = user?.id;
        item.dataJson.updatedAt = new Date();
        result = await strapi.entityService.update(slug, data.id, { data: item.dataJson, populate: '*' });
        await strapi.entityService.update("plugin::version-manager.content-type-version", item.id, {
          data: { active: true },
        });
      } else {
        if (item.activate) {
          await strapi.entityService.update("plugin::version-manager.content-type-version", item.id, {
            data: { active: false },
          });
        }
      }
    }
    return result;
  },
  /**
   * 
   * @param {string} slug 
   * @param {object} data 
   * @param {object} user 
   * @param {function} createNewVersion 
   * @returns 
   */
  async createContentTypeFirstVersion(slug, data, user, createNewVersion) {
    let newData = createNewVersion(slug, data);
    newData.createdAt = data.createdAt ? data.createdAt : new Date();
    newData.updatedAt = data.updatedAt ? data.updatedAt : new Date();
    newData.publishedAt = data.publishedAt ? data.publishedAt : null;
    newData.createdBy = user?.id;
    newData.updatedBy = user?.id;
    newData = await strapi.entityService.create(slug, { data: newData, populate: '*' }); // triggers a auto create of version check after create hook .
    data.id = newData.id;
    return data;
  },
  /**
   * gets latest version  and generates next version 
   * @param {staring} slug 
   * @param {object} data 
   * @param {object} user 
   * @param {function} createNewVersion 
   * @returns 
   */
  async newVersionData(slug, data, user, createNewVersion) {
    let olderVersions = await strapi.db.query("plugin::version-manager.content-type-version").findMany({
      where: { contentType: slug, contentId: data.id }, populate: { createdBy: true }
    });
    if (olderVersions && olderVersions.length && olderVersions.length > 0) {
      const latestVersion = _.maxBy(olderVersions, (v) => v.versionNumber);
      const latestVersionNumber = latestVersion && latestVersion.versionNumber;
      data.versionNumber = Number(latestVersionNumber || 0) + 1;
      try {
        if (olderVersions && olderVersions.length > 0) {
          data.createdBy = olderVersions[0].createdBy.id;
        }
      } catch (e) {
        // Fallback set logged user ID
        data.createdBy = user?.id;
      }
      data.vuid = olderVersions[0]?.vuid;
      data.updatedBy = user?.id;
    } else {
      data.vuid = uuid();
      data.versionNumber = 1;
      data.updatedBy = user?.id;
      data.createdBy = user?.id;
    }
    return createNewVersion(slug, JSON.parse(JSON.stringify(data)));
  },
  /**
   * 
   * @param {slug} slug 
   * @param {object} data 
   * @param {object} user 
   * @returns 
   */
  async createVersion(slug, data, user) {
    const { createNewVersion } = getService("content-types");
    // setup data, get old version and new version number
    if (!data.id) {
      return module.exports.createContentTypeFirstVersion(slug, data, user, createNewVersion);
    }
    const newData = await module.exports.newVersionData(slug, data, user, createNewVersion);
    await strapi.entityService.create("plugin::version-manager.content-type-version", {
      data: {
        dataJson: newData,
        viewJson: data,
        vuid: data.vuid,
        contentType: slug,
        versionNumber: data.versionNumber,
        contentId: data.id,
        active: false,
        updatedBy: user?.id,
        createdBy: user?.id
      }, populate: '*'
    });
    console.log("createVersion completed .");
    return data;
  },
  /**
   * updates existing version .
   * @param {string} slug 
   * @param {object} data 
   * @param {object} user 
   * @returns 
   */
  async updateVersion(slug, data, user) {
    try {
      const { createNewVersion } = getService("content-types");
      // setup data, get old version and new version number
      if (!data.id) {
        console.error("Content Id is Required .Returning......");
        return data;
      }
      let existingVersion = await strapi.db.query("plugin::version-manager.content-type-version").findMany({
        where: { contentType: slug, contentId: data.id, versionNumber: data.versionNumber }, populate: { createdBy: true }
      });
      if (existingVersion.length !== 1) {
        console.error("Version number mismatched.Returning......");
        return data;
      }
        data.updatedBy = user?.id;
        data.createdBy = existingVersion[0].dataJson.createdBy;
        const newData = createNewVersion(slug, JSON.parse(JSON.stringify(data)));
        const result = await strapi.entityService.update("plugin::version-manager.content-type-version", existingVersion[0].id, {
          data: {
            dataJson: newData,
            viewJson: data,
            updatedBy: user?.id,
            createdBy: user?.id
          }, populate: '*'
        });
        console.log("updateVersion completed .");
        return result;
    } catch (error) {
      console.error("updateVersion error occured"+error);
      return data;
    }
  },
  /**
   * 
   * @param {string} slug 
   * @param {object} user 
   * @returns 
   */
  async findAllForUser(slug, user) {
    if (!user) {
      return [];
    }
    const allItems = await strapi.db.query(slug).findMany({
      populate: {
        versions: true,
      },
      where: {
        createdBy: user.id
      },
    });

    return allItems;
  },
};
