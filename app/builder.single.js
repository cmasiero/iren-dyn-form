'use strict';
const resource = require('../lib/resource');
const fs = require('fs');
const path = require('path');
const parser = require('../lib/json.parser');
const pretty = require('pretty');
const minify = require('html-minifier').minify;

// Load building environment configuration.
const {initializeEnv} = require(`../config/build/env.js`); 
const env = initializeEnv();

// logging purpose
let log_filename_tag = `[${path.basename(__filename)}]`;

console.log(`${log_filename_tag} START`);

let dt = resource.DataSource.FILESYSTEM;

let jsonObj = resource.getJson(dt);
let htmlTemplate = resource.getTemplateHtml(dt);

let dom = parser.execute(jsonObj, htmlTemplate);
try {
  let outputPath = resource.getOutputPath(dt);

  // copies static files in output
  let staticFiles = resource.getStaticFiles(dt);
  staticFiles.forEach(f => {
    // copy if not exists!
    if (fs.existsSync(outputPath + '/' + f.filename) === false) {
      fs.writeFileSync(outputPath + '/' + f.filename, f.file);
      console.log(`${log_filename_tag} file: ${f.filename} COPIED!`);
    }
  });

  // copy css
  fs.writeFileSync(outputPath + '/' + jsonObj.config.css, resource.getCss(dt));
  
  // Generate html
  if (env.minify) {
    fs.writeFileSync(outputPath + '/' + jsonObj.config.filename,
      minify(dom.serialize(), {
        collapseWhitespace: true,
        minifyJS: true,
        removeComments: true
      })
    );
    console.log(`${log_filename_tag} file: ${jsonObj.config.filename} CREATED (minify)!`);
  } else {
    fs.writeFileSync(outputPath + '/' + jsonObj.config.filename, pretty(dom.serialize()));
    console.log(`${log_filename_tag} file: ${jsonObj.config.filename} CREATED!`);
  }

} catch (err) {
  console.error(err)
}

console.log(`${log_filename_tag} END`);