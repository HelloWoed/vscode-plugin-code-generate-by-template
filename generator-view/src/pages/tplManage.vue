<template>
  <div class="tpl-manage">
    <a-row>
      <a-col :span="14">
        <a-button type="link" @click="createSingleTpl">新建单文件模板</a-button>
        <a-button type="link" @click="createModuleTpl">新建模块文件模板</a-button>
      </a-col>
      <a-col :span="10">
        <a-select
          v-model:value="state.selType"
          style="width: 120px"
          @change="handleTypeChange"
        >
          <a-select-option value="singleFile">单文件</a-select-option>
          <a-select-option value="modules">模块</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <div class="tpl-table">
      <a-table :dataSource="selTypeTplDatas" :columns="state.tableColumns">
        <template #bodyCell="{ column, record }">
          <template v-if="['tplName', 'tplDes', 'updateDate'].includes(column.dataIndex)">
            <span>{{ record.info[column.dataIndex] }}</span>
          </template>
          <template v-if="column.dataIndex == 'operation'">
            <a-button type="link" @click="editTpl(record)">修改</a-button>
          <a-button type="link" @click="delTpl(record)">删除</a-button>
          </template>
        </template>
      </a-table>
    </div>
    <createSingleFileTpl ref="createSingleFileTplRef" :curtRowData="state.curtRowData" />
    <createModuleFileTpl ref="createModuleFileTplRef" :curtRowData="state.curtRowData" />
  </div>
</template>

<script setup lang='tsx'>
  import { ref, reactive, inject, computed } from 'vue';
  import createSingleFileTpl from './createSingleFileTpl.vue';
  import createModuleFileTpl from './createModuleFileTpl.vue';
  import { message } from 'ant-design-vue';
  import { callVscode } from '../utils/message'

  const createSingleFileTplRef = ref(null as any);
  const createModuleFileTplRef = ref(null as any);
  const refreshTplDatas = inject('refreshTplDatas') as any;
  const state = reactive({
    selType: 'singleFile',
    tableColumns: [
      {
        title: '名称',
        dataIndex: 'tplName'
      },
      {
        title: '简介',
        dataIndex: 'tplDes'
      },
      {
        title: '更新时间',
        dataIndex: 'updateDate'
      },
      {
        title: '操作',
        dataIndex: 'operation'
      }
    ],
    curtRowData: null as any
  });
  const tplDatas = inject('tplDatas') as any;
  const handleTypeChange = () => {

  }
  const selTypeTplDatas = computed(() => {
    return (tplDatas.value[state.selType] || []).map(item => {
      return {
        ...item,
        info: JSON.parse(item.info)
      }
    });
  })
  const editTpl = (record) => {
    state.curtRowData = record;
    if(record.type == 'singleFile'){
      createSingleFileTplRef.value?.open()
    }
    if(record.type == 'modules'){
      createModuleFileTplRef.value?.open()
    }
  }
  const delTpl = (record) => {
    callVscode(
        {
          cmd: 'delFolder',
          datas: record,
        }, 
        (res) => {
          if(res.success){
            refreshTplDatas()
            message.success(res.message);
          }else{
            message.error(res.message || '删除失败。');
          }
        }
      );
  }
  const createSingleTpl = () => {
    state.curtRowData = null;
    createSingleFileTplRef.value?.open()
  }
  const createModuleTpl = () => {
    state.curtRowData = null;
    createModuleFileTplRef.value?.open()
  }
</script>

<style scoped>
.tpl-table{
  margin-top: 10px;
}
</style>