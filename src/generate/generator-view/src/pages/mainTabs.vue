<template>
  <div class="ain-tabs h-full">
    <a-tabs v-model:activeKey="state.activeKey">
    <a-tab-pane key="dataConf" tab="文件生成">
      <generateFIles />
    </a-tab-pane>
    <a-tab-pane key="tplManage" tab="模板管理" force-render>
      <tplManage />
    </a-tab-pane>
  </a-tabs>
  </div>
</template>

<script setup lang='tsx'>
  import { ref, reactive, provide } from 'vue';
  import generateFIles from './generateFIles.vue';
  import tplManage from './tplManage.vue'
  import {callVscode} from '../utils/message'

  const state = reactive({
    activeKey: 'dataConf',
  });
  const tplDatas = ref({})
  const getTplDatas = () => {
    callVscode('getTplDatas', (datas: any) => {
      tplDatas.value = datas;
    });
  };
  getTplDatas();
  provide('getTplDatas', () => {
    return tplDatas;
  })
  provide('tplDatas', tplDatas)
  provide('refreshTplDatas', getTplDatas);
</script>

<style lang='less' scoped></style>