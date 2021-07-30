'use strict';

const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = require('../lib/part-html');
const scr = require('../lib/part-script');

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
    insertScriptMandatory(dom);

    /* hide show tables */
    insertScriptHideShowTable(dom);

    /* Menu */
    insertScriptMenu(dom);

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

        // Note: Avoids using the real name of css file to not coupling code with 'resource.DataSource.FILESYSTEM'
        // Set ccs name using real source name.
        // jsonObj.config.css = resource.getCssFileName(resource.DataSource.FILESYSTEM);

        // Adds reusable patterns declared in config.
        reusablePatternDao.add(jsonObj.config.reusablePattern);

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

let insertHtmlHiddenField = (jsonObj, dom) => {

    /* declares cards in current ouput html page */
    let keyNames = Object.keys(jsonObj);
    let formElements = dom.window.document.getElementsByTagName("form");
    let formElement = formElements[0];
    formElement.insertAdjacentHTML("beforeend", `<input type="hidden" id="cards" value="${keyNames}">`);

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
let insertScriptMandatory = (dom) => {

    /* insert script tag inside head tag */
    let tagForm = dom.window.document.getElementsByTagName("form");
    // let scriptStr = `<script type="text/javascript"></script>`;
    // tagForm[0].insertAdjacentHTML("afterend", scriptStr);


    let mandatoryScript = new scr.HeadValidation().buildPart();
    
    html.getHtmlWithRule().forEach(partHtml => {

        // console.log(partHtml);
        let mandatoryScriptTmp = scr.resultScript.scriptRule(partHtml, "mandatory");
        mandatoryScript = mandatoryScript.concat(mandatoryScriptTmp);

    });

    html.getHtmlWithPattern().forEach(partHtml => {
        let patternScriptTmp = scr.resultScript.scriptPattern(partHtml);
        mandatoryScript = mandatoryScript.concat(patternScriptTmp);
        // console.log(tmp);
    });

    mandatoryScript = mandatoryScript.concat(new scr.TailValidation().buildPart());


    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", mandatoryScript);

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
                            let nl = document.querySelectorAll('input[type="text"], input[type="date"], select, input[type="radio"], input[type="checkbox"], textarea');
                            for (item of nl) {
                                // Fields are evaluated if under a visible title.
                                // Search for title visibility, invisible title means unused table therefore unset values:
                                let title_display = document.getElementById(item.id).closest(".div-table").previousElementSibling.style.display;
                                if (title_display != 'none') {

                                    if (item.type === 'checkbox') {
                                        item.value = item.checked;
                                    } 

                                    let elTmp = document.getElementById(item.id);
                                    item.join = elTmp.getAttribute('join');
                                    if (item.type === 'select-one') {
                                        let selected = elTmp.options[elTmp.selectedIndex];
                                        item.valuemap = selected.getAttribute('valuemap');
                                    } else {
                                        item.valuemap = elTmp.getAttribute('valuemap');
                                    }
                                    
                                    let objToPush = {"id": item.id, "value": item.value, "type": item.type};
                                    if (item.join !== null){
                                        objToPush.join = item.join
                                    }
                                    if (item.valuemap !== null){
                                        objToPush.valuemap = item.valuemap;
                                    }
                                    console.log(objToPush);
                                    validArray.push(objToPush);

                                    /*
                                    item.join = item.join === null ? "" : item.join;
                                    item.valuemap = item.valuemap === null ? "" : item.valuemap;
                                    validArray.push({"join": item.join, "id": item.id, "value": item.value, "type": item.type, "valuemap": item.valuemap});
                                    */
                                } 
                            }

                            // inserts hidden fields in final json
                            let nh = document.querySelectorAll('input[type="hidden"]');
                            for (item of nh) {
                                let objToPush = {"id": item.id, "value": item.value, "type": item.type};
                                validArray.push(objToPush);
                            }
                            
                            /* insert file in indexDb */
                            let finalDoc = JSON.stringify(validArray,null,2);
                            saveDocOnDB(finalDoc);

                            /* DEBUG: Download file locally for test purpose! */
                            let today = new Date();
                            let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+'_'+today.toLocaleTimeString().replaceAll(":", "");
                            download(finalDoc, 'dee_scheda' + date + '.json', 'text/plain');

                            /* Post doc to the server */
                            sendDocOnServer(finalDoc);

                            // saveDocOnDB(validArray);

                            // getLastDoc(function (lastDoc){
                            //     console.log("[getLastDoc callback]");
                            //     console.log(lastDoc);
                            // });

                        }
                     });
                     `;
    
    let scriptClean =   `
                        document.getElementById("buttonClear").addEventListener("click", () => {
                            if (confirm('Ripristino, cancella tutti i campi! Sei sicuro?')) {
                                document.forms[0].reset();
                                initialize();
                                initializeData();
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

let insertScriptClientDb = (dom) => {

    let localDb = `
                    const db_name = "CardDatabase";
                    const object_store = "CardStore";
                    function initDb (){
                        // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
                        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
                       
                        // Open (or create) the database
                        let open = indexedDB.open(db_name, 1);

                        // Create the schema
                        open.onupgradeneeded = function() {
                            var db = open.result;
                            db.createObjectStore(object_store, { autoIncrement: true });
                        };

                       return open;
                   };

                   function saveDocOnDB (jsonDoc){
                       console.log("[saveDocOnDB]");
                       var open = initDb();

                        open.onsuccess = function() {
                            var db = open.result;
                            var tx = db.transaction(object_store, "readwrite");
                            var store = tx.objectStore(object_store);

                            store.put(jsonDoc);

                            // Close the db when the transaction is done
                            tx.oncomplete = function() {
                                console.log("close db saveDocOnDB");
                                db.close();
                            };
                        };

                   };

                   function getLastDoc (callback){
                       console.log("[getLastDoc]");

                       var open = initDb();

                        open.onsuccess = function() {
                            var db = open.result;
                            var tx = db.transaction(object_store, "readwrite");
                            var store = tx.objectStore(object_store);

                            var getAll = store.getAll();

                            // get last
                            getAll.onsuccess = function() {
                                let l = getAll.result.length;
                                callback(getAll.result[l-1]);
                            };

                            // Close the db when the transaction is done
                            tx.oncomplete = function() {
                                console.log("close db getLastDoc");
                                db.close();
                            };
                            
                        };

                   };

                   // Utility for download result files.
                   function download(content, fileName, contentType) {
                       var a = document.createElement("a");
                       var file = new Blob([content], {type: contentType});
                       a.href = URL.createObjectURL(file);
                       a.download = fileName;
                       a.click();
                   }

                  `;


    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", localDb);

}

let insertScriptPost = (jsonObj, dom) => {

    let serverPost = `
                        function sendDocOnServer (jsonDoc){
                            console.log("post server: ${jsonObj.config.send}");
                            // console.log(jsonDoc);
                            
                            let xhr = new XMLHttpRequest();
                            /* Cambia url per provare! */
                            let url = "${jsonObj.config.send}";
                            xhr.open("POST", url, true);
                            xhr.setRequestHeader("Content-Type", "application/json");
                            xhr.onreadystatechange = function () {
                                // console.log(xhr);
                                if (xhr.readyState === 4 && ( xhr.status === 200 || xhr.status === 201)) {
                                  let json = JSON.parse(xhr.responseText);
                                  console.log("##### json response #####");
                                  console.log(json)
                                  console.log("##### json response end #####");
                                }
                            };
                            // console.log(jsonDoc);
                            try {
                                xhr.send(jsonDoc);
                            } catch (err) {
                                console.error(err);
                                alert("Non è stato possibile inviare al server! url: " + url);
                            }
                            
                        }
                     `;

    let tagScript = dom.window.document.getElementsByTagName("script");
    tagScript[0].insertAdjacentHTML("beforeend", serverPost);
}