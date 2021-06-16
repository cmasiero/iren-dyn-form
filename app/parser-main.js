'use strict';
const { getCss, getJson, getTemplateHtml, getOutputPath, DataSource } = require('../lib/resource');
const fs = require('fs');
const parser = require('../lib/parser-json.js');
const pretty = require('pretty');

let jsonObj = getJson(DataSource.FILESYSTEM);
let htmlTemplate = getTemplateHtml(DataSource.FILESYSTEM);

let dom = parser.execute(jsonObj, htmlTemplate);
try {
  fs.writeFileSync(getOutputPath(DataSource.FILESYSTEM) + '/' + jsonObj.config.css , getCss(DataSource.FILESYSTEM));
  fs.writeFileSync(getOutputPath(DataSource.FILESYSTEM) + '/'  + jsonObj.config.filename, pretty(dom.serialize()));
} catch (err) {
  console.error(err)
}
