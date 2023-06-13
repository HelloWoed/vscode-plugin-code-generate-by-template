<template>
  <div class="create-module-file-tpl">
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
                    <a-dropdown v-if="type == 'folder'" :trigger="['contextmenu']">
                      <span>{{ title }}</span>
                      <template #overlay>
                        <a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey)">
                          <a-menu-item key="newFolder">新建文件夹</a-menu-item>
                          <a-menu-item key="newFile">新建文件</a-menu-item>
                          <a-menu-item key="del">删除</a-menu-item>
                        </a-menu>
                      </template>
                    </a-dropdown>
                    <span v-else>{{ title }}</span>
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
    <div class="footer">
      <a-button type="primary" @click="saveNewTpl">保存为新模板</a-button>
      <a-button class="footer-gen" type="primary" @click="genFiles">生成</a-button>
    </div>
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
    collapseActiveKey: 'moduleContent',
    moduleSelectedKeys: [] as string[],
    moduleExpandedKeys: [] as string[],
    selectedNodeData: null as any
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
    if(props.curtRowData){
      let { info, moduleTreeData, demoData} = JSON.parse(JSON.stringify(props.curtRowData));
      if(typeof info == 'string') {
        info = JSON.parse(info);
      }
      if(typeof moduleTreeData == 'string') {
        moduleTreeData = JSON.parse(moduleTreeData);
      }
      tplInfo.tplName = info.tplName;
      tplInfo.tplDes = info.tplDes;
      tplInfo.moduleTreeData.length = 0;
      moduleTreeData.forEach(item => {
        tplInfo.moduleTreeData.push(item)
      });
      tplInfo.tplDataDemo = demoData;
    }
  }, { immediate: true, deep: true });
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
      title: 'New Folder',
      type: 'folder',
      key: buildTreeKey()
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
      title: 'New File',
      type: 'file',
      key: buildTreeKey()
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
  const deleteFiles = (_treeTar) => {

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
            saveType: 'create',
            saveDatas: datas
          },
        }, 
        (res) => {
          if(res.success){
            refreshTplDatas();
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
      tplName: tplInfo.tplName,
      tplDes: tplInfo.tplDes,
      moduleTreeData: toRaw(tplInfo.moduleTreeData),
      tplDataDemo: tplInfo.tplDataDemo,
      tplType: 'modules'
    };
    checkTplManageSaveDatas(datas).then(() => {
      callVscode(
        {
          cmd: 'genModuleTplDatas',
          datas: {
            saveDatas: datas
          },
        }, 
        (res) => {
          if(res.success){
            refreshTplDatas();
            message.success(res.message);
          }else{
            message.error(res.message || '生成失败。');
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