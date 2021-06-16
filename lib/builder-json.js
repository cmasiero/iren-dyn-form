const joinJsonFile = (jsonObjs) => {
    let objResult = {};

    jsonObjs.forEach(obj => {
        Object.keys(obj).forEach(key => {
            objResult[key] = obj[key];
        });
    });

    // console.log( JSON.stringify(objResult));
    return objResult;
};

module.exports = {
    joinJsonFile
}