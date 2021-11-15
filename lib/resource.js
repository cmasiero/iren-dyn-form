"use strict";
const fs = require('fs');
const path = require('path');

// Load building environment configuration.
const { initializeEnv } = require(`../config/build/env.js`);
const env = initializeEnv();

// logging purpose
let log_filename_tag = `[${path.basename(__filename)}]`;


// exports.initConfig = (configParam) => {
//     config = configParam;
// };

const DataSource = {
    FILESYSTEM: "filesystem",
    DATABASE: "database"
};
exports.DataSource = DataSource;


/**
 * Return json file from filesystem or database as object.
 * @param {DataSource} source 
 * @returns {Object} json object.
 */
exports.getJson = (source) => {
    if (source === DataSource.FILESYSTEM) {
        let fileJson = fs.readFileSync(env.path_json);
        let jsonObject = JSON.parse(fileJson);
        return jsonObject;
    } else {
        throw new Error("Illegal argument error! %s", source);
    }
};

exports.getPathFolderJsonSplit = () => {
    return env.path_folder_json_split;
};

/**
 * Return split part of json file from filesystem or database as object.
 * @param {*} source 
 * @param {*} filename 
 * @returns {Object} json object.
 */
exports.getJsonFromSplit = (source, filename) => {
    if (source === DataSource.FILESYSTEM) {
        let f = env.path_folder_json_split.concat("/").concat(filename);
        let fileJson = fs.readFileSync(f);
        let jsonObject = JSON.parse(fileJson);
        return jsonObject;
    } else {
        throw new Error("Illegal argument error! %s", source);
    }
};

/**
 * Return css file from filesystem or database as File.
 * @param {*} source 
 * @returns css file.
 */
exports.getCss = (source) => {
    if (source === DataSource.FILESYSTEM) {
        return fs.readFileSync(env.path_css);
    } else {
        throw new Error("Illegal argument error! %s", source);
    }
};

exports.getCssFileName = (source) => {
    if (source === DataSource.FILESYSTEM) {
        let spl = env.path_css.split("/").pop();
        return spl;
    } else {
        throw new Error("Illegal argument error! %s", source);
    }
};

/**
 * Return html file from filesystem or database as string.
 * @param {DataSource} source
 * @returns {string} html in string format.
 */
exports.getTemplateHtml = (source) => {
    if (source === DataSource.FILESYSTEM) {
        return fs.readFileSync(env.path_template_html).toString();
    } else {
        throw new Error("Illegal argument error! %s", source);
    }
};

/**
 * Return array of static files.
 * @param {DataSource} source
 * @returns {string} html in string format.
 */
exports.getStaticFiles = (source) => {
    if (source === DataSource.FILESYSTEM) {
        let filenames = fs.readdirSync(env.path_static_script);
        return filenames.map(filename => {
            return {
                filename: filename,
                file: fs.readFileSync(env.path_static_script.concat("/").concat(filename)).toString()
            }
        });
    } else {
        throw new Error("Illegal argument error! %s", source);
    }
};




/**
 * Return outputPath o db parameter
 * @param {DataSource} source
 * @returns {string} output path or db parameter.
 */
exports.getOutputPath = (source) => {
    if (source === DataSource.FILESYSTEM) {
        return env.path_folder_output;
    } else {
        throw new Error("Illegal argument error! %s", source);
    }
};

/**
 * Only for test case
 * Return outputPath o db parameter
 * @param {DataSource} source
 * @returns {string} output path or db parameter.
 */
exports.getOutputPathTest = (source) => {
    if (source === DataSource.FILESYSTEM) {
        return env.path_folder_output_test;
    } else {
        throw new Error("Illegal argument error! %s", source);
    }
};