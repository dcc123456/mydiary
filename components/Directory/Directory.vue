<template>
  <view class="container">
    <!-- <view class="d-top"> 文件选择 </view> -->
    <view class="d-bread">
      <uni-breadcrumb separator=">">
        <uni-breadcrumb-item v-for="(route, index) in paths" :key="index">
          <view @click="clickBread(index)">{{ route.title }}</view>
        </uni-breadcrumb-item>
      </uni-breadcrumb>
    </view>
    <view class="main">
      <uni-list>
        <uni-list-item v-for="item in list" :showArrow="item.isDirectory" :key="item" :title="item.name" :note="item.modificationTime" clickable
          @click="clickListItem(item)">
         <!-- <template v-slot:footer v-if="item.isDirectory && (item.directoryCount || 0)+(item.fileCount || 0)">
            {{`${(item.directoryCount || 0)+(item.fileCount || 0)}项`}}
          </template> -->
        </uni-list-item>

      </uni-list>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, defineEmits, onMounted } from 'vue'
import { getDirection } from '../../utils/files'
import { timestampToDateTime } from '../../utils/common';
const paths = ref([{ title: '文件选择', name: [''] }]);
const emit = defineEmits('selected');
// 安卓手机只能访问外部这两个目录，其他目录没有权限访问
const initList = [
  { name: 'Documents', names: ['Documents'], isDirectory:true, isFile:false },
  { name: 'Download', names: ['Download'], isDirectory:true, isFile:false }
];
let list = ref(initList)

/**
 * 点击面包屑，跳转
 */
const clickBread = async (idx: number) => {
  if (idx > -1) {
    paths.value.splice(idx + 1, paths.value.length - 1)
  }
  console.log('path2 ->', ...paths.value);
  const names = paths.value[idx].name
  console.log('names ->', names);
  try{
  	await getList(names)
  }catch(e){
  	//TODO handle the exception
	console.error(e);
	list.value = initList
  }
}

/**
 * 点击目录条目触发
 */
const clickListItem = item => {
  if (!item) {
    return
  }
  if(item.isFile){
    emit('selected', item);
  }
  if (item.isDirectory) {
    paths.value = [...paths.value, { title: item.name, name: item.names }]
    getList(item.names)
  }
}

/**
 * 获取目录列表
 */
const getList = async (names: [string]) => {
  const name = names.join('/')
  // let res = null
  const res = await getDirection(name);
  if (res && Array.isArray(res)) {
  		res.forEach(element => {
  		  element.names = [...names, element.name]
  		  element.modificationTime = timestampToDateTime(new Date(element.modificationTime).getTime())
  		})
  		list.value = res
  }
}
</script>

<style lang="less" scoped>
.container{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  .d-bread{
    width: 100%;
  }
  .main{
    width: 100%;
  }
}
.active {
  color: #007aff;
}
</style>
