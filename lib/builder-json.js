const joinJsonFile = (... jsonFiles) => {
    let objResult = {};

    jsonFiles.forEach(f => {
        let obj = JSON.parse(f);
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