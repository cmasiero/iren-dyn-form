
/**
 * @deprecated Now this code is in ./static/script/sync.card.js
 * @param {*} urlJson 
 * @param {*} urlFile 
 * @returns 
 */
exports.syncCardStoreNotSend = (urlJson, urlFile) => {

    return `

    function syncCardStoreNotSend () {
        console.log("[syncCardStoreNotSend]")

        const docOnServer = (doc, callback) => {
            server.sendDocOnServer(JSON.stringify(doc, null, 2),'${urlJson}' ,'application/json',function (e){
                if (e.type === "error"){
                    console.error("[syncCardStoreNotSend.docOnServer]", "Can't send file on server! url: ${urlJson}");
                } else {
                    // doc.uuid: "2pn2wbayhqxt6nn28lfh4"
                    clientdb.deleteByUuid(store_not_send, doc.uuid, (f) => {
                        console.log("[syncCardStoreNotSend.docOnServer]", f, "removed");
                    });
                    callback(e);
                }
            });
        };

        const fileOnServer = (el, filename, callback) => {
            server.sendFileOnServer({"file": el , "filename": filename}, "${urlFile}", "", (e) => {
                if (e.type === "error"){
                    console.error("[syncCardStoreNotSend.fileOnServer]", "Can't send file on server! url: ${urlFile}");
                } else {
                    clientdb.deleteByUuid(store_not_send, filename, (f) => {
                        console.log("[syncCardStoreNotSend.fileOnServer]", f, "removed");
                    });
                    callback();
                }
            });
        };
        
        const sendAllFilesDeclaredInJson = (fls ,callback) => {

            if (fls.length === 0) callback();

            // tries to send Files to Server
            fls.forEach( (f, idx, array) => {
                clientdb.getByUuid(store_not_send, f.value, (ftmp) => {
                    fileOnServer(ftmp, f.value, () => {
                        if (idx === array.length - 1){ 
                            // Last file sended, now can callback to docOnServer
                            callback();
                        }
                    });
                });
            });
        }

        clientdb.getAllDoc(store_not_send, (docs) => {

            // Select type Object, they are json files saved on IndexedDB
            let jsonObjs = docs.filter( doc => doc.constructor.name === 'Object');

            jsonObjs.forEach((jsonObj, idxJson, array) => {

                // Gets files filtering inside jsonObject.
                let fls = jsonObj.content.filter( c => c.type === "file" );

                // Tries to send JsonObj to Server! Files at beginning, after json doc.
                sendAllFilesDeclaredInJson( fls, () => {
                    docOnServer(jsonObj, (e) => {
                        if (e.type !== "error"){
                            if (idxJson === array.length - 1){ 
                                // Last json doc sended, show message!
                                alert("La connessione al server è nuovamente attiva, i file salvati localmente sono ora stati inviati!");
                            }
                        }
                    });
                });

            });

        });
        
    };

    setInterval(function(){ 
        syncCardStoreNotSend();
    }, 30000);//run every 30 seconds


    `;

};