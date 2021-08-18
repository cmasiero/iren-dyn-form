'use strict';
const resource = require('../lib/resource');
const fs = require('fs');
const path = require('path');
const parser = require('../lib/parser-json.js');
const pretty = require('pretty');

// logging purpose
let log_filename_tag = `[${path.basename(__filename)}]`;

console.log(`${log_filename_tag} START`);

let dt = resource.DataSource.FILESYSTEM;

let jsonObj = resource.getJson(dt);
let htmlTemplate = resource.getTemplateHtml(dt);

let dom = parser.execute(jsonObj, htmlTemplate);
try {
  let outputPath = resource.getOutputPath(dt);
  fs.writeFileSync( outputPath + '/' + jsonObj.config.css , resource.getCss(dt));
  let pathHtmlFile = outputPath + '/'  + jsonObj.config.filename;
  fs.writeFileSync(pathHtmlFile , pretty(dom.serialize()));
  console.log(`${log_filename_tag} file: ${jsonObj.config.filename} CREATED! `);
} catch (err) {
  console.error(err)
}

console.log(`${log_filename_tag} END`);