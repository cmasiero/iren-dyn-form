"use strict";

let validable = [];
const getHtmlPartValidable = () => {
    return validable;
};

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
        this.value = objParam.value;
        this.option = objParam.option;
        this.validation = objParam.validation;
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
        <input type="text" id="${this.id}">
                      `;
        return result;
    }
}

class CheckboxHtml extends GenericHtml {
    constructor(objParam){
        super(objParam);
    }
    buildPart(){
        let result = `
        <input type="checkbox" id="${this.id}" name="${this.id}">
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
            result += `
            <input type="radio" id="${opt.value}" name="${this.id}" value="${opt.value}">
            <label for="${opt.value}">${opt.label}</label>`;
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
             result +=  `<option value="${opt.value}">${opt.label}</option>`
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