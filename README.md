# 根据模板生成代码的Vscode插件
> 主要功能
- 代码生成
  - 单文件模板
  - 模块文件
  - 代码生成时，保存为新模板
- 模板管理
    - 单文件模板
    - 模块文件模板
    - 新增
    - 修改
    - 删除
> 主体功能实现所用技术
- 使用webview作为视图层功能实现及数据交互；
- webview 使用vite+vue3开发
- 模板解析使用art-template作为模板解析工具
## 代码生成
- 目录 /generate-view
- 打包 npm run build (会在 /plugin/src/generate/generate-views 中生成页面文件)

## 模板管理
- 目录 /plugin
- 打包 vsce package
### 注意
- 打包时，先打包views，再打包plugin
  > 1、 cd /generate-view   npm run build

  > 2、 cd /plugin   npm run package-copy-static