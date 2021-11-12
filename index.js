'use strict';
// const { initConfig, getCss, getJson, getTemplateHtml, getOutputPath, DataSource } = require('./lib/resource');
const resource = require('./lib/resource');
const fs = require('fs');
const parser = require('./lib/json.parser.js');
const pretty = require('pretty');


exports.jsonToHtml = function (configParam) {

    console.log("[irendynform:index:jsonToHtml] START");

    let dt = resource.DataSource.FILESYSTEM;

    resource.initConfig(configParam);

    let jsonObj = resource.getJson(dt);
    let htmlTemplate = resource.getTemplateHtml(dt);

    let dom = parser.execute(jsonObj, htmlTemplate);
    try {
        let outputPath = resource.getOutputPath(dt);
        fs.writeFileSync(outputPath + '/' + jsonObj.config.css, resource.getCss(dt));
        fs.writeFileSync(outputPath + '/' + jsonObj.config.filename, pretty(dom.serialize()));
    } catch (err) {
        console.error(err)
    }

    console.log("[irendynform:index:jsonToHtml] END");

};
