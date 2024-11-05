<template>
	<view>
		<view style="display: flex;">
		<view @click="onFocus" @longpress="onFocus">
			<uni-easyinput class="diary-textarea" @blur="blurFun" type="textarea" maxlength="-1" :inputBorder="false" :value="content"
				:adjust-position="false" @input="changeContent" placeholder="请输入内容" ref="easyInput"></uni-easyinput>
		</view>
		<!-- <textarea class="diary-textarea uni-easyinput__content-textarea" ref="easyInput" placeholder="请输入内容" :value="content.value " @input="changeContent"/> -->
		<TipTool class="tip-tool-class" :insertTextAtCursor="insertTextAtCursor"></TipTool>
	</view>
	<!-- <button class="footer">99999999999</button> -->
	</view>
	
</template>

<script setup>
	import {
		ref,
		defineProps,
		watchEffect,
		onMounted,
		nextTick
	} from 'vue';
	import TipTool from './TipTool.vue';
	const props = defineProps({
		content: String,
		diaryItem: Object
	})
	const emit = defineEmits(['update:content'])
	const content = ref('')
	watchEffect(() => {
		if (props.content) {
			content.value = props.content
		}
	})
	const getContent = () => {
		return content.value
	}
	const changeContent = event => {
		console.log(event)
		content.value = event
		emit('update:content', content.value)
	}

	const cursorPosition = ref(null)
	const easyInput = ref(null)
	const blurFun = (e) =>{
		// onFocus()
		console.log('blur-->',e)
	}
	const onFocus = () => {

		uni.getSelectedTextRange({
			success: res => {
				console.log('getSelectedTextRange res', res.start, res.end)
				cursorPosition.value = res.start
			},
			fail: (err) => {
				console.error('fail:', err)
			},
			complete: res => {
				console.log('complete', res)
			}
		})
	}
	const insertTextAtCursor = (textToInsert) => {
		
		// 插入文本
		const val = content.value.slice(0, cursorPosition.value) + textToInsert + content.value.slice(cursorPosition.value)
		changeContent(val)
	}
	defineExpose({
		getContent
	})
</script>

<style lang="less" scoped>
	@import 'index.less';
</style>