'use strict';
const fs = require('fs');
const path = require('path');
const { joinJsonFile } = require('../lib/builder-json');
const resource = require('../lib/resource');
const parser = require('../lib/parser-json.js');
const pretty = require('pretty');

const confArray = [
    {
        outname: "dati_generali.html",
        files: ["config.json", "dati_generali.json"]
    },
    {
        outname: "cabine_secondarie.html",
        files: ["config.json", "cabine_secondarie.json"]
    },
    {
        outname: "scomparti.html",
        files: ["config.json", "scomparti.json"]
    },
    {
        outname: "trasformatori_mt_bt.html",
        files: ["config.json", "trasformatori_mt_bt.json"]
    },
    // {
    //     outname: "derivazioni_bt.html",
    //     files: ["config.json", "derivazioni_bt.json"]
    // }
    // ,
    {
        outname: "quadro_bt.html",
        files: ["config.json", "quadro_bt.json"]
    },
    // {
    //     outname: "dati_generali_cabine_secondarie.html",
    //     files: ["config.json", "dati_generali.json", "cabine_secondarie.json"]
    // },
    // {
    //     outname: "dati_generali_scomparti.html",
    //     files: ["config.json", "dati_generali.json", "scomparti.json"]
    // },
    // {
    //     outname: "dati_generali_trasformatori_mt_bt.html",
    //     files: ["config.json", "dati_generali.json", "trasformatori_mt_bt.json"]
    // },
    // {
    //     outname: "dati_generali_derivazioni_bt.html",
    //     files: ["config.json", "dati_generali.json", "derivazioni_bt.json"]
    // },
    // {
    //     outname: "dati_generali_bt_quadro_bt.html",
    //     files: ["config.json", "dati_generali.json", "quadro_bt.json"]
    // }
// ,
    // {
    //     outname: "dati_generali_derivazioni_bt_quadro_bt.html",
    //     files: ["config.json", "dati_generali.json", "derivazioni_bt.json", "quadro_bt.json"]
    // }
];

// logging purpose
let log_filename_tag = `[${path.basename(__filename)}]`;

confArray.forEach(confObj => {

    let dt = resource.DataSource.FILESYSTEM;

    // array of json objects 
    let fileObjs = confObj.files.map(filename => {
        let fPart = resource.getJsonFromSplit(dt, filename);
        return fPart;
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