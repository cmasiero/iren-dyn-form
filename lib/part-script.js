"use strict";

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
    /**
     * 
     * @param {*} partHtml 
     * @param {*} type can be "mandatory" or "visible" etc.
     * @returns script part to make visibility, mandatory etc.
     */
    scriptRule : (partHtml, type) => {
        let result = "";
        
        let arrayRule = partHtml.rule.split("|");
        arrayRule.forEach(rule => {
            if (rule.split(" ")[0] === type) {

                if (type === "mandatory") {
                    let mandatoryRule = new MandatoryRule(partHtml);
                    result = mandatoryRule.buildPart();
                    resultScript.arrayMandatory.push(mandatoryRule);
                } else if (type === "visible") {
                    let visibleRule = new VisibleRule(partHtml);
                    result = visibleRule.buildPart();
                    resultScript.arrayVisible.push(visibleRule);
                }

            }
        });

        return result;
    },
    


};

class GenericScript {
    constructor(partHtml) {
        this.type = partHtml.type;
        this.id = partHtml.id;
        this.label = partHtml.label;
        this.rule = partHtml.rule.replace(/\s\s+/g, ' ');// avoid multiple spaces in rule.
        this.valMessage = partHtml.valMessage;
    }

    buildCondition() {
        let ar = this.rule.split(" ");
        let condition = ar.slice(2,ar.length);
        // let regexDigit = new RegExp('^[0-9\.]+$');
        let regexStaticData = new RegExp("^(').*\\1$"); // static data: match for character ' at beginning and end of string, ex: 'a_value'
        
        let result = condition.map(token => {
            if (!["==", ">=", "<=", ">=", "<=", "!=", ">", "<", "&&", "||", "(", ")"].includes(token) && !token.match(regexStaticData)){
                token = "document.getElementById('" + token + "').value";
            }
            return token;
        });

        return result.join(" ");
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
        }
    }
    buildPart() {

        let result = "";

        if (this.type === "radio") {
            result = `let v_${this.id} = document.querySelector('input[name="${this.id}"]:checked');
                      if (v_${this.id} === null){ result.push("${this.valMessage}"); }
                     `;
        } else if (this.type === "text" || this.type === "select") {
            
            let bc = this.buildCondition();
            if (bc !== ''){
                result = "if ( ".concat(bc).concat(" ){\n");
            }

            result += `let v_${this.id} = document.getElementById('${this.id}').value;
                      if (v_${this.id} === ''){ result.push("${this.valMessage}"); }
                      `;
            
            if (bc !== '') {
                result += "}";
            }

        }
        return result;
    }
    setValidationMessage() {
        this.valMessage = `Il campo ${this.label} è obbligatorio!`;
    }
}

class DocReady {
    buildPart() {
        return `(function () {
                    console.log("doc ready");
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
                    console.log("[visibility]");
                `
    }
}

class TailVisibility {
    buildPart() {
        return `}`
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
            result = "if ( ".concat(bc).concat(" ){\n");
        }

        result += `
                   document.getElementById('${this.id}').style.display = "inline";
                   document.getElementById('${this.id}').previousElementSibling.style.display = "inline";
                   `;

        if (bc !== '') {
            result += `} else {
                           document.getElementById('${this.id}').style.display = "none";
                           document.getElementById('${this.id}').previousElementSibling.style.display = "none";
                       }`;
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
    resultScript
}