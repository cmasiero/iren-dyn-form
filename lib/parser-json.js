'use strict';

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const {
    partHtmlInit,
    TitleHtml,
    TableHtml,
    RowHtml,
    ColHtml,
    getHtmlWithRule,
    getHtmlWithPattern,
    getHtmlClientInit,
    generatedManager,
    buildHtmlPart
} = require('../lib/part-html');

const { 
    HeadValidation,
    TailValidation,
    DocReady,
    HeadVisibility,
    TailVisibility,
    VisibilityParent,
    HeadInit,
    TailInit,
    resultScript
} = require('../lib/part-script');

const { reusableRuleDao, reusablePatternDao, reusableDaoInit } = require('../lib/reusable-dao');


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
    partHtmlInit.clean();

    // Load html template
    let dom = new JSDOM(htmlTemplate);

    /* Configuration area */
    insertConfigPart(jsonObj, dom);

    insertMenuPart(dom);

    /* Html area */
    insertHtmlPart(jsonObj, dom);

    /* Init area */
    insertDocReady(dom)

    /* Visibility script area */
    insertScriptVisible(dom);

    /* Validations script area*/
    insertScriptMandatory(dom);


    /* hide show tables */
    insertScriptHideShowTable(dom);

    /* Menu */
    insertScriptMenu(dom);

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

let insertMenuPart = (dom) => {
    
    let menu = `
                <input type="button" id="buttonToggle" class="buttonMenu buttonMenuToggle" value="Menu">
                <input type="button" id="buttonSend" class="buttonMenu buttonMenuSend" value="Invia">
                <input type="button" id="buttonClear" class="buttonMenu buttonMenuClear" value="Pulisci"></input>
               `;

    /* Html area */
    let tagBody = dom.window.document.getElementsByTagName("body");
    tagBody[0].insertAdjacentHTML("afterend", "<form>");

    let formElements = dom.window.document.getElementsByTagName("form");
    let formElement = formElements[0];

    formElement.insertAdjacentHTML("beforeend", menu);

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
                let titleHtml = new TitleHtml(el);
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
                    let tableHtml = new TableHtml({ id: idTable, rule: jsonObj[idTable].rule, type: 'container' });
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
                        colEl.group.forEach(elGroup => {
                            elGroup.title = titleStrTmp;
                            let htmlPart = buildHtmlPart(elGroup);
                            currentCol.insertAdjacentHTML("beforeend", htmlPart.buildPart());
                        })
                    } else {
                        colEl.title = titleStrTmp;
                        let htmlPart = buildHtmlPart(colEl);
                        currentCol.insertAdjacentHTML("beforeend", htmlPart.buildPart());
                    }

                })

            }

        })

    });

    // Id validation of html elements.
    generatedManager.checkUniqueId();


}

let insertDocReady = (dom) => {
    /* insert script tag inside head tag */
    let tagForm = dom.window.document.getElementsByTagName("form");
    let scriptStr = `<script type="text/javascript"></script>`;
    tagForm[0].insertAdjacentHTML("afterend", scriptStr);

    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", new DocReady().buildPart());

    let initContent = new HeadInit().buildPart();
    getHtmlClientInit().forEach(partHtml => {
        let tmp = resultScript.scriptInit(partHtml);
        initContent = initContent.concat(tmp);
    });
    initContent = initContent.concat(new TailInit().buildPart());
    tagScript[0].insertAdjacentHTML("beforeend", initContent);
    
}

/**
 * ScriptPart are inside <script> tags in html page.
 * @param {*} dom 
 */
let insertScriptVisible = (dom) => {

    let tagScript = dom.window.document.getElementsByTagName("script");
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

        // console.log(partHtml);
        let mandatoryScriptTmp = resultScript.scriptRule(partHtml, "mandatory");
        mandatoryScript = mandatoryScript.concat(mandatoryScriptTmp);

    });

    getHtmlWithPattern().forEach(partHtml => {
        let patternScriptTmp = resultScript.scriptPattern(partHtml);
        mandatoryScript = mandatoryScript.concat(patternScriptTmp);
        // console.log(tmp);
    });

    mandatoryScript = mandatoryScript.concat(new TailValidation().buildPart());


    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", mandatoryScript);

}

/**
 * Hide show tables.
 * @param {} dom 
 */
let insertScriptHideShowTable = (dom) => {

    let clickTitleScript = ``;
    generatedManager.getByClassName("TitleHtml").forEach( titleHtml => {
        
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
let insertScriptMenu = (dom) => {
    
    let scriptMenu = `
                      let toggleMenu = false;
                      document.getElementById("buttonToggle").addEventListener("click", () => {
                        let el0 = document.getElementById("buttonToggle");
                        let el1 = document.getElementById("buttonSend");
                        let el2 = document.getElementById("buttonClear");
                        toggleMenu = !toggleMenu;
                        if (toggleMenu) {
                          el0.style['background-color'] = "#cccc00";
                          el1.style.display = "block";
                          el2.style.display = "block";
                        } else {
                          el0.style['background-color'] = "grey";
                          el1.style.display = "none";
                          el2.style.display = "none";
                        }
                      });
                     `;


    
    let scriptSend = `
                     document.getElementById("buttonSend").addEventListener("click", () => {
                        initialize();

                        let arrayMessage = validation();
                        let message = ""
                        arrayMessage.forEach(msg => {
                            message = message.concat(msg).concat("\\n");                            
                        });
                        if (message !== ""){
                            console.log(message);
                            alert(message);
                        } else { 
                            alert("DEBUG: FORM VALIDO, VERRA INVIATO AL SERVER!"); 
                            /* Create a valid json obj */
                            let validArray = [];
                            //let nl = document.querySelectorAll('input[type="text"], input[type="button"]');
                            let nl = document.querySelectorAll('input[type="text"], input[type="date"], input[type="select"], input[type="radio"], input[type="checkbox"], input[type="textarea"]');
                            for (item of nl) {
                                // Fields are evaluated if under a visible title.
                                // Search for title visibility, invisible title means unused table therefore unset values:
                                let title_display = document.getElementById(item.id).closest(".div-table").previousElementSibling.style.display;
                                if (title_display != 'none') {
                                    validArray.push({"id": item.id, "value": item.value, "type": item.type});
                                } 
                            }
                            console.log(validArray);
                        }
                     });
                     `;
    
    let scriptClean =   `
                        document.getElementById("buttonClear").addEventListener("click", () => {
                            if (confirm('Ripristino, cancella tutti i campi! Sei sicuro?')) {
                                document.forms[0].reset();
                                initialize();
                                visibility();
                            } else {
                                alert ('Nessuna azione eseguita!');
                            }
                           
                        });
                        `;
    

    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", scriptMenu);
    tagScript[0].insertAdjacentHTML("beforeend", scriptSend);
    tagScript[0].insertAdjacentHTML("beforeend", scriptClean);

}
