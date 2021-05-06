'use strict';

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const {
    TitleHtml,
    TableHtml,
    RowHtml,
    ColHtml,
    ColDescriptionHtml,
    TextHtml,
    RadioHtml,
    SelectHtml
} = require('../lib/part-html');

/**
 * It creates a jsdom object by the input css and html template.
 * @param {Object} jsonObj 
 * @param {string} htmlTemplate 
 * @returns a jsdom.JSDOM object
 */
exports.execute = (jsonObj, htmlTemplate) => {

    let dom = new JSDOM(htmlTemplate);
    let formElements = dom.window.document.getElementsByTagName("form");
    let formElement = formElements[0];
    let keyNames = Object.keys(jsonObj);
    let tmpIdTable = "";
    let idRowIndex = -1;
    keyNames.forEach(idTable => {

        // New id table
        console.log("Table id: %s", idTable);

        let keyTables = Object.keys(jsonObj[idTable]);
        keyTables.forEach(key => {

            if (key === "comment") {
                console.log("comment %s", jsonObj[idTable].comment);
            }
            else if (key === "title") {
                console.log("title.content %s", jsonObj[idTable][key].content);
                let titleHtml = new TitleHtml("id_title_".concat(idTable), jsonObj[idTable][key].content);
                formElement.insertAdjacentHTML("beforeend", titleHtml.buildPart());
            } else {
                /* Otherwise are rows */
                // All rows are inside a table.
                if (tmpIdTable !== idTable) {
                    tmpIdTable = idTable;
                    console.log("row name %s", key);
                    let tableHtml = new TableHtml(idTable);
                    formElement.insertAdjacentHTML("beforeend", tableHtml.buildPart());
                }

                // new row
                let idRow = "id_row_".concat(++idRowIndex);
                let rowHtml = new RowHtml(idRow);
                const currentTable = dom.window.document.getElementById(idTable);
                currentTable.insertAdjacentHTML("beforeend", rowHtml.buildPart());

                const currentRow = dom.window.document.getElementById(idRow);
                let columnKes = Object.values(jsonObj[idTable][key]);
                let idColIndex = -1;
                columnKes.forEach(colEl => {

                    let idCol = "id_col_".concat(idRowIndex).concat("_").concat(++idColIndex);

                    /* search for type */
                    if (colEl.type === "description") {
                        let colDescriptionHtml = new ColDescriptionHtml(colEl.value);
                        currentRow.insertAdjacentHTML("beforeend",colDescriptionHtml.buildPart());
                    } else if (colEl.type === "text") {
                        let colHtml = new ColHtml(idCol);
                        currentRow.insertAdjacentHTML("beforeend",colHtml.buildPart());
                        const currentCol = dom.window.document.getElementById(idCol);
                        let textHtml = new TextHtml(colEl.id,colEl.label);
                        currentCol.insertAdjacentHTML("beforeend",textHtml.buildPart());
                    } else if (colEl.type === "radio") {
                        let colHtml = new ColHtml(idCol);
                        currentRow.insertAdjacentHTML("beforeend",colHtml.buildPart());
                        const currentCol = dom.window.document.getElementById(idCol);
                        let radioHtml = new RadioHtml(colEl.id,colEl.option);
                        currentCol.insertAdjacentHTML("beforeend",radioHtml.buildPart());
                    } else if (colEl.type === "select") {
                        let colHtml = new ColHtml(idCol);
                        currentRow.insertAdjacentHTML("beforeend",colHtml.buildPart());
                        const currentCol = dom.window.document.getElementById(idCol);
                        let selectHtml = new SelectHtml(colEl.id, colEl.label, colEl.option);
                        currentCol.insertAdjacentHTML("beforeend",selectHtml.buildPart());
                    }  else if (colEl.type === "group") {
                        console.log("col group %s", colEl.group);
                    }

                })

            }

        })

    });

    return dom;

}