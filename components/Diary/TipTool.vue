<template>
	<view class="tip-container">
		<!-- 加粗 -->
		<view class="tip-item" @click="tip_B">
			<!-- 使用svg 图标 -->
			 <image src="/static/svg/bold.svg" mode="widthFix" style="width: 40rpx;height: 40rpx;"></image>
		</view>
		<!-- 斜体 -->
		<view class="tip-item" @click="tip_I">
			 <image src="/static/svg/italic.svg" mode="widthFix" style="width: 40rpx;height: 40rpx;"></image>
		</view>
		<!-- 标题 -->
		<view class="tip-item" @click="tip_H">
			 <image src="/static/svg/biaoti.svg" mode="widthFix" style="width: 40rpx;height: 40rpx;"></image>
		</view>
		<!-- 删除 -->
		<view class="tip-item" @click="tip_D">
			 <image src="/static/svg/strike.svg" mode="widthFix" style="width: 40rpx;height: 40rpx;"></image>
		</view>
		<!-- 无序 -->
		<view class="tip-item" @click="tip_unorderedlist">
			 <image src="/static/svg/unorderedlist.svg" mode="widthFix" style="width: 40rpx;height: 40rpx;"></image>
		</view>
		<!-- 有序 -->
		<view class="tip-item" @click="tip_orderedlist">
			 <image src="/static/svg/orderedlist.svg" mode="widthFix" style="width: 40rpx;height: 40rpx;"></image>
		</view>
		<!-- 代办 -->
		<view class="tip-item" @click="tip_todolist">
			 <image src="/static/svg/daibanshixiang.svg" mode="widthFix" style="width: 40rpx;height: 40rpx;"></image>
		</view>
		<!-- 引用 -->
		<view class="tip-item" @click="tip_blockquote">
			 <image src="/static/svg/blockquote.svg" mode="widthFix" style="width: 40rpx;height: 40rpx;"></image>
		</view>
		<!-- 代码块 -->
		<view class="tip-item" @click="tip_code">
			 <image src="/static/svg/code.svg" mode="widthFix" style="width: 40rpx;height: 40rpx;"></image>
		</view>
		<!-- 表格 -->
		<view class="tip-item" @click="tip_table">
			 <image src="/static/svg/table.svg" mode="widthFix" style="width: 40rpx;height: 40rpx;"></image>
		</view>
		<!-- 图片 -->
		<view class="tip-item" @click="tip_image">
			 <image src="/static/svg/image.svg" mode="widthFix" style="width: 40rpx;height: 40rpx;"></image>
		</view>
		<!-- 超链接 -->
		<view class="tip-item" @click="tip_link">
			 <image src="/static/svg/link.svg" mode="widthFix" style="width: 40rpx;height: 40rpx;"></image>
		</view>
	</view>
</template>

<script setup lang="ts">
	const {insertTextAtCursor} = defineProps({insertTextAtCursor:Function})
	const tip_B = () =>{
		insertTextAtCursor('**加粗样式**')
	}
	const tip_I = () =>{
		insertTextAtCursor('*斜体样式*')
	}
	const tip_H = () =>{
		insertTextAtCursor('\n## 标题')
	}
	const tip_D = () =>{
		insertTextAtCursor('~~删除线格式~~ ')
	}
	const tip_unorderedlist = () =>{
		insertTextAtCursor('\n - List item')
	}
	const tip_orderedlist = () =>{
		insertTextAtCursor('\n 1. List item')
	}
	const tip_todolist = () =>{
		insertTextAtCursor('\n- [ ] List item')
	}
	const tip_blockquote = () =>{
		insertTextAtCursor('\n> 这里是引用')
	}
	const tip_code = () =>{
		insertTextAtCursor('```\n在这里插入代码片\n```')
	}
	const tip_table = () =>{
		insertTextAtCursor('\n|表头|表头|表头|\n|-|-|-|\n|单元格|单元格|单元格|\n|单元格|单元格|单元格|\n')
	}
	const tip_link = () =>{
		insertTextAtCursor('\n[链接文字](链接地址)')
	}
	const tip_image = () =>{
		insertTextAtCursor('\n![图片描述](图片地址)')
	}
</script>

<style lang="less" scoped>
	 .tip-container{
		 display: flex;
		 flex-direction: column;
		 justify-content: flex-start;
		 align-items: flex-start;
		 .tip-item{
			 margin: 20rpx 0 0 20rpx;
		 }
	 }      
</style>
