# mydiary
程序员的个人日记，主要使用markdown格式进行书写，也可作为markdown的安卓端编辑器

## 第一版计划
- 支持创建markdown格式的日记，并能保存到本地 （已完成）
- 支持预览markdown格式的日记文档并能重新编辑和保存 （已完成）
- 支持日记按更新时间倒叙展示本地日记列表 （已完成）
- 支持浏览本地文件夹中的其他mark down格式的文件并打开 (已完成)
- 支持其他md文件使用mydiary应用预览 （todo）
- 支持编辑markdown时候可以使用markdown语法快捷导入（todo）

## 使用的技术栈
- uniapp + vue3
- [uni-ui](https://zh.uniapp.dcloud.io/component/uniui/uni-ui.html)
- [markdown-it](https://github.com/markdown-it/markdown-it)

## 预览
![列表页](./md-image/image.png)![预览页](./md-image/image-1.png)![编辑页](./md-image/image-2.png)

issue
支持浏览本地文件夹中的其他mark down格式的文件并打开 (已完成)
安卓10以上的系统使用了分区，不能直接访问其他文件，只能访问download和documents目录下的文件，而且不能获取到详细信息；
读取文件的方案是 先将md文件拷贝到app私域目录下，然后进行读取，如果没有编辑，读取完就删除，如果进行编辑保存，则将文件存放到当前app私域目录下

目前仅在安卓手机端测试通过，其他平台未测试；欢迎其他伙伴参与贡献；也欢迎联系我讨论技术问题
(email: 1243304602@qq.com; weixin: 1243304602)
