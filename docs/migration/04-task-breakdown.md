# 04 · 任务拆解

> 共 5 个里程碑 (M1–M5),32 个原子任务。每个任务自包含,有明确的"做什么"与"验收"。
> 实施顺序: 按 ID 顺序;同一 M 内可并行的标注 ‖。

---

## 里程碑 M1 — 项目骨架就绪

> 目标: 创建 uni-app x 工程结构,空跑出 tabBar 三个 tab。

### T-101 · 备份当前代码
- **做什么**: 在 `main` 上创建分支 `backup/pre-uni-app-x` 并推送;然后回到 `main` 继续工作。
- **验收**: `git branch -a` 看到备份分支。

### T-102 · 阅读 uni-app x 官方迁移指南并校验 02-research 的 13 个待校验项
- **做什么**: 打开 https://doc.dcloud.net.cn/uni-app-x/,逐项核对 `02-uni-app-x-research.md` §13,把答案写回该文件,移除 `[需校验]` 标记。
- **验收**: 02 文档无 `[需校验]` 残留;若发现与本计划冲突的事实,**先停下**回到 03 修正策略。

### T-103 · 修改 `manifest.json` 切换到 uni-app x 模式
- **做什么**: 在 `manifest.json` 顶部加 `"uni-app-x": {}` 节点(以官方模板为准),把 `app-plus` 节点改为新格式 (`app` 或保留;依官方),删除 `SQLite` 模块声明。
- **验收**: HBuilderX 打开项目,识别为 uni-app x 项目;不报 manifest 语法错。

### T-104 · 改写 `main.js` → `main.uts`
- **做什么**: 删除 `#ifndef VUE3` 分支,只留 Vue 3 创建逻辑,改 `import App from './App.uvue'`;装载 Pinia (uni-app x 兼容写法)。
- **验收**: 编译不报入口错误。

### T-105 · 改写 `App.vue` → `App.uvue` ‖
- **做什么**: 后缀改名;`<script setup>` 加 `lang="uts"`;`useShowFile()` 调用先注释掉(M5 再恢复);保留 less / css 引入。
- **验收**: 编译通过。

### T-106 · 改写 `pages.json` ‖
- **做什么**: 保留 5 个页面与 tabBar 结构;**移除 `easycom`**(uni-app x 不支持);页面 `path` 中的文件后缀保持(无需写后缀);权限节点按 uni-app x 规范调整。
- **验收**: 编译通过,启动后 tabBar 三个 tab 渲染。

### T-107 · 把 5 个页面 `.vue` 改为 `.uvue` 并清空内容,只保留最简模板 ‖
- **做什么**: 每个页面只保留 `<template><view>页面名</view></template>` 与空 `<script setup lang="uts">`。
- **验收**: HBuilderX 编译 → Android 模拟器 → 看到 3 个 tab 可切换、显示对应页面名。

**M1 验收门**: `git tag migration-m1` — 三 tab 可切,无崩溃。

---

## 里程碑 M2 — 数据层就绪

> 目标: SQLite + 文件 IO 两个 utils 完全用 uni-app x API 实现。

### T-201 · 编写 `utils/sqlite.uts`
- **做什么**: 按 `03-migration-strategy.md` §3.2 的签名实现 `openDB/closeDB/executeSQL/selectSQL/createTbSql/dropTable/clearTable`,使用 uni-app x 内置 SQLite API。
- **依赖**: T-102 已确认 SQLite API
- **验收**: 一个临时测试页面能 create + insert + select 一条记录。

### T-202 · 编写 `utils/files.uts`
- **做什么**: 实现 `saveFile/readFile/updateFile/deleteFile/listMdFiles/copyFile`,基于 `uni.getFileSystemManager()` + `UTSAndroid`。文件存放路径继续用 `_doc/mydiary/list`。
- **依赖**: T-102 已确认 FS API
- **验收**: 临时页面能写文件 → 读文件 → 列目录 → 删文件。

### T-203 · 编写 `utils/permissions.uts` ‖
- **做什么**: 实现 `requestStoragePermissions()`,封装 `UTSAndroid.requestSystemPermission`。
- **依赖**: T-102 已确认权限 API
- **验收**: 临时按钮触发,系统弹出权限对话框,允许后回调返回 true。

### T-204 · 改名 `utils/common.ts` → `utils/common.uts` ‖
- **做什么**: 改后缀,补类型注解(`function timestampToDateTime(t: number): string`)。
- **验收**: 编译通过。

### T-205 · 删除 `utils/markdown-plugins/` 与 `lib/markdown-it/`
- **做什么**: `git rm -r utils/markdown-plugins/ lib/markdown-it/`(确认 M3 已规划好替代再删)。
- **验收**: 项目编译无引用残留。

### T-206 · 改写 `hooks/useDiary.ts` → `hooks/useDiary.uts`
- **做什么**: 改后缀;改成 `async/await` 调用 sqlite.uts 与 files.uts;补类型;导出 `useDiary(): { diaryList: Ref<Array<DiaryItem>>, getDiaryList, saveMD, deleteDiary }`。
- **依赖**: T-201, T-202
- **验收**: 一个临时页面能调用 `useDiary().getDiaryList()` 拿到数组(空数组也算 OK)。

### T-207 · 改名 `hooks/interface.ts` → `hooks/interface.uts` ‖
- **做什么**: 改后缀;`DiaryItem` 字段加完整类型。
- **验收**: 在 useDiary.uts 中 import 不报错。

### T-208 · 改名 `hooks/useEditOperation.ts` → `hooks/useEditOperation.uts` ‖
- **做什么**: 改后缀;`history`/`future` 用 `Array<string>` 显式类型。
- **验收**: 在临时页面 import 不报错。

**M2 验收门**: `git tag migration-m2` — 数据层全部就绪,临时手测脚本走通。

---

## 里程碑 M3 — 渲染层就绪

> 目标: web-view 渲染 markdown,ShowDiary 组件可用。

### T-301 · 构建 web-view 端 markdown 渲染器
- **做什么**: 在仓库外或 `tools/markdown-render-src/` 创建临时 vite/esbuild 工程,集成 `markdown-it` + `@mdit/plugin-tasklist` + `highlight.js` + 原 `utils/markdown-plugins/` 的全部插件源码(从 git 历史 cherry-pick 回 tools 目录,不放主源)。Build 出单文件 JS。
- **验收**: 浏览器中打开测试 html,粘贴 markdown 能正确渲染含代码高亮、表格、tasklist 等。

### T-302 · 部署到 `static/markdown-render/`
- **做什么**: 把 T-301 产物 + `index.html` + `github.min.css` 放入 `static/markdown-render/`。`index.html` 实现 `window.addEventListener('message', ...)` 接收 markdown 字符串并 `innerHTML` 渲染结果到容器。
- **验收**: 临时 web-view 页能加载 HTML 并看到默认渲染示例。

### T-303 · 改写 `components/ShowDiary/ShowDiary.uvue`
- **做什么**: 模板用 `<web-view src="/static/markdown-render/index.html" />`;通过 `evalJS` (或 url hash) 将 `props.content` 传入;watch 内容变化重新触发。
- **依赖**: T-302
- **验收**: 详情页传入一段含代码块的 markdown,web-view 内渲染并显示。

### T-304 · 改写 `pages/detail/index.uvue`
- **做什么**: 后缀改名;`<ShowDiary>` 显式 import;移除 `plus.runtime.arguments` (M5 处理);保留 eventChannel 接收 diaryItem 并 readFile。
- **依赖**: T-303, T-206
- **验收**: 从列表点击进入详情,显示完整 markdown 渲染结果。

### T-305 · 改写 `pages/index/index.uvue`
- **做什么**: 后缀改名;`<DiaryList>` 显式 import;`onLoad/onShow/onPullDownRefresh` 调 `useDiary().getDiaryList()`;`uni.$on` 监听刷新事件保留。
- **依赖**: T-206
- **验收**: 首页能展示日记列表(如果数据库有数据则有内容,否则空状态)。

### T-306 · 改写 `components/DiaryList/DiaryList.uvue` ‖
- **做什么**: 后缀改名;`defineProps({list:{type: Array<DiaryItem>, default: () => []}})`;`defineEmits(['toDetail'])`;长按删除走 `uni.showModal` + `uni.$emit('refresh')`。
- **验收**: 在首页中渲染数据;长按出确认弹窗。

**M3 验收门**: `git tag migration-m3` — 首页 → 详情链路打通,markdown 渲染正常。

---

## 里程碑 M4 — 编辑器就绪

> 目标: 创建/编辑日记 + 撤销/重做 + 保存 全部走通。

### T-401 · 改写 `components/Diary/TipTool.uvue` (解耦 Function prop)
- **做什么**: 删 `insertTextAtCursor` prop;每个按钮 `emit('insert', before: string, after: string)`(例如粗体按钮 `emit('insert','**','**')`)。
- **验收**: 编译通过。

### T-402 · 改写 `components/Diary/Diary.uvue`
- **做什么**: 后缀改名;模板里改 `<TipTool @insert="onInsert"/>`;在 `onInsert` 中调用原 `insertAtCursor` 逻辑;`defineExpose({getContent})` 改为通过 emit('update:content') 主动通讯,删 `getCurrentInstance`。
- **依赖**: T-401
- **验收**: 编辑区可输入;点 12 个工具按钮各能正确插入对应 markdown 标记。

### T-403 · 改写 `stores/editStore.uts`
- **做什么**: 按 `03-migration-strategy.md` §3.6 改造为纯数据存储 (`dirty/pendingTitle/pendingContent`)。
- **验收**: 在临时按钮中调用 `markDirty/flush` 状态正确变化。

### T-404 · 改写 `components/TopTool/TopTool.uvue` ‖
- **做什么**: 后缀改名;props/emits 显式类型。
- **验收**: 渲染保存按钮、撤销/重做按钮、返回按钮各能 emit 事件。

### T-405 · 改写 `pages/edit/index.uvue`
- **做什么**: 后缀改名;显式 import 子组件;`useEditOperation` 接入;`useDiary.saveMD` 接入;返回拦截改为 `onBackPress`(见 03 §3.7);`uni.hideTabBar/showTabBar` 调用保留。
- **依赖**: T-402, T-403, T-404
- **验收**: 创建一条新日记 → 输入标题 → 编辑内容 → 撤销/重做工作 → 点保存 → 数据库与文件都已落盘 → 返回首页能看到新日记。

### T-406 · 改写 `pages/add/add.uvue` ‖
- **做什么**: 后缀改名;`onShow` 中 `uni.navigateTo` 到编辑器。
- **验收**: 点击 tabBar 的"创建"能跳转编辑器。

**M4 验收门**: `git tag migration-m4` — 完整创建 → 编辑 → 保存 → 列表展示链路通过。

---

## 里程碑 M5 — 文件浏览 / 外部打开 / 权限

> 目标: 三个收尾业务功能上线。

### T-501 · 改写 `components/Directory/Directory.uvue`
- **做什么**: 后缀改名;`uni-breadcrumb` 若 uni-app x 无适配版,手写一个 flex 面包屑(参考 02 §6);`uni-list` 改 uni-app x 兼容版;调用 `files.uts.listMdFiles`;`emit('selected', filePath)`。
- **依赖**: T-202
- **验收**: 打开"本地"tab → 看到 Documents/Download 入口 → 点入能看到 .md 文件列表。

### T-502 · 改写 `pages/openFile/index.uvue`
- **做什么**: 后缀改名;`onMounted` 中调 `requestStoragePermissions()`;选中后 `files.uts.copyFile` 拷到私有目录 → `uni.navigateTo` 到详情 + eventChannel 传 diaryItem。
- **依赖**: T-203, T-501
- **验收**: 选一个外部 .md 文件 → 详情页能渲染。

### T-503 · 改写 `hooks/useShowFile.uts` (外部 scheme 启动)
- **做什么**: 后缀改名;改用 uni-app x 启动参数 API(`onLaunch/onShow` options 中的 scheme 数据)替代 `plus.runtime.arguments`;Base64 解码逻辑保留。
- **依赖**: T-102 已确认 scheme 启动 API
- **验收**: 从其他文件管理器选"用 MD 打开"一个 .md 文件 → 应用启动后能跳详情渲染。

### T-504 · 在 `App.uvue` 中恢复 `useShowFile()` 调用
- **做什么**: 取消 T-105 时的注释。
- **验收**: 同 T-503。

### T-505 · `manifest.json` 重新声明 Android 权限与 md scheme
- **做什么**: 按 uni-app x 格式声明 8 项 Android 权限 + `schemes: "md"` + minSdk/targetSdk/abiFilters。
- **验收**: 安装到真机后,自启动权限弹窗;能被识别为 .md 文件处理者。

### T-506 · 删除 `components/test/test.vue` (调试页清理) ‖
- **做什么**: `git rm`。
- **验收**: 引用已无。

### T-507 · 清理 `package.json`
- **做什么**: 移除 `@mdit/plugin-tasklist`/`entities`/`highlight.js`/`linkify-it`/`mdurl`/`punycode.js`;`@dcloudio/uni-ui` 改为 uni-app x 兼容版本号或移除(若用插件市场拉取);执行 `npm install` 验证。
- **验收**: `node_modules` 重新生成无报错;`grep -r "from 'highlight.js'"` 等无源码命中。

### T-508 · 清理过期注释与导入
- **做什么**: 全局 `grep "plus\\."` 应只在文档与历史中存在,源代码无;移除 `uni.promisify.adaptor.js`(uni-app x API 默认 Promise/异步)。
- **验收**: `grep "plus\\."` 在 `pages/`/`components/`/`hooks/`/`stores/`/`utils/` 无任何命中。

**M5 验收门**: `git tag migration-m5` — 全部业务清单通过。

---

## 完整任务速查表

| ID | 任务 | 依赖 | 可并行 |
|---|---|---|---|
| T-101 | 备份分支 | — | — |
| T-102 | 校验官方文档 | T-101 | — |
| T-103 | manifest 切换 | T-102 | — |
| T-104 | main.uts | T-103 | — |
| T-105 | App.uvue | T-103 | ‖ T-104 |
| T-106 | pages.json | T-103 | ‖ T-104 |
| T-107 | 页面占位 | T-106 | ‖ T-105 |
| T-201 | sqlite.uts | T-102 | — |
| T-202 | files.uts | T-102 | — |
| T-203 | permissions.uts | T-102 | ‖ T-201/T-202 |
| T-204 | common.uts | — | ‖ |
| T-205 | 删除 markdown lib | — | — |
| T-206 | useDiary.uts | T-201,T-202 | — |
| T-207 | interface.uts | — | ‖ |
| T-208 | useEditOperation.uts | — | ‖ |
| T-301 | 构建 web 渲染器 | — | — |
| T-302 | 部署到 static | T-301 | — |
| T-303 | ShowDiary.uvue | T-302 | — |
| T-304 | detail.uvue | T-303,T-206 | — |
| T-305 | index.uvue | T-206 | — |
| T-306 | DiaryList.uvue | — | ‖ T-305 |
| T-401 | TipTool emit 化 | — | — |
| T-402 | Diary.uvue | T-401 | — |
| T-403 | editStore.uts | — | ‖ |
| T-404 | TopTool.uvue | — | ‖ |
| T-405 | edit.uvue | T-402,T-403,T-404 | — |
| T-406 | add.uvue | — | ‖ |
| T-501 | Directory.uvue | T-202 | — |
| T-502 | openFile.uvue | T-203,T-501 | — |
| T-503 | useShowFile.uts | T-102 | — |
| T-504 | 恢复 App.uvue 注入 | T-503 | — |
| T-505 | manifest 权限/scheme | — | ‖ |
| T-506 | 删 test.vue | — | ‖ |
| T-507 | package.json 清理 | T-205,T-303 | — |
| T-508 | grep 验证 | T-507 | — |
