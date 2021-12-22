var syncCard = {};

// Configuration
syncCard.urlJson = "";
syncCard.urlFile = "";
syncCard.syncResult = "";

syncCard.syncCardStoreNotSend = function () {

    console.log("[syncCard.syncCardStoreNotSend]")

    /**
     * 1) Send json file and attachments
     * 2) If server is up and jsonObj is the last element: Delete entire content of
     *    indexedDb for array jsonObjsToDelete
     */ 
    const jsonObjToServer = (jsonObj, lastJson, jsonObjsToDelete) => {
        server.sendDocOnServer(JSON.stringify(jsonObj, null, 2), syncCard.urlJson, 'application/json', (e) => {
            if (e.type !== "error" && lastJson === true) {
                clientdb.deleteDocAndRelativeFiles(store_not_send, jsonObjsToDelete, (result) => {
                    if (result === "SUCCESS") {// Show message!
                        alert("La connessione al server è nuovamente attiva, i file salvati localmente sono ora stati inviati!");
                    }
                });
            }
        });
    }

    const sendAllAttachmentsDeclaredInJson = (attachmentsInContent, callback) => {
        // tries to send attachments to Server
        attachmentsInContent.forEach((f, idx, array) => {
            clientdb.getByUuid(store_not_send, f.value, (ftmp) => {
                if (ftmp) { // json doc could link an attachment already sent to server so in indexedDb it doesn't exist!
                    server.sendFileOnServer({ "file": ftmp, "filename": f.value }, syncCard.urlFile, "", (e) => {
                        if (e.type === "error") syncCard.syncResult = "ERROR_IMAGES";
                        if (idx === array.length - 1) {
                            // Last file sended, now can callback
                            callback(syncCard.syncResult);
                        }
                    });
                } else {
                    if (idx === array.length - 1) {
                        // Last file sended, now can callback
                        callback(syncCard.syncResult);
                    }
                }
            });
        });
    }

    clientdb.getAllDoc(store_not_send, (docs) => {

        // Select type Object, they are json files saved on IndexedDB
        let jsonObjs = docs.filter(doc => doc.constructor.name === 'Object');

        jsonObjs.forEach((jsonObj, idxJson, arrayJson) => {
            // Init
            syncCard.syncResult = "SUCCESS_IMAGES";

            let lastJson = idxJson === arrayJson.length - 1;

            // Gets files filtering inside jsonObject.
            let attachmentsInContent = jsonObj.content.filter(c => c.type === "file");

            if (attachmentsInContent.length === 0) {
                jsonObjToServer(jsonObj, lastJson, jsonObjs);
            }

            // Tries to send JsonObj to Server! Attachments at beginning, after json doc.
            sendAllAttachmentsDeclaredInJson(attachmentsInContent, (result) => {
                if (result === "SUCCESS_IMAGES") { // Sent all images.
                    jsonObjToServer(jsonObj, lastJson, jsonObjs);
                }
            });
        });
    });

};

setInterval(function () {
    syncCard.syncCardStoreNotSend();
}, 1000 * 30);//run every 30 seconds