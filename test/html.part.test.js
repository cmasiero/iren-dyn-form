"use strict"

const pretty = require('pretty');
const { buildHtmlPart } = require('../lib/html.part');

test('test RadiotHtml component.', () => {

    let objParam = {
        id : "gender",
        type : "radio",
        option : [
            { "value": "male", "label": "description male" },
            { "value": "female", "label": "description female" },
            { "value": "other", "label": "description other" }
        ]
    }

    let radio = buildHtmlPart(objParam);

    let expected = `
    <input type="radio" id="male" name="gender" value="male">
    <label for="male">description male</label>
    <input type="radio" id="female" name="gender" value="female">
    <label for="female">description female</label>
    <input type="radio" id="other" name="gender" value="other">
    <label for="other">description other</label>
                `;

    expect(pretty(radio.buildPart())).toBe(pretty(expected));
    
});


test('test SelectHtml component.', () => {

    let objParam = {
        id : "id_val",
        type : "select",
        label: "Choose something",
        option: [
            { "value": "volvo", "label": "description volvo" },
            { "value": "saab", "label": "description saab" },
            { "value": "fiat", "label": "description fiat" }
        ]
    }
    let select = buildHtmlPart(objParam);
    // console.log(pretty(select.buildPart()));

    let expected = `
    <label for="id_val">Choose something</label>
    <select name="id_val" id="id_val">
      <option value="volvo">description volvo</option>
      <option value="saab">description saab</option>
      <option value="fiat">description fiat</option>
    </select>
                `;

    expect(pretty(select.buildPart())).toBe(pretty(expected));
});