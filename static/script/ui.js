
var ui = {};

ui.popUpSendMandatoryUtility = {
    getFieldCard: function (str) {
        let lastIndex0 = this._index(str, "(", -1);
        let lastIndex1 = this._index(str, ")", -1);
        return {
            card: str.substring(lastIndex0, lastIndex1 - 1),
            field: str.substring(0, lastIndex0 - 1)
        }
    },
	_index: function (str, c, idx) {
        let indices = [];
        for(let i=0; i<str.length;i++) {
            if (str[i] === c) indices.push(i+1);
        }
        return indices.at(idx);
    }
}

ui.popUpRecapUtility = {
    deleteUuid: (uuid) => {

        // Don't delete from store_save if uuid is in page, it causes problems with attachments.
        if ( $("#uuid").val() === uuid) {
            $('#row_'.concat(uuid)).addClass("ui message red");
            $("#list-popup-message").removeClass("hidden");
            $("#list-popup-message").children("p").text("Non puoi eliminare un salvataggio caricato in pagina!");
            return;
        }

        $("#list-popup-message").addClass("hidden");

        // remove from ui
        $('#'.concat("row_".concat(uuid))).remove();

        // remove from db
        clientdb.getByUuid(store_save, uuid, jsonObj => {
            clientdb.deleteDocsAndRelativeFiles(store_save, [jsonObj], (result) => {
                if (result === "SUCCESS") {
                    console.log(`[ui.popUpRecapUtility.deleteUuid] ${uuid} removed`);
                } else {
                    console.error("[ui.popUpRecapUtility.deleteUuid] store_save ");
                }
            });
        })

    }
}

ui.popUpRecap = () => {

    $('#list-popup').modal({
        
        onShow: function () {

            // Initilialize view
            $("#list-popup-header").html( "Lista schede salvate (Solo del tipo della scheda corrente!)");
            $("#list-popup-table-header").html("<th>Uuid scheda</th> <th>Ultimo salvataggio</th> <th>Stato</th> <th>Edit</th> <th>Elimina</th>");
            $("#list-popup-message").addClass("hidden");
            $("#list-popup-table").find("tr:gt(0)").remove(); // Removes current content.

            $("#list-popup-approve").show(); // show approve button

            // Table rows
            clientdb.getAllJson(store_save, (docs) => {

                let docsFiltered = docs.filter(doc => doc.filename === document.getElementById("filename").value);

                // no documents in store_save
                if (docsFiltered.length === 0){
                        $("#list-popup-message").removeClass("hidden");
                        $("#list-popup-message").children("p").text("Non ci sono documenti salvati!");
                }

                docsFiltered.sort((a, b) => (a.saveDate < b.saveDate) ? 1 : -1) // sorts by date descending
                    .forEach(doc => {
                        let validMessage = doc.isValid ? "completo" : "incompleto";
                        let t = `<tr id="row_${doc.uuid}">
                                 <td>${doc.uuid}</td>
                                 <td>${utilDate.toDDMMYYYY_HHMMSS(doc.saveDate, "/", ":")}</td>
                                 <td>${validMessage}</td>
                                 <td><div class="ui radio checkbox"><input type="radio" name="cardCheck" value="${doc.uuid}"><label> </label></div> 
                                 <td><button class="ui button" onClick="ui.popUpRecapUtility.deleteUuid('${doc.uuid}')">Elimina</button></td>
                                 </tr>`;
                        $('#list-popup-table tr:last').after(t);
                    });
            });

            return true;
        },
        onApprove($element){

            let docChecked = document.querySelector("input[name=cardCheck]:checked");
            if (!docChecked) {
                $("#list-popup-message").removeClass("hidden");
                $("#list-popup-message").children("p").text("Seleziona un elemento!");
                return false;
            }

            clientdb.getByUuid(store_save,docChecked.value, (result) => {
                document.forms[0].reset();
                document.getElementById("pageFrom").setAttribute('value', 'localDb'); 
                initialize();
                initializeData();
                ui.resetFilesFromStoreSave();
                utilCard.objToCurrentCard(result);
                visibility();

                /* collapse open cards */
                let el = document.getElementsByClassName("table-title");
                for (let i = 0; i < el.length; i++) {
                    if (el[i].style.display != 'none') { // some titles/cards can be invisible.
                        el[i].style.width = '30%';
                        let table = el[i].nextElementSibling; // hides cards.
                        table.style.display = 'none';
                    }
                }

            });
            
        },
        onDeny($element){
        }
    }).modal('show');
}

ui.popUpSendMandatory = (messages) => {

    $('#list-popup').modal({
        onShow: function () {

            // Initilialize view
            $("#list-popup-header").html( "Errori di compilazione" );
            $("#list-popup-table-header").html("<th>Campo</th> <th>Scheda</th>");
            $("#list-popup-message").addClass("hidden");
            $("#list-popup-table").find("tr:gt(0)").remove(); // Removes current content.
            
            $("#list-popup-approve").hide(); // hide approve button

            // Table rows
            messages.forEach(message => {
                    let m = ui.popUpSendMandatoryUtility.getFieldCard(message);
                    let t = `<tr> <td>${m.field}</td><td>${m.card}</td> </tr>`;
                    $('#list-popup-table tr:last').after(t);
            });

            return true;

        },
        onDeny($element){
        }
    }).modal('show');
}

ui.popUpChoice = (msgHeader, msg, approve, deny) => {

    $('#choice-popup').modal({
        onShow: function () {

            $("#choice-popup-header").html(msgHeader);
            $("#choice-popup-content").html(msg);

            return true;

        },
        onApprove($element){
            approve();
        },
        onDeny($element){
            deny();
        }
    }).modal('show');

}

ui.popUpMessage = (msgHeader, msg, close) => {

    $('#message-popup').modal({
        onShow: function () {

            $("#message-popup-header").html(msgHeader);
            $("#message-popup-content").html(msg);

            return true;

        },
        onApprove($element){
            let fnc = close ? close : () => {return};
            fnc();
        }
    }).modal('show');

}

ui.popUpMsg = (param, msg) => {

    if (!this.initiazed) {
        this.initiazed = true;
        ui.popUpMsg('init');
    }

    // Set states
    switch (param) {
        case 'init':
            this.modalId = document.getElementById("modalPop");
            this.msgId = document.getElementById("modalMsg");
            this.msgId.innerText = '';
            this.closeButtonId = document.getElementById("popUpClose");
            this.closeButtonId.style.display = "none";
            break;
        case 'open':
            this.modalId.style.display = "block";
            this.msgId.innerText = msg;
            break;
        case 'close':
            this.modalId.style.display = "none";
            this.msgId.innerText = '';
            this.closeButtonId.style.display = "none";
            break;
        case 'addText':
            this.msgId.innerText = this.msgId.innerText.concat("\n").concat(msg);
            break;
        case 'closeButton':
            this.closeButtonId.style.display = "block";
            break;
        default:
            throw new Error('[popUpMsg] Illegal argument error:' + param);
            break;
    }

}

/**
 * In UI files from store_save are showed like:
 * <input type="hidden" id="ba_foto_01" accept="image/*" name="fileFromStoreSave" value="gp8dwmjo4xhtzju7tklm7l_AAA_00.png">
 * <span>: gp8dwmjo4xhtzju7tklm7l_AAA_00.png</span>
 * This function turn the representation to:
 * <input type="file" id="ba_foto_01" accept="image/*">
 */
 ui.resetFilesFromStoreSave = function () {

    let ids = [];
    let nl = document.getElementsByName("fileFromStoreSave");
    for (let hiddenFile of nl) {
        ids.push(hiddenFile.id);
    }

    // Now it can modify name and the others property using the id.
    ids.forEach(id => {
        let hiddenFile = document.getElementById(id);
        hiddenFile.type = "file";
        hiddenFile.removeAttribute("name")
        hiddenFile.removeAttribute("value");
        hiddenFile.nextElementSibling.remove();
    });

}