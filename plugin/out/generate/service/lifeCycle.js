"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifeCycle = void 0;
class LifeCycle {
    constructor(panel) {
        this.panel = panel;
    }
    onDidDisposeFn() {
        debugger;
        this.panel.dispose();
    }
    subscribe() {
        this.panel.webview.onDidDispose(this.onDidDisposeFn);
    }
}
exports.LifeCycle = LifeCycle;
//# sourceMappingURL=lifeCycle.js.map