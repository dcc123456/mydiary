<template>
	<view style="display: flex; flex-direction: column">
		<uni-easyinput class="diary-textarea" type="textarea" maxlength="-1" :inputBorder="false" v-model="content" :adjust-position="false"
			placeholder="请输入内容"></uni-easyinput>
	</view>
</template>

<script setup>
	import {
		ref,
		defineProps,
		watchEffect,
		onMounted
	} from 'vue'
	const props = defineProps({
		content: String,
		diaryItem: Object
	})
	const content = ref('')
	const textareaRef = ref();
	watchEffect(() => {
		if (props.content) {
			content.value = props.content
		}
	})
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