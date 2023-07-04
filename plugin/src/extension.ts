// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {getWebViewContent} from './utils/loadHtmlConten';
const path = require('path');
import {MessageBridge} from './generate/service/message';
import {LifeCycle} from './generate/service/lifeCycle';

let currentPanel: vscode.WebviewPanel | undefined = undefined as any;
const createWebViewPanel = (context: any, columnToShowIn: any, uri: any) => {
	const webviewDir = path.join(context.extensionPath, './');
	currentPanel = vscode.window.createWebviewPanel(
		'generateFileWebView', // viewType
		"创建模板文件", // 视图标题
		// vscode.ViewColumn.One, // 显示在编辑器的哪个部位
		columnToShowIn,
		{
			enableScripts: true, // 启用JS，默认禁用
			retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
			// 指定允许加载的本地资源的根目录
			localResourceRoots: [
				vscode.Uri.file(webviewDir),
				vscode.Uri.file(vscode.env.appRoot),
				// vscode.Uri.joinPath(context.extensionPath as any, 'src')
			]
		}
	);
	new MessageBridge(context, currentPanel, uri).openMes();
	// currentPanel.webview.html = getWebViewContent(context, 'src/generate/pages/index.html', currentPanel);
	currentPanel.webview.html = getWebViewContent(context, 'out/views/index.html', currentPanel);
	vscode.window.setStatusBarMessage('欢迎来到召唤师峡谷！');
	new LifeCycle(currentPanel).subscribe();
};
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const columnToShowIn: any = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "generate-code-by-template" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('generate-code-by-template.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from generate-code-by-template!');
	// });
	// context.subscriptions.push(disposable);
	const generateFile = vscode.commands.registerCommand('generate-code-by-template.generateFile', (uri) => {
		// if (currentPanel) {
		// 	currentPanel?.reveal(columnToShowIn);
		// }else{
		// 	createWebViewPanel(context, currentPanel, columnToShowIn, uri);
		// }
		// 如果存在当前panel,销毁当前panel
		if(currentPanel){
			currentPanel.dispose();
		}
		createWebViewPanel(context, columnToShowIn, uri);
	});
	context.subscriptions.push(generateFile);
}

// This method is called when your extension is deactivated
export function deactivate() {
	vscode.window.setStatusBarMessage('');
}
