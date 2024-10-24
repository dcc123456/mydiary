<template>
  <view style="display: flex; flex-direction: column">
    <!-- <textarea
		style="background-color: bisque;"
      ref="textareaRef"
      class="diary-textarea"
      v-model="content"
      @input="renderMD()"
      :maxlength="-1"></textarea> -->
	  
	  <uni-easyinput class="diary-textarea" type="textarea" autoHeight maxlength="-1" v-model="content" placeholder="请输入内容"></uni-easyinput>
  </view>
</template>

<script setup>
import { ref, defineProps, watchEffect,onMounted } from 'vue'
import MarkdownIt from '../../lib/index'
const props = defineProps({
  content: String,
  diaryItem: Object
})
const content = ref('')
const md = MarkdownIt()
const result = ref()
const textareaRef = ref();
watchEffect(() => {
  if (props.content) {
    content.value = props.content
  }
})
const renderMD = () => {
  result.value = md.render(content.value)
}
const getContent = () => {
  return content.value
}


defineExpose({
  getContent,
})
</script>

<style lang="less">
@import 'index.less';
</style>
