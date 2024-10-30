<template>
  <view class="content">
    <DiaryList :list="diaryList"></DiaryList>
    <!-- <test></test> -->
     <!-- <Directory></Directory> -->
    <view
      class="icon-class"
      @click="toEdit">
      <uni-icons
        type="plusempty"
        size="30"></uni-icons>
	</view>
    <view
      class="icon-class2"
      @click="toFile">
      <uni-icons
        type="list"
        size="30"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import {onMounted} from 'vue'
import { onLoad, onPullDownRefresh,  } from '@dcloudio/uni-app'
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
onMounted(() => {
  if (plus.os.name === 'Android') {
    const permission = ['android.permission.READ_EXTERNAL_STORAGE', 'android.permission.WRITE_EXTERNAL_STORAGE'];
    plus.android.requestPermissions(permission, result => {
      if (
        result &&
        result['android.permission.READ_EXTERNAL_STORAGE'] === 'granted' &&
        result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
      ) {
        console.log('权限已授予')
      } else {
        console.error('权限未授予')
        // 重新授权
        // 未授权，请求权限
        const activity = plus.android.runtimeMainActivity();
          const requestCode = 100; // 自定义请求码
          activity.requestPermissions(permission, requestCode);
      }
    })
  }
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

const toFile = () => {
  uni.navigateTo({
    url: '../openFile/index',
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
.icon-class2 {
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 220rpx;
  right: 60rpx;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: #ccc 0px 0px 5px;
}
</style>
