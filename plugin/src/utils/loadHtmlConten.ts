const path = require('path');
const fs = require('fs');
import * as vscode from 'vscode';

/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
 export const getWebViewContent = (context: any, templatePath: string, panel: any) => {
    const resourcePath = path.join(context.extensionPath, templatePath);
    const dirPath = path.dirname(resourcePath);
    let html = fs.readFileSync(resourcePath, 'utf-8');
    // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
    // html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m: any, $1: string, $2: string) => {
    //     return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
    // });
    html = html.replace(/(<link.+?href="|<script.+?src="|<iframe.+?src="|<img.+?src=")(.+?)"/g, (m: any, $1: string, $2: string) => {
        if($2.indexOf("https://") < 0){
            // return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
            let resPath = vscode.Uri.file(path.resolve(dirPath, `${$2}`));
            let onDiskPath = vscode.Uri.joinPath(resPath);
            return $1 + panel.webview.asWebviewUri(onDiskPath) + '"';
        }else {
            return $1 + $2 + '"';
        }
    });
    return html;
}