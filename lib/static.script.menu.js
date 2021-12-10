exports.menu = (menuExtra) => {

    let extraPart = {declare : "", show: "", hide: ""};
    if (menuExtra !== undefined) {
        let token = menuExtra.map((me) => {
            let o = {
                declare: `let ${me.id} = document.getElementById("${me.id}");`,
                show: `${me.id}.style.display = "block";`,
                hide: `${me.id}.style.display = "none";`
            }
            return o;
        });

        extraPart.declare = token.map((t) => {
            return t.declare;
        }).join("\n");

        extraPart.show = token.map((t) => {
            return t.show;
        }).join("\n");

        extraPart.hide = token.map((t) => {
            return t.hide;
        }).join("\n");

    } 

    return `
                let toggleMenu = false;
                document.getElementById("buttonToggle").addEventListener("click", () => {
                    let el0 = document.getElementById("buttonToggle");
                    let el1 = document.getElementById("buttonSend");
                    let el2 = document.getElementById("buttonClear");
                    ${extraPart.declare}
                    toggleMenu = !toggleMenu;
                    if (toggleMenu) {
                        el0.style['background-color'] = "#cccc00";
                        el1.style.display = "block";
                        el2.style.display = "block";
                        ${extraPart.show}
                    } else {
                        el0.style['background-color'] = "grey";
                        el1.style.display = "none";
                        el2.style.display = "none";
                        ${extraPart.hide}
                    }
                });
                `;
            };

/**
 * @deprecated Now this code is in ./config/static_script/menu.js
 */
exports.send = (urlJson, urlFile) => {
    return  `
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
                    alert("FORM VALIDO, VERRA INVIATO AL SERVER!"); 
                    /* Create a valid json obj */
                    let validArray = [];
                    let filesToSave = [];
                    let querable = 'input[type="text"], input[type="date"], select, input[type="radio"], input[type="checkbox"], input[type="file"], textarea';
                    let nl = document.querySelectorAll(querable);
                    for (item of nl) {
                        /* Fields are evaluated if under a visible title.
                         * Search for title visibility, invisible title means unused table therefore unset values.
                         */
                        let title_display = document.getElementById(item.id).closest(".div-table").previousElementSibling.style.display;
                        if (title_display != 'none') {

                            if (item.type === 'checkbox') {
                                item.value = item.checked;
                            } 
               
                            /* join and value map for select */
                            let elTmp = document.getElementById(item.id);
                            item.join = elTmp.getAttribute('join');
                            if (item.type === 'select-one') {
                                let selected = elTmp.options[elTmp.selectedIndex];
                                item.valuemap = selected.getAttribute('valuemap');
                            } else {
                                item.valuemap = elTmp.getAttribute('valuemap');
                            }
                              
                            let objToPush = null;
                            if (item.id.lastIndexOf("__") !== -1) {
                               /* 
                                * Workaround: An id has same value and different behaviour about patterns in json configuration.
                                * Different ids name assumes the same name in output.
                                * example: dg_codice_cabina__parma and dg_codice_cabina__torino_chiomonte in output are the same: dg_codice_cabina
                                */
                                if (item.value.trim() !== '' ){
                                    let newId = item.id.substring(0,item.id.lastIndexOf("__"));
                                    objToPush = {"id": newId, "value": item.value, "type": item.type};
                                }
                            } else {
                                if (item.type == 'radio'){
                                    if (document.getElementById(item.id).checked === true){
                                        let newId = document.getElementById(item.id).name;
                                        objToPush = {"id": newId, "value": item.value, "type": item.type};
                                        /* Adds 'join' an 'valuemap' if they exist. */
                                        if (item.join !== null){ objToPush.join = item.join }
                                        if (item.valuemap !== null){ objToPush.valuemap = item.valuemap; }
                                    }
                                } else if (item.type == 'file') {
                                    let f = document.getElementById(item.id).files[0];
                                    if (f !== undefined){
                                        let uuid = document.getElementById('uuid').value;
                                        let uuidAndName = uuid.concat("_").concat(f.name);
                                        objToPush = {"id": item.id, "value": uuidAndName, "type": item.type};
                                        filesToSave.push({"file": f , "filename": uuidAndName});
                                    }
                                } else if ((item.type !== 'checkbox' && item.value.trim() !=='') ||
                                           (item.type === 'checkbox' && item.value === 'true')) { // only setted values in json doc
                                    objToPush = {"id": item.id, "value": item.value, "type": item.type};
                                    /* Adds 'join' an 'valuemap' if they exist. */
                                    if (item.join !== null){ objToPush.join = item.join }
                                    if (item.valuemap !== null){ objToPush.valuemap = item.valuemap; }
                                }
                            }
               
                            if (objToPush !== null) { validArray.push(objToPush); }
                            
                        } 
                    }
               
                    // Initialize final object.
                    let finalObj = {};

                    /* Hidden fields in final object */
                    let nh = document.querySelectorAll('input[type="hidden"]');
                    for (item of nh) {
                        if (item.id === 'uuid' || item.id === 'cards' || item.id === 'filename'){ 
                            finalObj[item.id] = item.value; 
                        } else {
                            let objToPush = {"id": item.id, "value": item.value, "type": item.type};
                            validArray.push(objToPush);
                        }
                    }
                     
                    /* inserts content's file in indexDb */
                    finalObj.content = validArray;
                    clientdb.saveOnDB(store_main, finalObj, finalObj.uuid);
                    filesToSave.forEach(obj => {
                        clientdb.saveOnDB(store_main, obj.file, obj.filename);
                    });

                    // doc in str format.
                    let finalDoc = JSON.stringify(finalObj,null,2);
               
                    /* Post doc to the server */
                    // message pop up
                    popUpMsg('open', 'Invio file ' + finalObj.uuid + '.json');

                    // Check of post images on server
                    let sended = {
                        type : 'success',
                        imageCount: 0
                    };
                    /* Cambia url per provare! */
                    server.sendDocOnServer(finalDoc, "${urlJson}", "application/json", (e) => {
                        
                        if (e.type === "error"){
                            sended.type = e.type;
                            // Error: Stores all in db not send to server. 
                            clientdb.saveOnDB(store_not_send, finalObj, finalObj.uuid);
                            filesToSave.forEach(obj => {
                                clientdb.saveOnDB(store_not_send, obj.file, obj.filename);
                            });
                            
                            // message pop up: Error
                            popUpMsg('addText' ,"Invio documento al server fallito, il documento è salvato solo in locale.");
                            popUpMsg('addText' ,"Al ripristino della connessione il documento verrà invitato automaticamente!");
                            popUpMsg('addText' ,"Url utilizzato: ${urlJson}");
                            popUpMsg('addText' ,"");
                            popUpMsg('closeButton');
                        } else {
                            clientdb.deleteByUuid(store_not_send, finalObj.uuid, (f) => {
                                console.log("[sendFileOnServer]", f, "removed");
                            });
                        }
                        
                        filesToSave.forEach((obj, idx, array) => {
                            // message pop up, original name of file!
                            //popUpMsg('addText', 'Invio file ' + obj.filename.substring(obj.filename.indexOf('_')+1) );
                            if (idx === 0) {
                                popUpMsg('addText', 'Invio files verso il server! ');
                            }

                            server.sendFileOnServer(obj, "${urlFile}", "", (e) => {
                                
                                if (e.type === "error" && sended.imageCount === 0){
                                    sended.type = e.type;
                                    sended.imageCount++;
                                    filesToSave.forEach(obj => {
                                        clientdb.saveOnDB(store_not_send, obj.file, obj.filename);
                                    });

                                    // message pop up: Error
                                    popUpMsg('addText', 'Invio immagini al server fallita, le immagini sono salvate solo in locale.');
                                    popUpMsg('addText' ,"Al ripristino della connessione le immagini verranno invitate automaticamente!");
                                    popUpMsg('addText' ,"Url utilizzato: ${urlFile}");
                                    popUpMsg('closeButton');

                                } 
                                
                                if (e.type !== "error") {
                                    clientdb.deleteByUuid(store_not_send, obj.filename, (f) => {
                                        console.log("[sendFileOnServer]", f, "removed");
                                    });
                                }

                                // Last element, show the message.
                                if ((idx === array.length - 1) && sended.type === 'success'){
                                    // message pop up
                                    popUpMsg('addText', 'Salvataggio sul server completato!');
                                    popUpMsg('closeButton');
                                } 

                            });
                        });

                        if (sended.type === 'success' && filesToSave.length === 0) { 
                            // message pop up
                            popUpMsg('addText', 'Salvataggio sul server completato!');
                            popUpMsg('closeButton');
                        }

                    });



                    /* DEBUG: Downloads file locally for test purpose! */
                    let today = new Date();
                    //  let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+'_'+today.toLocaleTimeString().replaceAll(":", "");
                    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+'_'+today.toLocaleTimeString().split(':').join('');
                    download(finalDoc, 'dee_scheda' + date + '.json', 'text/plain');
                    filesToSave.forEach(obj => {
                        download(obj.file, obj.filename, 'image');
                    });
               
                 }
               });

                let popUpMsg = (param, msg) => {

                    if (!this.initiazed){
                        this.initiazed = true;
                        popUpMsg('init');
                    }

                    // Set states
                    switch (param) {
                        case 'init':
                            this.modalId = document.getElementById("modalPop");
                            this.msgId = document.getElementById("modalMsg");
                            this.msgId.innerText = '';
                            this.closeButtonId = document.getElementById("popUpClose");
                            this.closeButtonId.style.display = "none";
                            break;
                        case 'open':
                            this.modalId.style.display = "block";
                            this.msgId.innerText = msg;
                            break;
                        case 'close':
                            this.modalId.style.display = "none";
                            this.msgId.innerText = '';
                            this.closeButtonId.style.display = "none";
                            break;
                        case 'addText':
                            this.msgId.innerText = this.msgId.innerText.concat("\\n").concat(msg);
                            break;
                        case 'closeButton':
                            this.closeButtonId.style.display = "block";
                            break;
                        default:
                            throw new Error('[popUpMsg] Illegal argument error:' + param);
                            break;
                    }
                   
                }

                /*** Utility for download result files. ***/
                function download(content, fileName, contentType) {
                    let a = document.createElement("a");
                    var file = new Blob([content], {type: contentType});
                    a.href = URL.createObjectURL(file);
                    a.download = fileName;
                    a.click();
                }
               /*******************************************/
            `
};

/**
 * @deprecated Now this code is in ./config/static_script/menu.js
 */
exports.clean = `
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

exports.menuExtra = (menuExtra) => {

    let result = ""
    if (menuExtra !== undefined) {

        menuExtra.forEach(me => {

            me.message = me.message === undefined ? `Do you want to go at ${me.url} page?` : me.message; 

            result += `
            document.getElementById("${me.id}").addEventListener("click", () => {
                if (confirm('${me.message}')) {
                    window.location.href = "${me.url}";
                  } 
            });
            `;

        });

    } 

    return result;

};