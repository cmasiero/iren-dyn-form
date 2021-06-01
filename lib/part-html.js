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
            throw new Error('htmlGen.id (' + id + ') must be exists and unique, check your json input file!');
        }

        return result[0];
    }

};


//'htmlWithRule' contains classes extendion of 'Generic Html' which have the rule attribute valued.
let htmlWithRule = [];
const getHtmlWithRule = () => {
    return htmlWithRule;
};

let htmlWithPattern = [];
const getHtmlWithPattern = () => {
    return htmlWithPattern;
};

let htmlClientInit = [];
const getHtmlClientInit = () => {
    return htmlClientInit;
};

let buildHtmlPart = colEl => {

    let result = null;

    if (colEl.type === "description") {
        result = new StrongText(colEl);
    } else if (colEl.type === "text") {
        result = new TextHtml(colEl);
    } else if (colEl.type === "checkbox") {
        result = new CheckboxHtml(colEl);
    } else if (colEl.type === "radio") {
        result = new RadioHtml(colEl);
    } else if (colEl.type === "select") {
        result = new SelectHtml(colEl);
    } else if (colEl.type === "date") {
        result = new DateHtml(colEl);
    } else if (colEl.type === "textarea"){
        result = new TextAreaHtml(colEl);
    }

    return result;

};



// array ruleType contains classes that support 'rule' attribute, this attibute comes from json file.
let ruleType = ["TextHtml","CheckboxHtml","RadioHtml","SelectHtml", "DateHtml"];

class GenericHtml {
    constructor(objParam, clazz){
        this.clazz = clazz;
        this.type = objParam.type;
        this.size = objParam.size;
        this.rows = objParam.rows;
        this.cols = objParam.cols;
        this.maxlength = objParam.maxlength;
        this.title = objParam.title;

        // add prefix to ids of values, if title is defined.
        // if (this.title !== undefined){
        //     let titlePrefix = this.title.replace( /\s/g, '').concat("_");
        //     console.log(titlePrefix)
        //     this.id = titlePrefix.concat(objParam.id);

        //     // this.id = objParam.id;
        // } else {
        //     this.id = objParam.id;
        // }
        
        this.id = objParam.id;

        this.label = objParam.label !== undefined ? objParam.label : "";
        this.value = objParam.value !== undefined ? objParam.value : "";
        this.option = objParam.option;
        this.rule = objParam.rule;
        this.valMessage = objParam.valMessage;
        this.pattern = objParam.pattern;
        this.patMessage = objParam.patMessage;
        this.init = objParam.init;

        // tags
        this.sizeTag = this.size !== undefined ?  `size="${this.size}"` : "";
        this.maxlengthTag = this.maxlength !== undefined ?  `maxlength="${this.maxlength}"` : "";
        this.rowsTag = this.rows !== undefined ? `rows="${this.rows}"` : "";
        this.colsTag = this.cols !== undefined ? `cols="${this.cols}"` : "";

        if (this.rule !== undefined){
            if (ruleType.includes(this.constructor.name)){
                htmlWithRule.push(this);
            } else {
                throw new Error(`id: ${this.id} - Class ${this.constructor.name} can't have rule attribute!`);
            }
        }

        if (this.pattern !== undefined){
            if (["TextHtml"].includes(this.constructor.name)){
                htmlWithPattern.push(this);
            } else {
                throw new Error(`id: ${this.id} - Class ${this.constructor.name} can't have pattern attribute!`);
            }
        }

        if (this.init !== undefined){
            htmlClientInit.push(this);
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
        <input type="text" ${this.sizeTag} ${this.maxlengthTag} id="${this.id}" value="${this.value}">
                      `;
        return result;
    }
}

class TextAreaHtml extends GenericHtml {

    constructor(objParam){
        super(objParam);
    }
    buildPart(){
        let result = `
        <label for="${this.id}">${this.label}</label>
        <textarea ${this.rowsTag} ${this.colsTag} id="${this.id}" value="${this.value}"></textarea>
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

class DateHtml extends GenericHtml {
    constructor(objParam) {
        super(objParam);
    }
    buildPart(){
        let result = `
                     <label for="${this.id}">${this.label}</label>
                     <input type="date" id="${this.id}" value="${this.value}">
                     `;
        return result;
    }
}


module.exports = {
    generatedManager,
    getHtmlWithRule,
    getHtmlWithPattern,
    getHtmlClientInit,
    TitleHtml,
    TableHtml,
    RowHtml,
    ColHtml,
    buildHtmlPart
}