"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTplDatasFn = void 0;
const path = require('path');
const fs = require('fs');
const fsUtils_1 = require("../../utils/fsUtils");
const cosnt_1 = require("./cosnt");
const buildTreeKey = () => {
    return Date.now() + '' + Math.round(Math.random() * 100000);
};
const readModuleFiles = (strPath, childItem) => {
    const moduleRes = {};
    const readFn = (pathStr, childItem, resData) => {
        resData.title = childItem;
        resData.key = buildTreeKey();
        resData.type = 'folder';
        const filePath = path.join(pathStr, childItem);
        const fileArr = fs.readdirSync(filePath);
        fileArr.length && (resData.children = []);
        fileArr.forEach((item) => {
            var stat = fs.lstatSync(path.join(filePath, item));
            if (stat.isFile()) {
                if (![cosnt_1.infoFileName, cosnt_1.demoDataFileName, cosnt_1.moduleTreeDataFileName].includes(item)) {
                    resData.children.push({
                        title: item,
                        type: 'file',
                        tplContent: fs.readFileSync(path.join(filePath, item), 'utf-8'),
                        key: buildTreeKey()
                    });
                }
            }
            if (stat.isDirectory()) {
                const dirItem = {};
                readFn(filePath, item, dirItem);
                resData.children.push(dirItem);
            }
        });
    };
    readFn(strPath, childItem, moduleRes);
    return [moduleRes];
};
const getTplDatasFn = (context, panel, uri) => {
    const tarFolder = path.join(context.extensionPath, cosnt_1.CACHE_PATH);
    console.log(tarFolder);
    const folderContent = fs.readdirSync(tarFolder);
    const res = {
        'curnt_work_catalog_path': (0, fsUtils_1.getCurntCatalog)(uri)
    };
    folderContent.map((fileType) => {
        const fileTypePath = path.join(tarFolder, fileType);
        const fileTypeChilds = fs.readdirSync(fileTypePath);
        res[fileType] = fileTypeChilds.map((childItem) => {
            const resItem = {
                name: childItem,
                type: fileType,
                path: path.join(fileTypePath, childItem),
                info: fs.readFileSync(path.join(fileTypePath, `${childItem}/${cosnt_1.infoFileName}`), 'utf-8'),
                demoData: fs.readFileSync(path.join(fileTypePath, `${childItem}/${cosnt_1.demoDataFileName}`), 'utf-8'),
            };
            if (fileType === 'singleFile') {
                resItem.tplContent = fs.readFileSync(path.join(fileTypePath, `${childItem}/${childItem}`), 'utf-8');
            }
            if (fileType === 'modules') {
                resItem.moduleTreeData_cache = fs.readFileSync(path.join(fileTypePath, `${childItem}/${cosnt_1.moduleTreeDataFileName}`), 'utf-8');
                resItem.moduleTreeData = readModuleFiles(fileTypePath, childItem);
            }
            return resItem;
        });
    });
    return res;
};
exports.getTplDatasFn = getTplDatasFn;
//# sourceMappingURL=getTplDatas.js.map