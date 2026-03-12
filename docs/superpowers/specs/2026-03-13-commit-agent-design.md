# Commit Agent 设计说明

## 背景与目标
当前 `aicommit` 是生成提交信息的 CLI。目标是升级为“真正的 agent”流水线：
1) 理解代码变化
2) 规划 commit
3) 自动生成 message
4) 校验 message 是否准确描述变化且符合作者意图
5) 若不达标给出理由与 2-3 个备选
6) 用户选择后直接执行 `git commit -m`

约束：
- 意图仅从 `git diff` 推断，不引入额外交互输入。
- 不做代码质量检查（lint/test/format 等均不执行）。
- 保持 CLI 单进程与现有模块化风格。

成功标准：
- 从 `git add` 到 `aicommit commit` 全流程无需手动运行 `git commit`。
- 输出具备可解释性（自检理由）。
- 未达标时稳定输出 2-3 个备选并可选择。

## 总体架构
新增三个核心单元并保持边界清晰：
- Intent 模块：从 diff 产出“意图摘要”。
- Planner/Generator：基于 diff + 意图摘要生成草案 commit。
- Reviewer：自检草案与 diff/意图摘要的一致性，给出评分与理由；必要时生成备选。

数据流：
`diff -> intent -> draft -> review -> (pass? draft : candidates) -> user选择 -> git commit`

## 组件设计

### 1. Diff 获取（现有）
- 职责：读取 staged diff，判断是否有暂存变更。
- 输出：`diff: string`。

### 2. Intent 模块（新增）
- 职责：从 diff 推断修改目的、范围、关键变化点。
- 输出：简短结构化文本（例如：
  - 目的：…
  - 影响模块：…
  - 关键变更：…
  - 风险/注意：…
 ）。
- 约束：长度受控，便于后续提示复用。

### 3. Planner / Generator（调整）
- 职责：基于 diff + 意图摘要生成 commit 草案（conventional commits）。
- 输出：单条 commit message（`type(scope): subject`）。

### 4. Reviewer（新增）
- 职责：
  - 将草案与 diff/意图摘要对照评分（1-5）。
  - 给出不达标理由（缺少范围、误判意图、遗漏关键变更等）。
  - 不达标时生成 2-3 个备选，要求彼此有差异。
- 通过阈值：默认评分 >=4 视为达标。

### 5. CLI 交互（调整）
- 输出意图摘要、草案、评分与理由。
- 未达标时显示 2-3 备选并让用户选择（仍可选择草案）。
- 用户确认后直接执行 `git commit -m`。

## 提示词设计
采用三段提示序列：
1) Intent Prompt：只生成意图摘要（结构化、短）。
2) Draft Prompt：输入 diff + 意图摘要，生成 commit 草案。
3) Review Prompt：输入 diff + 意图摘要 + 草案，输出评分、理由、备选（如需）。

输出格式必须可解析（例如用显式字段或分隔符），以支持 CLI 展示与选择。

## 数据流与状态
- 输入：staged diff。
- 中间状态：`intentSummary`, `draftMessage`, `reviewScore`, `reviewReasons`, `candidates[]`。
- 输出：最终 commit message。

## 错误处理
- 无暂存变更：提示并退出（非 0）。
- diff 为空或过大：提示并退出或建议拆分提交。
- 模型调用失败：打印错误并退出，不执行提交。
- 用户取消：不执行提交。
- `git commit` 失败：打印 git 错误并返回非 0。

## 测试策略
- Mock AI Provider：覆盖 intent/draft/review 三段调用。
- 关键用例：
  - 无暂存变更
  - 自检达标直接使用草案
  - 自检未达标生成 2-3 备选
  - 用户选择候选后执行 `git commit -m`

## 非目标
- 不做代码质量检查（lint/test/format）。
- 不引入外部上下文来源（PR/issue/手写意图）。
- 不做多模型投票或复杂裁判。

## 迁移与兼容
- 保留 `aicommit commit` 命令。
- 默认行为升级为 agent 流水线，用户交互更丰富但不破坏既有命令入口。
