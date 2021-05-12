"use strict";

/**
 * Manage html parts.
 */

// validable array contains 'evaluableType' which have the validable attribute valued.
let validable = [];
const getHtmlPartValidable = () => {
    return validable;
};

// array evaluableType contains classes that support 'validation' attribute, this attibute comes from json file.
let evaluableType = ["TextHtml","CheckboxHtml","RadioHtml","SelectHtml"];
let evaluable = [];
const getHtmlPartEvaluable = () => {
    return evaluable;
};

class GenericHtml {
    constructor(objParam, clazz){
        this.clazz = clazz;
        this.type = objParam.type;
        this.id = objParam.id;
        this.label = objParam.label;
        this.value = objParam.value !== undefined ? objParam.value : "";
        this.option = objParam.option;
        this.validation = objParam.validation;
        this.valMessage = objParam.valMessage;

        if (this.validation !== undefined){
            validable.push(this);
        }
        if (evaluableType.includes(this.constructor.name)){
            evaluable.push(this);
        }
    }
}

class TableHtml extends GenericHtml {
    constructor(objParam){
        super(objParam,"div-table");
    }
    buildPart(){
        let result = `<div class="${this.clazz}" id="${this.id}">
                      </div>`;
        return result;
    }
}

class TitleHtml extends GenericHtml {
    constructor(objParam){
        super(objParam,"table-title");
    }
    buildPart(){
        let result = `<div class="${this.clazz}" id="${this.id}">
                      ${this.value}
                     </div>`;
        return result;
    }
}

class RowHtml extends GenericHtml {
    constructor(objParam){
        super(objParam,"div-table-row");
    }
    buildPart(){
        let result = `<div class="${this.clazz}" id="${this.id}"></div>`;
        return result;
    }
}

class ColHtml extends GenericHtml {
    constructor(objParam){
        super(objParam,"div-table-col");
    }
    buildPart(){
        let result = `<div class="${this.clazz}" id="${this.id}"></div>`;
        return result;
    }
}

class StrongText extends GenericHtml {
    constructor(objParam){
        super(objParam);
    }
    buildPart(){
        let result = `<strong>${this.value}</strong>`;
        return result;
    }
}

class TextHtml extends GenericHtml {
    constructor(objParam){
        super(objParam);
    }
    buildPart(){
        let result = `
        <label for="${this.id}">${this.label}</label>
        <input type="text" id="${this.id}" value="${this.value}">
                      `;
        return result;
    }
}

class CheckboxHtml extends GenericHtml {
    constructor(objParam){
        super(objParam);
        this.checked = objParam.checked !== undefined && objParam.checked === 'true' ? "checked" : "";
    }
    buildPart(){
        let result = `
        <input type="checkbox" id="${this.id}" name="${this.id}" value="${this.value}" ${this.checked}>
        <label for="${this.id}">${this.label}</label>
                      `;
        return result;
    }
}

class RadioHtml extends GenericHtml {
    constructor(objParam){
        super(objParam);
    }
    buildPart(){
        let result = ``;

        this.option.forEach(opt => {
            let checked = opt.checked !== undefined && opt.checked === 'true' ? 'checked="true"' : "";
            result += `
            <input type="radio" id="${opt.value}" name="${this.id}" value="${opt.value}" ${checked}>
            <label for="${opt.value}" >${opt.label}</label>`;
        });

        return result;
    }
}

class SelectHtml extends GenericHtml {
    constructor(objParam) {
        super(objParam);
    }
    buildPart(){
        let result = `
        <label for="${this.id}">${this.label}</label>
        <select name="${this.id}" id="${this.id}">
                     `;
        this.option.forEach(opt => {
            opt.selected = opt.selected !== undefined && opt.selected === 'true' ? 'selected="selected"' : "";
            result += `<option value="${opt.value}" ${opt.selected}>${opt.label}</option>`
        });
        result += `</select>`;

        return result;
    }
}

module.exports = {
    getHtmlPartValidable,
    getHtmlPartEvaluable,
    TitleHtml,
    TableHtml,
    RowHtml,
    ColHtml,
    StrongText,
    TextHtml,
    RadioHtml,
    SelectHtml,
    CheckboxHtml
}