# 01 · 现有代码全景测绘

> 数据源: 实际遍历 `D:\projects\dcc\MDEditor` 源码 (Android-SDK 目录与 unpackage 已排除)
> 测绘日期: 2026-06-25
> 标记: ⚠ = 迁移高风险点

---

## 1. 工程结构

```
D:\projects\dcc\MDEditor\
├─ App.vue                      ← 全局生命周期 + useShowFile() 注入
├─ main.js                      ← Vue3 + Pinia 入口
├─ manifest.json                ← appid / Android 权限 / SQLite 模块 / md scheme
├─ pages.json                   ← 5 页面 + 3 tabBar + uni-ui easycom
├─ package.json                 ← 7 个 npm 依赖
├─ uni.scss                     ← 全局变量
├─ uni.promisify.adaptor.js     ← uni API Promise 化
├─ pages/                       ← 5 个页面 (见 §2)
├─ components/                  ← 6 个业务组件 + 1 个 test
├─ hooks/                       ← 4 个组合式函数 (TS)
├─ stores/                      ← 1 个 Pinia store (TS)
├─ utils/                       ← 工具 + 自维护 markdown 插件
├─ lib/markdown-it/             ← ⚠ 自维护 markdown-it 完整 TS 移植
├─ static/                      ← 静态资源 (svg/css/img)
└─ Android-SDK@.../             ← 离线 SDK,与迁移无关
```

## 2. 页面 (pages/)

| 文件 | 作用 | 生命周期 | 关键调用 |
|---|---|---|---|
| `pages/add/add.vue` | 转发到编辑器 | `onShow` | `uni.navigateTo` |
| `pages/detail/index.vue` | 显示渲染后的 Markdown | `onLoad / onShow / onBeforeUnmount` | `eventChannel`, ⚠ `plus.runtime.arguments` (line 101) |
| `pages/edit/index.vue` | Markdown 编辑器主页 | `onLoad / onShow / onMounted / onBeforeUnmount / onHide` | `uni.hideTabBar`, `uni.addInterceptor('navigateBack')`, `uni.showModal`, `uni.$emit/$once`, `getCurrentPages` |
| `pages/index/index.vue` | 首页 — 日记列表 | `onLoad / onShow / onLaunch / onMounted / onPullDownRefresh` | `uni.authorize`, `uni.$on`, `uni.navigateTo`, `uni.stopPullDownRefresh` |
| `pages/openFile/index.vue` | 文件浏览器 | `onMounted` | ⚠ `plus.os.name`, ⚠ `plus.android.requestPermissions`, ⚠ `plus.android.runtimeMainActivity()` |

## 3. 组件 (components/)

| 组件 | Props | Emits | 关键依赖 | 说明 |
|---|---|---|---|---|
| `Diary/Diary.vue` | `content`, `diaryItem` | `update:content` | `uni-easyinput` | 左编辑区 + 右快捷工具栏;`defineExpose({getContent})` |
| `Diary/TipTool.vue` | `insertTextAtCursor` (Function!) | — | 12 个 `static/svg/*.svg` | ⚠ Function 类型 prop — UTS 严格类型下需改为 emit 模式 |
| `DiaryList/DiaryList.vue` | `list` | `toDetail` | — | 列表 + 长按删除 |
| `Directory/Directory.vue` | — | `selected` | `uni-breadcrumb`, `uni-list`, `utils/files.getDirection` | ⚠ 依赖 `plus.io` 读取 Android 公共目录 |
| `ShowDiary/ShowDiary.vue` | `content` | — | `lib/markdown-it`, `highlight.js`, `@mdit/plugin-tasklist`, `utils/markdown-plugins/*` | ⚠ `v-html` 渲染 — uni-app x 仅 `<rich-text>` 支持有限 HTML |
| `TopTool/TopTool.vue` | `canUndo`, `canRedo` | `saved`, `back`, `undo`, `redo` | `uni-icons` | 编辑器顶栏 |
| `test/test.vue` | — | — | — | 调试页,迁移可删 |

## 4. Hook (hooks/, TypeScript)

| 文件 | 导出 | 依赖 | 说明 |
|---|---|---|---|
| `interface.ts` | `DiaryItem` 接口 | — | `{ id, title, desc, class_name, top, path, created_at, updated_at }` |
| `useDiary.ts` | `useDiary()` → `{ diaryList, getDiaryList, saveMD, deleteDiary }` | `utils/sqlite.js`, `utils/files.ts`, `utils/common.ts` | 数据层桥梁 |
| `useEditOperation.ts` | `useEditOperation()` → `{ undo, redo, saveContent, content, canUndo, canRedo }` | `vue` only | 撤销/重做栈 |
| `useShowFile.ts` | `useShowFile()` (副作用) | `@dcloudio/uni-app` | ⚠ 用 `plus.runtime.arguments` 接收外部文件参数 |

## 5. Store (stores/)

| 文件 | 库 | 状态 | 动作 |
|---|---|---|---|
| `editStore.ts` | Pinia | `diaryContext: Ref<null>` | `setDiaryContext(newVal)` |

⚠ 该 store 保存的是组件实例引用 — UTS 严格类型下需要明确类型(`Ref<DiaryComponentInstance | null>`)。

## 6. 工具 (utils/)

| 文件 | 导出 | 实现 | 风险 |
|---|---|---|---|
| `common.ts` | `timestampToDateTime` | 纯 JS | 无 |
| `files.ts` | `saveFile`, `readFile`, `updateFile`, `deleteFile`, `getDirection`, `copyFile`, `testFileOp` | ⚠ 全部基于 `plus.io.*` | **必须重写** |
| `sqlite.js` | `openDB`, `closeDB`, `executeSQL`, `selectSQL`, `createTbSql`, `dropTable`, `clearTable` | ⚠ 全部基于 `plus.sqlite.*` | **必须重写** |
| `markdown-plugins/index.ts` | 桶导出 | TS | 见下 |
| `markdown-plugins/abbr.ts` | `abbr_plugin` | 纯 TS | 取决于 markdown-it 决策 |
| `markdown-plugins/container.ts` | `container_plugin` | 纯 TS | 同上 |
| `markdown-plugins/deflist.ts` | `deflist_plugin` | 纯 TS | 同上 |
| `markdown-plugins/emoji.ts` | `emoji_plugin` | 纯 TS (含表情表) | 同上 |
| `markdown-plugins/footnote.ts` | `footnote_plugin` | 纯 TS | 同上 |
| `markdown-plugins/ins.ts` | `ins_plugin`, `ins_plugin$1` | 纯 TS | 同上 |
| `markdown-plugins/sub.ts` | `sub_plugin` | 纯 TS | 同上 |
| `markdown-plugins/sup.ts` | `sup_plugin` | 纯 TS | 同上 |

## 7. lib/markdown-it/ ⚠⚠⚠ 头号风险

- **完整移植版** markdown-it (TypeScript 源码) — 含 `index.ts`, `rules_inline/`, `rules_block/`, `common/utils.ts` 等
- 依赖 npm 包: `entities`, `linkify-it`, `mdurl`, `punycode.js`
- 在 `ShowDiary.vue` 与 `test.vue` 中 `import MarkdownIt from '../../lib/markdown-it/index'`
- **UTS 兼容性**:大量动态对象、prototype 操作、字符串处理 — **几乎不可能直接编译为 UTS**

## 8. 第三方依赖 (package.json)

| 包 | 版本 | 用途 | 在 uni-app x 中? |
|---|---|---|---|
| `@dcloudio/uni-ui` | ^1.5.6 | uni-easyinput / uni-icons / uni-list / uni-breadcrumb / uni-title | ⚠ 需用 uni-app x 版本 (校验) |
| `@mdit/plugin-tasklist` | ^0.13.1 | markdown-it 复选框插件 | ⚠ 取决于 markdown-it 决策 |
| `entities` | ^5.0.0 | HTML 实体解码 (markdown-it 内部) | 同上 |
| `highlight.js` | ^11.9.0 | 代码块语法高亮 | ⚠ 纯 JS,无法直接 UTS |
| `linkify-it` | ^5.0.0 | URL 自动识别 (markdown-it 内部) | 同上 |
| `mdurl` | ^2.0.0 | URL 规范化 (markdown-it 内部) | 同上 |
| `punycode.js` | ^2.3.1 | 域名编码 (markdown-it 内部) | 同上 |

## 9. uni.* API 调用清单

| API | 文件:行 | 替代方案 |
|---|---|---|
| `uni.navigateTo` | 5 处 | uni-app x 保留 |
| `uni.switchTab` | edit:131 | uni-app x 保留 |
| `uni.navigateBack` | edit:137 | uni-app x 保留 |
| `uni.addInterceptor` / `removeInterceptor` | edit:70/85/90 | ⚠ uni-app x 拦截器 API 行为可能不同 [需校验] |
| `uni.showToast` | 多处 | uni-app x 保留 |
| `uni.showModal` | edit:107, DiaryList:33 | uni-app x 保留 |
| `uni.hideTabBar` / `showTabBar` | edit:62/84/89 | uni-app x 保留 |
| `uni.authorize` | index:47 | ⚠ uni-app x 权限模型改变 [需校验] |
| `uni.stopPullDownRefresh` | index:88 | uni-app x 保留 |
| `uni.getSelectedTextRange` | Diary:53 | ⚠ uni-app x 中存在性 [需校验] |
| `uni.$on / $once / $emit` | 多处 | ⚠ uni-app x 全局事件总线 API 行为 [需校验] |
| `getCurrentPages()` | edit:125, detail:32 | uni-app x 保留 |
| `getOpenerEventChannel()` | detail | uni-app x 保留 |

## 10. plus.* API 调用清单 (全部需消除)

| API | 文件:行 | 用途 | 替代 |
|---|---|---|---|
| `plus.sqlite.*` | `utils/sqlite.js` (整个文件) | 整套 SQLite | uni-app x 原生 SQLite API / uts-plugin |
| `plus.io.*` | `utils/files.ts` (整个文件) | 文件读写/目录遍历/复制 | `uni.getFileSystemManager()` / UTSAndroid |
| `plus.os.name` | openFile:11, test:34 | 判断 Android | `uni.getSystemInfoSync().platform` |
| `plus.android.requestPermissions` | openFile:14, test:35 | 运行时权限 | `UTSAndroid.requestSystemPermission` [需校验] |
| `plus.android.runtimeMainActivity()` | openFile:27 | 拿 Android Activity | `UTSAndroid.getAppContext()` [需校验] |
| `plus.runtime.arguments` | useShowFile:9, detail:101 | 接收启动文件参数 | uni-app x scheme/intent 启动参数 [需校验] |

## 11. 配置文件

### `manifest.json` 关键字段
- `vueVersion: "3"` ✓
- `app-plus.modules.SQLite: {}` — 迁移后此模块不再适用
- `app-plus.distribute.android.schemes: "md"` — uni-app x 需在新的位置配置
- `app-plus.distribute.android.permissions` — 8 项权限,迁移后需重新声明
- `app-plus.distribute.android.minSdkVersion: 21`,`targetSdkVersion: 35`,`abiFilters: ["armeabi-v7a","arm64-v8a","x86"]`

### `pages.json`
- 5 页面 + 3 tabBar + uni-ui easycom + 2 项权限声明 + 全局自定义导航

### `App.vue`
- `<script setup>` Composition API
- 注入 `useShowFile()` 全局副作用
- 引入 `static/css/common.less` + `static/css/bootstrap.css`

### `main.js`
- 条件编译 `#ifdef VUE3` / `#ifndef VUE3` — uni-app x 入口写法可能不同 [需校验]
- 装载 Pinia

## 12. Vue 用法概览

- **全部使用 `<script setup>`** (`lang="ts"` 或无 lang)
- 仅用 Composition API,无 Options API
- 反应式 API: `ref` (常用), `computed` (1 处), `watch` (导入 1 处), `watchEffect` (5 处)
- `defineProps`, `defineEmits`, `defineExpose` 使用正常
- ⚠ `reactive` 未使用 — UTS 下需注意 ref 的类型推断

---

**测绘结论**: 项目结构清晰、代码规模适中(约 13 个 .vue + 5 个 .ts + 自维护 markdown-it 库),业务功能聚焦。最大迁移负担来自 ① 自维护 markdown-it + 4 个 npm 依赖,② 全部数据层基于 `plus.*`。
