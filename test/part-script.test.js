"use strict"

const pretty = require('pretty');
const { 
    MandatoryValidation, HeadValidation, TailValidation, validation 
} = require('../lib/part-script');

test('test MandatoryValidation class.', () => {

    let objParam = { 
        type: "text", id: "00_id", 
        label: "descrizione text 00", 
        validation: "mandatory               if                     id01 == id02 && ( id03 != 'valueStatic' )", 
        valMessage: "Il campo è obbligatorio!" 
    };
        
    // validation: "mandatory if id01 == id02 && ( id03 != '0' )", 
    let scriptResult = validation.mandatoryScript(objParam);
    
    // console.log(pretty(scriptResult));

    let expected = `if ( document.getElementById('id01').value == document.getElementById('id02').value && ( document.getElementById('id03').value != 'valueStatic' ) ){
                    let v_00_id = document.getElementById('00_id').value;
                    if (v_00_id === ''){ result.push("Il campo è obbligatorio!"); }
                    }
                   `;

    expect(pretty(scriptResult)).toBe(pretty(expected));
    
});


