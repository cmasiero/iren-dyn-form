'use strict';

const fs = require('fs');
const pretty = require('pretty');
const { joinJsonFile } = require('../lib/builder-json');


test('build json parts', () => {

    // Loads document parts
    let attached = fs.readFileSync("test/resource/attached.json");
    let attachedObj = JSON.parse(attached);

    let fileCf = fs.readFileSync("test/resource/config.json");
    let file01 = fs.readFileSync("test/resource/part_01.json");
    let file02 = fs.readFileSync("test/resource/part_02.json");

    // let resultObj = joinJsonFile(JSON.parse(fileCf), JSON.parse(file01), JSON.parse(file02));
    let resultObj = joinJsonFile([JSON.parse(fileCf), JSON.parse(file01), JSON.parse(file02)]);


    // console.log(JSON.stringify(attachedObj));
    // console.log(JSON.stringify(resultObj));

    expect(attachedObj).toStrictEqual(resultObj);

});