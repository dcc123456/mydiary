<template>
	<view class="t-contian">
		<view class="t-left">
			<view @click="backFun">返回</view>
			<template v-if="false">
			<view class="icon-pre">
				<uni-icons type="undo" size="20"></uni-icons>
			</view>
			<view class="icon-next">
				<uni-icons type="undo" size="20"></uni-icons>
			</view>
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
	
	const emit = defineEmits(['saved','back'])
	const saveFun = ()=>{
		emit('saved')
	}
	const backFun = () =>{
		emit('back')
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