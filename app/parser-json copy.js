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
    getHtmlPartValidable
} = require('../lib/part-html');

/**
 * It creates a jsdom object by the input css and html template.
 * @param {Object} jsonObj 
 * @param {string} htmlTemplate 
 * @returns a jsdom.JSDOM object
 */
exports.execute = (jsonObj, htmlTemplate) => {

    const specialKey = ["config"];
    
    let dom = new JSDOM(htmlTemplate);

    /* Configuration area */
    if (jsonObj.config !== undefined) {
        let tagHead = dom.window.document.getElementsByTagName("head");
        
        let linkStr = `<link rel="stylesheet" href="${jsonObj.config.css}"></link>`;
        let titleStr = `<title>${jsonObj.config.title}</title>`;
        tagHead[0].insertAdjacentHTML("beforeend", linkStr);
        tagHead[0].insertAdjacentHTML("beforeend", titleStr);
    }

    
    /* Html area */
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
                let el = {id: "id_title_".concat(idTable), value: jsonObj[idTable][key].value};
                let titleHtml = new TitleHtml(el);
                formElement.insertAdjacentHTML("beforeend", titleHtml.buildPart());
            } else {
                /* Otherwise are rows */
                // All rows are inside a table.
                if (tmpIdTable !== idTable) {
                    tmpIdTable = idTable;
                    let tableHtml = new TableHtml({id: idTable});
                    formElement.insertAdjacentHTML("beforeend", tableHtml.buildPart());
                }

                // new row
                let idRow = "id_row_".concat(++idRowIndex);
                let rowHtml = new RowHtml({id: idRow});
                const currentTable = dom.window.document.getElementById(idTable);
                currentTable.insertAdjacentHTML("beforeend", rowHtml.buildPart());

                const currentRow = dom.window.document.getElementById(idRow);
                let columnKes = Object.values(jsonObj[idTable][key]);
                let idColIndex = -1;
                columnKes.forEach(colEl => {

                    let idCol = "id_col_".concat(idRowIndex).concat("_").concat(++idColIndex);
                    let colHtml = new ColHtml({id: idCol});
                    currentRow.insertAdjacentHTML("beforeend", colHtml.buildPart());
                    const currentCol = dom.window.document.getElementById(idCol);
                    
                    if (colEl.group !== undefined) {
                        colEl.group.forEach(elGruop => {
                            insertHtmlPart(currentCol, elGruop);
                        })
                    } else {
                        insertHtmlPart(currentCol, colEl);
                    }

                })

            }

        })

    });

    /* build validations script */
    insertValidationScript(dom);

    return dom;

}

let insertHtmlPart = (currentCol, colEl) => {

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

}

let insertValidationScript = (dom) => {

    /* insert script tag inside head tag */
    let tagHead = dom.window.document.getElementsByTagName("head");
    let scriptStr = `<script type="text/javascript"></script>`;
    tagHead[0].insertAdjacentHTML("beforeend", scriptStr);

    let mandatoryScript = ``;
    getHtmlPartValidable().forEach(partHtml => {
        if (partHtml.validation === "mandatory") {
            let mandatoryScriptTmp = `
            let result = true;
            let a = document.getElementById('${partHtml.id}').value;
            if (a === ''){ result = false; }
                                   `;
            mandatoryScript = mandatoryScript.concat(mandatoryScriptTmp);
        }
    });
    
    let tagScript = dom.window.document.getElementsByTagName("script");
    console.log("************************* >>>> %s", mandatoryScript)
    tagScript[0].insertAdjacentHTML("beforeend", mandatoryScript);


}





