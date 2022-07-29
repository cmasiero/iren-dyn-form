var cardMenu = {};

$("#changeNote").click(function () {

    const sendDoc = () => {
        utilCard.currentCardToObj(crd => {
            let finalDoc = JSON.stringify(crd.card, null, 2);
            server.sendDocOnServer(finalDoc, cardMenu.urlJson, "application/json", (e) => {
                if (e.type === "error") {
                    alert("Errore invio documento!")
                } else {
                    alert("Documento modificato (Per i soli campi in sfondo verde!)")
                }
            });
        });
    }


    if (confirm("Confermi, per i soli campi in sfondo verde, l'invio e la modifica del documento?") == true) {
        sendDoc();
    } else {
        alert("Operazione annullata!")
    }

});

$("#card-popup-send").click(function () {
    addMessage("Dati aggiunti!");
});

$("#card-popup-close").click(function () {
    $('#card-popup').modal('hide');
});

let addMessage = function (msg) {
    $("#card-popup-massage").text(msg);
};


// $('#card-popup').modal({
//     onShow: function () {
//         addMessage("Qui puoi aggiungere altri dati alla scheda.");
//         return true;
//     }
// }).modal('show');