import { onShow, onLoad } from '@dcloudio/uni-app'
const useShowFile = () => {
	onLoad((options) =>{
		console.log('onload--->',options)
	})
  onShow(option => {
    console.log(option)
    // 获取启动参数
    const launchOptions = plus.runtime.arguments
    console.log(launchOptions, 'lau0000000000')
    // uni.getFileSystemManager().readFile({
    //           filePath: plus.runtime.arguments,
    //           encoding: 'utf8',
    //           success: (res) => console.log(res.data),
    //           fail: (err) => console.error(err)
    //         });
    if(plus.runtime.arguments){
      openDetail()
      
    }
  })
  // 使用 base64decode 函数进行解码
  // 解码 Base64 字符串为 UTF-8  
  function base64ToUtf8(base64) {  
      // 检查输入是否为字符串  
      if (typeof base64 !== 'string') {  
          throw new TypeError('Expected input to be a string');  
      }  
  
      // 尝试捕捉可能的解码错误  
      try {  
          // 使用atob解码Base64字符串  
          const binaryString = atob(base64);  
          const binaryLen = binaryString.length;  
          const bytes = new Uint8Array(binaryLen);  
  
          // 将解码后的二进制字符串转为Uint8Array  
          for (let i = 0; i < binaryLen; i++) {  
              bytes[i] = binaryString.charCodeAt(i);  
          }  
  
          // 将Uint8Array转为UTF-8字符串  
          let result = '';  
          for (let i = 0; i < bytes.length; i++) {  
              result += String.fromCharCode(bytes[i]);  
          }  
          
          // Decode the result  
          return decodeURIComponent(escape(result));  
      } catch (error) {  
          console.error('Base64 解码错误:', error);  
          throw new Error('Base64解码失败');  
      }  
  }  
  const openDetail = () => {
    const dccParseurl = uni.requireNativePlugin('dcc_parseurl')
    dccParseurl.testAsyncFunc(
      {
        url: plus.runtime.arguments || ''
      },
      e => {
        console.log('backoption:----->', e)
  
        if (e.code === 'success') {
          const { path, result } = e.data
          console.log('backoption:----->', result)
          // 使用 atob() 进行解码
          try {
            // const file = base64ToUtf8(result)
            const file = result
            console.log('backoption:----->', file)
            uni.navigateTo({
              url: '../detail/index',
              success: function (res) {
                // 通过eventChannel向被打开页面传送数据
                res.eventChannel.emit('acceptDataFromApp', {
                  data: file
                })
              },
              fail: function (err) {
                console.error('跳转失败:', err)
              },
              complete: function () {
                console.log('跳转完成')
              }
            })
          } catch (e) {
            console.error('Base64 解码错误:', e)
            return null
          }
        }
      }
    )
  }
}
export default useShowFile