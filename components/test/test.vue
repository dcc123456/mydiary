<template>
	<view style="display: flex;height: 80vh;flex-direction: column;">
		<textarea class="diary-textarea" v-model="content" @input="renderMD()" :maxlength="-1"></textarea>
		<button type="default" @click="saveMD">保存</button>
		<button type="default" @click="testFun">测试</button>
		<button type="default" @click="createDb">数据库</button>
		<button type="default" @click="insertFun">插入数据库</button>
		<button type="default" @click="selectFun">查询数据库</button>
		<button type="default" @click="readFileFun">读取文件</button>
		<button type="default" @click="writeFile">更新文件</button>
		<button type="default" @click="deleteFileFun">删除文件</button>

	</view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import MarkdownIt from "../../lib/index"
import { deleteFile, readFile, saveFile, testFileOp, updateFile } from "../../utils/files";
import { openDB, closeDB, executeSQL, createTbSql, selectSQL, clearTable, dropTable } from "../../utils/sqlite";
// import { onLaunch } from '@dcloudio/uni-app';
	const content = ref("5555");
	const md = MarkdownIt()
	const result = ref();
	const renderMD = () =>{
		result.value = md.render(content.value);
	}
	const getContent = () =>{
		return content.value;
	}


	onMounted(() => {
  if (plus.os.name === 'Android') {
    plus.android.requestPermissions(['android.permission.READ_EXTERNAL_STORAGE', 'android.permission.WRITE_EXTERNAL_STORAGE'], (result) => {
      if (result && result['android.permission.READ_EXTERNAL_STORAGE'] === 'granted' && result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted') {
        console.log('权限已授予');
      } else {
        console.error('权限未授予');
      }
    });
  }
});

	// 保存到手机文件夹中，md格式
	const saveMD = async() =>{
		const res = await saveFile(content.value)
		if(res.path){
			const param = {
				title: content.value.slice(0, 10),
				desc: content.value.slice(0, 10),
				class_name: "全部",
				path: res.path,
				top: 0, // 0 不置顶，1置顶
			}
			insertFun(param)
		}
		console.log(res)
	}

	const testFun = ()=>{
		testFileOp();
	}
	const createDb = async () =>{
		await dropTable("diary_item");
		const res = await createTbSql("diary_item", "id integer primary key, title text,desc text,class_name text default '全部',path text,top int(2), created_at datetime default current_timestamp, updated_at datetime default current_timestamp");
		console.log(res);
	}

	const insertFun = async (param) =>{
		const res = await executeSQL(
			`insert into diary_item(title,desc,class_name,path,top,created_at,updated_at) values(
			'${param.title}',
			'${param.desc}',
			'${param.class_name}',
			'${param.path}',
			${param.top},
			${new Date().getTime()},${new Date().getTime()})`,false);
		console.log(res);
	}
	const selectFun = async () =>{
		const res = await selectSQL("select * from diary_item order by updated_at desc");
		console.log(res)
	}

	const path = "/storage/emulated/0/Android/data/io.dcloud.HBuilder/apps/HBuilder/doc/mydiary/list/mydiary-日记-1729585389336.md";
	const readFileFun = async () =>{
		const res = await readFile(path)
		console.log(res)
	}

	const writeFile = async () =>{
		const res = await updateFile(path,'666666');
		console.log(res)
	}

	const deleteFileFun = async () =>{
		const res = await deleteFile(path);
		console.log(res)
	}
	defineExpose({
		getContent
	})
	
</script>

<style lang="less">
@import "index.less";
</style>