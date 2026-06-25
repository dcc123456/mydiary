# MDEditor 迁移至 uni-app x 计划文档

> 项目: **mydiary (MD)** — 移动端 Markdown 文档预览/编辑应用
> 当前栈: uni-app + Vue 3 + TypeScript + Pinia + 5+App (Android)
> 目标栈: **uni-app x (UTS + Vue 3, 纯原生)**
> 策略: **In-place rewrite** (原地重写)
> 创建日期: 2026-06-25

---

## 文档索引

| # | 文档 | 目的 |
|---|---|---|
| 00 | [00-overview.md](./00-overview.md) | 总览：目标、范围、约束、成功标准 |
| 01 | [01-codebase-map.md](./01-codebase-map.md) | 现有代码全景:页面/组件/Hook/Store/工具/依赖/API 调用 |
| 02 | [02-uni-app-x-research.md](./02-uni-app-x-research.md) | uni-app x 关键差异:UTS 语言、API 替换、生态兼容性 |
| 03 | [03-migration-strategy.md](./03-migration-strategy.md) | 迁移总策略:目录结构、依赖替换、关键技术决策 |
| 04 | [04-task-breakdown.md](./04-task-breakdown.md) | 任务拆解:5 个里程碑,共约 30 个原子任务,可独立执行 |
| 05 | [05-risks-and-mitigations.md](./05-risks-and-mitigations.md) | 风险登记册与缓解措施(含回退方案) |

---

## 快速开始

1. 阅读 **00-overview.md** 了解迁移目标
2. 阅读 **02-uni-app-x-research.md** 理解关键差异(尤其是 markdown-it/SQLite/plus API)
3. 阅读 **04-task-breakdown.md** 按任务执行
4. 每完成一个里程碑,对照 **05-risks-and-mitigations.md** 验收

---

## 协作角色

| 阶段 | 团队 | 职责 |
|---|---|---|
| 分析 | Deconstructors | 代码全景测绘 (已完成,见 01) |
| 规划 | Renaissance | 迁移策略制定 (已完成,见 03) |
| 文档 | Cascade | 文档结构化与任务原子化 (本目录) |
| 实施 | Code Vanguard | 按 04 执行 |
| 验证 | DeepBlue Bastion | 编译/运行/无回归验证 |

---

## 重要提示

- 由于工具环境无法访问 `https://doc.dcloud.net.cn/uni-app-x/`,本文档中所有标注 **[需校验]** 的条目请实施前对照 uni-app x 官方最新文档核实。
- 原项目所有 `plus.*` 调用必须移除或重写 — 这是 uni-app x 的硬性约束。
- 自维护的 `lib/markdown-it/` (TypeScript 版 markdown-it 全量移植) 是本次迁移的最大风险点,详见 02 与 05。
