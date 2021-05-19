'use strict';

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const {
    TitleHtml,
    TableHtml,
    RowHtml,
    ColHtml,
    StrongText,
    TextHtml,
    RadioHtml,
    SelectHtml,
    CheckboxHtml,
    getHtmlWithRule
} = require('../lib/part-html');

const { 
    HeadValidation,
    TailValidation,
    DocReady,
    HeadVisibility,
    TailVisibility,
    VisibilityParent,
    resultScript
} = require('../lib/part-script')

const specialKey = ["config"];

/**
 * It creates a jsdom object by the input css and html template.
 * @param {Object} jsonObj 
 * @param {string} htmlTemplate 
 * @returns a jsdom.JSDOM object
 */
exports.execute = (jsonObj, htmlTemplate) => {

    let dom = new JSDOM(htmlTemplate);

    /* Configuration area */
    insertConfigPart(jsonObj, dom);

    /* Html area */
    insertHtmlPart(jsonObj, dom);

    /* Visibility script area */
    insertScriptVisible(dom);

    /* Validations script area*/
    insertScriptMandatory(dom);

    /* Submit area */
    insertSubmitScript(dom);

    return dom;

}

/**
 * Configuration parts means: "config": {
 *                                "css" : "/example/example.css",
 *                                        "title": "Card title for test!"
 *                            }
 * in jsonObj into html output.                                     
 * @param {*} jsonObj 
 * @param {*} dom 
 */
let insertConfigPart = (jsonObj, dom) => {

    if (jsonObj.config !== undefined) {
        let tagHead = dom.window.document.getElementsByTagName("head");

        let linkStr = `<link rel="stylesheet" href="${jsonObj.config.css}"></link>`;
        let titleStr = `<title>${jsonObj.config.title}</title>`;
        tagHead[0].insertAdjacentHTML("beforeend", linkStr);
        tagHead[0].insertAdjacentHTML("beforeend", titleStr);
    }

}

/**
 * Html parts means "00":{
 *                      "comment": "Titled area, it will not written in html!",
 *                      "title":{
 *                          "value": "Titolo 1"
 *                       },
 *                       [cut]
 *       
 * @param {*} jsonObj 
 * @param {*} dom 
 */
let insertHtmlPart = (jsonObj, dom) => {

    let htmlPart = (currentCol, colEl) => {

        if (colEl.type === "description") {
            let strongText = new StrongText(colEl);
            currentCol.insertAdjacentHTML("beforeend", strongText.buildPart());
        } else if (colEl.type === "text") {
            let textHtml = new TextHtml(colEl);
            currentCol.insertAdjacentHTML("beforeend", textHtml.buildPart());
        } else if (colEl.type === "checkbox") {
            let checkboxHtml = new CheckboxHtml(colEl);
            currentCol.insertAdjacentHTML("beforeend", checkboxHtml.buildPart());
        } else if (colEl.type === "radio") {
            let radioHtml = new RadioHtml(colEl);
            currentCol.insertAdjacentHTML("beforeend", radioHtml.buildPart());
        } else if (colEl.type === "select") {
            let selectHtml = new SelectHtml(colEl);
            currentCol.insertAdjacentHTML("beforeend", selectHtml.buildPart());
        }

    };

    /* Html area */
    let tagBody = dom.window.document.getElementsByTagName("body");
    tagBody[0].insertAdjacentHTML("afterend", "<form>");

    let formElements = dom.window.document.getElementsByTagName("form");
    let formElement = formElements[0];
    let keyNames = Object.keys(jsonObj);
    let tmpIdTable = "";
    let idRowIndex = -1;
    keyNames.filter(idTable => !specialKey.includes(idTable)).forEach(idTable => {

        // New id table
        let keyTables = Object.keys(jsonObj[idTable]);
        keyTables.forEach(key => {

            if (key === "comment") {
                console.log("comment %s", jsonObj[idTable].comment);
            }
            else if (key === "title") {
                let el = { id: "id_title_".concat(idTable), value: jsonObj[idTable][key].value };
                let titleHtml = new TitleHtml(el);
                formElement.insertAdjacentHTML("beforeend", titleHtml.buildPart());
            } else {
                /* Otherwise are rows */
                // All rows are inside a table.
                if (tmpIdTable !== idTable) {
                    tmpIdTable = idTable;
                    let tableHtml = new TableHtml({ id: idTable });
                    formElement.insertAdjacentHTML("beforeend", tableHtml.buildPart());
                }

                // new row
                let idRow = "id_row_".concat(++idRowIndex);
                let rowHtml = new RowHtml({ id: idRow });
                const currentTable = dom.window.document.getElementById(idTable);
                currentTable.insertAdjacentHTML("beforeend", rowHtml.buildPart());

                const currentRow = dom.window.document.getElementById(idRow);
                let columnKes = Object.values(jsonObj[idTable][key]);
                let idColIndex = -1;
                columnKes.forEach(colEl => {

                    let idCol = "id_col_".concat(idRowIndex).concat("_").concat(++idColIndex);
                    let colHtml = new ColHtml({ id: idCol });
                    currentRow.insertAdjacentHTML("beforeend", colHtml.buildPart());
                    const currentCol = dom.window.document.getElementById(idCol);

                    if (colEl.group !== undefined) {
                        colEl.group.forEach(elGruop => {
                            htmlPart(currentCol, elGruop);
                        })
                    } else {
                        htmlPart(currentCol, colEl);
                    }

                })

            }

        })

    });

}

/**
 * ScriptPart are inside <script> tags in html page.
 * @param {*} dom 
 */
let insertScriptVisible = (dom) => {

    /* insert script tag inside head tag */
    let tagForm = dom.window.document.getElementsByTagName("form");
    let scriptStr = `<script type="text/javascript"></script>`;
    tagForm[0].insertAdjacentHTML("afterend", scriptStr);

    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", new DocReady().buildPart());


    tagScript[0].insertAdjacentHTML("beforeend", new VisibilityParent().buildPart());


    // output is visibility method implementation.
    tagScript[0].insertAdjacentHTML("beforeend", new HeadVisibility().buildPart());

    let visibilityContent = "";

    getHtmlWithRule().forEach(partHtml => {
        let tmp = resultScript.scriptRule(partHtml, "visible");
        visibilityContent = visibilityContent.concat(tmp);
    });

    tagScript[0].insertAdjacentHTML("beforeend", visibilityContent);

    tagScript[0].insertAdjacentHTML("beforeend", new TailVisibility().buildPart());

}

/**
 * ScriptPart are inside <script> tags in html page.
 * @param {*} dom 
 */
let insertScriptMandatory = (dom) => {

    /* insert script tag inside head tag */
    let tagForm = dom.window.document.getElementsByTagName("form");
    // let scriptStr = `<script type="text/javascript"></script>`;
    // tagForm[0].insertAdjacentHTML("afterend", scriptStr);


    let mandatoryScript = new HeadValidation().buildPart();
    
    getHtmlWithRule().forEach(partHtml => {

        let mandatoryScriptTmp = resultScript.scriptRule(partHtml, "mandatory");
        mandatoryScript = mandatoryScript.concat(mandatoryScriptTmp);

    });

    mandatoryScript = mandatoryScript.concat(new TailValidation().buildPart());


    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", mandatoryScript);

}

/**
 * Submit scripts are inside <script> tags in html page, 
 * they do the check of inserted values then send data to the server.
 * @param {*} dom 
 */
let  insertSubmitScript = (dom) => {

    let formElements = dom.window.document.getElementsByTagName("form");
    let formElement = formElements[0];
    formElement.setAttribute('onsubmit', 'postScheda()');

    // console.log(JSON.stringify(getMandatories()));
    let buttonSend = `<input type="submit" value="Invia">`;
    formElement.insertAdjacentHTML("afterbegin", buttonSend);


    let valMessage = "";
    resultScript.getMandatories().forEach(mandatory => {
        valMessage = valMessage.concat(mandatory.valMessage.concat("\\n"));
    });
    let sendScript = `function postScheda() { 
                        let arrayMessage = validation();
                        let message = ""
                        arrayMessage.forEach(msg => {
                            message = message.concat(msg).concat("\\n");                            
                        });
                        if (message !== ""){
                            alert(message);
                        } else { alert("DEBUG: FORM VALIDO, VERRA INVIATO AL SERVER!"); }
                      }
                     `;
    
    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", sendScript);

}




