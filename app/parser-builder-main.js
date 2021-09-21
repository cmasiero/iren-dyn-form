'use strict';
const fs = require('fs');
const path = require('path');
const { joinJsonFile } = require('../lib/builder-json');
const resource = require('../lib/resource');
const parser = require('../lib/parser-json.js');
const pretty = require('pretty');

// Load building environment configuration.
const {initializeEnv} = require(`../config/build/env.js`); 
const env = initializeEnv();
const {confArray} = require(env.builder_config);

// logging purpose
let log_filename_tag = `[${path.basename(__filename)}]`;

confArray.forEach(confObj => {

    let dt = resource.DataSource.FILESYSTEM;

    // array of json objects 
    let fileObjs = confObj.files.map(filename => {
        try {
            let fPart = resource.getJsonFromSplit(dt, filename);
            return fPart;
        } catch (err) {
            err.message += ` - Is ${env.builder_config} correct?`
            throw new Error(err);
        }
    });

    // join files
    let jsonObj = joinJsonFile(fileObjs);
    
    // set html file name in joined file
    jsonObj.config.filename = confObj.outname;

    // Base template
    let htmlTemplate = resource.getTemplateHtml(dt);

    // create html dom 
    let dom = parser.execute(jsonObj, htmlTemplate);

    try {
        fs.writeFileSync(resource.getOutputPath(dt) + '/' + jsonObj.config.css, resource.getCss(dt));
        fs.writeFileSync(resource.getOutputPath(dt) + '/' + jsonObj.config.filename, pretty(dom.serialize()));
        console.log(`${log_filename_tag} file: ${jsonObj.config.filename} CREATED!`);
    } catch (err) {
        console.error(err)
    }

});