
const reusableDaoInit = {
    clean: () => {
        reusableRuleDao.arrayReusable = [];
        reusablePatternDao.arrayReusable = [];
    }
};

const reusableRuleDao = {

    /**
     * Array of reusableRule
     * ex :{"rule": "mandatory#visible if a == '10'", "name": "rule_tipo_accesso"}
     */
    arrayReusable: [],

    add: (ruleObj) => {
        
        reusableRuleDao.arrayReusable.push(...ruleObj);

        // Checks for duplicates.
        let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)
        let onlyNames = reusableRuleDao.arrayReusable.map( r => {
            return r.name;
        });
        if (findDuplicates(onlyNames).length !== 0){
            throw new Error(`Rule "${findDuplicates(onlyNames)}" are duplicated! reusableRule.name must be unique!`);
        }

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

        // Checks for duplicates.
        let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)
        let onlyNames = reusablePatternDao.arrayReusable.map( r => {
            return r.name;
        });
        if (findDuplicates(onlyNames).length !== 0){
            throw new Error(`Pattern "${findDuplicates(onlyNames)}" are duplicated! reusablePattern.name must be unique!`);
        }

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
    reusableDaoInit,
    reusableRuleDao,
    reusablePatternDao
}