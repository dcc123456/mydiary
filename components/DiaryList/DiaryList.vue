<template>
  <view class="container">
    <view
		class="list-item"
      v-for="(item, index) in list"
      :key="index"
      @click="toDetail(item)"
      @longpress="deleteDiaryFun(item)">
      <view class="title">{{ item.title }}</view>
      <view class="desc">{{ item.desc }}</view>
      <view class="update-time">{{ item.updated_at }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, defineProps, watchEffect } from 'vue'
import useDiary from '../../hooks/useDiary'
import { DiaryItem } from '../../hooks/interface'
const list = ref([])
const props = defineProps({
  list: Array
})
const { deleteDiary } = useDiary()
watchEffect(() => {
  if (props.list) {
    list.value = props.list
  }
})

const deleteDiaryFun = (diaryItem: DiaryItem) => {
  uni.showModal({
    title: '删除',
    content: '确认删除？',
    success: function (res) {
      if (res.confirm) {
        console.log('用户点击确定',diaryItem)
        deleteDiary(diaryItem).then(() => {
          uni.$emit('refreshDiaryList', { data: true })
        }).catch(err => {
          console.error(err)
        })
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}
const toDetail = item => {
  uni.navigateTo({
    url: '../detail/index',
    success: function (res) {
      // 通过eventChannel向被打开页面传送数据
      res.eventChannel.emit('acceptDataFromList', { data: item })
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

<style scoped lang="less">
	.container{
		width: 100%;
		.list-item{
			width: 100%;
			border: 1px solid #cfcece;
			border-radius: 8px;
			box-shadow: #cfcece 2px 0px 5px;
			margin: 10rpx 0;
			padding: 10rpx 20rpx;
			view{
				margin-top: 5rpx;
			}
		}
	}
.title {
  font-weight: 500;
  font-size: 16px;
}
.desc {
  color: #999;
  font-size: 14px;
}
.update-time {
  color: #cfcece;
  font-size: 12px;
}
</style>
