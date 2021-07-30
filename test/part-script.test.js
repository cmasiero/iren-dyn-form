"use strict"

const pretty = require('pretty');
const { 
    resultScript 
} = require('../lib/part-script');

const {
    generatedManager
} = require('../lib/part-html');


test('test MandatoryRule class.', () => {

    /* Avoid in file part-html.js 'throw new Error('htmlGen.id must be exists and unique, check your json input file!');' */
    generatedManager.clean();
    generatedManager.add({id: 'id01', type: 'text'});
    generatedManager.add({id: 'id02', type: 'text'});
    generatedManager.add({id: 'id03', type: 'text'});

    // partHml object
    let partHtml = { 
        type: "text", id: "00_id", 
        label: "descrizione text 00", 
        rule: "mandatory               if                     id01 == id02 && ( id03 != 'valueStatic' )", 
        valMessage: "Il campo è obbligatorio!" 
    };
        
    let scriptResult = resultScript.scriptRule(partHtml, "mandatory");
    
    // console.log(pretty(scriptResult));

    let expected = `// Fields are evaluated if under a visible title.
                    // Search for title visibility:
                    let title_display_00_id = document.getElementById("00_id").closest(".div-table").previousElementSibling.style.display;
                    if (title_display_00_id != 'none') {
                    if ( document.getElementById('id01').value == document.getElementById('id02').value && ( document.getElementById('id03').value != 'valueStatic' ) ){
                    let v_00_id = document.getElementById('00_id').value;
                    if (v_00_id === ''){
                    document.getElementById('00_id').parentElement.style.border = '1px solid red';
                    result.indexOf("Il campo è obbligatorio! (undefined)") === -1 ? result.push("Il campo è obbligatorio! (undefined)") : console.log("'Il campo è obbligatorio! (undefined)' already exists");       
                    }
                    }}
                   `;

    expect(pretty(scriptResult)).toBe(pretty(expected));
    
});

test('test VisibleRule class.', () => {

    /* Avoid in file part-html.js 'throw new Error('htmlGen.id must be exists and unique, check your json input file!');' */
    generatedManager.clean();
    generatedManager.add({id: '01_id', type: 'text'});
    generatedManager.add({id: '02_id', type: 'text'});

    // partHml object
    let partHtml = { 
        type: "text", 
        id: "01_id", 
        label: "descrizione text 01", 
        //rule: "mandatory#visible if 01_identificativo > 10"
        rule: "mandatory if 01_id == '10'#visible if 02_id == 'hard_coded'"
    };
        
    let scriptResult = resultScript.scriptRule(partHtml,"visible");
    
    // console.log(pretty(scriptResult));

    let expected = `
    if ( document.getElementById('02_id').value == 'hard_coded' ){
        let node = document.getElementById('01_id');
        node.style.display = \"inline\";
        if (node.previousElementSibling !== null) {
        node.previousElementSibling.style.display = \"inline\";
        }
        if (node.nextElementSibling !== null) {
        node.nextElementSibling.style.display = \"inline\";
        }
        visibilityParent(node);
        } else {
        let node = document.getElementById('01_id');
        node.style.display = \"none\";
        if (node.previousElementSibling !== null) {
        node.previousElementSibling.style.display = \"none\";
        }
        if (node.nextElementSibling !== null) {
        node.nextElementSibling.style.display = \"none\";
        }
        visibilityParent(node);
        }
    `;

    expect(pretty(scriptResult)).toBe(pretty(expected));
    
});

test('test scriptRule method visible.', () => {


    /* Avoid in file part-html.js 'throw new Error('htmlGen.id must be exists and unique, check your json input file!');' */
    generatedManager.clean();
    generatedManager.add({id: '02_id', type: 'text'});
    generatedManager.add({id: '03_id', type: 'text'});
    generatedManager.add({id: '04_id', type: 'text'});

    // partHml object
    let partHtml = { 
        type: "text", 
        id: "01_id", 
        label: "descrizione text 01", 
        rule: "mandatory if 01_id == '10'#visible if 02_id == 'hard coded'"
    };
        
    let scriptResult = resultScript.scriptRule(partHtml,"visible");
    
    // console.log(pretty(scriptResult));
    // console.log(scriptResult);

    let expected = `
    if ( document.getElementById('02_id').value == 'hard coded' ){
        let node = document.getElementById('01_id');
        node.style.display = \"inline\";
        if (node.previousElementSibling !== null) {
            node.previousElementSibling.style.display = \"inline\";
        }
        if (node.nextElementSibling !== null) {
            node.nextElementSibling.style.display = \"inline\";
        }
        visibilityParent(node);
    } else {
        let node = document.getElementById('01_id');
        node.style.display = \"none\";
        if (node.previousElementSibling !== null) {
            node.previousElementSibling.style.display = \"none\";
        }
        if (node.nextElementSibling !== null) {
            node.nextElementSibling.style.display = \"none\";
        }
        visibilityParent(node);
    }
    `;

    expect(pretty(scriptResult)).toBe(pretty(expected));
    
});





