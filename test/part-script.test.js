"use strict"

const pretty = require('pretty');
const { 
    resultScript 
} = require('../lib/part-script');

test('test MandatoryRule class.', () => {

    let objParam = { 
        type: "text", id: "00_id", 
        label: "descrizione text 00", 
        rule: "mandatory               if                     id01 == id02 && ( id03 != 'valueStatic' )", 
        valMessage: "Il campo è obbligatorio!" 
    };
        
    let scriptResult = resultScript.scriptRule(objParam, "mandatory");
    
    // console.log(pretty(scriptResult));

    let expected = `if ( document.getElementById('id01').value == document.getElementById('id02').value && ( document.getElementById('id03').value != 'valueStatic' ) ){
                    let v_00_id = document.getElementById('00_id').value;
                    if (v_00_id === ''){ result.push("Il campo è obbligatorio!"); }
                    }
                   `;

    expect(pretty(scriptResult)).toBe(pretty(expected));
    
});

test('test VisibleRule class.', () => {

    let objParam = { 
        type: "text", 
        id: "01_id", 
        label: "descrizione text 01", 
        //rule: "mandatory|visible if 01_identificativo > 10"
        rule: "mandatory if 01_id == '10'|visible if 02_id == 'hard_coded'"
    };
        
    // rule: "visible if id01 == id02 && ( id03 != '0' )", 
    let scriptResult = resultScript.scriptRule(objParam,"visible");
    
    console.log(pretty(scriptResult));

    let expected = `if ( document.getElementById('02_id').value == 'hard_coded' ){
                    document.getElementById('01_id').style.display = "inline";
                    document.getElementById('01_id').previousElementSibling.style.display = "inline";
                    visibilityParent('01_id');
                    } else {
                    document.getElementById('01_id').style.display = "none";
                    document.getElementById('01_id').previousElementSibling.style.display = "none";
                    visibilityParent('01_id');
                    }
                   `;

    expect(pretty(scriptResult)).toBe(pretty(expected));
    
});


test('test scriptRule method visible.', () => {

    let objParam = { 
        type: "text", 
        id: "01_id", 
        label: "descrizione text 01", 
        rule: "mandatory if 01_id == '10'|visible if 02_id == 'hard coded' && 03_id == 'pippo' && 04_id == 'ciao ciao'"
    };
        
    let scriptResult = resultScript.scriptRule(objParam,"visible");
    
    console.log(pretty(scriptResult));

    let expected = `if ( document.getElementById('02_id').value == 'hard coded' && document.getElementById('03_id').value == 'pippo' && document.getElementById('04_id').value == 'ciao ciao' ){
                    document.getElementById('01_id').style.display = "inline";
                    document.getElementById('01_id').previousElementSibling.style.display = "inline";
                    visibilityParent('01_id');
                    } else {
                    document.getElementById('01_id').style.display = "none";
                    document.getElementById('01_id').previousElementSibling.style.display = "none";
                    visibilityParent('01_id');
                    }
                   `;

    expect(pretty(scriptResult)).toBe(pretty(expected));
    
});





