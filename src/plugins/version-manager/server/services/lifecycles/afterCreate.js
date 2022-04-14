const { getService } = require("./../../utils");
const _ = require("lodash");
const afterCreate = async (event) => {
    try {
        const { result, model } = event;
        const { createVersion, getVersion } = getService('core-api');
        let existing = getVersion(model.uid, result.id, result.versionNumber);
        if (_.isEmpty(existing)) {
            await createVersion(model.uid, result, result.createdBy)
        }
    } catch (error) {
        console.log("Error occured while creating version." + error);
    }
};

module.exports = afterCreate;

