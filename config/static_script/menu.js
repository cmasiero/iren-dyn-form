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
    let message = ""
    arrayMessage.forEach(msg => {
        message = message.concat(msg).concat("\n");
    });
    if (message !== "") {
        alert(message);
    } else {
        alert("FORM VALIDO, VERRA INVIATO AL SERVER!");

        // Obtains json doc from current page.
        let currentCard = utilCard.currentCardToObj();

        // Object in str format.
        let finalDoc = JSON.stringify(currentCard.card, null, 2);

        currentCard.attachments.forEach((objAttachment, idxAttachment, arrayAttachment) => {

            // Show first message!
            if (idxAttachment === 0) {
                popUpMsg('open', 'Invio in corso...');
                popUpMsg('addText', 'Invio files verso il server! ');
            }

            // Send file to server
            server.sendFileOnServer(objAttachment, menu.urlFile, "", (e) => {
                if (e.type === "error") {
                    clientdb.saveOnDB(store_not_send, objAttachment.file, objAttachment.filename);
                    menu.sendResult = "ERROR_IMAGES";
                }

                // 1) All attachments have been sent
                if (idxAttachment === arrayAttachment.length - 1){
                    
                    switch (menu.sendResult) {
                        case "SUCCESS_IMAGES":
                            // 2) All success, now send the json.
                            // message pop up
                            popUpMsg('addText', 'Invio file ' + currentCard.card.uuid + '.json');
                            server.sendDocOnServer(finalDoc, menu.urlJson, "application/json", (e) => {
                                if (e.type === "error") {
                                    clientdb.saveOnDB(store_not_send, currentCard.card, currentCard.card.uuid);
                                    popUpMsg('open', '');// Open reset content of pop-up
                                    errorJsonPopUp();
                                } else {
                                    successPopUp();
                                }
                            });
                            break;
                        case "ERROR_IMAGES":
                            // 3) there were some errors...
                            // In case of error on attachment it still saves the doc on local database.
                            clientdb.saveOnDB(store_not_send, currentCard.card, currentCard.card.uuid);
                            popUpMsg('open', ''); // Open reset content of pop-up
                            errorAttachmentPopUP();
                            break;
                        default:
                            break;
                    }
                }
            });

        });

        function errorAttachmentPopUP() {
            // message pop up: Error
            popUpMsg('addText', 'Invio immagini al server fallita, le immagini sono salvate solo in locale.');
            popUpMsg('addText', "Al ripristino della connessione le immagini verranno invitate automaticamente!");
            popUpMsg('addText', `Url utilizzato: ${menu.urlFile}`);
            errorJsonPopUp();
        }

        function errorJsonPopUp(){
            // message pop up: Error
            popUpMsg('addText', "Invio documento al server fallito, il documento è salvato solo in locale.");
            popUpMsg('addText', "Al ripristino della connessione il documento verrà invitato automaticamente!");
            popUpMsg('addText', `Url utilizzato: ${menu.urlJson}`);
            popUpMsg('addText', "");
            popUpMsg('closeButton');
        }

        function successPopUp(){
            // message pop up
            popUpMsg('addText', 'Salvataggio sul server completato!');
            popUpMsg('addText', "");
            popUpMsg('closeButton');
        }

        /* DEBUG: Downloads file locally for test purpose! */
        let today = new Date();
        let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + '_' + today.toLocaleTimeString().split(':').join('');
        menu.download(finalDoc, 'dee_scheda' + date + '.json', 'text/plain');
        currentCard.attachments.forEach(obj => {
            menu.download(obj.file, obj.filename, 'image');
        });

    }
});

document.getElementById("buttonClear").addEventListener("click", () => {
    if (confirm('Ripristino, cancella tutti i campi! Sei sicuro?')) {
        document.forms[0].reset();
        initialize();
        initializeData();
        visibility();
    } else {
        alert('Nessuna azione eseguita!');
    }

});


document.getElementById("buttonSave").addEventListener("click", () => {

    alert('Funzionalità disponibile nella prossima versione!');

    // Obtains json doc from current page.
    // let currentCard = utilCard.currentCardToObj();
    // console.log(currentCard);

    // saveRestore.save();

});

document.getElementById("buttonRecap").addEventListener("click", () => {

    alert('Funzionalità disponibile nella prossima versione!');

});


let popUpMsg = (param, msg) => {

    if (!this.initiazed) {
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
            this.msgId.innerText = this.msgId.innerText.concat("\n").concat(msg);
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
menu.download = function (content, fileName, contentType) {
    let a = document.createElement("a");
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
/*******************************************/




