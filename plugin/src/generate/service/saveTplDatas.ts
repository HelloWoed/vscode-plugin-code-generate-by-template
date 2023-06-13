const path = require('path');
const fs = require('fs');
import { CACHE_PATH, infoFileName, demoDataFileName, moduleTreeDataFileName } from './cosnt';

interface TplDatas{
    tplName: string;
    tplDes: string;
    tplType: 'singleFile' | 'modules';
    tplContent: string;
    tplDataDemo: string;
    [k: string]: any;
}
declare type SaveType = 'edit' | 'create';
const saveSingleFileTpl = (saveDatas: TplDatas, tarTplFolder: string, saveType: SaveType) => {
    return new Promise((resolve) => {
        const {tplName, tplDes, tplContent, tplDataDemo } = saveDatas;
        const info = {
            tplName,
            tplDes,
            updateDate: new Date().getTime()
        };
        fs.writeFileSync(path.join(tarTplFolder, tplName), tplContent);
        fs.writeFileSync(path.join(tarTplFolder, infoFileName), JSON.stringify(info, null, 4));
        fs.writeFileSync(path.join(tarTplFolder, demoDataFileName), JSON.stringify(JSON.parse(tplDataDemo), null, 4));
        resolve({
            success: true,
            message: `${tplName} 文件${saveType === 'create' ? '创建' : '修改'}成功。`
        });
    });
};
const createModuleFiles = (saveDatas: any[], tarTplFolder: string, saveType: SaveType) => {
    return new Promise((resulve) => {
        const createFn = (treeData: any[], curntDir: string) => {
            treeData.forEach(item => {
                if(item.type === 'folder'){
                    if(!fs.existsSync(path.join(curntDir, item.title))){
                        fs.mkdirSync(path.join(curntDir, item.title));
                    }else {
                        if(saveType === 'create'){
                            resulve({
                                success: false,
                                message: `${item.title} 模块已存在！`
                            });
                            throw new Error(`${item.title} 模块已存在！`);
                        }
                    }
                }else if(item.type === 'file'){
                    fs.writeFileSync(path.join(curntDir, item.title), item.tplContent);
                }
                if(item.children){
                    createFn(item.children, path.join(curntDir, item.title));
                }
            });
        };
        try {
            createFn(saveDatas, tarTplFolder);
            resulve({
                success: true,
            });
        } catch (error) {
            
        }
        
    });
};
const saveModulesTpl = (saveDatas: TplDatas, tarTplFolder: string, saveType: SaveType) => {
    return new Promise((resolve) => {
        const {tplName, tplDes, moduleTreeData, tplDataDemo } = saveDatas;
        const info = {
            tplName,
            tplDes,
            updateDate: new Date().getTime()
        };
        createModuleFiles(moduleTreeData, tarTplFolder, saveType).then((res: any) => {
            if(res.success){
                tarTplFolder = path.join(tarTplFolder, tplName);
                fs.writeFileSync(path.join(tarTplFolder, infoFileName), JSON.stringify(info, null, 4));
                fs.writeFileSync(path.join(tarTplFolder, moduleTreeDataFileName), JSON.stringify(moduleTreeData, null, 4));
                fs.writeFileSync(path.join(tarTplFolder, demoDataFileName), JSON.stringify(JSON.parse(tplDataDemo), null, 4));
                resolve({
                    success: true,
                    message: `${tplName} 模块文件${saveType === 'create' ? '创建' : '修改'}成功。`
                });
            }else {
                resolve({
                    ...res
                });
            }
        });
    });
};
export const saveTplDatasFn = (context: any, panel: any, uri: any, datas: { saveType: SaveType, saveDatas: TplDatas }) => {
    return new Promise(async (resolve) => {
        const {saveType, saveDatas} = datas;
        const { tplType, tplName } = saveDatas;
        const tarFolder =  path.join(context.extensionPath, CACHE_PATH);
        let res;
        if(tplType === 'singleFile'){
            const tarTplFolder = path.join(tarFolder, `${tplType}/${tplName}`);
            if(!fs.existsSync(path.join(tarFolder, tplType))){
                fs.mkdirSync(path.join(tarFolder, tplType));
            }
            if(fs.existsSync(tarTplFolder)){
                if(saveType === 'create'){
                    resolve({
                        success: false,
                        message: `${tplName} 文件已存在。`
                    });
                    return false;
                }
            }else{
                fs.mkdirSync(tarTplFolder);
            }
            res = await saveSingleFileTpl(saveDatas, tarTplFolder, saveType);
        }
        if(tplType === 'modules'){
            saveDatas.tplName = saveDatas?.moduleTreeData[0]?.title || saveDatas.tplName;
            const tarTplFolder = path.join(tarFolder, tplType);
            if(!fs.existsSync(path.join(tarFolder, tplType))){
                fs.mkdirSync(path.join(tarFolder, tplType));
            }
            res = await saveModulesTpl(saveDatas, tarTplFolder, saveType);
        }
        resolve(res);
    });
};