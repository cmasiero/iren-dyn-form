const resource = require('../lib/resource');
const {splitJsonFileByRootKes} = require('../lib/json.split');

let dt = resource.DataSource.FILESYSTEM;
splitJsonFileByRootKes(resource.getJson(dt),resource.getPathFolderJsonSplit());