<template>
  <view class="content" >
    <uni-title type="h1" :title="diaryItem.title" style="white-space: nowarp;"></uni-title>
	<view class="diary-contain">
		<ShowDiary :content="content"></ShowDiary>
	</view>
	<view
	  class="icon-class"
	  @click="toEdit">
	  <uni-icons
	    type="compose"
	    size="30"></uni-icons>
	</view>
  </view>
</template>

<script setup lang="ts">
import { ref, watchEffect, onBeforeUnmount,onMounted,getCurrentInstance } from 'vue'
import { onLoad,onShow } from '@dcloudio/uni-app'
import { deleteFile, readFile } from '../../utils/files'
import { DiaryItem } from '../../hooks/interface'
const content = ref('')
const diaryItem:DiaryItem = ref(null)
const openFileDiary = ref(null)

 //  onMounted(() => {
 //    const instance = getCurrentInstance().proxy
 //    const eventChannel = instance.getOpenerEventChannel();
	// })
onLoad(option => {
  console.log(option)
  const pages = getCurrentPages() // 无需import
  const page = pages[pages.length - 1]
  const eventChannel = page.getOpenerEventChannel()
  // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
  eventChannel.on('acceptDataFromList', function (data) {
    console.log(data)
    if (data && data.data) {
      diaryItem.value = data.data
    }
  })
  // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
  eventChannel.on('acceptDataFromOpenFile', function (data) {
    console.log(data)
    if (data && data.data) {
      openFileDiary.value = data.data
      diaryItem.value = data.data
    }
  })
})
onShow(() => {
  if(diaryItem.value && diaryItem.value.path){
    readFileFun(diaryItem.value.path).then(res => {
      content.value = res
    })
  }
})

onBeforeUnmount(() => {
  console.log('页面销毁', openFileDiary.value,openFileDiary.value.id)
  if(!openFileDiary.value?.id){
    deleteFile(openFileDiary.value.path)
  }
})
watchEffect(() => {
  if (diaryItem.value) {
    // title.value = diaryItem.value.title;
    // content.value = diaryItem.value.content;

    readFileFun(diaryItem.value.path)
      .then(res => {
        content.value = res
        console.log('content', res)
      })
      .catch(err => {
        console.log(err)
      })
  }
  // console.log(diaryItem.value)
})

const readFileFun = async path => {
  const res = await readFile(path)
  // console.log(res)
  return res
}

const toEdit = () => {
  uni.navigateTo({
    url: '../edit/index',
    success: function (res) {
      // 通过eventChannel向被打开页面传送数据
      uni.$emit('acceptDataFromDetail', { data: diaryItem.value })
    },
    fail: function (err) {
      console.error('跳转失败:', err)
    },
    complete: function () {
      console.log('跳转完成')
    }
  })
}
</script>
<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.diary-contain{
	width: 90vw;
	height: calc(100vh - 80rpx);
	overflow: auto;
}
.text-area {
  display: flex;
  justify-content: center;
}
.icon-class {
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 80rpx;
  right: 60rpx;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: #ccc 0px 0px 5px;
}
</style>
