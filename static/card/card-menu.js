var cardPopUp = {};

$("#changeNote").click(function () {
    alert("Manca implementazione");
    
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