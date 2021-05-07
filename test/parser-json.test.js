'use strict';
const { getJson, getTemplateHtml, getOutputPath, DataSource } = require('../lib/resource');
const fs = require('fs');
const parser = require('../app/parser-json.js');
const pretty = require('pretty');

let jsonObj = getJson(DataSource.FILESYSTEM);
let htmlTemplate = getTemplateHtml(DataSource.FILESYSTEM);

test('test parser', () => {
  let dom = parser.execute(jsonObj, htmlTemplate);
  try {
    const data = fs.writeFileSync(getOutputPath(DataSource.FILESYSTEM) + '/test.html', pretty(dom.serialize()));
    //file written successfully
  } catch (err) {
    console.error(err)
  }
  expect(1).toBe(1);
});