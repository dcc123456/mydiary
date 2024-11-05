<template>
	<view class="t-contian">
		<view class="t-left">
			<view @click="backFun">返回</view>
			<view :class="['icon-pre']">
				<uni-icons type="undo" size="20" :color="canUndo ? '#000':'#ccc'" @click="undoFun"></uni-icons>
			</view>
			<view :class="['icon-next']">
				<uni-icons type="undo" size="20" :color="canRedo ? '#000':'#ccc'" @click="redoFun"></uni-icons>
			</view>
			<template v-if="false">
			<view>
				<uni-icons type="bars" size="20"></uni-icons>
			</view>
			</template>
		</view>
		<view class="t-right">
			<view v-if="false">
				语法说明
			</view>
			<view @click="saveFun">
				保存
			</view>
		</view>
		
	</view>
</template>

<script lang="ts" setup>
	const {canUndo,canRedo} = defineProps({
		canUndo:Boolean,
		canRedo:Boolean
	})
	const emit = defineEmits(['saved','back','undo','redo'])
	const saveFun = ()=>{
		emit('saved')
	}
	const backFun = () =>{
		emit('back')
	}
	const undoFun = ()=>{
		emit('undo')
	}
	const redoFun = ()=>{
		emit('redo')
	}

</script>

<style lang="less">
.t-contian{
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 60rpx;
	border-bottom: 1px solid #ccc;
	padding: 0 20rpx;
	font-size: 36rpx;
	.t-left{
		display: flex;
		justify-content: flex-start;
		margin-right: 30rpx;
		.icon-next{
			transform: rotateY(180deg);
		}
		.icon-pre,.icon-next{
			margin: 0 20rpx;
		}
		.icon-pre,.icon-next .disabled{
			color: #ccc;
			cursor: not-allowed;
		}
	}
	
	.t-right{
		display: flex;
		justify-content: flex-end;
		view{
			margin-right: 30rpx;
		}
	}
}
</style>