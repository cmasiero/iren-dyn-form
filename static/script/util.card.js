var utilCard = {};

/**
 * By parsing current html page: Returns an object containing the javascript object for fields
 * and an array of attachment files.
 * @returns Obj {card: {}, attachments: []}.
 */
utilCard.currentCardToObj = function () {

    console.log("[utilCard.currentCardToJson]");

    let result = {
        card: {},
        attachments: []
    };

    /* Create a valid json obj */
    let validArray = [];

    let querable = 'input[type="text"], input[type="date"], select, input[type="radio"], input[type="checkbox"], input[type="file"], textarea';
    let nl = document.forms[0].querySelectorAll(querable);
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
                        result.attachments.push({ "file": f, "filename": uuidAndName });
                    }
                } else if ((item.type !== 'checkbox' && item.value.trim() !== '') ||
                    (item.type === 'checkbox' && item.value === 'true')) { // only setted values in json doc
                    objToPush = { "id": item.id, "value": item.value, "type": item.type };
                    /* Adds 'join' an 'valuemap' if they exist. */
                    if (item.join !== null) { objToPush.join = item.join }
                    if (item.valuemap !== null) { objToPush.valuemap = item.valuemap; }
                }
            }

            if (objToPush !== null) { validArray.push(objToPush); }

        }
    }

    /* Hidden fields in final object */
    let nh = document.querySelectorAll('input[type="hidden"]');
    for (item of nh) {
        if (item.id === 'uuid' || item.id === 'cards' || item.id === 'filename') {
            result.card[item.id] = item.value;
        } else {
            let objToPush = { "id": item.id, "value": item.value, "type": item.type };
            validArray.push(objToPush);
        }
    }

    result.card.content = validArray;

    return result;

};