'use strict';

const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = require('../lib/part-html');
const scr = require('../lib/part-script');
const staticClientDb = require('../lib/static-script-clientdb')
const staticServer   = require('../lib/static-script-server');
const staticMenu = require('../lib/static-script-menu');

const { reusableRuleDao, reusablePatternDao, reusableDaoInit } = require('../lib/reusable-dao');
// const resource = require('../lib/resource');

// logging purpose
let log_filename_tag = `[${path.basename(__filename)}]`;

const specialKey = ["config"];

/**
 * It creates a jsdom object by the input css and html template.
 * @param {Object} jsonObj 
 * @param {string} htmlTemplate 
 * @returns a jsdom.JSDOM object
 */
 exports.execute = (jsonObj, htmlTemplate) => {

    /* Initialize */
    reusableDaoInit.clean();
    html.partHtmlInit.clean();

    // Load html template
    let dom = new JSDOM(htmlTemplate);

    /* Configuration area */
    insertConfigPart(jsonObj, dom);

    /* Pop Up */
    insertPopUp(dom);

    /* Menu */
    insertMenuPart(dom);

    /* Hidden field */
    insertHtmlHiddenField(jsonObj, dom);

    /* Html area */
    insertHtmlPart(jsonObj, dom);

    /* Init area */
    insertDocReady(dom);

    /* Init data method */
    insertInitilizeData(dom);

    /* Visibility script area */
    insertScriptVisible(dom);

    /* Validations script area*/
    insertScriptRule(dom);

    /* hide show tables */
    insertScriptHideShowTable(dom);

    /* Menu */
    insertScriptMenu(jsonObj, dom);

    /* Db locale */
    insertScriptClientDb(dom);

    /* Post result */
    insertScriptPost(jsonObj, dom);


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

        // Adds reusable patterns declared in config.
        reusablePatternDao.add(jsonObj.config.reusablePattern);

        let tagHead = dom.window.document.getElementsByTagName("head");
        let linkStr = `<link rel="stylesheet" href="${jsonObj.config.css}"></link>`;
        let titleStr = `<title>${jsonObj.config.title}</title>`;
        tagHead[0].insertAdjacentHTML("beforeend", linkStr);
        tagHead[0].insertAdjacentHTML("beforeend", titleStr);

    }

}

let insertPopUp = (dom) => {

    let popUp = fs.readFileSync('lib_html/static-html-popup.html');

    let tagBody = dom.window.document.getElementsByTagName("body");
    tagBody[0].insertAdjacentHTML("beforebegin", popUp);

}


let insertMenuPart = (dom) => {
    
    let menu = `
                <input type="button" id="buttonToggle" class="buttonMenu buttonMenuToggle" value="Menu">
                <input type="button" id="buttonSend" class="buttonMenu buttonMenuSend" value="Invia">
                <input type="button" id="buttonClear" class="buttonMenu buttonMenuClear" value="Pulisci"></input>
               `;

    /* Html area */
    let tagBody = dom.window.document.getElementsByTagName("body");
    tagBody[0].insertAdjacentHTML("beforeend", "<form>");

    let formElements = dom.window.document.getElementsByTagName("form");
    let formElement = formElements[0];

    formElement.insertAdjacentHTML("beforeend", menu);

}

let insertHtmlHiddenField = (jsonObj, dom) => {

    /* declares cards in current ouput html page */
    let keyNames = Object.keys(jsonObj);
    let formElements = dom.window.document.getElementsByTagName("form");
    let formElement = formElements[0];
    let hiddenElem = `
                      <input type="hidden" id="filename" value="${jsonObj.config.filename}">
                      <input type="hidden" id="cards" value="${keyNames}">
                      <input type="hidden" id="uuid" value="">
                     `;
    formElement.insertAdjacentHTML("beforeend", hiddenElem);

};

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


    /* Html area */
    let formElements = dom.window.document.getElementsByTagName("form");
    let formElement = formElements[0];
    let keyNames = Object.keys(jsonObj);
    let tmpIdTable = "";
    let idRowIndex = -1;
    let titleStrTmp = ""; 
    // let ruleCardTmp = "";
    keyNames.filter(idTable => !specialKey.includes(idTable)).forEach(idTable => {

        // New id table
        let keyTables = Object.keys(jsonObj[idTable]);
        keyTables.forEach(key => {

            if (key === "comment") {
                /* Comments are ignored */
                //console.log("comment %s", jsonObj[idTable].comment);
            }
            else if (key === "title") {
                titleStrTmp = jsonObj[idTable][key].value;
                let el = { id: "id_title_".concat(idTable), value: jsonObj[idTable][key].value };
                let titleHtml = new html.TitleHtml(el);
                formElement.insertAdjacentHTML("beforeend", titleHtml.buildPart());
            }
            else if (key === "reusableRule"){
                reusableRuleDao.add(jsonObj[idTable][key]);
            }
            else if (key === "reusablePattern"){
                reusablePatternDao.add(jsonObj[idTable][key]);
            }
            else if (key === "rule"){
                /* Comments are ignored */
                // console.log("table: %s - rule: %s", idTable, jsonObj[idTable][key]);
            } 
            else {
                /* Otherwise are rows */
                // All rows are inside a table.
                if (tmpIdTable !== idTable) {
                    tmpIdTable = idTable;
                    // console.log("table: %s - rule: %s", idTable, jsonObj[idTable].rule);
                    let tableHtml = new html.TableHtml({ id: idTable, rule: jsonObj[idTable].rule, type: 'container' });
                    formElement.insertAdjacentHTML("beforeend", tableHtml.buildPart());
                }

                // new row
                let idRow = "id_row_".concat(++idRowIndex);
                let rowHtml = new html.RowHtml({ id: idRow });
                const currentTable = dom.window.document.getElementById(idTable);
                currentTable.insertAdjacentHTML("beforeend", rowHtml.buildPart());

                const currentRow = dom.window.document.getElementById(idRow);
                let columnKes = Object.values(jsonObj[idTable][key]);
                let idColIndex = -1;
                columnKes.forEach(colEl => {

                    let idCol = "id_col_".concat(idRowIndex).concat("_").concat(++idColIndex);
                    let colHtml = new html.ColHtml({ id: idCol });
                    currentRow.insertAdjacentHTML("beforeend", colHtml.buildPart());
                    const currentCol = dom.window.document.getElementById(idCol);

                    if (colEl.group !== undefined) {
                        colEl.group.forEach(elGroup => {
                            elGroup.title = titleStrTmp;
                            let htmlPart = html.buildHtmlPart(elGroup);
                            currentCol.insertAdjacentHTML("beforeend", htmlPart.buildPart());
                        })
                    } else {
                        colEl.title = titleStrTmp;
                        let htmlPart = html.buildHtmlPart(colEl);
                        currentCol.insertAdjacentHTML("beforeend", htmlPart.buildPart());
                    }

                })

            }

        })

    });

    // Id validation of html elements.
    html.generatedManager.checkUniqueId();


}

/**
 * Doc ready and initialize() method.
 * @param {*} dom 
 */
let insertDocReady = (dom) => {
    /* insert script tag inside head tag */
    let tagForm = dom.window.document.getElementsByTagName("form");
    let scriptStr = `<script type="text/javascript"></script>`;
    tagForm[0].insertAdjacentHTML("afterend", scriptStr);

    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", new scr.DocReady().buildPart());

    let initContent = new scr.HeadInit().buildPart();
    initContent = initContent.concat(new scr.TailInit().buildPart());

    tagScript[0].insertAdjacentHTML("beforeend", initContent);
    
}

let insertInitilizeData = (dom) => {

    let content = `function initializeData() {`; 

    content = content.concat(`
                              console.log("[initializeData]");
                              // page from, ex: http://localhost:5000/card?uuid=ni9n9ubkqnhtmspjk8ajs
                              // do not initialize uuid, we are viewing an existing card!
                              if ('card' !== window.location.pathname.slice(1)){
                                let uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                                document.getElementById("uuid").value = uuid;
                              }
                              `);

    html.getHtmlClientInit().forEach(partHtml => {
        let tmp = scr.resultScript.scriptInit(partHtml);
        content = content.concat(tmp);
    });
    content = content.concat("}"); 

    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", content);
}


/**
 * ScriptPart are inside <script> tags in html page.
 * @param {*} dom 
 */
let insertScriptVisible = (dom) => {

    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", new scr.VisibilityParent().buildPart());

    // output is visibility method implementation.
    tagScript[0].insertAdjacentHTML("beforeend", new scr.HeadVisibility().buildPart());

    let visibilityContent = "";

    html.getHtmlWithRule().forEach(partHtml => {
        let tmp = scr.resultScript.scriptRule(partHtml, "visible");
        visibilityContent = visibilityContent.concat(tmp);
    });

    tagScript[0].insertAdjacentHTML("beforeend", visibilityContent);

    tagScript[0].insertAdjacentHTML("beforeend", new scr.TailVisibility().buildPart());

}

/**
 * ScriptPart are inside <script> tags in html page.
 * @param {*} dom 
 */
let insertScriptRule = (dom) => {

    /* insert script tag inside head tag */
    let tagForm = dom.window.document.getElementsByTagName("form");
    // let scriptStr = `<script type="text/javascript"></script>`;
    // tagForm[0].insertAdjacentHTML("afterend", scriptStr);


    let ruleScript = new scr.HeadValidation().buildPart();
    
    html.getHtmlWithRule().forEach(partHtml => {

        // console.log(partHtml);
        let ruleScriptTmp = scr.resultScript.scriptRule(partHtml, "mandatory");
        ruleScript = ruleScript.concat(ruleScriptTmp);

    });

    html.getHtmlWithPattern().forEach(partHtml => {
        let patternScriptTmp = scr.resultScript.scriptPattern(partHtml);
        ruleScript = ruleScript.concat(patternScriptTmp);
        // console.log(tmp);
    });

    ruleScript = ruleScript.concat(new scr.TailValidation().buildPart());


    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", ruleScript);

}

/**
 * Hide show tables.
 * @param {} dom 
 */
let insertScriptHideShowTable = (dom) => {

    let clickTitleScript = ``;
    html.generatedManager.getByClassName("TitleHtml").forEach( titleHtml => {
        
        clickTitleScript = clickTitleScript + `document.getElementById('${titleHtml.id}').addEventListener('click', function(event) {
                                                  let title = document.getElementById('${titleHtml.id}');
                                                  title.style.width = title.style.width == '30%' || title.style.width == '' ? '100%' : '30%'; 
                                                  let table = title.nextElementSibling;
                                                  table.style.display = table.style.display == 'none' || table.style.display =='' ? 'block' : 'none';
                                               });
                                              `;

    });

    // console.log(clickTitleScript);
    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", clickTitleScript);

}

/**
 * insertScriptMenu is inside <script> tags in html page, 
 * It does: check of inserted values then send data to the server.
 *          clear data in the form.
 * @param {*} dom 
 */
let insertScriptMenu = (jsonDoc, dom) => {

    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", staticMenu.menu);
    tagScript[0].insertAdjacentHTML("beforeend", staticMenu.send(jsonDoc.config.sendJson, jsonDoc.config.sendFile));
    tagScript[0].insertAdjacentHTML("beforeend", staticMenu.clean);

}

let insertScriptClientDb = (dom) => {

    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", staticClientDb.dao);

}

let insertScriptPost = (jsonObj, dom) => {

    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", staticServer.post());

}