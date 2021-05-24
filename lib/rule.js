
const reusableRuleManager = {

    /**
     * Array of reusableRule
     * ex :{"rule": "mandatory#visible if a == '10'", "name": "rule_tipo_accesso"}
     */
    arrayReusable: [],

    add: (ruleObj) => {
        reusableRuleManager.arrayReusable.push(...ruleObj);
    },

    get: () => {
        return reusableRuleManager.arrayReusable;
    },

    getByName: (ruleName) => {
        let result = reusableRuleManager.get().filter(ruleObj => {
            return ruleObj.name == ruleName;
        });
        return result[0];
    },

    // initialize: (jsonObj) => {

    //     let keyNames = Object.keys(jsonObj);
    //     keyNames.forEach(idTable => {

    //         let keyTables = Object.keys(jsonObj[idTable]);
    //         keyTables.forEach(key => {

    //             let rowKeys = Object.values(jsonObj[idTable][key]);
    //             rowKeys.forEach(rowEl => {
    //                 // console.log(rowEl.reusableRule);
    //                 if (rowEl.reusableRule !== undefined) {
    //                     // console.log(rowEl);
    //                     reusableRuleManager.add(rowEl);
    //                 }
    //             });

    //         });

    //     });

    // }

};

module.exports = {
    reusableRuleManager: reusableRuleManager
}