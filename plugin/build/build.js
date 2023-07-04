// #!/usr/bin/env node
var fs  = require('fs');
var path = require('path');
var { copyFolder, deleteFolder } = require('./utils');

var outDir = '../out';
var outDirPath = path.join(__dirname, outDir);
if(!fs.existsSync(outDirPath)){
    fs.mkdirSync(outDirPath);
}
var sourceDir = '../src/cache';
var tarDir = '../out/cache';

const sourcePathStr = path.join(__dirname, sourceDir);
const tarPathStr = path.join(__dirname, tarDir);

if(fs.existsSync(tarPathStr)){
    deleteFolder(tarPathStr);
}
fs.mkdirSync(tarPathStr);
copyFolder(sourcePathStr, tarPathStr, function(err) {
    if (err) {
        console.error(err);
        return;
    }
});