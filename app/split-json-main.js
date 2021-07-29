const resource = require('../lib/resource');
const {splitJsonFileByRootKes} = require('../lib/split-json');

let dt = resource.DataSource.FILESYSTEM;
splitJsonFileByRootKes(resource.getJson(dt),resource.getPathFolderJsonSplit());