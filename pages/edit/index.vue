<template>
  <view class="content">
	<TopTool @saved="saveFun" @back="backFun"></TopTool>
    <view class="title-class">
      <uni-easyinput
        class="title-input-class"
        :inputBorder="false"
        v-model="title"
        :styles="styles"
		:adjust-position="false"
        :placeholderStyle="placeholderStyle"
        placeholder="请输入标题"></uni-easyinput>
    </view>
    <Diary
      ref="diaryRef"
      :content="content"
      :diaryItem="diaryItem"></Diary>
  </view>
</template>

<script setup>
import { ref, watchEffect, onBeforeUnmount,watch, onMounted } from 'vue'
import { onLoad,onHide,onShow,onBackPress } from '@dcloudio/uni-app'
import { readFile } from '../../utils/files'
import useDiary from '../../hooks/useDiary'
const placeholderStyle = 'color:#999;font-size:16px;text-align: center;'
const styles = {
  color: '#000',
  fontSize: '16px',
  textAlign: 'center',
  borderBottom: '1px solid #f0eded',
}
const initDiaryContent = ref(null); // 保存初始化日记内容，用来比较判断有没有更新
const diaryRef = ref(null)
const content = ref('')
const diaryItem = ref(null)
const title = ref('')
const { saveMD } = useDiary()
const eventChannel = ref(null)
const addPage = "pages/add/add";
onLoad(option => {
  console.log(option)
  
})
// watch(diaryRef, (newVal) => {
//   if (newVal) {
//     console.log('Child component instance:', newVal);
// 	diaryRef.value = newVal;
	
//   }
// });
onShow(() =>{
	uni.hideTabBar()
	uni.$once('acceptDataFromDetail', function (data) {
	  if (data && data.data) {
	    diaryItem.value = data.data
	  }
	})
	
	uni.addInterceptor('navigateBack', {
	invoke(args) {
		  console.log('拦截成功。',args,args.from,args?.from === 'backbutton')
		  if(args?.from === 'backbutton'){
			  // backFun(diaryRef);
			  return false
		  }else{
			  return true
		  }
	}
	})
})
onMounted(() => {
	
})
onBeforeUnmount(() => {
  uni.showTabBar()
  uni.removeInterceptor('navigateBack')
})

onHide(() =>{
	uni.showTabBar()
	uni.removeInterceptor('navigateBack')
})
const saveFun = () =>{
	const res = diaryRef.value?.getContent()
	if(!res) return;
	console.log('title::::', title.value)
	content.value = res
	initDiaryContent.value = res
	saveMD(diaryItem.value, content.value, title.value).then(() => {
	  uni.$emit('refreshDiaryList', { data: true })
	})
}
const backFun = (diaryRefOption) =>{
	const res = diaryRef.value?.getContent()
	console.log('back:',res,diaryRef,diaryRefOption)
	if(res && res != initDiaryContent.value){
		uni.showModal({
			title: '内容尚未保存，是否保存？',
			success: function (res) {
				if (res.confirm) {
					saveFun()
					goBack()
				} else if (res.cancel) {
					console.log('用户点击取消');
					goBack()
				}
			}
		})
	}else{
		goBack()
	}
	// isBack && goBack()
	
}
const goBack =() =>{
	const pages = getCurrentPages();
	if(pages.length > 1){
		const page = pages[pages.length - 2]
		console.log(page.route, addPage ,page.route === addPage)
		if(page.route === addPage){ // 如果是编辑页，则返回到首页
			uni.switchTab({
				url: '/pages/index/index'
			})
			return;
		}
	}
	uni.navigateBack()
}

// onBackPress((option) =>{
// 	// backFun();
// 	// console.log('pags::',pages.length,option)
// 	Object.keys(option).forEach(key => console.log(key,option[key]))
// 	if(option.from === 'backbutton'){
// 		backFun()
// 	return true;
// 	}
// })
watchEffect(() => {
  if (diaryItem.value) {
    title.value = diaryItem.value.title
    readFileFun(diaryItem.value.path)
      .then(res => {
        content.value = res
		initDiaryContent.value = res
      })
      .catch(err => {
        console.log(err)
      })
  }
})

const readFileFun = async path => {
  const res = await readFile(path)
  return res
}
</script>
<style scoped lang="less">
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.title-class {
  width: 100%;
  margin-bottom: 20rpx;
  .title-input-class{
	border-bottom: 1px solid #f0eded; 
	text-align: center;
	/deep/ .uni-easyinput__content-input{
		font-size: 36rpx;
	}
  }
  .is-input-border {
    border-style: none;
    border: 2px solid #ba2828 !important;
  }
}
.uni-easyinput__content-input {
  border: 1px solid #4caf50 !important; /* 修改边框颜色和宽度 */
  border-radius: 8px; /* 修改边框圆角 */
}
</style>
