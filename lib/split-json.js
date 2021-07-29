const fs = require('fs');

/**
 * Splits input json file based on root key.
 * RootKey in default.json file means 'config' and 'table names' (eg: See config/default.json).
 * Output is in config/json_split.
 * @param {*} jsonObj 
 * @param {*} outpath 
 * @returns 
 */
const splitJsonFileByRootKes = (jsonObj, outpath) => {

    let keyNames = Object.keys(jsonObj);

    keyNames.forEach(rootKey => {
        let obj = {
            [rootKey]: jsonObj[rootKey]
        };
        fs.writeFileSync(`${outpath}/${rootKey}.json`, JSON.stringify(obj,null,2));
    });
};

module.exports = {
    splitJsonFileByRootKes
}