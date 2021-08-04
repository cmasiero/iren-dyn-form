"use strict";
const fs = require('fs');

/**
 * Configuration:
 */
let config = {
    // path_json: "config/default_send_hide_tab.json",
    // path_json: "config/default_example_radio.json",
    path_json: "config/default.json",
    path_css: "config/default.css",
    path_folder_json_split: 'config/json_split',
    path_template_html: "config/version5.html",
    path_folder_output: "output",
    path_folder_output_test: "test/output",
};

exports.initConfig = (configParam) => {
    config = configParam;
};

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
        // console.log("[resource:getJson] %s", config.path_json);
        let fileJson = fs.readFileSync(config.path_json);
        let jsonObject = JSON.parse(fileJson);
        return jsonObject;
    } else {
        throw new Error("Illegal argument error! %s", source);
    }
};

exports.getPathFolderJsonSplit = () => {
    return config.path_folder_json_split;
};

/**
 * Return split part of json file from filesystem or database as object.
 * @param {*} source 
 * @param {*} filename 
 * @returns {Object} json object.
 */
 exports.getJsonFromSplit = (source, filename) => {
    if (source === DataSource.FILESYSTEM) {
        let f = config.path_folder_json_split.concat("/").concat(filename);
        // console.log("[resource:getJsonFromSplit] %s", f);
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
        // console.log("[resource:getCss] %s", config.path_css);
        return fs.readFileSync(config.path_css);
    } else {
        throw new Error("Illegal argument error! %s", source);
    }
};

exports.getCssFileName = (source) => {
    if (source === DataSource.FILESYSTEM) {
        // console.log("[resource:getCssFileName] %s", config.path_css);
        let spl = config.path_css.split("/").pop();
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
        // console.log("[resource:getTemplateHtml] %s", config.path_template_html);
        return fs.readFileSync(config.path_template_html).toString();
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
        // console.log("[resource:getOutputPath] %s", config.path_folder_output);
        return config.path_folder_output;
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
        // console.log("[resource:getOutputPath] %s", config.path_folder_output_test);
        return config.path_folder_output_test;
    } else {
        throw new Error("Illegal argument error! %s", source);
    }
};