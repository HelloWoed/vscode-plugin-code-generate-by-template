"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genModuleTpl = void 0;
const path = require('path');
const fs = require('fs');
const parseFile_1 = require("./parseFile");
const fsUtils_1 = require("../../utils/fsUtils");
const genModuleTpl = (context, panel, uri, datas) => {
    let { saveDatas: { moduleTreeData, tplDataDemo } } = datas;
    if (typeof moduleTreeData === 'string') {
        moduleTreeData = JSON.parse(moduleTreeData);
    }
    if (typeof tplDataDemo === 'string') {
        tplDataDemo = JSON.parse(tplDataDemo);
    }
    const tarDir = (0, fsUtils_1.getCurntCatalog)(uri);
    const genFun = (pathStr, moduleData) => {
        moduleData.forEach((item) => {
            if (item.type === 'folder') {
                if (!fs.existsSync(path.join(pathStr, item.title))) {
                    fs.mkdirSync(path.join(pathStr, item.title));
                }
                else {
                    throw Error(`${item.title} 模块已存在`);
                }
                if (item.children) {
                    genFun(path.join(pathStr, item.title), item.children);
                }
            }
            else if (item.type === 'file') {
                const fileName = item.title.slice(0, item.title.lastIndexOf('.'));
                const contentRes = (0, parseFile_1.default)(item.tplContent, { ...tplDataDemo[fileName], fileName });
                if (contentRes.success) {
                    fs.writeFileSync(path.join(pathStr, item.title), contentRes.fileContent);
                }
            }
        });
    };
    const res = {};
    try {
        genFun(tarDir, moduleTreeData);
        res.success = true;
        res.message = '创建成功';
    }
    catch (error) {
        res.success = false;
        res.message = `创建失败--${error}`;
    }
    return res;
};
exports.genModuleTpl = genModuleTpl;
//# sourceMappingURL=genModuleTpl.js.map