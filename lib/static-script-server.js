exports.post = () => {
    
    return `    function sendDocOnServer (jsonDoc, url, contentType, callback){
                    console.log("[sendDocOnServer] url: %s, contentType: %s", url, contentType);
                    
                    let xhr = new XMLHttpRequest();
                    xhr.open("POST", url, true);
                    xhr.setRequestHeader("Content-Type", contentType);
                    xhr.send(jsonDoc);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && ( xhr.status === 200 || xhr.status === 201)) {
                          console.log("[sendDocOnServer] json response: %s", xhr.responseText);
                          callback(xhr);
                        } 
                    };
                    xhr.onerror= function(err) {
                        console.error(err);
                        callback(err);
                    };
                    
                }

                function sendFileOnServer(fileObj, url, contentType, callback) {
                    let t0 = new Date().getTime();
                    console.log("[sendFileOnServer] Send file, name: %s", fileObj.filename);
                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", url + '?filename=' + fileObj.filename , true);
                    xhr.onload = function (e) {
                        console.log("[sendFileOnServer] Saved on server filename: %s  in %d ms", fileObj.filename, new Date().getTime() - t0);
                        console.log("[sendFileOnServer] Server response: %s", e.currentTarget.responseText);
                        callback(e);
                    };
                    xhr.onerror = function (err) {
                        console.error(err);
                        callback(err);
                    };
                    xhr.send(fileObj.file);
                }
                
                `;
                
}