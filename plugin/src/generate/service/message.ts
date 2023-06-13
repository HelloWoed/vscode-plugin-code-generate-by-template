import { getTplDatasFn } from './getTplDatas';
import { saveTplDatasFn } from './saveTplDatas';
import { deleteFolder } from './deleteFolder';
import { genSingleTpl } from './genSingleTpl';
import { genModuleTpl } from './genModuleTpl';

export class MessageBridge {
    private context: any;
    private panel: any;
    private uri: any;
    constructor(context: any, panel: any, uri: any ){
        this.context = context;
        this.panel = panel;
        this.uri = uri;
    }
    private messageHandler: any = {
        getTplDatas: (message: any) => {
            const datas = getTplDatasFn(this.context, this.panel);
            this.panel.webview.postMessage({cmd: 'vscodeCallback', cbid: message.cbid, data: datas});
        },
        saveTplDatas: (message: any) => {
            saveTplDatasFn(this.context, this.panel, this.uri, message.datas).then(res => {
                this.panel.webview.postMessage({cmd: 'vscodeCallback', cbid: message.cbid, data: res});
            });
        },
        delFolder: (message: any) => {
            let { datas } = message;
            if(typeof datas === 'string'){
                datas = JSON.parse(datas);
            }
            const res = deleteFolder(datas.path);
            this.panel.webview.postMessage({cmd: 'vscodeCallback', cbid: message.cbid, data: res});
        },
        genSingleTplDatas: (message: any) => {
            const res = genSingleTpl(this.context, this.panel, this.uri, message.datas);
            this.panel.webview.postMessage({cmd: 'vscodeCallback', cbid: message.cbid, data: res});
        },
        genModuleTplDatas: (message: any) => {
            const res = genModuleTpl(this.context, this.panel, this.uri, message.datas);
            this.panel.webview.postMessage({cmd: 'vscodeCallback', cbid: message.cbid, data: res});
        },
    };
    openMes(){
        this.panel.webview.onDidReceiveMessage((message: any) => {
            if (this.messageHandler[message.cmd]) {
                // cmd表示要执行的方法名称
                this.messageHandler[message.cmd](message);
            }
        }, undefined, this.context.subscriptions);
    }
}