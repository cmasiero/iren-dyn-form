
const reusableRuleDao = {

    /**
     * Array of reusableRule
     * ex :{"rule": "mandatory#visible if a == '10'", "name": "rule_tipo_accesso"}
     */
    arrayReusable: [],

    add: (ruleObj) => {
        reusableRuleDao.arrayReusable.push(...ruleObj);
    },

    getAll: () => {
        return reusableRuleDao.arrayReusable;
    },

    getByName: (ruleName) => {
        let result = reusableRuleDao.getAll().filter(ruleObj => {
            return ruleObj.name == ruleName;
        });
        return result[0];
    },

};

const reusablePatternDao = {

    /**
     * Array of reusablePattern
     * ex :{
     *          "name": "1_to_3_digit",
     *          "pattern": "/^[0-9]{1,3}$/",
     *          "patMessage": "messaggio (comune)"
     *      }
     */
    arrayReusable: [],

    add: (patternObj) => {
        reusablePatternDao.arrayReusable.push(...patternObj);
    },

    getAll: () => {
        return reusablePatternDao.arrayReusable;
    },

    getByName: (patternName) => {
        let result = reusablePatternDao.getAll().filter(patternObj => {
            return patternObj.name == patternName;
        });
        return result[0];
    },

};

module.exports = {
    reusableRuleDao,
    reusablePatternDao
}