"use strict";

/**
 * Manage html parts.
 */

const partHtmlInit = {
    clean: () => {
        htmlGenerated = [];
        htmlWithRule = [];
        htmlWithPattern = [];
        htmlWithRuleValue = [];
        htmlClientInit = [];
    }
};

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

    checkUniqueId: () => {
        
        let onlyIds = htmlGenerated.map( htmlGen => {
            return htmlGen.id;
        });
        
        let ids = onlyIds.filter((item, index) => onlyIds.indexOf(item) != index)

        if (ids.length !== 0){
            let msg = `Id '${ids}' are duplicated! Id value must be unique!`;
            throw new Error(msg);
        }

    },

    getById: (id) => {

        let result = htmlGenerated.filter(function (htmlGen) {
            return htmlGen.id === id;
        });

        if (result.length !== 1) {
            let msg = `htmlGen.id '${id}' must be exists and unique, check your json input file!`;
            throw new Error(msg);
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

let htmlWithRuleValue = [];
const getHtmlWithRuleValue = () => {
    return htmlWithRuleValue;
};

let htmlClientInit = [];
const getHtmlClientInit = () => {
    return htmlClientInit;
};

let buildHtmlPart = colEl => {

    let result = null;

    switch (colEl.type) {
        case "description":
            result = new StrongText(colEl);
            break;
        case "text":
            result = new TextHtml(colEl);
            break;
        case "checkbox":
            result = new CheckboxHtml(colEl);
            break;
        case "radio":
            result = new RadioHtml(colEl);
            break;
        case "select":
            result = new SelectHtml(colEl);
            break;
        case "date":
            result = new DateHtml(colEl);
            break;
        case "textarea":
            result = new TextAreaHtml(colEl);
            break;
        case "file":
            result = new FileHtml(colEl);
            break;
        case "hint":
            result = new HintHtml(colEl);
            break;
        default:
            break;
    }


    return result;

};



class GenericHtml {

    /**
     *  Array RULE_TYPE contains classes that support 'rule' attribute, 
     *  this attibute comes from json file.
     */
    static RULE_TYPE = ["TableHtml", "TextHtml", "TextAreaHtml", "CheckboxHtml","RadioHtml","SelectHtml", "DateHtml", "HintHtml"];

    constructor(objParam, clazz){
        this.clazz = clazz;
        this.type = objParam.type;
        this.size = objParam.size;
        this.rows = objParam.rows;
        this.cols = objParam.cols;
        this.maxlength = objParam.maxlength;
        this.title = objParam.title;

        this.join = objParam.join;
        this.id = objParam.id;

        this.label = objParam.label !== undefined ? objParam.label : "";
        this.value = objParam.value !== undefined ? objParam.value : "";
        this.option = objParam.option;
        this.rule = objParam.rule;
        this.valMessage = objParam.valMessage;
        this.pattern = objParam.pattern;
        this.patMessage = objParam.patMessage;
        this.ruleValue = objParam.ruleValue;
        this.init = objParam.init;
        this.accept = objParam.accept;

        // tags
        this.joinTag = this.join !== undefined ?  `join="${this.join}"` : "";
        this.sizeTag = this.size !== undefined ?  `size="${this.size}"` : "";
        this.maxlengthTag = this.maxlength !== undefined ?  `maxlength="${this.maxlength}"` : "";
        this.rowsTag = this.rows !== undefined ? `rows="${this.rows}"` : "";
        this.colsTag = this.cols !== undefined ? `cols="${this.cols}"` : "";

        if (this.rule !== undefined){
            if (GenericHtml.RULE_TYPE.includes(this.constructor.name)){
                htmlWithRule.push(this);
            } else {
                throw new Error(`id: ${this.id} - Class ${this.constructor.name} can't have rule attribute!`);
            }
        }
        
        if (this.ruleValue !== undefined){
            if (["TextHtml","HintHtml", "SelectHtml"].includes(this.constructor.name)){
                htmlWithRuleValue.push(this);
            } else {
                throw new Error(`id: ${this.id} - Class ${this.constructor.name} can't have ruleValue attribute!`);
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
        if (objParam.hint != undefined){
            this.scrHint = new HintHtml(objParam.hint);
        }
    }
    buildPart(){
        let hintParseTag = "";
        if (this.scrHint != undefined){
            let hintParse = this.scrHint.buildPart();
            hintParseTag = ` <div style="display: inline;">${hintParse}</div>`;
        }
        let result = `<div class="${this.clazz}" id="${this.id}">
                       ${this.value}${hintParseTag}
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
        <input type="text" ${this.sizeTag} ${this.maxlengthTag} ${this.joinTag} id="${this.id}" value="${this.value}">
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
        <textarea ${this.rowsTag} ${this.colsTag} ${this.maxlengthTag} ${this.joinTag} id="${this.id}" value="${this.value}"></textarea>
                      `;
        return result;
    }

}

class CheckboxHtml extends GenericHtml {
    constructor(objParam){
        super(objParam);
        this.checked = objParam.checked !== undefined && objParam.checked === 'true' ? "checked" : "";
        this.valuemapTag = objParam.valuemap !== undefined ? `valuemap=${objParam.valuemap}` : "";
    }
    buildPart(){
        let result = `
        <input type="checkbox" ${this.joinTag} id="${this.id}" name="${this.id}" value="${this.value}" ${this.valuemapTag} ${this.checked}>
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
            let valuemapTag = opt.valuemap !== undefined ? `valuemap=${opt.valuemap}`  : "";
            result += `
            <input type="radio" ${this.joinTag} id="${opt.value}" ${valuemapTag} name="${this.id}" value="${opt.value}" ${checked}>
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
        <select name="${this.id}" ${this.joinTag} id="${this.id}">
                     `;
        this.option.forEach(opt => {
            opt.selected = opt.selected !== undefined && opt.selected === 'true' ? 'selected="selected"' : "";
            let valuemapTag = opt.valuemap !== undefined ? `valuemap=${opt.valuemap}`  : "";
            result += `<option value="${opt.value}" ${valuemapTag} ${opt.selected}>${opt.label}</option>`
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
                     <input type="date" ${this.joinTag} id="${this.id}" value="${this.value}">
                     `;
        return result;
    }
}

class FileHtml extends GenericHtml {
    constructor(objParam) {
        super(objParam);
    }
    buildPart(){
        let result = `
                     <label for="${this.id}">${this.label}</label>
                     <input type="file" id="${this.id}" accept="${this.accept}">
                     `;
        return result;
    }
}

class HintHtml extends GenericHtml {
    constructor(objParam) {
        // Before 'id' add marker 'hint' to recognize it and avoiding post it.
        objParam.id = 'hint_'.concat(objParam.id);
        super(objParam, "hint-span");
    }
    buildPart(){
        
        let result = `
                     <label for="${this.id}">${this.label}</label>
                     <span id="${this.id}" class="${this.clazz}">${this.value}</span>
                     `;
        return result;
    }
}


module.exports = {
    partHtmlInit,
    generatedManager,
    getHtmlWithRule,
    getHtmlWithRuleValue,
    getHtmlWithPattern,
    getHtmlClientInit,
    TitleHtml,
    TableHtml,
    RowHtml,
    ColHtml,
    buildHtmlPart
}