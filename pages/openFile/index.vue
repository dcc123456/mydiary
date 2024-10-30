<template>
  <view class="content">
     <Directory @selected="handleSelected"></Directory>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { copyFile, moveFile } from '../../utils/files';
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
const handleSelected = async (e: any) => {
  console.log(e)
  const res = await copyFile(e.name, e.fullPath);
  const diaryItem = {
    desc: '',
    class_name: '',
    top: 0,
    path: res?.entry?.fullPath,
    created_at: '',
    updated_at: ''
  }
  console.log(diaryItem, res.entry.fullPath)
  toDetail(diaryItem)
}

const toDetail = item => {
  uni.navigateTo({
    url: '../detail/index',
    success: function (res) {
      // 通过eventChannel向被打开页面传送数据
      res.eventChannel.emit('acceptDataFromOpenFile', { data: item })
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
</style>
