const path = require('path');
const fs = require('fs');
import parseFile from './parseFile';

export const genSingleTpl = (context: any, panel: any, uri: any, datas: any) => {
    let { saveDatas: { tplName, tplContent, tplDataDemo }} = datas;
    if(typeof tplDataDemo === 'string'){
        tplDataDemo = JSON.parse(tplDataDemo);
    }
    const tarDir = path.dirname(uri.path.slice(1));
    const fileName = tplName.slice(0, tplName.lastIndexOf('.'));
    const parseRes = parseFile(tplContent, {...tplDataDemo, fileName});
    if(parseRes.success){
        if(fs.existsSync(path.join(tarDir, tplName))){
            return {
                success: false,
                message: `${tplName} 文件已存在`,
            };
        }else {
            try {
                fs.writeFileSync(path.join(tarDir, tplName), parseRes.fileContent);
            } catch (err) {
                console.log(err);
            }
            return {
                success: true,
                message: `${tplName} 文件生成成功`,
            };
        }
    }else{
        return {
            success: false,
            message: parseRes.message || `${tplName} 文件生成失败`,
        };
    }
    
};