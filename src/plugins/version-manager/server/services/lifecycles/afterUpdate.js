const { getService } = require("./../../utils");
const afterUpdate = async (event) => {
    try {
        const { result, model } = event;
        const { updateVersion } = getService('core-api');
        await updateVersion(model.uid, result, result.updatedBy);
    }
    catch (error) {
        console.log("Error occured while updating versions." + error);
    }
};

module.exports = afterUpdate;

