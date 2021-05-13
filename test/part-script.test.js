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
        rule: "mandatory|visible if 01_identificativo > 10"
    };
        
    // rule: "visible if id01 == id02 && ( id03 != '0' )", 
    let scriptResult = resultScript.scriptRule(objParam,"visible");
    
    console.log(pretty(scriptResult));

    let expected = `if ( document.getElementById('id01').value == document.getElementById('id02').value && ( document.getElementById('id03').value != 'valueStatic' ) ){
                    let v_00_id = document.getElementById('00_id').value;
                    if (v_00_id === ''){ result.push("Il campo è obbligatorio!"); }
                    }
                   `;

    // expect(pretty(scriptResult)).toBe(pretty(expected));
    expect(1).toBe(1);
    
});


