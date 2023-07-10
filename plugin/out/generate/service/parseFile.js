"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const template = require('art-template');
exports.default = (content, datas) => {
    let res = {};
    let contentStr = '';
    try {
        contentStr = template.render(content, typeof datas === 'string' ? JSON.parse(datas) : datas);
        res = {
            success: true,
            fileContent: contentStr,
            message: '生成成功'
        };
    }
    catch (error) {
        res = {
            success: false,
            fileContent: contentStr,
            message: `error -- ${error}`
        };
    }
    return res;
};
//# sourceMappingURL=parseFile.js.map