exports.post = (url) => {
                
    return `    function sendDocOnServer (jsonDoc){
                    console.log("post server: ${url}");
                    // console.log(jsonDoc);
                    
                    let xhr = new XMLHttpRequest();
                    /* Cambia url per provare! */
                    let url = "${url}";
                    xhr.open("POST", url, true);
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.onreadystatechange = function () {
                        // console.log(xhr);
                        // if (xhr.readyState === 4 && ( xhr.status === 200 || xhr.status === 201)) {
                        if (xhr.readyState === 4) {
                          let json = JSON.parse(xhr.responseText);
                          console.log("##### json response #####");
                          console.log(json)
                          console.log("##### json response end #####");
                          alert("DOCUMENTO INVIATO AL SERVER! (status = " + xhr.status + ")");
                        } 
                    };
                    xhr.onerror= function(err) {
                        console.error(err);
                        alert("Non è stato possibile inviare i dati al server! url:" + url);
                    };

                    // console.log(jsonDoc);
                    xhr.send(jsonDoc);
                    
                }
                `;
}