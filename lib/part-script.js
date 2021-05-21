"use strict";

const {
    generatedManager
} = require('./part-html');

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
    


};

class GenericScript {
    constructor(partHtml) {
        this.type = partHtml.type;
        this.id = partHtml.id;
        this.label = partHtml.label;
        this.rule = partHtml.rule.replace(/\s\s+/g, ' ');// avoids multiple spaces in rule.
        this.valMessage = partHtml.valMessage;
    }

    buildCondition() {

        const mark = "'mark_";

        /*
        Before split by space (split(" ")), substitutes value 'hard coded' (ex: visible if 02_id == 'hard coded')
        that can contain spaces inside with a placeholder.
        */
        const regex = /\'(.*?)\'/g;
        let foundHardCoded = this.rule.match(regex);
        foundHardCoded = foundHardCoded == null ? [] : foundHardCoded; // avoid null if there aren't hard coded values.
        let rulePlaceholder = this.rule;
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

        return arResult.join(" ");;

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

        if (this.type === "checkbox") {
            result = `let v_${this.id} = document.getElementById("${this.id}").checked;
                      if (v_${this.id} === false){ result.push("${this.valMessage}"); }
                     `;
        } else if (this.type === "radio") {
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

        // Todo da provare la parte radio, aggiungere la parte none di radio
        if (this.type === 'radio') {
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
                      if (node.previousElementSibling !== null){
                        node.previousElementSibling.style.display = "inline";
                      } else {
                        node.nextElementSibling.style.display = "inline";
                      }
                      visibilityParent(node);
                      `;
        }

        

        if (bc !== '') {

            if (this.type === 'radio') {
                result += `} else {
                          let node = document.getElementsByName('${this.id}');
                          node.forEach( n => {
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
                           node.style.display = "none";
                           if (node.previousElementSibling !== null){
                            node.previousElementSibling.style.display = "none";
                          } else {
                            node.nextElementSibling.style.display = "none";
                          }
                           visibilityParent(node);
                       }`;

            }

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
    resultScript
}