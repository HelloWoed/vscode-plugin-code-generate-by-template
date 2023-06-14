const path = require('path');
const fs = require('fs');

export const getCurntCatalog = (uri: any) => {
    const uriPath = uri.path.slice(1);
    return fs.statSync(uriPath).isDirectory() ? uriPath : path.dirname(uriPath);
};