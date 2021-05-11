"use strict";

const validation = {
    arrayValidated : [],
    /**
     * 
     * @returns Array of classes that need to be validated.
     */
    getValidated : () => {
        return validation.arrayValidated;
    },
    /**
     * 
     * @param {*} partHtml 
     * @returns script part to make validation.
     */
    validationScript : (partHtml) => {
        let result = "";
        
        let arrayValidation = partHtml.validation.split("|");
        arrayValidation.forEach(validation => {
            if (validation.split(" ")[0] === "mandatory") {
                let mandatoryValidation = new MandatoryValidation(partHtml);
                result = mandatoryValidation.buildPart();
            } else if (validation === "visible"){
    
            }  
        });

        return result;
    }

};

class GenericValidation {
    constructor(partHtml) {
        this.type = partHtml.type;
        this.id = partHtml.id;
        this.label = partHtml.label;
        this.validation = partHtml.validation.replace(/\s\s+/g, ' ');// avoid multiple spaces in rule.
        this.valMessage = partHtml.valMessage;

        if (this.valMessage === undefined) {
            this.validationMessage();
        }
        if (this.validation !== undefined) {
            validation.arrayValidated.push(this);
        }
    }

    /**
     * Trick to simulate abstract method.
     */
    validationMessage() {
        throw new Error('You have to implement the method validationMessage!');
    }

    buildCondition() {
        let ar = this.validation.split(" ");
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

class MandatoryValidation extends GenericValidation {
    constructor(partHtml) {
        super(partHtml);
        if (this.valMessage === undefined) {
            this.valMessage = `Il campo ${this.label} è obbligatorio!`;
        }
    }
    buildPart() {

        let result = "";

        if (this.type === "radio") {
            result = `let v_${this.id} = document.querySelector('input[name="${this.id}"]:checked');
                      if (v_${this.id} === null){ result.push("${this.valMessage}"); }
                     `;
        } else if (this.type === "text") {
            
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
    validationMessage() {
        this.validationMessage = `Il campo ${this.label} è obbligatorio!`;
    }
}


module.exports = {
    MandatoryValidation,
    HeadValidation,
    TailValidation,
    validation
}