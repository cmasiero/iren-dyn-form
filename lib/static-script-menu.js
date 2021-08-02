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

exports.send = `
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
                             // console.log(objToPush);
                             validArray.push(objToPush);
               
                             /*
                             item.join = item.join === null ? "" : item.join;
                             item.valuemap = item.valuemap === null ? "" : item.valuemap;
                             validArray.push({"join": item.join, "id": item.id, "value": item.value, "type": item.type, "valuemap": item.valuemap});
                             */
                         } 
                     }
               
                     // inserts hidden fields in final json
                     let uuid = "none";
                     let nh = document.querySelectorAll('input[type="hidden"]');
                     for (item of nh) {
                         let objToPush = {"id": item.id, "value": item.value, "type": item.type};
                         validArray.push(objToPush);
                         if (item.id === 'uuid'){ uuid = item.value; }
                     }
                     
                     /* insert file in indexDb */
                     let finalObj = {uuid: uuid, content: validArray};
                     let finalDoc = JSON.stringify(finalObj,null,2)
                     saveDocOnDB(finalObj);
               
                     /* DEBUG: Download file locally for test purpose! */
                     
                     let today = new Date();
                     let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+'_'+today.toLocaleTimeString().replaceAll(":", "");
                     
                     /*** Utility for download result files. ***/
                     function download(content, fileName, contentType) {
                         var a = document.createElement("a");
                         var file = new Blob([content], {type: contentType});
                         a.href = URL.createObjectURL(file);
                         a.download = fileName;
                         a.click();
                     }
                     download(finalDoc, 'dee_scheda' + date + '.json', 'text/plain');
                     /*******************************************/
               
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