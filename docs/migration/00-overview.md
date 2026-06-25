# 00 · 总览

## 项目身份

| 字段 | 值 |
|---|---|
| 应用名称 | MD (mydiary) |
| AppID | `__UNI__7055921` |
| 包名 | `com.your.md.name` |
| 版本 | 1.0.0 (versionCode 100) |
| 平台 | Android (5+App / app-plus) |
| Vue | 3 (manifest `vueVersion: "3"`) |
| 入口 | `main.js` → `App.vue` → `pages/index/index.vue` |

## 业务功能(必须保留)

1. **本地 Markdown 日记 CRUD** — SQLite + 文件双轨存储
2. **Markdown 编辑器** — 12 个快捷插入按钮(粗体/斜体/标题/引用/代码块/表格/图片/链接 等)
3. **Markdown 渲染** — 自定义 markdown-it 实例,支持 footnote/container/abbr/deflist/emoji/ins/sub/sup/tasklist + highlight.js 语法高亮
4. **文件浏览器** — 浏览 `/storage/emulated/0/Documents` 与 `Download` 下的 `.md` 文件
5. **外部文件打开** — 注册 `md` URL scheme,从其他应用打开 `.md` 文件
6. **撤销/重做** — 编辑器历史栈
7. **下拉刷新** — 首页
8. **底部 tabBar** — "最近 / 创建 / 本地" 三个 tab

## 迁移目标

| 目标 | 度量 |
|---|---|
| 迁移到 uni-app x | 项目可在 uni-app x 模式下编译通过 |
| 移除全部 `plus.*` | `grep "plus\\."` 无项目源命中 |
| 保留全部 8 项业务功能 | 手工验收清单全通过 |
| Android 包可运行 | HBuilderX/CLI 打 apk 安装到真机不闪退 |
| 不退化性能 | 启动时间、列表滚动、保存延迟与原版可感知一致 |

## 非目标(本次不做)

- iOS 平台适配(uni-app x iOS 与 Android 行为差异较大,本次仅保 Android)
- H5/小程序适配(原项目即仅 Android,无需考虑)
- 新增业务功能
- UI 重设计

## 关键约束

- **In-place 重写**:在当前仓库内直接重写,不创建并行项目。每次重写一组,可用 Git 回退。
- **不可使用 `plus.*`**:uni-app x 不存在 5+App runtime。
- **谨慎使用 npm 包**:UTS 编译时,纯 JS 包大多无法直接使用;TS 写法的包可能可编译;原生能力需用 UTS 插件包装。
- **保留 Pinia**:uni-app x 支持 Pinia(校验:见 02-research)。
- **保留 `<script setup>`**:uni-app x 支持 Vue 3 `<script setup lang="uts">`。

## 成功标准(Definition of Done)

- [ ] `manifest.json` 顶部 `"uni-app-x": {}` 配置已添加,IDE 识别为 uni-app x 项目
- [ ] 所有 `.vue` 文件 `<script setup lang="uts">`(或纯 TS 的 hooks 改为 `.uts`)
- [ ] `utils/sqlite.js` → `utils/sqlite.uts`,使用 uni-app x 原生 SQLite API
- [ ] `utils/files.ts` → `utils/files.uts`,使用 `uni.getFileSystemManager()` 或 `UTSAndroid`
- [ ] `plus.runtime.arguments` → uni-app x 原生 schemes/launch options
- [ ] `plus.android.requestPermissions` → `UTSAndroid.requestSystemPermission`
- [ ] `lib/markdown-it/` 决策落地(三选一:UTS 重写 / web-view / 原生插件)
- [ ] `package.json` 仅保留 uni-app x 兼容依赖
- [ ] Android 真机:启动、列表、新建、编辑、保存、查看、删除、打开外部 .md、撤销/重做 全部正常
- [ ] 文档 00–05 全部完成且与代码一致

## 推荐推进节奏

| 阶段 | 输出 | 验收门 |
|---|---|---|
| M1 项目骨架就绪 | uni-app x 工程能空跑出 tabBar | HBuilderX 编译成功,启动不闪退 |
| M2 数据层就绪 | sqlite + files 全用 uni-app x API | 单元手测:建库/插入/查询/读文件/写文件 OK |
| M3 渲染层就绪 | Markdown 渲染方案落地 | 详情页能展示带高亮的 markdown |
| M4 编辑器就绪 | 编辑/撤销/重做/保存 OK | 创建+编辑+保存一条日记走通 |
| M5 全功能集成 | 文件浏览/外部打开/权限 OK | 全部业务清单通过 |
