<template>
  <div class="data-config">
    <div class="curnt-path">
      <span>当前目录：</span>
      <span>{{curntPath}}</span>
    </div>
    <a-select
      v-model:value="state.selType"
      class="m-r-10px"
      style="width: 120px"
      @change="handleTypeChange"
    >
      <a-select-option value="singleFile">单文件</a-select-option>
      <a-select-option value="modules">模块</a-select-option>
    </a-select>
    <a-select
      v-model:value="state.selTpl"
      :style="{width: '220px', marginLeft: '10px'}"
      @change="handleTplChange"
    >
      <a-select-option v-for="item in selTypeTplDatas" :key="item.name" :value="item.name">{{item.name}}</a-select-option>
    </a-select>
    <div v-if="state.selTpl" class="gen-config">
      <genSingleFileTpl v-if="state.selType == 'singleFile'" :curtRowData="state.selTplDatas" />
      <genModuleFileTpl v-if="state.selType == 'modules'" :curtRowData="state.selTplDatas" />
    </div>
  </div>
</template>

<script setup lang='tsx'>
  import { reactive, inject, computed } from 'vue';
  import genSingleFileTpl from './genSingleFileTpl.vue'
  import genModuleFileTpl from './genModuleFileTpl.vue'

  const state = reactive({
    selType: 'singleFile',
    selTpl: '',
    selTplDatas: {} as any
  });
  const tplDatas = inject('tplDatas') as any;
  const handleTypeChange = () => {
    state.selTpl = '';
  }
  const handleTplChange = () => {
    const tarData = selTypeTplDatas.value.find((ite: any) => ite.name === state.selTpl);
    state.selTplDatas = JSON.parse(JSON.stringify(tarData))
  }
  const selTypeTplDatas = computed(() => {
    return tplDatas.value[state.selType]
  })
  const curntPath = computed(() => {
    return tplDatas.value['curnt_work_catalog_path']
  })
</script>

<style scoped>
.curnt-path{
  padding: 10px;
  padding-top: 0;
}
.gen-config{
  margin-top: 10px;
}
</style>