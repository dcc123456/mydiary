# 02 · uni-app x 关键差异与生态兼容性研究

> 信息源: 训练知识 + DCloud 官方 (`https://doc.dcloud.net.cn/uni-app-x/`)。
> 本次工具环境无法在线访问官网,**所有标注 [需校验] 项请实施前对照官方最新文档复核**。

---

## 1. 概念差异

| 项 | uni-app | uni-app x |
|---|---|---|
| 语言 | JS / TS | **UTS** (Unified TypeScript) |
| 编译目标 (App) | JS bundle → WebView + V8/JsCore 运行 | **直接编译为 Kotlin (Android) / Swift (iOS) 原生代码** |
| 渲染层 | WebView (默认) / nvue (weex) | **完全原生**,无 WebView |
| Vue 版本 | 2 / 3 (二选一) | **仅 Vue 3** |
| 运行时 | 含 V8 / WKWebView | 不含 JS 引擎(App 端) |
| 类型 | 弱(JS)/可选强(TS) | **强类型,空安全,无 any 滥用** |
| 5+App API (`plus.*`) | 全量支持 | **完全移除** |

## 2. UTS 语言要点

- 语法上是 TypeScript 的子集 + 部分增强
- **强制类型**: 函数参数、返回值、变量声明需明确类型
- **空安全**: 类似 Kotlin 的 `T?` (可空) 与 `T` (非空) 区分
- **无 `any` 滥用**: `UTSJSONObject` / `Map` / `Array<T>` 替代裸 object
- **代码可与原生 Kotlin/Swift 互操作**: 通过 uts-plugin 写原生代码
- 文件扩展名:
  - 普通脚本/Hook: `.uts`
  - 组件 script: `<script setup lang="uts">`

## 3. plus.* → uni-app x 替代映射 [需校验]

| 原 API | uni-app x 替代 | 备注 |
|---|---|---|
| `plus.sqlite.openDatabase` | `uni.openDatabase()` / `UTSSQLite` API | uni-app x 内置 SQLite,API 已 Promise/Sync 化 |
| `plus.sqlite.executeSql` | `uni.executeSql()` / 同上 | — |
| `plus.sqlite.selectSql` | `uni.selectSql()` / 同上 | 返回 `Array<UTSJSONObject>` |
| `plus.io.requestFileSystem` | `uni.getFileSystemManager()` | uni-app x 已实现部分能力 |
| `plus.io.FileReader` | `getFileSystemManager().readFile({})` | 异步回调或 Promise |
| `plus.io.FileWriter` | `getFileSystemManager().writeFile({})` | 同上 |
| `plus.io.resolveLocalFileSystemURL` | `getFileSystemManager()` 同步系列 + UTSAndroid.getResourcePath | 部分场景需要 UTSAndroid |
| `plus.os.name` | `uni.getSystemInfoSync().osName` 或 `"android"` 字面量 | uni-app x App-Android 编译目标已知是 Android |
| `plus.android.requestPermissions` | `UTSAndroid.requestSystemPermission(context, permissions, granted, denied)` | UTSAndroid 是 uni-app x 内置 Android 互操作对象 |
| `plus.android.runtimeMainActivity` | `UTSAndroid.getUniActivity()` | — |
| `plus.runtime.arguments` | `onLaunch` / `onShow` 的 `options` 参数中包含 scheme 启动信息 | 也可通过 `uni.getLaunchOptionsSync()` |

## 4. npm 包兼容性

- **核心规则**: uni-app x 的 npm 包必须能转换为 UTS。纯 JS 字符串/数组操作的库**有时**可以工作,但**几乎所有依赖 `prototype` 改造、动态 require、Node 内置模块**的库不能工作。
- 本项目所用 7 个包的预判:

| 包 | 预判 | 处理 |
|---|---|---|
| `@dcloudio/uni-ui` | ⚠ 部分支持 | 改用 uni-app x 版组件库;可能需逐个换成 [`uni-app-x` 内置 ui 组件](https://ext.dcloud.net.cn/) [需校验] |
| `@mdit/plugin-tasklist` | ✗ 强依赖 markdown-it | 若放弃 markdown-it 路线则一并放弃 |
| `entities` | ⚠ 纯字符串处理库 | 若有 UTS 替代或可移植,否则放弃 |
| `highlight.js` | ✗ 纯 JS,体量大,prototype 操作多 | **放弃**,改用 CSS 类标记 + 简化高亮 / 或 web-view 方案 |
| `linkify-it` | ⚠ 字符串处理库 | 取决于 markdown-it 决策 |
| `mdurl` | ⚠ 字符串处理库 | 同上 |
| `punycode.js` | ⚠ 字符串处理库 | 同上 |

## 5. Markdown 渲染:三选一决策矩阵

由于 `lib/markdown-it/` + `highlight.js` 在 UTS 下基本不可用,必须做架构选择:

### 选项 A: 用 `<web-view>` 渲染
- 在 `static/markdown-render.html` 内放完整 markdown-it + highlight.js
- ShowDiary.vue 改为加载 `web-view`,通过 `postMessage` 把 markdown 内容传过去
- **优点**: 渲染保真度最高、保留全部插件、改动最小
- **缺点**: uni-app x 中 `<web-view>` 是原生 WebView 控件,与页面其它原生元素层级关系需测试;启动稍慢

### 选项 B: 用 `<rich-text>` + 纯 UTS Markdown 解析器
- 在 UTS 中重写一个极简 markdown 解析器,输出 `<rich-text>` 节点数组
- 牺牲 footnote/container/deflist 等高级插件,仅保留 heading/bold/italic/list/code/link/image
- **优点**: 纯原生、性能最好
- **缺点**: 工作量极大,且功能退化

### 选项 C: 写 UTS 插件包装原生 Markdown 库
- Android 端用 [Markwon](https://noties.io/Markwon/) 等 Java 库,封装 UTS 插件
- **优点**: 原生性能 + 完整 markdown 支持
- **缺点**: 需要写 UTS 插件 + Kotlin/Java 封装,门槛高

### 推荐: **选项 A** (web-view)
理由: 项目核心价值是 markdown 渲染,任何功能退化都伤害体验;选项 A 改动小、可控、最快交付。后续若性能不达标,再演进到选项 C。

详见 `03-migration-strategy.md` §3。

## 6. uni-ui 在 uni-app x 中的状态 [需校验]

| 原组件 | uni-app x 中状态 |
|---|---|
| `uni-easyinput` | 应已适配 |
| `uni-icons` | 应已适配 |
| `uni-list` / `uni-list-item` | 应已适配 |
| `uni-title` | 应已适配 |
| `uni-breadcrumb` / `uni-breadcrumb-item` | **可能未适配** |

校验方法: 在 [uni-app x 插件市场](https://ext.dcloud.net.cn/) 搜索每个组件 + 关键词 "uni-app-x"。
若 `uni-breadcrumb` 未适配,需在 `Directory.vue` 中手写一个简单面包屑(几行 flex 布局即可)。

## 7. Pinia 支持 [需校验]

- 据 DCloud 公告,uni-app x **支持 Pinia**(以 UTS 版本提供),但 `editStore` 中保存组件实例 ref 的写法可能因强类型需要调整。
- 建议把"保存组件 ref 用于跨页面调用"重构为:
  - 用全局事件 (`uni.$emit`) 触发保存,而非直接调用 ref 方法
  - 这样 store 状态退化为纯数据,无强类型问题

## 8. Vue 3 在 UTS 下的注意点

| 项 | 注意 |
|---|---|
| `<script setup lang="uts">` | 推荐,强制类型 |
| `defineProps<{ x: string }>()` | UTS 中可能要求**运行时声明** `defineProps({x: {type: String}})` [需校验] |
| `defineEmits` | 同上,需声明事件名数组 |
| `Function` 类型 prop | UTS 中应避免,改用 emit |
| `ref<T>(initial)` | 必须显式类型 |
| `reactive` | UTS 仅支持反应式对象,建议优先用 `ref` |
| `v-html` | **uni-app x 中 v-html 仅在特定组件支持**;一般用 `<rich-text :nodes="">` 或 `<web-view>` |
| `watch` / `watchEffect` | 支持,但回调参数需要类型 |
| `provide` / `inject` | 支持,需类型化 key |
| `getCurrentInstance` | uni-app x **不建议使用**,改用 props/emits/store |

## 9. 路由与生命周期

- 页面级 `onLoad / onShow / onReady / onHide / onUnload / onPullDownRefresh / onReachBottom / onBackPress` 均保留
- 应用级 `onLaunch / onShow / onHide` 保留
- `uni.navigateTo({url, events: {...}, success: r => r.eventChannel.emit(...)})` 写法保留
- ⚠ `uni.addInterceptor('navigateBack', ...)` 在 uni-app x 中的支持状态 [需校验] — 若不支持,改用页面 `onBackPress(event) { return true }` 拦截

## 10. 入口与 main 文件

- uni-app x 推荐入口为 `main.uts`(或保持 `main.js`,内容简化)
- Pinia 装载方式 [需校验]:
  ```ts
  import { createSSRApp } from 'vue'
  import { createPinia } from 'pinia'
  import App from './App.uvue'
  export function createApp() {
    const app = createSSRApp(App)
    app.use(createPinia())
    return { app }
  }
  ```
- `.vue` → `.uvue` 文件后缀建议改 (uni-app x 默认页面文件后缀)

## 11. manifest.json 顶部新字段

```jsonc
{
  "appid": "__UNI__7055921",
  "uni-app-x": {
    // 启用 uni-app x 模式
  },
  "app": {
    // 替代原 "app-plus"
    "distribute": {
      "android": {
        "permissions": [...],
        "schemes": "md",
        // ...
      }
    }
  }
}
```
[需校验] 具体字段名称与 uni-app 不同,以 HBuilderX 新建项目模板为准。

## 12. pages.json 兼容性

- 大部分字段保留:`pages[].path`, `pages[].style`, `tabBar`, `globalStyle`
- `easycom` **不可用**(因为 uni-app x 组件按强类型导入)— 所有组件改为显式 `import`
- `permissions` 字段在 uni-app x 中位置可能改变 [需校验]

---

## 13. 待官方文档核实的 13 个问题

下列条目在实施前请打开 https://doc.dcloud.net.cn/uni-app-x/ 核实:

1. SQLite API 的最终签名与位置 (`uni.openDatabase` vs 其它命名)
2. `uni.getFileSystemManager()` 在 App-Android 端支持的方法清单
3. `UTSAndroid.requestSystemPermission` 的完整签名
4. 外部文件启动参数获取方式
5. `uni-easyinput`/`uni-icons`/`uni-list`/`uni-breadcrumb`/`uni-title` 在 uni-app x 是否可用
6. Pinia 在 uni-app x 的官方支持状态与示例
7. `uni.addInterceptor('navigateBack', ...)` 是否被 `onBackPress` 取代
8. `uni.authorize(scope:'userInfo')` 在 uni-app x 中的等价用法
9. `uni.getSelectedTextRange` 是否仍存在
10. `uni.$on/$emit/$once` 全局事件总线是否仍可用
11. `v-html` / `rich-text` / `web-view` 在 uni-app x 的渲染规则
12. `manifest.json` 是否需新增 `"uni-app-x": {}` 节点
13. 页面文件后缀(`.vue` vs `.uvue`)

---

**研究结论**: 迁移**技术可行**,但**Markdown 渲染**与**自定义 markdown-it 库**是最大障碍。推荐选项 A(web-view)路线落地最快、风险最低。
