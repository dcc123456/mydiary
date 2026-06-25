# 05 · 风险登记册与缓解措施

> 评分: P = 概率(1-5), I = 影响(1-5), R = P×I (>=15 高风险, 8-14 中, <8 低)

---

## R-01 · web-view 与 uni-app x 的集成不顺 ⚠ 高

| | |
|---|---|
| **P** | 4 |
| **I** | 5 |
| **R** | 20 |
| **现象** | uni-app x 中 `<web-view>` 与原生页面层级关系/事件传递/postMessage 双向通讯可能比 uni-app 限制更严;src 加载本地文件路径写法不同 |
| **触发任务** | T-301 ~ T-303 |
| **预防** | M3 开工前先做 PoC: 一个空白 uni-app x 工程 + 一个 web-view + 一个本地 html,验证 evalJS / postMessage 通路 |
| **缓解** | 若双向通讯不可用,改用 URL 参数单向传入 markdown (`src=...?content=<base64>`);若高度自适应不可用,固定 web-view 高度 + 内部滚动 |
| **回退** | 若 web-view 整体不可用,切换到选项 C (UTSAndroid + Markwon),工作量上升约 3-5 倍 |

## R-02 · uni-ui 组件在 uni-app x 中缺失 ⚠ 中

| | |
|---|---|
| **P** | 3 |
| **I** | 3 |
| **R** | 9 |
| **现象** | `uni-breadcrumb` / `uni-title` 等小众组件可能未适配 |
| **触发任务** | T-501, T-303, T-306 |
| **预防** | 实施前在 [插件市场](https://ext.dcloud.net.cn/) 搜索每个组件 + `uni-app-x` |
| **缓解** | 不存在的组件用基础 `<view>` + flex 自行实现(几十行) |
| **回退** | 无需回退,本地实现即可 |

## R-03 · SQLite/FS API 在 uni-app x 行为差异 ⚠ 中

| | |
|---|---|
| **P** | 3 |
| **I** | 4 |
| **R** | 12 |
| **现象** | SQLite 路径/事务/参数化查询语法可能略有不同;`_doc` 别名可能不再可用 |
| **触发任务** | T-201, T-202 |
| **预防** | T-102 校验时同时跑一个最小 demo: openDatabase + execute + select |
| **缓解** | 路径变化使用 `UTSAndroid.getAppContext().getFilesDir()` 替代;事务包装在 helper 内统一 |
| **回退** | 若 SQLite 不可用,改用纯文件存储 + JSON 索引文件 |

## R-04 · Android 13+ 存储权限模型 ⚠ 中

| | |
|---|---|
| **P** | 3 |
| **I** | 3 |
| **R** | 9 |
| **现象** | API 33+ 要求 `READ_MEDIA_IMAGES` 等细粒度权限,旧的 `READ_EXTERNAL_STORAGE` 不再生效 |
| **触发任务** | T-203, T-505 |
| **预防** | 测试设备覆盖 Android 11 / 13 / 14 |
| **缓解** | 使用 SAF (Storage Access Framework) `ACTION_OPEN_DOCUMENT` 让用户主动选择文件,绕过权限限制 |
| **回退** | 限制 `targetSdkVersion` <= 30(可能引起 Play Store 上架问题,但本项目仅自分发可接受) |

## R-05 · 自维护 markdown-it 库的丢失 ⚠ 高

| | |
|---|---|
| **P** | 2 |
| **I** | 5 |
| **R** | 10 |
| **现象** | `lib/markdown-it/` 是项目独有,删除后无法回头;若 web-view 路线失败,重建成本高 |
| **触发任务** | T-205 |
| **预防** | T-205 不在 M2 真删,延迟到 M5 (T-507) 才删,且先 `git mv lib/markdown-it/ tools/markdown-it-archive/` |
| **缓解** | 保留 backup 分支 + tools 归档目录 |
| **回退** | `git checkout backup/pre-uni-app-x -- lib/markdown-it/` |

## R-06 · UTS 强类型导致 Vue 写法变化 ⚠ 中

| | |
|---|---|
| **P** | 4 |
| **I** | 2 |
| **R** | 8 |
| **现象** | `defineProps<T>()` 泛型写法可能不被支持,需要运行时声明;ref<T> 必须明确类型 |
| **触发任务** | 所有组件改造任务 |
| **预防** | T-105 时即建立一个组件改造模板,所有组件按模板复制 |
| **缓解** | 编译报错时按类型补全;UTS 编译器错误信息一般明确 |
| **回退** | — |

## R-07 · `uni.$on / $emit` 全局事件总线被移除 ⚠ 中

| | |
|---|---|
| **P** | 3 |
| **I** | 3 |
| **R** | 9 |
| **现象** | 部分版本 uni-app x 移除/调整了全局事件 API |
| **触发任务** | T-305 (refresh 事件), T-306 (long-press 删除), T-405 (edit 保存) |
| **预防** | T-102 校验时确认 |
| **缓解** | 用 Pinia store 的 ref 触发 (`store.refreshCounter.value++`) 替代事件总线 |
| **回退** | — |

## R-08 · 编辑器返回拦截 (`addInterceptor`) 失效 ⚠ 低

| | |
|---|---|
| **P** | 3 |
| **I** | 2 |
| **R** | 6 |
| **现象** | uni-app x 可能不支持 `uni.addInterceptor('navigateBack',...)` |
| **触发任务** | T-405 |
| **预防** | 已规划改用 `onBackPress` 替代 (03 §3.7) |
| **缓解** | 同上 |
| **回退** | — |

## R-09 · 启动参数 (md scheme) 接收方式不同 ⚠ 中

| | |
|---|---|
| **P** | 4 |
| **I** | 3 |
| **R** | 12 |
| **现象** | `plus.runtime.arguments` 不可用;新 API 可能在 `onLaunch options.referrerInfo` 或 `uni.getLaunchOptionsSync()` |
| **触发任务** | T-503 |
| **预防** | T-102 校验 |
| **缓解** | 双路径监听:`onLaunch` 拿首次,`onShow` 拿热启动 |
| **回退** | 实在不行可写一个 UTSAndroid 插件读 Activity Intent |

## R-10 · web-view 性能 / 启动延迟 ⚠ 低

| | |
|---|---|
| **P** | 2 |
| **I** | 3 |
| **R** | 6 |
| **现象** | 进入详情页时 web-view 冷启动有几百毫秒延迟 |
| **触发任务** | T-303, T-304 |
| **预防** | 预渲染 / 保持 web-view 实例 |
| **缓解** | 加载 loading 占位 |
| **回退** | — |

## R-11 · Pinia 在 uni-app x 中不可用 ⚠ 低

| | |
|---|---|
| **P** | 2 |
| **I** | 3 |
| **R** | 6 |
| **现象** | Pinia 在 UTS 下无官方版本 |
| **触发任务** | T-104, T-403 |
| **预防** | T-102 校验;若不可用,改用一个 `composables/globalState.uts` 全局 ref 单例 |
| **缓解** | 单例 composable 同样简单 |
| **回退** | — |

## R-12 · Android 多 ABI 打包失败 ⚠ 低

| | |
|---|---|
| **P** | 2 |
| **I** | 3 |
| **R** | 6 |
| **现象** | uni-app x 原生编译对 `x86` ABI 可能不再支持 |
| **触发任务** | T-505 |
| **预防** | T-505 时 `abiFilters` 改为 `["arm64-v8a", "armeabi-v7a"]` |
| **缓解** | 主流真机均为 arm,影响极小 |
| **回退** | — |

---

## 验收清单 (Definition of Done)

迁移结束前,逐项手测勾选:

### 启动
- [ ] 冷启动 < 3s
- [ ] tabBar 三个 tab 切换正常

### 首页 (最近)
- [ ] 显示已有日记列表 (无数据时优雅空态)
- [ ] 下拉刷新
- [ ] 点击进入详情
- [ ] 长按弹删除确认 → 确认后列表刷新

### 创建/编辑
- [ ] 点 tabBar "创建" → 进入编辑器
- [ ] 输入标题
- [ ] 输入内容 (含 markdown 标记)
- [ ] 12 个工具按钮各插入对应 markdown 标记
- [ ] 撤销 / 重做按钮状态正确
- [ ] 点保存 → 提示成功 → 返回首页 → 看到新日记

### 详情
- [ ] markdown 渲染完整 (含代码高亮、tasklist、表格、emoji)
- [ ] 点右下角浮动按钮 → 进入编辑器编辑该日记

### 本地文件
- [ ] 点 tabBar "本地" → 显示 Documents/Download 入口
- [ ] 首次访问触发权限弹窗
- [ ] 进入目录看到 .md 文件
- [ ] 点击文件 → 拷贝到私有目录 → 跳转详情渲染

### 外部启动
- [ ] 从文件管理器选一个 .md → "用 MD 打开" → 应用启动并展示该文件渲染
- [ ] 应用已运行时,同上操作触发热启动并展示

### 编辑器返回
- [ ] 有未保存修改时,返回弹确认框
- [ ] 取消 → 留在编辑器
- [ ] 确认 → 返回上一页(数据未保存)
- [ ] 保存后再返回 → 不弹框,直接返回

### 代码卫生
- [ ] `grep -r "plus\\." pages/ components/ hooks/ stores/ utils/ App.uvue main.uts manifest.json` 无源代码命中
- [ ] `package.json` 不含 `highlight.js`/`entities`/`linkify-it`/`mdurl`/`punycode.js`/`@mdit/plugin-tasklist`
- [ ] `lib/markdown-it/` 已删 (产物在 `static/markdown-render/`)
- [ ] HBuilderX 编译无 error / warning(uni-app x 类型告警可逐个修)

### Git
- [ ] 5 个里程碑 tag 全部存在
- [ ] backup/pre-uni-app-x 分支存在并可 checkout
- [ ] 主分支历史清晰,每个 commit 对应一个 T-xxx 任务
