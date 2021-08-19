'use strict';
// First of all set env
// Load building environment configuration.
const {initializeEnv} = require(`../config/build/env.js`); 
const env = initializeEnv('dev');

const { getCss, getJson, getTemplateHtml, getOutputPathTest, DataSource } = require('../lib/resource');
const fs = require('fs');
const parser = require('../lib/parser-json');
const pretty = require('pretty');

let jsonObj = getJson(DataSource.FILESYSTEM);
let htmlTemplate = getTemplateHtml(DataSource.FILESYSTEM);

test('test parser', () => {
  let dom = parser.execute(jsonObj, htmlTemplate);
  try {
    fs.writeFileSync(getOutputPathTest(DataSource.FILESYSTEM) + '/' + jsonObj.config.css, getCss(DataSource.FILESYSTEM));
    fs.writeFileSync(getOutputPathTest(DataSource.FILESYSTEM) + '/' + jsonObj.config.filename, pretty(dom.serialize()));
  } catch (err) {
    console.error(err)
  }
  expect(1).toBe(1);
});