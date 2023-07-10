"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurntCatalog = void 0;
const path = require('path');
const fs = require('fs');
const getCurntCatalog = (uri) => {
    const uriPath = uri.path.slice(1);
    return fs.statSync(uriPath).isDirectory() ? uriPath : path.dirname(uriPath);
};
exports.getCurntCatalog = getCurntCatalog;
//# sourceMappingURL=fsUtils.js.map