const callbacks = {}; // 存放所有的回调函数
const vscode = acquireVsCodeApi();
/**
 * 调用vscode原生api
 * @param data 可以是类似 {cmd: 'xxx', param1: 'xxx'}，也可以直接是 cmd 字符串
 * @param cb 可选的回调函数
 */
function callVscode(data, cb) {
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
            console.log(message.data);
            (callbacks[message.cbid] || function () { })(message.data);
            delete callbacks[message.cbid];
            break;
        default: break;
    }
});
const isJsonString = (str) => {
    try {
        const strObj = JSON.parse(str);
        if(strObj && typeof strObj === 'object'){
            return true;
        }
    } catch (error) {
        return false;
    }
    return false;
}
(() => {
    new Vue({
        el: '#app',
        data: function() {
          return { 
            genSelTplType: 'singleFile',
            tplDatas: {},
            activeName: 'dataConf',
            dataConfActiveNames: ['dataJson'],
            genSelectedTpl: '',
            dataConfig: {
                dataJson: '',
                tplContent: '',
            },
            tplManage: {
                tableData: [
                    {
                        date: '2016-05-02',
                        name: '王小虎',
                        des: '上海市普陀区金沙江路 1518 弄'
                      }
                ],
                form: {
                    tplType: 'singleFile'
                },
                formLabelWidth: '80px',
                tplTypeOptions: [
                    {
                        label: '单文件',
                        vlaue: 'singleFile'
                    },
                    {
                        label: '模块',
                        vlaue: 'modules'
                    }
                ],
                tplContent: '',
            },
            tplAddOrEditType: '',
            tplAddOrEditTitle: '',
            tplAddOrEditDialogShow: false,
            tplAddOrEditLoading: false
           };
        },
        created() {
            this.getTplDatas();
        },
        computed: {
            tplOption(){
                return this.tplDatas[this.genSelTplType];
            }
        },
        methods: {
            getTplDatas(){
                callVscode('getTplDatas', (datas) => {
                    this.tplDatas = datas;
                });
            },
            genSelTplTypeChange(){
                this.dataConfig = {};
                this.genSelectedTpl = '';
            },
            genSelTplChange(){
                const selTplData = this.tplOption.find(item => item.name === this.genSelectedTpl);
                this.dataConfig.dataJson = selTplData.demoData;
                this.dataConfig.tplContent = selTplData.tplContent;
            },
            handleTabClick(tab){
                console.log(tab);
            },
            /**
             * 新增模板
             */
            handleAddTpl(){
                this.tplAddOrEditType = 'add';
                this.tplAddOrEditTitle = '新增模板';
                this.tplAddOrEditDialogShow = true;
            },
            /**
             * 修改模板
             */
            handleEditTpl(scope){
                this.tplAddOrEditType = 'edit';
                this.tplAddOrEditTitle = '修改模板';
                this.tplAddOrEditDialogShow = true;
            },
            /**
             * 删除模板
             */
            handleDeleteTpl(scope){
                debugger
            },
            /**
             * 新增或修改模板弹框关闭时
             */
            tplAddOrEditHandleClose(done){
                this.$confirm('确定要关闭吗？').then(_ => {
                    done();
                }).catch(_ => {});
            },
            /**
             * 新增或修改模板弹框取消
             */
            tplAddOrEditHandleCancel(){
                this.$refs.tplAddOrEditDrawer.closeDrawer();
            },
            /**
             * 校验模板保存时的数据
             */
            checkTplManageSaveDatas(datas){
                return new Promise((resolve, reject) => {
                    const tplDataDemo = this.tplManage.tplDataDemo;
                    // 检查 tplDataDemo 是否时JSON数据
                    const tplDataDemoIsChecked = isJsonString(tplDataDemo);
                    if(!tplDataDemoIsChecked){
                        this.$message.warning('模板数据Demo不是合法的JSON!');
                        reject();
                        return false;
                    }
                    resolve(true);
                });
            },
            /**
             * 模板管理/新增、修改模板类型change事件
             */
            tplManageAddTplTypeChange(){

            },
            /**
             * 新增或修改模板弹框提交
             */
            tplAddOrEditHandleSubmit(){
                const datas = {
                    ...this.tplManage.form,
                    tplContent: this.tplManage.tplContent,
                    tplDataDemo: this.tplManage.tplDataDemo
                };
                this.checkTplManageSaveDatas(datas).then(() => {
                    callVscode(
                        {
                            cmd: 'saveTplDatas',
                            datas,
                        }, 
                        (res) => {
                            if(res.success){
                                this.$message.success(res.message);
                                this.tplAddOrEditHandleCancel();
                            }
                        }
                    );
                });
            },
        }
    });
})();