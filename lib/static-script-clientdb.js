exports.dao = `
                        const db_name = "CardDatabase";
                        const store_main = "CardStore";
                        const store_not_send = "CardStoreNotSend";
                        
                        function initDb (object_store){
                            // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
                            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
                           
                            // Open (or create) the database
                            let open = indexedDB.open(db_name, 1);
					    
                            // Create the schema
                            open.onupgradeneeded = function() {
                                console.log("[indexDb] open.onupgradeneeded");
                                var db = open.result;
                                let store1 = db.createObjectStore(store_main, { autoIncrement: false });
                                let store2 = db.createObjectStore(store_not_send, { autoIncrement: false });
                            };
					    
                            return open;
                        };
					    
                        function saveOnDB (object_store, finalObj, uuid){
                           console.log("[saveOnDB]");
                           var open = initDb(object_store);
					    
                            open.onsuccess = function() {
                                var db = open.result;
                                var tx = db.transaction(object_store, "readwrite");
                                var store = tx.objectStore(object_store);
					    
                                store.put(finalObj, uuid);
					    
                                // Close the db when the transaction is done
                                tx.oncomplete = function() {
                                    console.log("[saveOnDB] close db!");
                                    db.close();
                                };
                            };
					    
                        };

                        function getByUuid(object_store, uuid ,callback){

                           console.log("[getByUuid]");
					    
                           var open = initDb(object_store);
					    
                            open.onsuccess = function() {
                                var db = open.result;
                                var tx = db.transaction(object_store, "readwrite");
                                var store = tx.objectStore(object_store);
                                let getUuid = store.get(uuid);

                                // success
                                getUuid.onsuccess = function() {
                                    console.log("[getByUuid] getUuid.onsuccess");
                                    callback(getUuid.result);
                                };
					    
                                // Close the db when the transaction is done
                                tx.oncomplete = function() {
                                    console.log("[getByUuid] close db!");
                                    db.close();
                                };
                                
                            };

                        };
					    
                        function getLastDoc (object_store, callback){
                           console.log("[getLastDoc]");
					    
                           var open = initDb(object_store);
					    
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
                                    console.log("[getLastDoc] close db!");
                                    db.close();
                                };
                                
                            };
					    
                        };

                        function getAllDoc (object_store, callback){
                            console.log("[getAllDoc]");
                         
                            var open = initDb(object_store);
                         
                             open.onsuccess = function() {
                                 var db = open.result;
                                 var tx = db.transaction(object_store, "readwrite");
                                 var store = tx.objectStore(object_store);
                         
                                 var getAll = store.getAll();
                         
                                 getAll.onsuccess = function() {
                                     callback(getAll.result);
                                 };
                         
                                 // Close the db when the transaction is done
                                 tx.oncomplete = function() {
                                     console.log("[getAllDoc] close db!");
                                     db.close();
                                 };
                                 
                             };
                         
                         };

                         function deleteByUuid(object_store, uuid ,callback){

                            console.log("[deleteByUuid]");
                         
                            var open = initDb(object_store);
                         
                             open.onsuccess = function() {
                                 var db = open.result;
                                 var tx = db.transaction(object_store, "readwrite");
                                 var store = tx.objectStore(object_store);
                                 let getUuid = store.delete(uuid);
 
                                 // success
                                 getUuid.onsuccess = function() {
                                     console.log("[deleteByUuid] getUuid.onsuccess");
                                     callback(getUuid.result);
                                 };
                         
                                 // Close the db when the transaction is done
                                 tx.oncomplete = function() {
                                     console.log("[deleteByUuid] close db!");
                                     db.close();
                                 };
                                 
                             };
 
                         };
                        
                   `;