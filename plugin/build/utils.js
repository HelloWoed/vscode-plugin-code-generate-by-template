var fs  = require('fs');
var path = require('path');
var copyFile = function(srcPath, tarPath, cb) {
    var rs = fs.createReadStream(srcPath);
    rs.on('error', function(err) {
        if (err) {
            console.log('read error', srcPath);
        }
        cb && cb(err);
    });
   
    var ws = fs.createWriteStream(tarPath);
    ws.on('error', function(err) {
        if (err) {
            console.log('write error', tarPath);
        }
        cb && cb(err);
    });
    ws.on('close', function(ex) {
        cb && cb(ex);
    });
   
    rs.pipe(ws);
};
var copyFolder = function(srcDir, tarDir, cb) {
    fs.readdir(srcDir, function(err, files) {
        var count = 0;
        var checkEnd = function() {
            ++count === files.length && cb && cb();
        };
    
        if (err) {
            checkEnd();
            return;
        }
    
        files.forEach(function(file) {
            var srcPath = path.join(srcDir, file);
            var tarPath = path.join(tarDir, file);
    
            fs.stat(srcPath, function(err, stats) {
                if (stats.isDirectory()) {
                    fs.mkdir(tarPath, function(err) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        copyFolder(srcPath, tarPath, checkEnd);
                    });
                } else {
                    copyFile(srcPath, tarPath, checkEnd);
                }
            });
        });
    
        //为空时直接回调
        files.length === 0 && cb && cb();
    });
};
const deleteFolder = (url) => {
    let msg = '';
    const deleteDir = (url) => {
        var files = [];       
        if( fs.existsSync(url) ) {  //判断给定的路径是否存在
               
            files = fs.readdirSync(url);   //返回文件和子目录的数组
            files.forEach((file) => {
                var curPath = path.join(url,file);
                    
                if(fs.statSync(curPath).isDirectory()) { //同步读取文件夹文件，如果是文件夹，则函数回调
                    deleteDir(curPath);
                } else {    
                    fs.unlinkSync(curPath);    //是指定文件，则删除
                }
                    
            });
               
            fs.rmdirSync(url); //清除文件夹
            
        }else{
            msg = '指定路径不存在';
        }
    
    };
    deleteDir(url);
    return {
        success: msg ? false : true,
        message: msg || '删除完成'
    };
};
module.exports = {copyFile, copyFolder, deleteFolder};