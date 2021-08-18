const fs = require('fs');
const path = require('path');

// logging purpose
let log_filename_tag = `[${path.basename(__filename)}]`;

// read file conf
let bc = JSON.parse(fs.readFileSync('app/build-config.json', 'utf8'));
console.log(log_filename_tag + " env: " + bc.environment);

exports.env = bc.environment;
