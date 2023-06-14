<template>
  <div class="create-module-file-tpl">
    <a-drawer
      v-if="state.visible"
      v-model:visible="state.visible"
      title="创建单文件模板"
      width="820"
      :closable="false"
      :footer-style="{ textAlign: 'right' }"
      @close="onClose"
    >
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
      <template #footer>
        <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
        <a-button type="primary" @click="submitDatas">保存</a-button>
      </template>
    </a-drawer>
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
    visible: false,
    collapseActiveKey: 'tplContent',
    curntRowOrignData: {} as any,
  });
  const tplInfo = reactive({
    tplName: '',
    tplDes: '',
    tplContent: '',
    tplDataDemo: ''
  });
  watch(() => props.curtRowData, () => {
    if(props.curtRowData){
      state.curntRowOrignData = JSON.parse(JSON.stringify(props.curtRowData));
      const { info, tplContent, demoData} = props.curtRowData;
      tplInfo.tplName = info.tplName;
      tplInfo.tplDes = info.tplDes;
      tplInfo.tplContent = tplContent;
      tplInfo.tplDataDemo = demoData;
    }
  }, { immediate: true, deep: true });
  const open = () => {
    state.visible = true;
  }
  const close = () => {
    state.visible = false;
  }
  const onClose = () => {
    close();
  }
  /**
   * 校验模板保存时的数据
   */
  const checkTplManageSaveDatas = (datas) => {
      return new Promise((resolve, reject) => {
        if(!datas.tplName.trim()){
          message.warning('模板名称不能为空!');
          reject();
          return false;
        }
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
  const submitDatas = () => {
    const datas = {
      ...tplInfo,
      tplType: 'singleFile'
    };
    checkTplManageSaveDatas(datas).then(() => {
      callVscode(
        {
          cmd: 'saveTplDatas',
          datas: {
            saveType: props.curtRowData ? 'edit' : 'create',
            saveDatas: JSON.stringify({
              datas,
              originData: state.curntRowOrignData
            })
          },
        }, 
        (res) => {
          if(res.success){
            refreshTplDatas()
            message.success(res.message);
            onClose()
          }else{
            message.error(res.message || '创建失败。');
          }
        }
      );
    })
  }
  defineExpose({
    open,
    close
  })
</script>

<style lang='less' scoped></style>