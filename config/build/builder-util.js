var combinations = function (a, min) {
    var fn = function (n, src, got, all) {
        if (n == 0) {
            if (got.length > 0) {
                all[all.length] = got;
            }
            return;
        }
        for (var j = 0; j < src.length; j++) {
            fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
        }
        return;
    }
    var all = [];
    for (var i = min; i < a.length; i++) {
        fn(i, a, [], all);
    }
    all.push(a);
    return all;
}

/**
 * This is an example of item configuration in configurations array.
 * 
 * {
 *   outname: 'co_dg_tr.html',
 *   files: [
 *     'config.json',
 *     'dati_generali.json',
 *     'trasformatori_mt_bt.json',
 *     'trasformatori_mt_bt_01.json',
 *     'trasformatori_mt_bt_02.json',
 *     'trasformatori_mt_bt_03.json'
 *   ]
 * }
 * @returns configuration
 */
 let buildConfiguration = (firstElDefault,elToCombine) => {
    // Make combinations, input are just tags, then concat firstElDefault!
    let tagToCombine = elToCombine.tags.map((el) => el.tag);
    let arrCombination = combinations(tagToCombine, 1).map((e) => [firstElDefault.tag].concat(e));

    // Create final configuration.
    let resultConf = arrCombination.map((ac) => {
        return {
            outname: ac.join("_").concat(".html"),
            files: function () {
                let result = [];

                ac.forEach((e) => {
                    if (e === firstElDefault.tag) {
                        result = result.concat(firstElDefault.file);
                    } else {
                        let r = elToCombine.tags.find(el => el.tag == e);
                        result = result.concat(r.file);
                    }
                });

                return result;
            }()

        };
    });

    return resultConf;

};

module.exports = {
    buildConfiguration
}
