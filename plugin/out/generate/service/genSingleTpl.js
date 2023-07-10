"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genSingleTpl = void 0;
const path = require('path');
const fs = require('fs');
const parseFile_1 = require("./parseFile");
const fsUtils_1 = require("../../utils/fsUtils");
const genSingleTpl = (context, panel, uri, datas) => {
    let { saveDatas: { tplName, tplContent, tplDataDemo } } = datas;
    if (typeof tplDataDemo === 'string') {
        tplDataDemo = JSON.parse(tplDataDemo);
    }
    const tarDir = (0, fsUtils_1.getCurntCatalog)(uri);
    const fileName = tplName.slice(0, tplName.lastIndexOf('.'));
    const parseRes = (0, parseFile_1.default)(tplContent, { ...tplDataDemo, fileName });
    if (parseRes.success) {
        if (fs.existsSync(path.join(tarDir, tplName))) {
            return {
                success: false,
                message: `${tplName} 文件已存在`,
            };
        }
        else {
            try {
                fs.writeFileSync(path.join(tarDir, tplName), parseRes.fileContent);
            }
            catch (err) {
                console.log(err);
            }
            return {
                success: true,
                message: `${tplName} 文件生成成功`,
            };
        }
    }
    else {
        return {
            success: false,
            message: parseRes.message || `${tplName} 文件生成失败`,
        };
    }
};
exports.genSingleTpl = genSingleTpl;
//# sourceMappingURL=genSingleTpl.js.map