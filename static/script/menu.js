var menu = {};

// Configuration
menu.urlJson = "";
menu.urlFile = "";
menu.sendResult = "";

document.getElementById("buttonSend").addEventListener("click", () => {

    // Initialization
    initialize();
    menu.sendResult = "SUCCESS_IMAGES";

    let arrayMessage = validation();
    if (arrayMessage.length !== 0) {
        ui.popUpSendMandatory(arrayMessage);
    } else {
        
        ui.popUpChoice(
            "Attenzione",
            "Form valido vuoi inviarlo al server?",
            approve,
            () => { return; }
        );

        function approve() {
            // Obtains json doc from current page.
            utilCard.currentCardToObj(currentCard => {

                if (currentCard.attachments.length === 0) {
                    docToServer(currentCard);
                } else {
                    docAndFilesToServer(currentCard);
                }

                /* DEBUG: Downloads file locally for test purpose! */
                let finalDoc = JSON.stringify(currentCard.card, null, 2); // Object in str format.
                let today = new Date();
                let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + '_' + today.toLocaleTimeString().split(':').join('');
                menu.download(finalDoc, 'dee_scheda' + date + '.json', 'text/plain');
                currentCard.attachments.forEach(obj => {
                    menu.download(obj.file, obj.filename, 'image');
                });

            });
        }

        function docToServer(crd) {
            // Object in str format.
            let finalDoc = JSON.stringify(crd.card, null, 2);

            ui.popUpMsg('open', 'Invio in corso...');
            ui.popUpMsg('addText', 'Invio file ' + crd.card.uuid + '.json');
            server.sendDocOnServer(finalDoc, menu.urlJson, "application/json", (e) => {
                if (e.type === "error") {
                    clientdb.saveOnDB(store_not_send, crd.card, crd.card.uuid);
                    ui.popUpMsg('open', '');// Open reset content of pop-up
                    errorJsonPopUp();
                } else {
                    successPopUp();
                    // deleteStoreSave(crd.card);
                }
            });
        }

        function docAndFilesToServer(crd) {

            // Object in str format.
            let finalDoc = JSON.stringify(crd.card, null, 2);

            crd.attachments.forEach((objAttachment, idxAttachment, arrayAttachment) => {

                // Show first message!
                if (idxAttachment === 0) {
                    ui.popUpMsg('open', 'Invio in corso...');
                    ui.popUpMsg('addText', 'Invio files verso il server! ');
                }

                // Send file to server
                server.sendFileOnServer(objAttachment, menu.urlFile, "", (e) => {
                    if (e.type === "error") {
                        clientdb.saveOnDB(store_not_send, objAttachment.file, objAttachment.filename);
                        menu.sendResult = "ERROR_IMAGES";
                    }

                    // 1) All attachments have been sent
                    if (idxAttachment === arrayAttachment.length - 1) {

                        switch (menu.sendResult) {
                            case "SUCCESS_IMAGES":
                                // 2) All success, now send the json.
                                // message pop up
                                ui.popUpMsg('addText', 'Invio file ' + crd.card.uuid + '.json');
                                server.sendDocOnServer(finalDoc, menu.urlJson, "application/json", (e) => {
                                    if (e.type === "error") {
                                        clientdb.saveOnDB(store_not_send, crd.card, crd.card.uuid);
                                        ui.popUpMsg('open', '');// Open reset content of pop-up
                                        errorJsonPopUp();
                                    } else {
                                        successPopUp();
                                        // deleteStoreSave(crd.card);
                                    }
                                });
                                break;
                            case "ERROR_IMAGES":
                                // 3) there were some errors...
                                // In case of error on attachment it still saves the doc on local database.
                                clientdb.saveOnDB(store_not_send, crd.card, crd.card.uuid);
                                ui.popUpMsg('open', ''); // Open reset content of pop-up
                                errorAttachmentPopUP();
                                break;
                            default:
                                break;
                        }
                    }
                });

            });

        }

        function errorAttachmentPopUP() {
            // message pop up: Error
            ui.popUpMsg('addText', 'Invio immagini al server fallita, le immagini sono salvate solo in locale.');
            ui.popUpMsg('addText', "Al ripristino della connessione le immagini verranno invitate automaticamente!");
            ui.popUpMsg('addText', `Url utilizzato: ${menu.urlFile}`);
            errorJsonPopUp();
        }

        function errorJsonPopUp() {
            // message pop up: Error
            ui.popUpMsg('addText', "Invio documento al server fallito, il documento è salvato solo in locale.");
            ui.popUpMsg('addText', "Al ripristino della connessione il documento verrà invitato automaticamente!");
            ui.popUpMsg('addText', `Url utilizzato: ${menu.urlJson}`);
            ui.popUpMsg('addText', "");
            ui.popUpMsg('closeButton');
        }

        function successPopUp() {
            // message pop up
            ui.popUpMsg('addText', 'Salvataggio sul server completato!');
            ui.popUpMsg('addText', "");
            ui.popUpMsg('closeButton');
        }

    }
});

document.getElementById("buttonClear").addEventListener("click", () => {

    ui.popUpChoice(
        "Attenzione",
        "Ripristino, cancella tutti i campi! Sei sicuro?",
        approve,
        deny
    );

    function approve () {
        document.forms[0].reset();
        initialize();
        initializeData();
        visibility();
        ui.resetFilesFromStoreSave();    
    }

    function deny () {
        ui.popUpMessage("Messaggio","Nessuna azione eseguita!");
    }

});

document.getElementById("buttonSave").addEventListener("click", () => {

    // Utility function for message.
    const showMessage = (filename, attachQty) => {
        ui.popUpMessage(
            "Messaggio",
            "Salvataggio locale del file '" + filename + "' con allegate: " + attachQty + " foto, effettuato!");
    }

    // Obtains json doc from current page.
    utilCard.currentCardToObj(currentCard => {

        // Is a valid document?
        let isValid = validation().length === 0 ? true : false;
        currentCard.card.isValid = isValid;
    
        // saving date
        currentCard.card.saveDate = new Date();

        clientdb.getByUuid(store_save, currentCard.card.uuid, (currentCardSaved) => {
    
            // Array of files saved on db store_save.
            let arrayFileSaved = [];
            if (currentCardSaved && currentCardSaved.content){
                arrayFileSaved = currentCardSaved.content.filter(el => el.type === 'file');
            }
            
            // Array of files on current document.
            let arrayFileCurDoc = currentCard.card.content.filter(el => el.type === 'file');
            
            // Files not il doc.
            let array4Add = arrayFileSaved.filter(elSaved => {
                let el = arrayFileCurDoc.find(elCurDoc => elCurDoc.id === elSaved.id);
                return el ? false : true;
            });
    
            // Adds files not il doc.
            currentCard.card.content.push(...array4Add);
    
            // Save file json
            clientdb.saveOnDB(store_save, currentCard.card, currentCard.card.uuid);
    
            // No attachments, show message!
            if (currentCard.attachments.length === 0) {
                showMessage(currentCard.card.uuid, 0);
            }
    
            currentCard.attachments.forEach((objAttachment, idxAttachment, arrayAttachment) => {
                // Save attachments.
                clientdb.saveOnDB(store_save, objAttachment.file, objAttachment.filename);
                if (idxAttachment === arrayAttachment.length - 1) { // last attachment.
                    showMessage(currentCard.card.uuid, arrayAttachment.length);
                }
            });
    
        });
    });


});

document.getElementById("buttonRecap").addEventListener("click", () => {
    ui.popUpRecap();
});

/*** Utility for download result files. ***/
menu.download = function (content, fileName, contentType) {
    let a = document.createElement("a");
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
/*******************************************/




