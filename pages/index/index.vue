<template>
  <view class="content">
    <DiaryList :list="diaryList"></DiaryList>
    <view
      class="icon-class"
      @click="toEdit">
      <uni-icons
        type="plusempty"
        size="30"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import useDiary from '../../hooks/useDiary'
// const list = ref([])
const { diaryList, getDiaryList } = useDiary()
onLoad(() => {
  console.log('onShow')
  getDiaryList()
  uni.$on('refreshDiaryList', function (data) {
    if (data && data.data) {
      getDiaryList()
    }
  })
})

onPullDownRefresh(() => {
  getDiaryList().finally(() => uni.stopPullDownRefresh())
  console.log('onPullDownRefresh')
})

const toEdit = () => {
  uni.navigateTo({
    url: '../edit/index',
    success: function (res) {
      // 通过eventChannel向被打开页面传送数据
      // res.eventChannel.emit('acceptDataFromDetail', { data: diaryItem.value })
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
<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
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
