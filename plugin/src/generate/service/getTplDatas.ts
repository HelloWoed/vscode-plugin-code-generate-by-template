const path = require('path');
const fs = require('fs');
import { getCurntCatalog } from '../../utils/fsUtils';
import { CACHE_PATH, infoFileName, demoDataFileName, moduleTreeDataFileName } from './cosnt';

const buildTreeKey = () => {
    return Date.now() + '' + Math.round(Math.random() * 100000)
};
const readModuleFiles = (strPath: string, childItem: string) => {
    const moduleRes = {} as any;
    const readFn = (pathStr: string, childItem: string, resData: any) => {
        resData.title = childItem;
        resData.key = buildTreeKey();
        resData.type = 'folder';
        const filePath = path.join(pathStr, childItem);
        const fileArr = fs.readdirSync(filePath);
        fileArr.length && (resData.children = []);
        fileArr.forEach((item: string) => {
            var stat = fs.lstatSync(path.join(filePath, item));
            if(stat.isFile()){
                if(![infoFileName, demoDataFileName, moduleTreeDataFileName].includes(item)){
                    resData.children.push({
                        title: item,
                        type: 'file',
                        tplContent: fs.readFileSync(path.join(filePath, item), 'utf-8'),
                        key: buildTreeKey()
                    });
                }
            }
            if(stat.isDirectory()){
                const dirItem = {};
                readFn(filePath, item, dirItem);
                resData.children.push(dirItem);
            }
        });
    };
    readFn(strPath, childItem, moduleRes);
    return [moduleRes];
};
export const getTplDatasFn = (context: any, panel: any, uri: any) => {
    const tarFolder =  path.join(context.extensionPath, CACHE_PATH);
    console.log(tarFolder);
    const folderContent = fs.readdirSync (tarFolder);
    const res = {
        'curnt_work_catalog_path': getCurntCatalog(uri)
    } as any;
    folderContent.map((fileType: string) => {
        const fileTypePath = path.join(tarFolder, fileType);
        const fileTypeChilds = fs.readdirSync(fileTypePath);
        res[fileType] = fileTypeChilds.map((childItem: string) => {
            const resItem = {
                name: childItem,
                type: fileType,
                path: path.join(fileTypePath, childItem),
                info: fs.readFileSync(path.join(fileTypePath, `${childItem}/${infoFileName}`), 'utf-8'),
                demoData: fs.readFileSync(path.join(fileTypePath, `${childItem}/${demoDataFileName}`), 'utf-8'),
            } as any;
            if(fileType === 'singleFile'){
                resItem.tplContent = fs.readFileSync(path.join(fileTypePath, `${childItem}/${childItem}`), 'utf-8');
            }
            if(fileType === 'modules'){
                resItem.moduleTreeData_cache = fs.readFileSync(path.join(fileTypePath, `${childItem}/${moduleTreeDataFileName}`), 'utf-8');
                resItem.moduleTreeData = readModuleFiles(fileTypePath, childItem);
            }
            return resItem;
        });
    });
    return res;
};