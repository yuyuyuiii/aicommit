const SYSTEM_PROMPT_ZH = `你是一个专业的 Git 提交助手。

请分析以下代码变更，生成符合 conventional commits 格式的提交描述。

要求：
- type: feat/fix/docs/style/refactor/test/chore/perf/build/ci/revert 等
- 使用中文
- 简洁明了
- 格式: type(scope): subject

可选的 type 含义：
- feat: 新功能
- fix: 修复 bug
- docs: 文档变更
- style: 代码格式（不影响功能）
- refactor: 重构
- test: 测试相关
- chore: 构建过程或辅助工具变动
- perf: 性能优化
- build: 构建系统或外部依赖变更
- ci: CI 配置文件和脚本变更

请直接输出提交描述，不要有其他解释。`;

export interface PromptResult {
  system: string;
  user: string;
}

export function buildPrompt(diff: string): PromptResult {
  return {
    system: SYSTEM_PROMPT_ZH,
    user: `以下是代码变更的 diff:\n\`\`\`\n${diff}\n\`\`\``
  };
}
