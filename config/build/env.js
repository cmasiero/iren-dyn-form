const fs = require('fs');
const path = require('path');
// logging purpose
let log_filename_tag = `[${path.basename(__filename)}]`;

const initializeEnv = (defaultEnv) => {

    let bc;
    if (defaultEnv !== undefined){
        // parametrized change environment in config file.
        bc = JSON.parse(fs.readFileSync('config/build/build-config.json', 'utf8'));
        bc.environment = defaultEnv;
        fs.writeFileSync('config/build/build-config.json',JSON.stringify(bc, null, 2));
        console.log(`${log_filename_tag} ENV: ${defaultEnv} PARAMETRIZED!`);
    } else {
        bc = JSON.parse(fs.readFileSync('config/build/build-config.json', 'utf8'));
        console.log(`${log_filename_tag} ENV: ${bc.environment} FROM build-config.json!`);
    }

    return defaultEnv === undefined ? bc[bc.environment] : bc[defaultEnv];
    
}

module.exports = {
    initializeEnv
}


