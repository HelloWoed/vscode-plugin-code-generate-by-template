export class LifeCycle {
    private panel: any;
    constructor(panel: any){
        this.panel = panel;
    }
    private onDidDisposeFn(){
        debugger
        this.panel.dispose();
    }
    subscribe(){
        this.panel.webview.onDidDispose(this.onDidDisposeFn);
    }
}