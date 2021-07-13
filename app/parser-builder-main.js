'use strict';
const fs = require('fs');
const { joinJsonFile } = require('../lib/builder-json');
const { getJsonFromSplit, getTemplateHtml, getOutputPath, getCss, DataSource } = require('../lib/resource');
const parser = require('../lib/parser-json.js');
const pretty = require('pretty');

const confArray = [
    {
        outname: "dati_generali_cabine_cabine_secondarie.html",
        files: ["config.json", "dati_generali.json", "cabine_secondarie.json"]
    }
    ,
    {
        outname: "dati_generali_scomparti.html",
        files: ["config.json", "dati_generali.json", "scomparti.json"]
    }
    ,
    {
        outname: "dati_generali_trasformatori_mt_bt.html",
        files: ["config.json", "dati_generali.json", "trasformatori_mt_bt.json"]
    }
    ,
    {
        outname: "dati_generali_derivazioni_bt_quadro_bt.html",
        files: ["config.json", "dati_generali.json", "derivazioni_bt.json", "quadro_bt.json"]
    }
];

confArray.forEach(confObj => {

    let fileObjs = confObj.files.map(filename => {
        let fPart = getJsonFromSplit(DataSource.FILESYSTEM, filename);
        return fPart;
    });

    let jsonObj = joinJsonFile(fileObjs);
    jsonObj.config.filename = confObj.outname;

    // console.log(jsonObj);

    let htmlTemplate = getTemplateHtml(DataSource.FILESYSTEM);

    let dom = parser.execute(jsonObj, htmlTemplate);

    try {
        console.log(jsonObj.config.filename);
        fs.writeFileSync(getOutputPath(DataSource.FILESYSTEM) + '/' + jsonObj.config.css, getCss(DataSource.FILESYSTEM));
        fs.writeFileSync(getOutputPath(DataSource.FILESYSTEM) + '/' + jsonObj.config.filename, pretty(dom.serialize()));
    } catch (err) {
        console.error(err)
    }

});