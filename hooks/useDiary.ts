import { ref } from 'vue'
import { createTbSql, executeSQL, selectSQL } from '../utils/sqlite'
import { timestampToDateTime } from '../utils/common'
import { deleteFile, saveFile, updateFile } from '../utils/files'
const useDiary = () => {
  const diaryList = ref([])
  // 获取文件列表
  const getDiaryList = async () => {
    const res = await selectSQL('select * from diary_item order by updated_at desc')
    if (res && res.length) {
      diaryList.value = res
    }
    // 时间戳转换成年月日时分秒
    diaryList.value.forEach(item => {
      item.updated_at = timestampToDateTime(item.updated_at)
    })
    console.log('diaryList.value', diaryList.value)
    return diaryList.value
  }

  // 保存到手机文件夹中，md格式
  const saveMD = async (diaryItem: DiaryItem, content: string, title?: string, className?: string, top?: 0 | 1) => {
    // 不是编辑则新建
    if (!diaryItem) {
      const res = await saveFile(content)
      if (res.path) {
        const param = {
          title: title ?? content.slice(0, 10),
          desc: content.slice(0, 10),
          class_name: className ?? '全部',
          path: res.path,
          top: top ? 1 : 0 // 0 不置顶，1置顶
        }
		console.log('insert params:',param)
        await insertFun(param)
      }
    }
    // 编辑则更新
    if (diaryItem) {
      const path = diaryItem.path?.replace('file://', '')
      if (!path) {
        console.error('文件路径为空！')
        return
      }
      const updateFileRes = await updateFile(path, content)
      const param = {
        title: title ?? content.slice(0, 10),
        desc: content.slice(0, 10),
        class_name: className ?? '全部',
        top: top ? 1 : 0, // 0 不置顶，1置顶
        path: diaryItem.path,
      }
      // sqlite更新
      try {
        const sql = `UPDATE diary_item SET title = '${param.title}', desc = '${param.desc}', class_name = '${param.class_name}', top = ${
          param.top
        }, updated_at=${new Date().getTime()} WHERE id = ${diaryItem.id}`
        const res = await executeSQL(sql, false)
      } catch (e) {
        console.error(e)
      }
    }
  }

  const insertFun = async param => {
    // 判断sqlite是否存在表diary_item
    const res = await selectSQL('select name from sqlite_master where type=\'table\' and name=\'diary_item\';')
    // if (res.rows.length === 0) {
      // 不存在则创建
      await createTbSql("diary_item", "id integer primary key, title text,desc text,class_name text default '全部',path text,top int(2), created_at datetime default current_timestamp, updated_at datetime default current_timestamp");

    // }

    await executeSQL(
      `insert into diary_item(title,desc,class_name,path,top,created_at,updated_at) values(
			'${param.title}',
			'${param.desc}',
			'${param.class_name}',
			'${param.path}',
			${param.top},
			${new Date().getTime()},${new Date().getTime()})`,
      false
    )
  }

  // 删除日记
  const deleteDiary = async (diaryItem: DiaryItem) => {
    if(!diaryItem){
      console.log('deleteDiary error')
      return;
    }
    if(diaryItem.id){
      const res = await executeSQL(`delete from diary_item where id=${diaryItem.id}`, false)
      console.log('deleteDiary', res)
    }
    if(diaryItem.path){
      const fileRes = await deleteFile(diaryItem.path);
      console.log('deleteFile', fileRes)
    }
    console.log('diaryItem',diaryItem)
  }
  return {
    diaryList,
    getDiaryList,
    saveMD,
    deleteDiary
  }
}
export default useDiary
