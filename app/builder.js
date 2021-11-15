'use strict';
const fs = require('fs');
const path = require('path');
const { joinJsonFile } = require('../lib/json.builder');
const resource = require('../lib/resource');
const parser = require('../lib/json.parser');
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
        let outputPath = resource.getOutputPath(dt);

        // copies static files in output
        let staticFiles = resource.getStaticFiles(dt);
        staticFiles.forEach(f => {
            if (fs.existsSync(outputPath + '/' + f.filename) === false) {
                fs.writeFileSync(outputPath + '/' + f.filename, f.file);
                console.log(`${log_filename_tag} file: ${f.filename} COPIED!`);
            }
        });

        fs.writeFileSync(outputPath + '/' + jsonObj.config.css, resource.getCss(dt));
        fs.writeFileSync(outputPath + '/' + jsonObj.config.filename, pretty(dom.serialize()));
        console.log(`${log_filename_tag} file: ${jsonObj.config.filename} CREATED!`);
    } catch (err) {
        console.error(err)
    }

});