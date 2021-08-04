exports.menu =  `
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

exports.send = (url) => {
    return     `
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
                                        objToPush = {"id": item.id, "value": f.name, "type": item.type};
                                        let uuidAndName = uuid.concat("_").concat(f.name);
                                        filesToSave.push({"file": f , "filename": uuidAndName});
                                    }
                                // } else { // all values inserted in doc
                                } else if ((item.type !== 'checkbox' && item.value.trim() !=='') ||
                                           (item.type === 'checkbox' && item.value === 'true')) { // only setted values in json doc
                                    objToPush = {"id": item.id, "value": item.value, "type": item.type};
                                    /* Adds 'join' an 'valuemap' if they exist. */
                                    if (item.join !== null){ objToPush.join = item.join }
                                    if (item.valuemap !== null){ objToPush.valuemap = item.valuemap; }
                                }
                             }
               
                             // console.log(objToPush);
                             if (objToPush !== null) { validArray.push(objToPush); }
                            
                         } 
                     }
               
                     /* Hidden fields in final object */
                     let finalObj = {};
                     let nh = document.querySelectorAll('input[type="hidden"]');
                     for (item of nh) {
                         if (item.id === 'uuid' || item.id === 'cards'){ 
                            finalObj[item.id] = item.value; 
                         } else {
                            let objToPush = {"id": item.id, "value": item.value, "type": item.type};
                            validArray.push(objToPush);
                         }
                     }
                     
                     /* inserts content's file in indexDb */
                     finalObj.content = validArray;
                     saveOnDB(finalObj, finalObj.uuid);
                     filesToSave.forEach(obj => {
                        saveOnDB(obj.file, obj.filename);
                     });

                     // doc in str format.
                     let finalDoc = JSON.stringify(finalObj,null,2);
               
                     /* Post doc to the server */
                     /* Cambia url per provare! */
                     sendDocOnServer(finalDoc, "${url}", "application/json");
               
                     /* DEBUG: Downloads file locally for test purpose! */
                     let today = new Date();
                     let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+'_'+today.toLocaleTimeString().replaceAll(":", "");
                     download(finalDoc, 'dee_scheda' + date + '.json', 'text/plain');
                     filesToSave.forEach(obj => {
                        download(obj.file, obj.filename, 'image');
                     });
               
                 }
               });

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