var server = {};

server.sendDocOnServer = function (jsonDoc, url, contentType, callback){
    console.log("[server.sendDocOnServer] url: %s, contentType: %s", url, contentType);
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(jsonDoc);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && ( xhr.status === 200 || xhr.status === 201)) {
          console.log("[server.sendDocOnServer] json response: %s", xhr.responseText);
          callback(xhr);
        }
        if ( xhr.readyState === 4 && xhr.status === 500 ){
            let e = new Error(xhr.responseText);
            e.type = 'error';
            callback(e);
        }
    };
    xhr.onerror= function(err) {
        console.error(err);
        callback(err);
    };
    
}

server.sendFileOnServer = function(fileObj, url, contentType, callback) {
    let t0 = new Date().getTime();
    console.log("[server.sendFileOnServer] Send file, name: %s", fileObj.filename);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url + '?filename=' + fileObj.filename , true);
    xhr.send(fileObj.file);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && ( xhr.status === 200 || xhr.status === 201)) {
          console.log("[server.sendFileOnServer] json response: %s", xhr.responseText);
          callback(xhr);
        }
        if ( xhr.readyState === 4 && xhr.status === 500 ){
            let e = new Error(xhr.responseText);
            e.type = 'error';
            callback(e);
        }
    };
    xhr.onerror = function (err) {
        console.error(err);
        callback(err);
    };
    
}