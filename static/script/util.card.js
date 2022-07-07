var utilCard = {};

/**
 * By parsing current html page: Returns an object containing the javascript object for fields
 * and an array of attachment files.
 * @returns Obj {card: {}, attachments: []}.
 */
utilCard.currentCardToObj = function (callback) {

    console.log("[utilCard.currentCardToJson]");

    let result = {
        card: {
        },
        attachments: []
    };

    /* Hidden fields in final object */
    let nh = document.querySelectorAll('input[type="hidden"]:not([name="fileFromStoreSave"])')
    for (item of nh) {
        if (item.id === 'uuid' || item.id === 'cards' || item.id === 'filename') {
            result.card[item.id] = item.value;
        } 
    }

    // Init content
    result.card.content = [];

    /* Edited fields */
    let querableField = 'input[type="text"], input[type="date"], select, input[type="radio"], input[type="checkbox"], input[type="file"], input[name="fileFromStoreSave"], textarea';
    let nl = document.forms[0].querySelectorAll(querableField);
    for (item of nl) {
        /* Fields are evaluated if under a visible title.
         * Search for title visibility, invisible title means unused table therefore unset values.
         */
        let title_display = document.getElementById(item.id).closest(".div-table").previousElementSibling.style.display;
        if (title_display != 'none') {

            if (item.type === 'checkbox') {
                item.value = item.checked;
            }

            /* join and value map for select */
            let elTmp = document.getElementById(item.id);
            item.join = elTmp.getAttribute('join');
            if (item.type === 'select-one') {
                let selected = elTmp.options[elTmp.selectedIndex];
                item.valuemap = selected.getAttribute('valuemap');
            } else {
                item.valuemap = elTmp.getAttribute('valuemap');
            }

            let objToPush = null;
            if (item.id.lastIndexOf("__") !== -1) {
                /* 
                 * Workaround: An id has same value and different behaviour about patterns in json configuration.
                 * Different ids name assumes the same name in output.
                 * example: dg_codice_cabina__parma and dg_codice_cabina__torino_chiomonte in output are the same: dg_codice_cabina
                 */
                if (item.value.trim() !== '') {
                    let newId = item.id.substring(0, item.id.lastIndexOf("__"));
                    objToPush = { "id": newId, "value": item.value, "type": item.type };
                }
            } else {
                if (item.type == 'radio') {
                    if (document.getElementById(item.id).checked === true) {
                        let newId = document.getElementById(item.id).name;
                        objToPush = { "id": newId, "value": item.value, "type": item.type };
                        /* Adds 'join' an 'valuemap' if they exist. */
                        if (item.join !== null) { objToPush.join = item.join }
                        if (item.valuemap !== null) { objToPush.valuemap = item.valuemap; }
                    }
                } else if (item.type == 'file') {
                    let f = document.getElementById(item.id).files[0];
                    if (f !== undefined) {
                        let uuid = document.getElementById('uuid').value;
                        let uuidAndName = uuid.concat("_").concat(f.name);
                        objToPush = { "id": item.id, "value": uuidAndName, "type": item.type };
                    }
                } else if (item.type == 'hidden' && item.name === 'fileFromStoreSave'){
                    // back to original format
                    objToPush = { "id": item.id, "value": item.value, "type": "file" };
                } else if ((item.type !== 'checkbox' && item.value.trim() !== '') || (item.type === 'checkbox' && item.value === 'true')) { // only setted values in json doc

                    if (item.type === 'select-one'){
                        objToPush = { "id": item.id, "value": item.value, "selectedIndex": item.selectedIndex, "type": item.type };
                    } else {
                        objToPush = { "id": item.id, "value": item.value, "type": item.type };
                    }

                    /* Adds 'join' an 'valuemap' if they exist. */
                    if (item.join !== null) { objToPush.join = item.join }
                    if (item.valuemap !== null) { objToPush.valuemap = item.valuemap; }
                }
            }

            if (objToPush !== null) { result.card.content.push(objToPush); }

        }
    }

    /* Add files */
    let querableFile = 'input[type="file"]';
    let nlFile = document.forms[0].querySelectorAll(querableFile);
    for (item of nlFile){
        let f = document.getElementById(item.id).files[0];
        if (f){
            let uuid = document.getElementById('uuid').value;
            let uuidAndName = uuid.concat("_").concat(f.name);
            result.attachments.push({ "file": f, "filename": uuidAndName });
        }
    }

    /* Adds files from store save */
    let querableFileStoreSave = 'input[name="fileFromStoreSave"]';
    let nlFileStoreSave = document.forms[0].querySelectorAll(querableFileStoreSave);

    // No file from store_save
    if (nlFileStoreSave.length === 0) {
        callback(result);
    }

    // There are some files from store_save, callback here!
    nlFileStoreSave.forEach( (item, i, array) => {
        clientdb.getByUuid(store_save, item.value, (f) => {
            result.attachments.push({ "file": f, "filename": item.value });
            if (i === array.length - 1) {
                callback(result);
            }
        });
    });

};

utilCard.objToCurrentCard = function (jsonDoc) {
    
    console.log("[utilCard.objToCurrentCard]");

    document.getElementById("filename").value = jsonDoc.filename;
    document.getElementById("cards").value = jsonDoc.cards;
    document.getElementById("uuid").value = jsonDoc.uuid;

    jsonDoc.content.forEach(element => {
        
        if (element.type === "checkbox") {
            document.getElementById(element.id).checked = (element.value === "true");
        } else if (element.type === "radio") {
            document.getElementById(element.value).checked = true;
        } else if (element.type === "file") {
            let fileElement = document.getElementById(element.id);
            fileElement.type = "hidden";
            fileElement.name = "fileFromStoreSave";
            fileElement.value = `${element.value}`;
            $(`<span>: ${element.value}</span>`).insertAfter(fileElement);
        } else {
            document.getElementById(element.id).value = element.value;
        }

    });

};
