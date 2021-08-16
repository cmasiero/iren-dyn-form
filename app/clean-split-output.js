const fs = require('fs');
const path = require('path');

/**
 * Directories to clean out.
 */
const directories = [
    './config/json_split',
    './output'
]

directories.forEach( directory => {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
                else console.log(path.join(directory, file).concat(' REMOVED!'));
            });
        }
      });
});
