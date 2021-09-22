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
    "scomparti_11.json"
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
    "derivazioni_bt_11.json"
];

const quadri_bt = [
    "quadro_bt.json",
    "quadro_bt_01.json",
    "quadro_bt_02.json",
    "quadro_bt_03.json"
];


exports.confArray = [
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
        files: ["config.json"].concat(scomparti)
    },
    {
        outname: "trasformatori_mt_bt.html",
        files: ["config.json"].concat(trasformatori)
    },
    // {
    //     outname: "derivazioni_bt.html",
    //     files: ["config.json", "derivazioni_bt.json"]
    // }
    // ,
    {
        outname: "quadro_bt.html",
        files: ["config.json"].concat(quadri_bt)
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
    {
        outname: "dati_generali_derivazioni_bt.html",
        files: ["config.json", "dati_generali.json"].concat(derivazioni_bt)
    },
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
