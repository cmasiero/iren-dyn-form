
const builder_util = require('./builder-util.js');

/**
 * prod configuration
 */
const scomparti = [
    "scomparti.json",
    "scomparti_01.json",
    "scomparti_02.json",
    "scomparti_03.json",
    "scomparti_04.json",
    "scomparti_05.json",
    "scomparti_06.json",
    "scomparti_07.json",
    "scomparti_08.json",
    "scomparti_09.json",
    "scomparti_10.json",
    "scomparti_11.json",
    "scomparti_12.json",
    "scomparti_13.json"
];
const trasformatori = [
    "trasformatori_mt_bt.json",
    "trasformatori_mt_bt_01.json",
    "trasformatori_mt_bt_02.json",
    "trasformatori_mt_bt_03.json"
];
const derivazioni_bt = [
    "derivazioni_bt.json",
    "derivazioni_bt_01.json",
    "derivazioni_bt_02.json",
    "derivazioni_bt_03.json",
    "derivazioni_bt_04.json",
    "derivazioni_bt_05.json",
    "derivazioni_bt_06.json",
    "derivazioni_bt_07.json",
    "derivazioni_bt_08.json",
    "derivazioni_bt_09.json",
    "derivazioni_bt_10.json",
    "derivazioni_bt_11.json",
    "derivazioni_bt_12.json",
    "derivazioni_bt_13.json"
];
const quadri_bt = [
    "quadro_bt.json",
    "quadro_bt_01.json",
    "quadro_bt_02.json",
    "quadro_bt_03.json"
];

const firstElDefault = {
    tag: "co_dg",
    file: ["config.json", "dati_generali.json"]
};
const elToCombine = {
    tags: [
        { tag: "cs", file: ["cabine_secondarie.json"] },
        { tag: "sc", file: scomparti },
        { tag: "tr", file: trasformatori },
        { tag: "dbt", file: derivazioni_bt },
        { tag: "qbt", file: quadri_bt }
    ]
};


exports.confArray = builder_util.buildConfiguration(firstElDefault,elToCombine);

// console.log("================================");
// console.log(builder_util.buildConfiguration());
// console.log("================================");
