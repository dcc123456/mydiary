<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>
<style lang="less">
	@import "./static/css/common.less";
</style>
<style>
	/*每个页面公共css */
	@import "./static/css/bootstrap.css";
	.content{
		padding-top: 100rpx;
		width: 100%;
	}
</style>
