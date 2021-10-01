"use strict";

const { generatedManager } = require('./part-html');

const { reusableRuleDao, reusablePatternDao } = require('./reusable-dao');

/**
 * Manage script parts.
 */
const resultScript = {
    arrayMandatory : [],
    /**
     * 
     * @returns Array of classes MandatoryRule that need to be validated.
     */
    getMandatories : () => {
        return resultScript.arrayMandatory;
    },

    arrayVisible : [],
    /**
     * 
     * @returns Array of classes VisibleRule that need to be validated.
     */
    getVisibles : () => {
        return resultScript.arrayVisible;
    },

    arrayPattern : [],
    /**
     * 
     * @returns Array of classes Pattern that need to be validated.
     */
    getPattern : () => {
        return resultScript.arrayPattern;
    },

    arrayRuleValue : [],
    /**
     * 
     * @returns Array of classes Pattern that need to be validated.
     */
    getRuleValue : () => {
        return resultScript.arrayRuleValue;
    },

    /**
     * 
     * @param {*} partHtml 
     * @param {*} type can be "mandatory" or "visible" etc.
     * @returns script part to make visibility, mandatory etc.
     */
    scriptRule : (partHtml, type) => {
        let result = "";

        // Messages management for reusable rules.
        let r = reusableRuleDao.getByName(partHtml.rule);
        if (r !== undefined) {
            partHtml.rule = r.rule; 
            if (r.valMessage !== undefined && partHtml.valMessage === undefined) {
                partHtml.valMessage = r.valMessage;
            }
        }

        let arrayRule = partHtml.rule.split("#");
        
        arrayRule.forEach(rule => {

            if (rule.split(" ")[0] === type) {
                let partHtmlCopy = Object.assign({}, partHtml);
                if (type === "mandatory") {
                    partHtmlCopy.rule = rule; // Only 'mandatory' part as rule in parameter object partHtml.
                    let mandatoryRule = new MandatoryRule(partHtmlCopy);
                    result = mandatoryRule.buildPart();
                    resultScript.arrayMandatory.push(mandatoryRule);
                } else if (type === "visible") {
                    partHtmlCopy.rule = rule; // Only 'visible' part as rule in parameter object partHtml.
                    let visibleRule = new VisibleRule(partHtmlCopy);
                    result = visibleRule.buildPart();
                    resultScript.arrayVisible.push(visibleRule);
                }

            }

        });

        return result;
    },

    /**
     * 
     * @param {*} partHtml 
     * @returns script part to make pattern match.
     */
    scriptPattern : (partHtml) => {
        let result = "";

        // Pattern substituion and message management for reusable patterns.
        let p = reusablePatternDao.getByName(partHtml.pattern);
        if (p !== undefined) {
            partHtml.pattern = p.pattern; 
            if (p.patMessage !== undefined && partHtml.patMessage === undefined) {
                partHtml.patMessage = p.patMessage;
            }
        }
        
        if (partHtml.pattern !== undefined) {
            let pattern = new MandatoryPattern(partHtml);
            result = pattern.buildPart();
            resultScript.arrayPattern.push(pattern);
        }

        return result;
    },

    scriptRuleValue : (partHtml) => {
        let result = "";

        // Reusable rules.
        /* TODO... */

        if (partHtml.ruleValue !== undefined) {
            let rule = new SetValueRule(partHtml);
            result = rule.buildPart();
            resultScript.arrayRuleValue.push(rule);
        }

        return result;
    },

    scriptInit : (partHtml) => {
        let result = "";
        if (partHtml.init !== undefined) {
            let initElement = new InitElement(partHtml);
            result = initElement.buildPart();
        }
        return result;
    }

};

class GenericScript {
    constructor(partHtml) {
        this.type = partHtml.type;
        this.id = partHtml.id;
        this.label = partHtml.label;
        this.rule = partHtml.rule !== undefined ? partHtml.rule.replace(/\s\s+/g, ' ') : ""; // avoids multiple spaces in rule.
        this.valMessage = partHtml.valMessage;
        this.ruleValue = partHtml.ruleValue;
        this.title = partHtml.title;
        this.pattern = partHtml.pattern;
        this.patMessage = partHtml.patMessage;
        this.init = partHtml.init;
        
    }

    _condition(param){
        param = param.trim();

        const mark = "'mark_";
        /*
        Before split by space (split(" ")), substitutes value 'hard coded' (ex: visible if 02_id == 'hard coded')
        that can contain spaces inside with a placeholder.
        */
        const regex = /\'(.*?)\'/g;
        let foundHardCoded = param.match(regex);
        foundHardCoded = foundHardCoded == null ? [] : foundHardCoded; // avoid null if there aren't hard coded values.
        let rulePlaceholder = param;
        foundHardCoded.forEach((str, i) => {
            rulePlaceholder = rulePlaceholder.replace(str, mark.concat(i).concat("'"));
        });
        
        // array of rule with placeholders.
        let ar = rulePlaceholder.split(" ");
        let arTokenCondition = ar.slice(2,ar.length); // remove firt 2 token: ex: visible if
        let regexStaticData = new RegExp("^(').*\\1$"); // static data: match for character ' at beginning and end of string, ex: 'a_value'
        let arResultPlaceholder = arTokenCondition.map(token => {
            if (!["==", ">=", "<=", ">=", "<=", "!=", ">", "<", "&&", "||", "(", ")", "true", "false"].includes(token) && !token.match(regexStaticData)){

                if (generatedManager.getById(token).type === 'checkbox') {
                    token = "document.getElementById('" + token + "').checked";
                } else {
                    token = "document.getElementById('" + token + "').value";
                }
            }

            return token;
        });
        
        // replaces mark_[n] for real value.
        let arResult = arResultPlaceholder.map(token => {
            if (token.match(mark)){
                token = foundHardCoded[0];
                foundHardCoded.splice(0, 1);
            }
            return token;
        });

        return arResult.join(" ");
    }

    buildCondition() {
        return this._condition(this.rule);
    }

}

class HeadValidation {
    buildPart() {
        let result = `function validation() {
                      let result = [];
                      `;
        return result;
    }
}

class TailValidation {
    buildPart() {
        let result = `return result; 
                      }`;
        return result;
    }
}

class MandatoryRule extends GenericScript {
    constructor(partHtml) {
        super(partHtml);
        if (this.valMessage === undefined) {
            this.setValidationMessage();
        } else {
            this.valMessage = this.valMessage.concat(` (${this.title})`);
        }
    }
    buildPart() {

        let result = `
                       // Fields are evaluated if under a visible title.
                       // Search for title visibility:
                       let title_display_${this.id} = document.getElementById("${this.id}").closest(".div-table").previousElementSibling.style.display;
                       if (title_display_${this.id} != 'none') {
                     `;

        if (this.type === "checkbox") {

            let bc = this.buildCondition();
            if (bc !== ''){
                result += "if ( ".concat(bc).concat(" ){\n");
            }

            result += `let v_${this.id} = document.getElementById("${this.id}").checked;
                      if (v_${this.id} === false){ 
                          document.getElementById('${this.id}').parentElement.style.border = '1px solid red';
                          result.indexOf("${this.valMessage}") === -1 ? result.push("${this.valMessage}") : console.log("'${this.valMessage}' already exists"); 
                        }
                     `;

            if (bc !== '') {
                result += "}";
            }

        } else if (this.type === "radio") {
            result += `let v_${this.id} = document.querySelector('input[name="${this.id}"]:checked');
                      if (v_${this.id} === null){ 
                          document.getElementById('${this.id}').parentElement.style.border = '1px solid red';
                          result.indexOf("${this.valMessage}") === -1 ? result.push("${this.valMessage}") : console.log("'${this.valMessage}' already exists"); 
                        }
                     `;
        } else if (this.type === "text" || this.type === "select" || this.type === "date") {
            
            let bc = this.buildCondition();
            if (bc !== ''){
                result += "if ( ".concat(bc).concat(" ){\n");
            }

            result += `let v_${this.id} = document.getElementById('${this.id}').value;
                      if (v_${this.id} === ''){ 
                          document.getElementById('${this.id}').parentElement.style.border = '1px solid red';
                          result.indexOf("${this.valMessage}") === -1 ? result.push("${this.valMessage}") : console.log("'${this.valMessage}' already exists"); 
                        }
                      `;
            
            if (bc !== '') {
                result += "}";
            }

        }

        result += "}";

        return result;


    }
    setValidationMessage() {
        this.valMessage = `${this.label} è obbligatorio! (${this.title})`;
    }
}

class MandatoryPattern extends GenericScript {
    constructor(partHtml) {
        super(partHtml);
        if (this.patMessage === undefined) {
            this.setUndefinedPatternMessage();
        } else {
            if (Array.isArray(this.patMessage)) {
                this.patMessage = this.patMessage.map( p => p.concat(` (${this.title})`));
            } else {
                this.patMessage = this.patMessage.concat(` (${this.title})`);
            }
        }
    }

    buildPart() {
        let result = `
                       // Fields are evaluated if under a visible title.
                       // Search for title visibility:
                       let title_display_pat_${this.id} = document.getElementById("${this.id}").closest(".div-table").previousElementSibling.style.display;
                       if (title_display_pat_${this.id} != 'none') {
                     `;
        
        if (this.type === "text") {

            let bcp = this.buildConditionPattern();

            result += `let vPat_${this.id} = document.getElementById('${this.id}').value;`;

            if (bcp.type === "regex") {
                
                result += `
                            // Pattern mandatory for ${this.id} Regex hard coded
                            if (vPat_${this.id}.trim() !== '' && vPat_${this.id}.match(${bcp.pattern}) === null){
                                document.getElementById('${this.id}').parentElement.style.border = '1px solid red';
                                result.push("${this.patMessage}");
                            };
                          `;
            } else if (bcp.type === "formula") {

                bcp.formulaSet.forEach( fs => {

                    fs.forEach (fsIn => {

                        let pattern = reusablePatternDao.exists(fsIn.pattern) ? reusablePatternDao.getByName(fsIn.pattern).pattern : fsIn.pattern;

                        let r = `
                                // Pattern mandatory for ${this.id} Regex formula
                                if (vPat_${this.id}.trim() !== ''){
                                    if ( (${fsIn.formula}) && vPat_${this.id}.match(${pattern}) === null ){
                                        document.getElementById('${this.id}').parentElement.style.border = '1px solid red';
                                        result.push("${fsIn.patMessage}");
                                    }
                                }
                                `;
                        
                        result += r;
                    });
                });

            }
        } else {
            let message = `Id: ${this.id}, "pattern": "${this.pattern}" Not supported!`;
            throw new Error(message);
        }

        result += "}";

        return result;

    }

    buildConditionPattern() {

        // type can be 'regex' or 'formula'
        let result = {};
        result.type =  Array.isArray(this.pattern) ? 'formula' : 'regex';
        if (result.type === 'regex'){
            // regex can be "pattern": "6_char" (ReusablePattern), or directly "pattern": "/^[a-zA-Z0-9]{6}$/"
            result.pattern = this.pattern;
        } else if (result.type === 'formula'){
            // Check params
            if (this.pattern.length !== this.patMessage.length){
                throw new Error(`id: ${this.id} => In pattern formulas: size of "pattern" array must be equal to size of "patMessage" array!`);
            }

            // this.pattern is an array of formulas.
            let arrayResult =  this.pattern.map( (patternElem, index) => {
                let fc = patternElem.substring(0,patternElem.indexOf(':'));
                let pt = patternElem.substring(patternElem.indexOf(':') + 1,patternElem.length).trim().slice(1,-1);
                let r = {
                    formula : this._condition(fc),
                    pattern: pt,
                    patMessage: this.patMessage[index]
                }
                return r;
            });
            result.formulaSet = [];
            result.formulaSet.push(arrayResult);
        }

        return result;
    }

    setUndefinedPatternMessage(){
        let idOrLabel = this.label !== "" ? this.label : this.id; 
        this.patMessage = `${idOrLabel} non è editato nel formato corretto (${this.pattern})! (${this.title})`;
    }

}

class SetValueRule extends GenericScript {
    
    constructor(partHtml) {
        super(partHtml);
    }

    buildPart() {

        let result = "";

        let bc = this.buildConditionRuleValue();
        let nodeValue = bc.type === "HARD_CODED" ? `"${bc.valueToSet}"` : `document.getElementById("${bc.valueToSet}").value`;

        // Validation, Check if variable exists.
        if (bc.type === "VARIABLE") generatedManager.getById(bc.valueToSet);
        
        if (this.type === "hint"){
            result = `
                        if (${bc.condition}){
                            // SetValueRule id ${this.id}
                            let node_${this.id} = document.getElementById('${this.id}');
                            node_${this.id}.textContent = ${nodeValue};
                        }
                   `;
        } else if (this.type === "text"){
            result = `
                        if (${bc.condition}){
                            // SetValueRule id ${this.id}
                            let id_${this.id} = document.getElementById('${this.id}');
                            id_${this.id}.value = ${nodeValue};
                        }
                   `;
        }

        return result;

    }

    buildConditionRuleValue() {

        // Example: "ruleValue": "set if ba_text00 == 'write' : 'Value to write'"
        let fc = this.ruleValue.substring(0,this.ruleValue.indexOf(':'));
        let val = this.ruleValue.substring(this.ruleValue.indexOf(':') + 1,this.ruleValue.length).trim();
        // HARD_CODE: string contained by char '
        // VARIABLE: Must be an id of field (text)
        let type = val.indexOf("'") === 0 && val.slice(-1) == "'" ? "HARD_CODED" : "VARIABLE";
        let valueToSet = type === "HARD_CODED" ? val.slice(1, -1) : val;
        return {
            condition: this._condition(fc),
            valueToSet: valueToSet,
            type: type
        }

    }

} 


class DocReady {
    buildPart() {
        return `
                let config = {
                    css_default_border_col: ''
                };
                (function () {
                    console.log("Doc ready!");
                    
                    let elem = document.querySelector('.div-table-col');
                    let style = getComputedStyle(elem);
                    config.css_default_border_col = style.border;

                    initialize();
                    initializeData();
                    visibility();
                    let form = document.querySelector('form');
                    form.addEventListener('change', function() {
                        visibility();
                    });
                })();
                `
    }
}

class HeadVisibility {
    buildPart() {
        return `function visibility() {
                `
    }
}

class TailVisibility {
    buildPart() {
        return `}`;
    }
}

class VisibilityParent {
    buildPart() {
        return `
                function visibilityParent(element) {
                    let col = element.parentNode;
                    let children = col.childNodes;
            
                    let displayCol = false;
                    for (let i = 0; i < children.length; i++) {
                        if ( children[i].style !== undefined && children[i].style.display !== 'none'){
                            displayCol = true;
                            break;
                        }
                    }
                    col.style.display = displayCol ? "inline" : "none";
                }
               `;
    }
}

class VisibleRule extends GenericScript {

    constructor(partHtml) {
        super(partHtml);
    }

    buildPart() {

        let result = "";

        let bc = this.buildCondition();
        if (bc !== '') {
            result = "if ( ".concat(bc).concat(" ){");
        }
         
       if (this.type === 'container') {
            result += `
                      let node = document.getElementById('${this.id}');
                      if (node.previousElementSibling.style.display === 'none') {
                        node.style.display = "block";
                        node.previousElementSibling.style = "display: block; width: 100%;";
                      }
                      `;
        }
        else if (this.type === 'radio') {
            result += `
                      let node = document.getElementsByName('${this.id}');
                      node.forEach( n => {
                          n.style.display = "inline";
                          n.nextElementSibling.style.display = "inline";
                        if(node[node.length-1] === n){
                            visibilityParent(n);
                        }
                      });
                      `;
        } else {
            result += `
                      let node = document.getElementById('${this.id}');
                      node.style.display = "inline";
                      if (node.previousElementSibling !== null) {
                        node.previousElementSibling.style.display = "inline";
                      } 
                      if (node.nextElementSibling !== null) {
                        node.nextElementSibling.style.display = "inline";
                      }
                      visibilityParent(node);
                      `;
        }

        

        if (bc !== '') {
            
            if (this.type === 'container') {
                result += `
                        } else { 
                            let node = document.getElementById('${this.id}');
                            node.style.display = "none";
                            node.previousElementSibling.style = "display: none";
                        }
                      `;
            }
            else if (this.type === 'radio') {
                result += `} else {
                          let node = document.getElementsByName('${this.id}');
                          node.forEach( n => {
                            n.checked = false;
                            n.style.display = "none";
                            n.nextElementSibling.style.display = "none";
                            if(node[node.length-1] === n){
                                visibilityParent(n);
                            }
                          });
                        }`;
            } else {

                result += `} else {
                           let node = document.getElementById('${this.id}');
                           if (node.type === 'checkbox'){
                               node.checked = false
                           } else {
                              node.value = '';
                           }
                           
                           node.style.display = "none";
                           if (node.previousElementSibling !== null) {
                             node.previousElementSibling.style.display = "none";
                           } 
                           if (node.nextElementSibling !== null) {
                             node.nextElementSibling.style.display = "none";
                           }
                           visibilityParent(node);
                           }`;

            }

        }

        return result;
    }


}

class HeadInit {
    buildPart() {
        return `function initialize() {
                    // Reset all border cols to default color
                    let elCol = document.getElementsByClassName('div-table-col');
                    for (var i = 0; i < elCol.length; i++) {
                        elCol[i].style.border = config.css_default_border_col;
                    }
                `
    }
}

class TailInit {
    buildPart() {
        return `}`;
    }
}

class InitElement extends GenericScript {
    constructor(partHtml) {
        super(partHtml);
    }

    buildPart() {
        let result = ``;

        if (this.type === 'date' && this.init === 'today') {
            result = `
                    if (document.getElementById("${this.id}").value === ''){
                        // Useful when read doc after saving: Initialize date only if it is empty.
                        let dt_${this.id} = new Date();
                        let d_${this.id} = dt_${this.id}.getDate() < 10 ? "0" + dt_${this.id}.getDate() : dt_${this.id}.getDate();
                        let m1_${this.id} =  dt_${this.id}.getMonth() + 1;
                        let m_${this.id} = m1_${this.id} < 10 ? "0" + m1_${this.id} : m1_${this.id};
                        let dateInit_${this.id} = dt_${this.id}.getFullYear() + "-" + m_${this.id} + "-" + d_${this.id};
                        //console.log(dateInit_${this.id});
                        document.getElementById("${this.id}").value = dateInit_${this.id};
                    }
                    `;
        } else {
            let message = `Id: ${this.id}, "init": "${this.init}" Not supported!`;
            throw new Error(message);
        }

        return result;
    }
}


module.exports = {
    MandatoryRule,
    HeadValidation,
    TailValidation,
    VisibleRule,
    DocReady,
    HeadVisibility,
    TailVisibility,
    VisibilityParent,
    HeadInit,
    TailInit,
    resultScript
}