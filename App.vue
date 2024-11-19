<script setup>
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import useShowFile from './hooks/useShowFile'
useShowFile()
onLaunch(option => {
	console.log('App Launch', option)
	// registerReceiver()
})
onShow(option => {
	console.log('App onShow', option)
	// registerReceiver()
})
onHide(option => {
	console.log('App onHide', option)
	// registerReceiver()
})
</script>
<style lang="less">
@import './static/css/common.less';
</style>
<style>
/*每个页面公共css */
@import './static/css/bootstrap.css';

.content {
	padding-top: 100rpx;
	width: 100%;
}
</style>
