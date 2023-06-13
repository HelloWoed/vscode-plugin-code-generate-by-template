
declare global {
    interface Window {
        acquireVsCodeApi: any
    }
  }
const callbacks = {} as {[k: string]: any}; // 存放所有的回调函数
const vscode = window.acquireVsCodeApi() as any;
interface callVscodeData {
    cmd: string;
    [k: string]: any
}
/**
 * 调用vscode原生api
 * @param data 可以是类似 {cmd: 'xxx', param1: 'xxx'}，也可以直接是 cmd 字符串
 * @param cb 可选的回调函数
 */
function callVscode(data: callVscodeData | string, cb: any) {
    if (typeof data === 'string') {
        data = { cmd: data };
    }
    if (cb) {
        // 生成回调函数id,用于临时保存回调函数
        const cbid = Date.now() + '' + Math.round(Math.random() * 100000);
		// 将回调函数存起来
        callbacks[cbid] = cb;
        data.cbid = cbid;
    }
    vscode.postMessage(data);
}
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.cmd) {
        case 'vscodeCallback':
            (callbacks[message.cbid] || function () { })(message.data);
            delete callbacks[message.cbid];
            break;
        default: break;
    }
});
export { callVscode };
