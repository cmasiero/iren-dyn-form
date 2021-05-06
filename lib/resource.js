"use strict";
const fs = require('fs');

/**
 * Configuration:
 */
const config = {
    path_json: "config/default.json",
    path_css: "config/default.css",
    path_template_html: "template/version5.html",
    path_output: "output"
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
    console.log("[resource:getJson] %s", source);
    if (source === DataSource.FILESYSTEM) {
        let fileJson = fs.readFileSync(config.path_json);
        let jsonObject = JSON.parse(fileJson);
        return jsonObject;
    }
};

/**
 * Return css file from filesystem or database as File.
 * @param {*} source 
 * @returns css file.
 */
exports.getCss = (source) => {
    console.log("[resource:getCss] %s", source);
    if (source === DataSource.FILESYSTEM) {
        return fs.readFileSync(config.path_css);
    }
};

/**
 * Return html file from filesystem or database as string.
 * @param {DataSource} source
 * @returns {string} html in string format.
 */
exports.getTemplateHtml = (source) => {
    console.log("[resource:getTemplateHtml] %s", source);
    if (source === DataSource.FILESYSTEM) {
        return fs.readFileSync(config.path_template_html).toString();
    }
};


/**
 * Return outputPath o db parameter
 * @param {DataSource} source
 * @returns {string} output path or db parameter.
 */
 exports.getOutputPath = (source) => {
    console.log("[resource:getOutputPath] %s", source);
    if (source === DataSource.FILESYSTEM) {
        return config.path_output;
    }
};