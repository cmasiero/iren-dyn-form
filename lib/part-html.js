"use strict";

class GenericHtml {
    constructor(clazz, id){
        this.clazz = clazz;
        this.id = id;
    }
}

class TableHtml extends GenericHtml {
    constructor(id){
        super("div-table",id);
    }
    buildPart(){
        let result = `<div class="${this.clazz}" id="${this.id}">
                      </div>`;
        return result;
    }
}

class TitleHtml extends GenericHtml {
    constructor(id, content){
        super("table-title", id);
        this.content = content;
    }
    buildPart(){
        let result = `<div class="${this.clazz}" id="${this.id}">
                      ${this.content}
                     </div>`;
        return result;
    }
}

class RowHtml extends GenericHtml {
    constructor(id){
        super("div-table-row",id);
    }
    buildPart(){
        let result = `<div class="${this.clazz}" id="${this.id}"></div>`;
        return result;
    }
}

class ColHtml extends GenericHtml {
    constructor(id){
        super("div-table-col",id);
        
    }
    buildPart(){
        let result = `<div class="${this.clazz}" id="${this.id}"></div>`;
        return result;
    }
}

class ColDescriptionHtml extends GenericHtml {
    constructor(content){
        super("div-table-col div-table-col-desc");
        this.content = content;
    }
    buildPart(){
        let result = `<div class="${this.clazz}">
                     ${this.content}
                     </div>`;
        return result;
    }
}

class TextHtml extends GenericHtml {
    constructor(id, label){
        super(undefined,id);
        this.label = label;
    }
    buildPart(){
        let result = `
        <label for="${this.id}">${this.label}</label>
        <input type="text" id="${this.id}">
                      `;
        return result;
    }
}

class RadioHtml extends GenericHtml {
    constructor(id,option){
        super(undefined,id);
        this.option = option;
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
    constructor(id, label, option) {
        super(undefined,id);
        this.label = label;
        this.option = option;
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
    TitleHtml,
    TableHtml,
    RowHtml,
    ColHtml,
    ColDescriptionHtml,
    TextHtml,
    RadioHtml,
    SelectHtml
}