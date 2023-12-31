<template>
  <div class="create-module-file-tpl">
    <a-drawer
      v-if="state.visible"
      v-model:visible="state.visible"
      title="创建模块文件模板"
      width="820"
      :closable="false"
      :footer-style="{ textAlign: 'right' }"
      @close="onClose"
    >
      <div class="modul-tpl-content">
        <a-form-item label="名称">
          <a-input v-model:value="tplInfo.tplName"></a-input>
        </a-form-item>
        <a-form-item label="简介">
          <a-textarea v-model:value="tplInfo.tplDes" :rows="4" placeholder="请输入模板简介" />
        </a-form-item>
        <div v-if="tplInfo.tplName" class="module-files">
          <a-collapse v-model:activeKey="state.collapseActiveKey">
            <a-collapse-panel key="moduleContent" header="模块内容">
              <a-row>
                <a-col :span="6">
                  <a-tree
                    :show-line="true"
                    :tree-data="tplInfo.moduleTreeData"
                    v-model:selectedKeys="state.moduleSelectedKeys"
                    v-model:expandedKeys="state.moduleExpandedKeys"
                    @select="moduleTreeOnSelect"
                  >
                    <template #title="{ key: treeKey, title, type }">
                      <a-dropdown :trigger="['contextmenu']">
                        <span>{{ title }}</span>
                        <template #overlay>
                          <a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey)">
                            <a-menu-item v-if="type == 'folder'" key="newFolder">新建文件夹</a-menu-item>
                            <a-menu-item v-if="type == 'folder'" key="newFile">新建文件</a-menu-item>
                            <a-menu-item v-if="treeKey != tplInfo.moduleTreeData[0].key" key="del">删除</a-menu-item>
                          </a-menu>
                        </template>
                      </a-dropdown>
                    </template>
                  </a-tree>
                </a-col>
                <a-col v-if="state.selectedNodeData" :span="18">
                  <a-form-item label="名称">
                    <a-input v-model:value="state.selectedNodeData.title"></a-input>
                  </a-form-item>
                  <Editor v-if="state.selectedNodeData.type == 'file'" v-model:value="state.selectedNodeData.tplContent" :editorConfig="{language: 'html'}" />
                </a-col>
              </a-row>
            </a-collapse-panel>
            <a-collapse-panel key="tplDataDemo" header="Demo数据">
              <Editor v-model:value="tplInfo.tplDataDemo" :editorConfig="{language: 'json'}" />
            </a-collapse-panel>
          </a-collapse>
        </div>
      </div>

      <template #footer>
        <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
        <a-button type="primary" @click="submitDatas">保存</a-button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang='tsx'>
  import { reactive, watch, inject, toRaw } from 'vue';
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
    collapseActiveKey: 'moduleContent',
    moduleSelectedKeys: [] as string[],
    moduleExpandedKeys: [] as string[],
    selectedNodeData: null as any,
    curntRowOrignData: {} as any
  });
  const tplInfo = reactive({
    tplName: '',
    tplDes: '',
    moduleTreeData: [] as any,
    tplDataDemo: ''
  });
  const buildTreeKey = () => {
    return Date.now() + '' + Math.round(Math.random() * 100000)
  }
  watch(() => tplInfo.tplName, () => {
    if(tplInfo.moduleTreeData[0]){
      tplInfo.moduleTreeData[0].title = tplInfo.tplName
    }else{
      tplInfo.moduleTreeData.push({
        title: tplInfo.tplName,
        type: 'folder',
        key: buildTreeKey()
      })
    }
  })
  watch(() => tplInfo.moduleTreeData, () => {
    const treeFirstTitle = tplInfo.moduleTreeData[0]?.title || '';
    if(treeFirstTitle && treeFirstTitle != tplInfo.tplName){
      tplInfo.tplName = tplInfo.moduleTreeData[0].title
    }
  }, {deep: true})
  watch(() => props.curtRowData, () => {
    initTplInfo();
    if(props.curtRowData){
      state.curntRowOrignData = JSON.parse(JSON.stringify(props.curtRowData));
      const { info, moduleTreeData, demoData} = JSON.parse(JSON.stringify(props.curtRowData));
      tplInfo.tplName = info.tplName;
      tplInfo.tplDes = info.tplDes;
      moduleTreeData.forEach(item => {
        tplInfo.moduleTreeData.push(item)
      });
      tplInfo.tplDataDemo = demoData;
      state.selectedNodeData = tplInfo.moduleTreeData[0] || null;
    }
  }, { immediate: true, deep: true });
  const initTplInfo = () => {
    tplInfo.tplName = '';
    tplInfo.tplDes = '';
    tplInfo.tplDataDemo = '';
    tplInfo.moduleTreeData.length = 0;
  }
  const open = () => {
    state.visible = true;
  }
  const close = () => {
    state.visible = false;
  }
  const onClose = () => {
    close();
  }
  const moduleTreeOnSelect = (_, {node}) => {
    state.moduleSelectedKeys = [ node.key ];
    state.selectedNodeData = findByTreeKey(tplInfo.moduleTreeData, node.key);
  }
  const findByTreeKey = (treeDatas, key) => {
    let res = {} as any;
    const findFun = (datas) => {
      datas.forEach(item => {
        if(item.key === key){
          res = item;
        }else{
          if(item.children && item.children.length){
            findFun(item.children)
          }
        }
      });
    }
    findFun(treeDatas);
    return res;
  }
  const createFoler = (treeTar) => {
    const itemFolder = {
      title: tplInfo.tplName,
      type: 'folder',
      key: buildTreeKey(),
      parentKey: treeTar.key
    }
    if(treeTar.children){
      treeTar.children.push(itemFolder)
    }else{
      treeTar.children = [itemFolder]
    }
    state.selectedNodeData = itemFolder;
    state.moduleSelectedKeys = [itemFolder.key];
    state.moduleExpandedKeys.push(treeTar.key);
  };
  const createFile = (treeTar) => {
    const itemFile = {
      title: tplInfo.tplName,
      type: 'file',
      key: buildTreeKey(),
      parentKey: treeTar.key
    }
    if(treeTar.children){
      treeTar.children.push(itemFile)
    }else{
      treeTar.children = [itemFile]
    }
    state.selectedNodeData = itemFile;
    state.moduleSelectedKeys = [itemFile.key];
    state.moduleExpandedKeys.push(treeTar.key);
  };
  const deleteFiles = (treeTar) => {
    const parentData = findByTreeKey(tplInfo.moduleTreeData, treeTar.parentKey);
    parentData.children = parentData.children.filter(ite => ite.key != treeTar.key);
    state.selectedNodeData = parentData;
    state.moduleSelectedKeys = [parentData.key];
    state.moduleExpandedKeys.push(parentData.key);
  };
  const onContextMenuClick = (treeKey, menuKey) => {
    const treeTar = findByTreeKey(tplInfo.moduleTreeData, treeKey);
    switch (menuKey) {
      case 'newFolder':
        createFoler(treeTar)
        break;
      case 'newFile':
        createFile(treeTar)
        break;
      case 'del':
        deleteFiles(treeTar)
        break;
    
      default:
        break;
    }
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
      tplName: tplInfo.tplName,
      tplDes: tplInfo.tplDes,
      moduleTreeData: toRaw(tplInfo.moduleTreeData),
      tplDataDemo: tplInfo.tplDataDemo,
      tplType: 'modules'
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
            refreshTplDatas();
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