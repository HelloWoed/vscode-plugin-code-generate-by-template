const path = require('path');
const fs = require('fs');
import parseFile from './parseFile';
import { getCurntCatalog } from '../../utils/fsUtils';

export const genModuleTpl = (context: any, panel: any, uri: any, datas: any) => {
    let { saveDatas: { moduleTreeData, tplDataDemo }} = datas;
    if(typeof moduleTreeData === 'string'){
        moduleTreeData = JSON.parse(moduleTreeData);
    }
    if(typeof tplDataDemo === 'string'){
        tplDataDemo = JSON.parse(tplDataDemo);
    }
    const tarDir = getCurntCatalog(uri);
    const genFun = (pathStr: string, moduleData: any) => {
        moduleData.forEach((item: any) => {
            if(item.type === 'folder'){
                if(!fs.existsSync(path.join(pathStr, item.title))){
                    fs.mkdirSync(path.join(pathStr, item.title));
                }else {
                    throw Error(`${item.title} 模块已存在`);
                }
                if(item.children){
                    genFun(path.join(pathStr, item.title), item.children);
                }
            }else if(item.type === 'file'){
                const fileName = item.title.slice(0, item.title.lastIndexOf('.'));
                const contentRes = parseFile(item.tplContent, {...tplDataDemo[fileName], fileName});
                if(contentRes.success){
                    fs.writeFileSync(path.join(pathStr, item.title), contentRes.fileContent);
                }
            }
        });
    };
    const res = {} as any;
    try {
        genFun(tarDir, moduleTreeData);
        res.success = true;
        res.message = '创建成功';
    } catch (error) {
        res.success = false;
        res.message = `创建失败--${error}`;
    }
    return res;
};