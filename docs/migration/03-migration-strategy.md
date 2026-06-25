# 03 · 迁移策略

> 策略类型: **In-place rewrite** (原地重写)
> 目标平台: Android (App-Android)
> 渲染方案: **选项 A — web-view 渲染 markdown**

---

## 1. 总体路线

```
原仓库 ─┬─► 备份分支 backup/pre-uni-app-x  (保留 plus.* 时代代码)
         │
         └─► main 分支 (本次工作)
              ├─► M1 骨架 (manifest/main/pages.json + 空 .uvue 页面)
              ├─► M2 数据层 (sqlite.uts + files.uts)
              ├─► M3 渲染层 (web-view + 本地 HTML markdown 渲染器)
              ├─► M4 编辑器 (Diary 组件 + 撤销/重做)
              └─► M5 文件浏览 + 启动参数 + 权限
                  └─► 验收并合并
```

每个 M 完成后 commit,保证任何时点都可回退。

## 2. 目录结构对照

### Before (uni-app)
```
App.vue                  pages/<x>/<x>.vue
main.js                  components/<x>/<x>.vue
manifest.json            hooks/<x>.ts
pages.json               utils/<x>.ts | .js
                         lib/markdown-it/...
```

### After (uni-app x) [需根据官方模板微调]
```
App.uvue                 pages/<x>/<x>.uvue
main.uts                 components/<x>/<x>.uvue
manifest.json            hooks/<x>.uts
pages.json               utils/<x>.uts
                         static/markdown-render/      ← web-view 内 HTML/JS/CSS
                         lib/                          ← 删除整个 lib/markdown-it/
```

## 3. 关键技术决策

### 3.1 Markdown 渲染 — web-view 方案

**新目录**: `static/markdown-render/`
```
static/markdown-render/
├─ index.html          ← 容器页面
├─ markdown-it.min.js  ← 从原 lib/markdown-it 编译/打包的产物 (一次性)
├─ highlight.min.js    ← highlight.js 浏览器版
├─ github.min.css      ← 高亮主题
└─ render.js           ← postMessage 桥接 + 渲染逻辑
```

**ShowDiary.vue 改写思路**:
```vue
<template>
  <web-view
    src="/static/markdown-render/index.html"
    @message="onMsg"
    ref="wv"
  />
</template>
<script setup lang="uts">
const props = defineProps({ content: { type: String, default: "" } })
const wv = ref<UniWebViewElement | null>(null)
// 内容通过 src URL hash 或 onMessage 双向通讯
watch(() => props.content, c => {
  // 重新加载或调用 web-view evalJS
})
</script>
```

**桥接合约**:
- 父 → 子: 通过 `web-view` 的 `evalJS` (uni-app x [需校验]) 或 URL hash 传入 markdown 源文
- 子 → 父: `uni.postMessage({type:'rendered', height: 1234})` 通知渲染完成与高度

### 3.2 SQLite 重写

`utils/sqlite.uts` 新签名:
```ts
// 全部改为 Promise / async-await,移除回调地狱
export async function openDB(): Promise<void>
export async function executeSQL(sql: string): Promise<void>
export async function selectSQL(sql: string): Promise<Array<UTSJSONObject>>
export async function createTbSql(): Promise<void>
```

DB 路径策略保持: 数据库名 `mydiary`,位置由 uni-app x 决定(通常是 app 私有目录)。
表结构保持: `diary_item(id, title, desc, class_name, path, top, created_at, updated_at)`。

### 3.3 文件 IO 重写

`utils/files.uts` 新签名:
```ts
export async function saveFile(name: string, content: string): Promise<string>  // 返回路径
export async function readFile(path: string): Promise<string>
export async function updateFile(path: string, content: string): Promise<void>
export async function deleteFile(path: string): Promise<void>
export async function listMdFiles(dir: string): Promise<Array<FileInfo>>
export async function copyFile(src: string, dst: string): Promise<void>
```

- 私有目录:`uni.getFileSystemManager()` + `_doc/mydiary/list` 同名路径(uni-app x 内置 `_doc` 别名应可用 [需校验])
- 公共目录:`/storage/emulated/0/Documents` 与 `Download` 仍可访问,但需要 Android 13+ 的 `READ_MEDIA_*` 权限调整 [需校验]

### 3.4 权限请求

新 helper `utils/permissions.uts`:
```ts
import { UTSAndroid } from '...'
export async function requestStoragePermissions(): Promise<boolean> {
  return new Promise(resolve => {
    UTSAndroid.requestSystemPermission(
      UTSAndroid.getUniActivity(),
      ['android.permission.READ_EXTERNAL_STORAGE',
       'android.permission.WRITE_EXTERNAL_STORAGE'],
      (allGranted, grantedList) => resolve(allGranted),
      (doNotAskAgain, deniedList) => resolve(false)
    )
  })
}
```

### 3.5 启动参数 (md scheme)

替换 `plus.runtime.arguments` 与 `useShowFile`:
```ts
// hooks/useShowFile.uts
export default function useShowFile() {
  onLaunch((options: OnLaunchOptions) => {
    const path = parseSchemeUrl(options.query?.path ?? "")
    if (path != null) navigateToDetail(path)
  })
  onShow((options: OnShowOptions) => {
    // 同上
  })
}
```
[需校验] uni-app x 中获取 scheme 启动 URL 的官方写法。

### 3.6 Pinia store 重构

`stores/editStore.uts`:
```ts
// 不再存组件实例 ref (UTS 强类型 + 解耦)
// 改为:存"待保存"标志,由组件订阅
export const useEditStore = defineStore('edit', () => {
  const dirty = ref<boolean>(false)
  const pendingTitle = ref<string>('')
  const pendingContent = ref<string>('')
  function markDirty(title: string, content: string) {
    dirty.value = true
    pendingTitle.value = title
    pendingContent.value = content
  }
  function flush() {
    dirty.value = false
    pendingTitle.value = ''
    pendingContent.value = ''
  }
  return { dirty, pendingTitle, pendingContent, markDirty, flush }
})
```

### 3.7 编辑器返回拦截

原 `uni.addInterceptor('navigateBack', ...)` 改为页面 `onBackPress`:
```ts
// pages/edit/index.uvue
onBackPress((event: OnBackPressOptions) => {
  if (editStore.dirty) {
    uni.showModal({
      title: '提示',
      content: '内容未保存,确认离开?',
      success: r => { if (r.confirm) uni.navigateBack() }
    })
    return true  // 阻止默认返回
  }
  return false
})
```

### 3.8 TipTool 解耦 Function prop

原: `<TipTool :insertTextAtCursor="insertAtCursor"/>`
改:
```vue
<TipTool @insert="onInsert"/>
```
TipTool 内部对每个按钮 `emit('insert', '**', '**')` 之类的事件,父组件统一在 `Diary.vue` 处理插入。

### 3.9 v-html → web-view

`ShowDiary.vue` 完全切换到 web-view(见 §3.1)。

`DiaryList.vue` 中 `desc` 字段如果有富文本,目前是纯文本展示(仅 `{{item.desc}}`),无需改动。

## 4. 依赖清单变更

### 移除
- `@mdit/plugin-tasklist`
- `entities`
- `highlight.js`
- `linkify-it`
- `mdurl`
- `punycode.js`
- 整个 `lib/markdown-it/` 目录

### 保留 (考察)
- `@dcloudio/uni-ui` — 改用 uni-app x 兼容版本 (插件市场重装)

### 新增
- 静态资源 `static/markdown-render/markdown-it.min.js` 等 (从原 lib 一次性 build)
- 可能需要 `markdown-it` 浏览器 UMD 版本 (CDN 或本地 build)

### `package.json` 目标形态 (示意)
```json
{
  "name": "mydiary",
  "version": "1.0.0",
  "dependencies": {}
}
```
所有运行时依赖均通过 HBuilderX 或 uni-app x 插件市场拉取,npm `dependencies` 趋近于空。

## 5. 资产准备:web-view 端的 markdown 渲染器

一次性脚本(本仓库外执行,产物 commit 到 `static/markdown-render/`):
```bash
# 在临时 vite 工程
npm i markdown-it @mdit/plugin-tasklist highlight.js
# 写一个 main.js:
#   import md from 'markdown-it'; import hljs from 'highlight.js'
#   import { tasklist } from '@mdit/plugin-tasklist'
#   const m = md({ highlight: (str, lang) => ... }).use(tasklist)
#   window.addEventListener('message', e => {
#     document.getElementById('out').innerHTML = m.render(e.data.markdown)
#   })
# 用 vite build --lib 或 esbuild --bundle 出单文件
```

> 注意: 也可以保留 `lib/markdown-it/` 但**不再放主工程**,而是放在 `tools/markdown-render-src/`,只把产物 .js 文件部署到 `static/`。

## 6. 不动的部分

- `static/svg/*.svg` (TipTool 图标)
- `static/css/*.less / *.css`
- `static/img/*`
- `utils/common.ts` (改名 `.uts` 即可)
- `hooks/useEditOperation.ts` (改名,纯 Vue API)
- `hooks/interface.ts` (改名,纯类型)
- `components/Diary/TipTool.vue` 的模板与图标 (改 Function prop 那行)
- `components/TopTool/TopTool.vue` 基本不动
- `components/DiaryList/DiaryList.vue` 基本不动
- `pages/add/add.vue` 基本不动

## 7. 风险与回退

每个里程碑(M1–M5)结束打 git tag:`migration-m1` … `migration-m5`。
任何里程碑验收不通过,可:
- `git checkout migration-m<n-1>` 回到上一个稳定点
- 或 `git checkout backup/pre-uni-app-x` 完全回滚

详见 `05-risks-and-mitigations.md`。
