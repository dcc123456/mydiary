<template>
  <view class="content">
    <view class="title-class">
      <uni-easyinput
        class="title-class"
        :inputBorder="false"
        v-model="title"
        :styles="styles"
        :placeholderStyle="placeholderStyle"
        placeholder="请输入标题"></uni-easyinput>
    </view>
    <Diary
      ref="diaryRef"
      :content="content"
      :diaryItem="diaryItem"></Diary>
  </view>
</template>

<script setup>
import { ref, watchEffect, onBeforeUnmount } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { readFile } from '../../utils/files'
import useDiary from '../../hooks/useDiary'
const placeholderStyle = 'color:#999;font-size:16px'
const styles = {
  color: '#000',
  fontSize: '16px',
}
const diaryRef = ref(null)
const content = ref('')
const diaryItem = ref(null)
const title = ref('')
const { saveMD } = useDiary()
onLoad(option => {
  console.log(option)
  const pages = getCurrentPages() // 无需import
  const page = pages[pages.length - 1]
  const eventChannel = page.getOpenerEventChannel()
  // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
  eventChannel.on('acceptDataFromDetail', function (data) {
    console.log(data)
    if (data && data.data) {
      diaryItem.value = data.data
    }
  })
})

onBeforeUnmount(() => {
  console.log('detail onBeforeUnmount')
  const res = diaryRef.value?.getContent()
  console.log('title::::', title.value)
  content.value = res
  saveMD(diaryItem.value, content.value, title.value).then(() => {
    uni.$emit('refreshDiaryList', { data: true })
  })
})

watchEffect(() => {
  if (diaryItem.value) {
    title.value = diaryItem.value.title
    readFileFun(diaryItem.value.path)
      .then(res => {
        content.value = res
      })
      .catch(err => {
        console.log(err)
      })
  }
})

const readFileFun = async path => {
  const res = await readFile(path)
  return res
}
</script>
<style scoped lang="less">
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.title-class {
  width: 100%;
  margin-bottom: 20rpx;
  .is-input-border {
    border-style: none;
    border: 2px solid #ba2828 !important;
  }
}
.uni-easyinput__content-input {
  border: 1px solid #4caf50 !important; /* 修改边框颜色和宽度 */
  border-radius: 8px; /* 修改边框圆角 */
}
</style>
