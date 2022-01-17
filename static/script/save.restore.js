/**
 * Save current card in indexed db in Browser
 * @unused
 */
console.log("save restore");

var saveRestore = {};

saveRestore.save = () => {

    console.log("[saveRestore.save]");
    clientdb.saveOnDB(store_save, {"saluto":"ciao"}, "10101");

}