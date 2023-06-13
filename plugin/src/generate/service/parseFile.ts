const template = require('art-template');

export default (content: string, datas: string) => {
    let res = {} as {success: boolean; fileContent: string; message: string;};
    let contentStr = '';
    try {
        contentStr = template.render(content, typeof datas === 'string' ? JSON.parse(datas) : datas);
        res = {
            success: true,
            fileContent: contentStr,
            message: '生成成功'
        };
    } catch (error) {
        res = {
            success: false,
            fileContent: contentStr,
            message: `error -- ${error}`
        };
    }
    return res;
};