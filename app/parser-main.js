'use strict';
const resource = require('../lib/resource');
const fs = require('fs');
const parser = require('../lib/parser-json.js');
const pretty = require('pretty');

console.log("[parser-main] START");

let dt = resource.DataSource.FILESYSTEM;

let jsonObj = resource.getJson(dt);
let htmlTemplate = resource.getTemplateHtml(dt);

let dom = parser.execute(jsonObj, htmlTemplate);
try {
  let outputPath = resource.getOutputPath(dt);
  fs.writeFileSync( outputPath + '/' + jsonObj.config.css , resource.getCss(dt));
  fs.writeFileSync( outputPath + '/'  + jsonObj.config.filename, pretty(dom.serialize()));
} catch (err) {
  console.error(err)
}

console.log("[parser-main] END");