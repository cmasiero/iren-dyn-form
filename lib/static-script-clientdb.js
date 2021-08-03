exports.dao = `
                        const db_name = "CardDatabase";
                        const object_store = "CardStore";
                        function initDb (){
                            // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
                            var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
                           
                            // Open (or create) the database
                            let open = indexedDB.open(db_name, 1);
					    
                            // Create the schema
                            open.onupgradeneeded = function() {
                                console.log("[indexDb] open.onupgradeneeded");
                                var db = open.result;
                                // let store = db.createObjectStore(object_store, { autoIncrement: true });
                                let store = db.createObjectStore(object_store, { autoIncrement: false });
                                // var index = store.createIndex("UuidIndex", ["uuid"]);
                            };
					    
                            return open;
                        };
					    
                        function saveDocOnDB (finalObj, uuid){
                           console.log("[indexDb] saveDocOnDB");
                           var open = initDb();
					    
                            open.onsuccess = function() {
                                var db = open.result;
                                var tx = db.transaction(object_store, "readwrite");
                                var store = tx.objectStore(object_store);
					    
                                store.put(finalObj, uuid);
					    
                                // Close the db when the transaction is done
                                tx.oncomplete = function() {
                                    console.log("[indexDb] close db saveDocOnDB");
                                    db.close();
                                };
                            };
					    
                        };

                        function getByUuid(uuid ,callback){

                           console.log("[indexDb] [getByUuid]");
					    
                           var open = initDb();
					    
                            open.onsuccess = function() {
                                var db = open.result;
                                var tx = db.transaction(object_store, "readwrite");
                                var store = tx.objectStore(object_store);
                                // var index = store.index("UuidIndex");
                                // var getUuid = index.get([uuid]);
                                let getUuid = store.get(uuid);

                                // success
                                getUuid.onsuccess = function() {
                                    console.log("[indexDb] getUuid.onsuccess");
                                    callback(getUuid.result);
                                };
					    
                                // Close the db when the transaction is done
                                tx.oncomplete = function() {
                                    console.log("[indexDb] close db getByUuid");
                                    db.close();
                                };
                                
                            };

                        };
					    
                        function getLastDoc (callback){
                           console.log("[indexDb] [getLastDoc]");
					    
                           var open = initDb();
					    
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
                                    console.log("[indexDb] close db getLastDoc");
                                    db.close();
                                };
                                
                            };
					    
                        };
                        
                   `;