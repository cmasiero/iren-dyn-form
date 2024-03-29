/*
 * start command: node .\customization_project\SchedaRaccDati\duplicate-card.js
 */

const fs = require('fs');
const path = require('path');

// logging purpose
let log_filename_tag = `[${path.basename(__filename)}]`;

const makeScomparti = (config) => {

    let resultAll = {};
    let idxes = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"];
    idxes.forEach(idx => {

        // let idx = "01";
        let sourceData = fs.readFileSync(config.source, 'utf8');
        let outData = sourceData.replace(/"scomparti"/g, `"scomparti_${idx}"`);
        outData = outData.replace(/"00 Scomparti"/g, `"${idx} Scomparti"`);
        outData = outData.replace(/rule_/g, `rule${idx}_`);
        outData = outData.replace(/sc_/g, `sc${idx}_`);

        let jsonObject = JSON.parse(outData);

        let idxSc = idx === "01" ? "" : (parseInt(idx) - 1).toString();
        idxSc = idxSc.length === 1 ? "0".concat(idxSc) : idxSc;
        let sc = Object.assign({ 'rule': `visible if sc${idxSc}_ulteriore_scomparto_gestire == 'SI'` }, jsonObject[`scomparti_${idx}`]);

        let resultSingle = {};
        resultSingle[`scomparti_${idx}`] = sc;
        fs.writeFileSync(config.destination + '/' + `scomparti${idx}.json`, JSON.stringify(resultSingle, null, 2));

        resultAll[`scomparti_${idx}`] = sc;

    });

    fs.writeFileSync(config.destination + '/' + `scompartiAll.json`, JSON.stringify(resultAll, null, 2));

};

const makeTrasformatoriMtBt = (config) => {

    let resultAll = {};
    let idxes = ["01", "02", "03"];
    idxes.forEach(idx => {

        // let idx = "01";
        let sourceData = fs.readFileSync(config.source, 'utf8');
        let outData = sourceData.replace(/"trasformatori_mt_bt"/g, `"trasformatori_mt_bt_${idx}"`);
        outData = outData.replace(/"00 Trasformatori MT-BT"/g, `"${idx} Trasformatori MT-BT"`);
        // outData = outData.replace(/rule_/g, `rule${idx}_`);
        outData = outData.replace(/tr_/g, `tr${idx}_`);

        let jsonObject = JSON.parse(outData);

        let idxSc = idx === "01" ? "" : (parseInt(idx) - 1).toString();
        idxSc = idxSc.length === 1 ? "0".concat(idxSc) : idxSc;
                                                       
        let sc = Object.assign({ 'rule': `visible if tr${idxSc}_ulteriore_trasformatore_gestire == 'SI'` }, jsonObject[`trasformatori_mt_bt_${idx}`]);

        let resultSingle = {};
        resultSingle[`trasformatori_mt_bt_${idx}`] = sc;
        fs.writeFileSync(config.destination + '/' + `trasformatori_mt_bt_${idx}.json`, JSON.stringify(resultSingle, null, 2));

        resultAll[`trasformatori_mt_bt_${idx}`] = sc;

    });

    fs.writeFileSync(config.destination + '/' + `trasformatori_mt_btAll.json`, JSON.stringify(resultAll, null, 2));

};

const makeDerivazioniBt = (config) => {

    let resultAll = {};
    let idxes = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"];
    idxes.forEach(idx => {

        let sourceData = fs.readFileSync(config.source, 'utf8');
        let outData = sourceData.replace(/"derivazioni_bt"/g, `"derivazioni_bt_${idx}"`);
        outData = outData.replace(/"00 Derivazioni BT"/g, `"${idx} Derivazioni BT"`);
        // outData = outData.replace(/rule_/g, `rule${idx}_`);
        outData = outData.replace(/dbt_/g, `dbt${idx}_`);

        let jsonObject = JSON.parse(outData);

        let idxSc = idx === "01" ? "" : (parseInt(idx) - 1).toString();
        idxSc = idxSc.length === 1 ? "0".concat(idxSc) : idxSc;
                                                       
        let sc = Object.assign({ 'rule': `visible if dbt${idxSc}_ulteriore_derivazione_gestire == 'SI'` }, jsonObject[`derivazioni_bt_${idx}`]);

        let resultSingle = {};
        resultSingle[`derivazioni_bt_${idx}`] = sc;
        fs.writeFileSync(config.destination + '/' + `derivazioni_bt_${idx}.json`, JSON.stringify(resultSingle, null, 2));

        resultAll[`derivazioni_bt_${idx}`] = sc;

    });

    fs.writeFileSync(config.destination + '/' + `derivazioni_btAll.json`, JSON.stringify(resultAll, null, 2));

};

const makeQuadroBt = (config) => {

    let resultAll = {};
    let idxes = ["01", "02", "03"];
    idxes.forEach(idx => {

        let sourceData = fs.readFileSync(config.source, 'utf8');
        let outData = sourceData.replace(/"quadro_bt"/g, `"quadro_bt_${idx}"`);
        outData = outData.replace(/"00 Quadro BT"/g, `"${idx} Quadro BT"`);
        // outData = outData.replace(/rule_/g, `rule${idx}_`);
        outData = outData.replace(/qbt_/g, `qbt${idx}_`);

        let jsonObject = JSON.parse(outData);

        let idxSc = idx === "01" ? "" : (parseInt(idx) - 1).toString();
        idxSc = idxSc.length === 1 ? "0".concat(idxSc) : idxSc;
                                                       
        let sc = Object.assign({ 'rule': `visible if qbt${idxSc}_ulteriore_derivazione_gestire == 'SI'` }, jsonObject[`quadro_bt_${idx}`]);

        let resultSingle = {};
        resultSingle[`quadro_bt_${idx}`] = sc;
        fs.writeFileSync(config.destination + '/' + `quadro_bt_${idx}.json`, JSON.stringify(resultSingle, null, 2));

        resultAll[`quadro_bt_${idx}`] = sc;

    });

    fs.writeFileSync(config.destination + '/' + `quadro_btAll.json`, JSON.stringify(resultAll, null, 2));

};

// out folder
const outFolder = path.join(__dirname, 'duplicate_card_out')

// clean outFolder
let filesRemoved = fs.readdirSync(outFolder);
filesRemoved.forEach(file => {
    fs.unlinkSync(path.join(outFolder, file));
    console.log(path.join(outFolder, file).concat(' Old file REMOVED!'));
});


console.log(`${log_filename_tag} ### Do new files ###`);

makeScomparti({
    source: path.join(__dirname, '../../config/json_split/scomparti.json'),
    destination: outFolder
});


makeTrasformatoriMtBt({
    source: path.join(__dirname, '../../config/json_split/trasformatori_mt_bt.json'),
    destination: outFolder
});

makeDerivazioniBt({
    source: path.join(__dirname, '../../config/json_split/derivazioni_bt.json'),
    destination: outFolder
});

makeQuadroBt({
    source: path.join(__dirname, '../../config/json_split/quadro_bt.json'),
    destination: outFolder
});

console.log(`${log_filename_tag} ### New files DONE ###`);
console.log(`${log_filename_tag} ### Path: ${outFolder} ###`);

