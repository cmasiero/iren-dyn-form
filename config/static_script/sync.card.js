var syncCard = {};

// Configuration
syncCard.urlJson = "";
syncCard.urlFile = "";
syncCard.syncResult = "";

syncCard.syncCardStoreNotSend = function () {
    console.log("[syncCard.syncCardStoreNotSend]")

    const docOnServer = (doc, callback) => {
        server.sendDocOnServer(JSON.stringify(doc, null, 2), syncCard.urlJson, 'application/json', function (e) {
            callback(e);
        });
    };

    const fileOnServer = (el, filename, callback) => {
        server.sendFileOnServer({ "file": el, "filename": filename }, syncCard.urlFile, "", (e) => {
            callback(e);
        });
    };
    
    const sendAllFilesDeclaredInJson = (fls, callback) => {

        // tries to send Files to Server
        fls.forEach((f, idx, array) => {
            clientdb.getByUuid(store_not_send, f.value, (ftmp) => {
                if (ftmp){ // json doc could link an attachment already sent to server.
                    fileOnServer(ftmp, f.value, (e) => {
                        if (e.type === "error") syncCard.syncResult = "ERROR_IMAGES";
                        if (idx === array.length - 1) {
                            // Last file sended, now can callback to docOnServer
                            callback(syncCard.syncResult);
                        }
                    });
                } else {
                    if (idx === array.length - 1) {
                        // Last file sended, now can callback to docOnServer
                        callback(syncCard.syncResult);
                    }
                }
            });
        });
    }

    clientdb.getAllDoc(store_not_send, (docs) => {

        // Select type Object, they are json files saved on IndexedDB
        let jsonObjs = docs.filter(doc => doc.constructor.name === 'Object');

        jsonObjs.forEach((jsonObj, idxJson, array) => {
            // Init
            syncCard.syncResult = "SUCCESS_IMAGES";

            // Gets files filtering inside jsonObject.
            let fls = jsonObj.content.filter(c => c.type === "file");

            // Tries to send JsonObj to Server! Files at beginning, after json doc.
            sendAllFilesDeclaredInJson(fls, (result) => {
                if (result === "SUCCESS_IMAGES") { // Sent all images.
                    docOnServer(jsonObj, (e) => { 
                        if (e.type !== "error") { // Sent json file
                            if (idxJson === array.length - 1) { // Last json doc
                                clientdb.deleteDocAndRelativeFiles(store_not_send, jsonObjs, (result) => {
                                    if (result === "SUCCESS") {// Show message!
                                        alert("La connessione al server è nuovamente attiva, i file salvati localmente sono ora stati inviati!");
                                    }
                                });
                            }
                        } 
                    });
                } 
            });
        });
    });

};

setInterval(function () {
    syncCard.syncCardStoreNotSend();
}, 1000 * 30);//run every 30 seconds