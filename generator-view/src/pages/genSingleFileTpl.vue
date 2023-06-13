<template>
  <div class="gen-single-file-tpl">
    <div class="content-box">
      <a-form-item label="名称">
        <a-input v-model:value="tplInfo.tplName"></a-input>
      </a-form-item>
      <a-form-item label="简介">
        <a-textarea v-model:value="tplInfo.tplDes" :rows="4" placeholder="请输入模板简介" />
      </a-form-item>
      <a-collapse v-model:activeKey="state.collapseActiveKey">
        <a-collapse-panel key="tplContent" header="模板内容">
          <Editor v-model:value="tplInfo.tplContent" :editorConfig="{language: 'html'}" />
        </a-collapse-panel>
        <a-collapse-panel key="tplDataDemo" header="Demo数据">
          <Editor v-model:value="tplInfo.tplDataDemo" :editorConfig="{language: 'json'}" />
        </a-collapse-panel>
      </a-collapse>
    </div>
    <div class="footer">
      <a-button type="primary" @click="saveNewTpl">保存为新模板</a-button>
      <a-button class="footer-gen" type="primary" @click="genFiles">生成</a-button>
    </div>
  </div>
</template>

<script setup lang='tsx'>
  import { reactive, inject, watch } from 'vue';
  import Editor from '../components/monacoEditor/editor.vue';
  import { isJsonString } from '../utils/is';
  import { message } from 'ant-design-vue';
  import { callVscode } from '../utils/message'

  const props = defineProps({
    curtRowData: {
      type: Object,
      default: () => null
    }
  });
  const refreshTplDatas = inject('refreshTplDatas') as any;
  const state = reactive({
    collapseActiveKey: 'tplContent'
  });
  const tplInfo = reactive({
    tplName: '',
    tplDes: '',
    tplContent: '',
    tplDataDemo: ''
  });
  watch(() => props.curtRowData, () => {
    if(props.curtRowData){
      let { info, tplContent, demoData} = JSON.parse(JSON.stringify(props.curtRowData));
      if(typeof info == 'string') {
        info = JSON.parse(info);
      }
      tplInfo.tplName = info.tplName;
      tplInfo.tplDes = info.tplDes;
      tplInfo.tplContent = tplContent;
      tplInfo.tplDataDemo = demoData;
    }
  }, { immediate: true, deep: true });
  /**
   * 校验模板保存时的数据
   */
  const checkTplManageSaveDatas = (datas) => {
      return new Promise((resolve, reject) => {
          const tplDataDemo = datas.tplDataDemo;
          // 检查 tplDataDemo 是否时JSON数据
          const tplDataDemoIsChecked = isJsonString(tplDataDemo);
          if(!tplDataDemoIsChecked){
              message.warning('模板数据Demo不是合法的JSON!');
              reject();
              return false;
          }
          resolve(true);
      });
  };
  const saveNewTpl = () => {
    const datas = {
      ...tplInfo,
      tplType: 'singleFile'
    };
    checkTplManageSaveDatas(datas).then(() => {
      callVscode(
        {
          cmd: 'saveTplDatas',
          datas: {
            saveType: 'create',
            saveDatas: JSON.stringify({
              datas
            })
          },
        }, 
        (res) => {
          if(res.success){
            refreshTplDatas()
            message.success(res.message);
          }else{
            message.error(res.message || '保存失败。');
          }
        }
      );
    })
  }
  const genFiles = () => {
    const datas = {
      ...tplInfo,
      tplType: 'singleFile'
    };
    checkTplManageSaveDatas(datas).then(() => {
      callVscode(
        {
          cmd: 'genSingleTplDatas',
          datas: {
            saveDatas: datas
          },
        }, 
        (res) => {
          if(res.success){
            refreshTplDatas()
            message.success(res.message);
          }else{
            message.error(res.message || '保存失败。');
          }
        }
      );
    })
  }
</script>
<style scoped>
  .footer{
    padding: 15px 20px;
    text-align: right;
  }
  .footer-gen{
    margin-left: 10px;
  }
</style>