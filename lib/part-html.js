"use strict";

/**
 * Manage html parts.
 */

// All classes generated
let htmlGenerated = [];
const generatedManager = {

    clean: () => {
        htmlGenerated = [];
    },

    get: () => {
        return htmlGenerated;
    },

    getByClassName: (className) => {
        return generatedManager.get().filter( htmlPart => {
            return htmlPart.constructor.name == className;
        })
    },

    add: (htmlPart) => {
        htmlGenerated.push(htmlPart);
    },

    getById: (id) => {
        let result = htmlGenerated.filter(function (htmlGen) {
            return htmlGen.id === id;
        });

        if (result.length !== 1) {
            console.log("** %s", id);
            throw new Error('htmlGen.id must be exists and unique, check your json input file!');
        }

        return result[0];
    }

};


//'htmlWithRule' contains classes extendion of 'Generic Html' which have the rule attribute valued.
let htmlWithRule = [];
const getHtmlWithRule = () => {
    return htmlWithRule;
};

// array ruleType contains classes that support 'rule' attribute, this attibute comes from json file.
let ruleType = ["TextHtml","CheckboxHtml","RadioHtml","SelectHtml"];

class GenericHtml {
    constructor(objParam, clazz){
        this.clazz = clazz;
        this.type = objParam.type;
        this.id = objParam.id;
        this.label = objParam.label;
        this.value = objParam.value !== undefined ? objParam.value : "";
        this.option = objParam.option;
        this.rule = objParam.rule;
        this.valMessage = objParam.valMessage;
        this.title = objParam.title;

        if (this.rule !== undefined){
            if (ruleType.includes(this.constructor.name)){
                htmlWithRule.push(this);
            } else {
                throw new Error("Class %s can't have rule attribute!", this.constructor.name);
            }
        }

        generatedManager.add(this);

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
    generatedManager,
    getHtmlWithRule,
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