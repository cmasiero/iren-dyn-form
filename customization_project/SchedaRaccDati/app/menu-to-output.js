/**
 *  move file menu.html to global output /output
 * */
//  console.log(__dirname)
//  console.log(process.cwd())

const path = require('path');
const fs = require('fs');
const resource = require(process.cwd() + '/lib/resource');

// logging purpose
let log_filename_tag = `[${path.basename(__filename)}]`;

try {
    let dt = resource.DataSource.FILESYSTEM;
    let outputPath = resource.getOutputPath(dt);
    fs.writeFileSync(outputPath + '/menu.html', fs.readFileSync("customization_project/SchedaRaccDati/config/menu.html"));
    console.log(log_filename_tag + " menu.html in " + outputPath);
} catch (e) {
    console.error(e);
}
