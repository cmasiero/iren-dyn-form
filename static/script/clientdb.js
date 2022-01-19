var clientdb = {};

const db_name = "CardDatabase";
const store_main = "CardStore";
const store_not_send = "CardStoreNotSend";
const store_save = "CardStoreSave"

clientdb.initDb = (object_store) => {
    // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    // Open (or create) the database
    let open = indexedDB.open(db_name, 2);

    // Create the schema
    open.onupgradeneeded = function () {
        console.log("[clientdb.initDb] open.onupgradeneeded");
        var db = open.result;
        
        try { db.createObjectStore(store_not_send, { autoIncrement: false }); }
        catch (error) { console.log(`[clientdb.initDb] Object Store ${store_not_send} already exists!`); }
        
        try { db.createObjectStore(store_save, { autoIncrement: false }); } 
        catch (error) { console.log(`[clientdb.initDb] Object Store ${store_save} already exists!`); }
        
    };

    return open;
};

clientdb.saveOnDB = (object_store, finalObj, uuid) => {
    console.log("[clientdb.saveOnDB]");
    var open = clientdb.initDb(object_store);

    open.onsuccess = function () {
        var db = open.result;
        var tx = db.transaction(object_store, "readwrite");
        var store = tx.objectStore(object_store);

        store.put(finalObj, uuid);

        // Close the db when the transaction is done
        tx.oncomplete = function () {
            console.log("[clientdb.saveOnDB] close db!");
            db.close();
        };
    };

};

clientdb.getByUuid = (object_store, uuid, callback) => {

    console.log("[clientdb.getByUuid]");

    var open = clientdb.initDb(object_store);

    open.onsuccess = function () {
        var db = open.result;
        var tx = db.transaction(object_store, "readwrite");
        var store = tx.objectStore(object_store);
        let getUuid = store.get(uuid);

        // success
        getUuid.onsuccess = function () {
            console.log("[clientdb.getByUuid] getUuid.onsuccess");
            callback(getUuid.result);
        };

        // Close the db when the transaction is done
        tx.oncomplete = function () {
            console.log("[clientdb.getByUuid] close db!");
            db.close();
        };

    };

};

clientdb.getByUuidPromise = (object_store, uuid) => {
    return new Promise((resolve, reject) => {
        clientdb.getByUuid(object_store, uuid, (result) => {
            if (result) {
                resolve(result);
            }
            let errMsg = `"Uuid ${uuid} does not exist in: ${object_store}`;
            reject(new Error(errMsg));
        });
    });

    // return await promise;
}

clientdb.getByUuidPromiseAsync = async (object_store, uuid) => {
    const result = await clientdb.getByUuidPromise(object_store, uuid);
    if (result){
        return result;
    }
}


clientdb.getLastDoc = (object_store, callback) => {
    console.log("[clientdb.getLastDoc]");

    var open = clientdb.initDb(object_store);

    open.onsuccess = function () {
        var db = open.result;
        var tx = db.transaction(object_store, "readwrite");
        var store = tx.objectStore(object_store);

        var getAll = store.getAll();

        // get last
        getAll.onsuccess = function () {
            let l = getAll.result.length;
            callback(getAll.result[l - 1]);
        };

        // Close the db when the transaction is done
        tx.oncomplete = function () {
            console.log("[getLastDoc] close db!");
            db.close();
        };

    };

};

clientdb.getAllDoc = (object_store, callback) => {
    console.log("[clientdb.getAllDoc]");

    var open = clientdb.initDb(object_store);

    open.onsuccess = function () {
        var db = open.result;
        var tx = db.transaction(object_store, "readwrite");
        var store = tx.objectStore(object_store);

        var getAll = store.getAll();

        getAll.onsuccess = function () {
            callback(getAll.result);
        };

        // Close the db when the transaction is done
        tx.oncomplete = function () {
            console.log("[clientdb.getAllDoc] close db!");
            db.close();
        };

    };

};

clientdb.getAllJson = (object_store, callback) => {
    console.log("[clientdb.getAllJson]");

    var open = clientdb.initDb(object_store);

    open.onsuccess = function () {
        var db = open.result;
        var tx = db.transaction(object_store, "readwrite");
        var store = tx.objectStore(object_store);

        var getAll = store.getAll();

        getAll.onsuccess = function () {
            let result = getAll.result.filter(c => c.uuid !== undefined);
            callback(result);
        };

        // Close the db when the transaction is done
        tx.oncomplete = function () {
            console.log("[clientdb.getAllDoc] close db!");
            db.close();
        };

    };

};

clientdb.deleteByUuid = (object_store, uuid, callback) => {

    console.log("[clientdb.deleteByUuid]");

    var open = clientdb.initDb(object_store);

    open.onsuccess = function () {
        var db = open.result;
        var tx = db.transaction(object_store, "readwrite");
        var store = tx.objectStore(object_store);
        let getUuid = store.delete(uuid);

        // success
        getUuid.onsuccess = function () {
            console.log("[clientdb.deleteByUuid] getUuid.onsuccess");
            callback(getUuid.result);
        };

        // Close the db when the transaction is done
        tx.oncomplete = function () {
            console.log("[clientdb.deleteByUuid] close db!");
            db.close();
        };

    };

};

clientdb.deleteDocAndRelativeFiles = (object_store, jsonObjs, callback) => {

    console.log("[clientdb.deleteDocAndRelativeFiles");

    var open = clientdb.initDb(object_store);

    open.onsuccess = function () {
        var db = open.result;
        var tx = db.transaction(object_store, "readwrite");
        var store = tx.objectStore(object_store);
        
        let getUuid;
        jsonObjs.forEach(jsonObj => {
            let fls = jsonObj.content.filter( c => c.type === "file" );
            fls.forEach(f => {
                getUuid = store.delete(f.value);
            });
            getUuid = store.delete(jsonObj.uuid);
        });

        // success
        getUuid.onsuccess = function () {
            console.log("[clientdb.deleteDocAndRelativeFiles] getUuid.onsuccess");
        };

        // error
        getUuid.onerror = function () {
            console.log("[clientdb.deleteDocAndRelativeFiles] getUuid.onsuccess");
            callback("ERROR");
        };

        // Close the db when the transaction is done
        tx.oncomplete = function () {
            console.log("[clientdb.deleteDocAndRelativeFiles] tx.oncomplete, close db");
            db.close();
            callback("SUCCESS");
        };

    };

}

