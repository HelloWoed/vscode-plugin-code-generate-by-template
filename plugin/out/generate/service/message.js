"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBridge = void 0;
const getTplDatas_1 = require("./getTplDatas");
const saveTplDatas_1 = require("./saveTplDatas");
const deleteFolder_1 = require("./deleteFolder");
const genSingleTpl_1 = require("./genSingleTpl");
const genModuleTpl_1 = require("./genModuleTpl");
class MessageBridge {
    constructor(context, panel, uri) {
        this.messageHandler = {
            getTplDatas: (message) => {
                const datas = (0, getTplDatas_1.getTplDatasFn)(this.context, this.panel, this.uri);
                this.panel.webview.postMessage({ cmd: 'vscodeCallback', cbid: message.cbid, data: datas });
            },
            saveTplDatas: (message) => {
                (0, saveTplDatas_1.saveTplDatasFn)(this.context, this.panel, this.uri, message.datas).then(res => {
                    this.panel.webview.postMessage({ cmd: 'vscodeCallback', cbid: message.cbid, data: res });
                });
            },
            delFolder: (message) => {
                let { datas } = message;
                if (typeof datas === 'string') {
                    datas = JSON.parse(datas);
                }
                const res = (0, deleteFolder_1.deleteFolder)(datas.path);
                this.panel.webview.postMessage({ cmd: 'vscodeCallback', cbid: message.cbid, data: res });
            },
            genSingleTplDatas: (message) => {
                const res = (0, genSingleTpl_1.genSingleTpl)(this.context, this.panel, this.uri, message.datas);
                this.panel.webview.postMessage({ cmd: 'vscodeCallback', cbid: message.cbid, data: res });
            },
            genModuleTplDatas: (message) => {
                const res = (0, genModuleTpl_1.genModuleTpl)(this.context, this.panel, this.uri, message.datas);
                this.panel.webview.postMessage({ cmd: 'vscodeCallback', cbid: message.cbid, data: res });
            },
        };
        this.context = context;
        this.panel = panel;
        this.uri = uri;
    }
    openMes() {
        this.panel.webview.onDidReceiveMessage((message) => {
            if (this.messageHandler[message.cmd]) {
                // cmd表示要执行的方法名称
                this.messageHandler[message.cmd](message);
            }
        }, undefined, this.context.subscriptions);
    }
}
exports.MessageBridge = MessageBridge;
//# sourceMappingURL=message.js.map