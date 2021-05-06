"use strict"
const fs = require('fs');
const { getJson, getCss, getTemplateHtml, DataSource } = require('../lib/resource');

test('Return default json from filesystem.', () => {

    let fileJson = fs.readFileSync("config/default.json");
    let jsonObject = JSON.parse(fileJson);

    let jsonObjTest = getJson(DataSource.FILESYSTEM);

    expect(jsonObject).toStrictEqual(jsonObjTest);

});

test('Return css file from filesystem as File.', () => {

    let cssFile = fs.readFileSync("config/default.css");
    let cssFileTest = getCss(DataSource.FILESYSTEM);

    expect(cssFile).toStrictEqual(cssFileTest);

});

test('Return html file from filesystemas String.', () => {

    let htmlFile = fs.readFileSync("template/version5.html").toString();
    let htmlFileTest = getTemplateHtml(DataSource.FILESYSTEM); 

    expect(htmlFile).toStrictEqual(htmlFileTest);

});