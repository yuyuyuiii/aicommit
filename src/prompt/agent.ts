const BASE_SYSTEM_PROMPT_ZH = `你是一个专业的 Git 提交助手。`;

export interface PromptResult {
  system: string;
  user: string;
}

export function buildIntentPrompt(diff: string): PromptResult {
  return {
    system: BASE_SYSTEM_PROMPT_ZH,
    user: `请从以下 diff 推断作者的修改意图，并输出简短结构化摘要。\n\n要求：\n- 使用中文\n- 4 行以内\n- 每行以固定前缀开头：\n  目的：...\n  影响模块：...\n  关键变更：...\n  风险/注意：...\n- 如果没有明显风险，写“风险/注意：无”\n\ndiff:\n\`\`\`\n${diff}\n\`\`\``
  };
}

export function buildDraftPrompt(diff: string, intentSummary: string): PromptResult {
  return {
    system: BASE_SYSTEM_PROMPT_ZH,
    user: `你将基于 diff 与意图摘要生成一条提交信息。\n\n要求：\n- 使用中文\n- 格式: type(scope): subject\n- type: feat/fix/docs/style/refactor/test/chore/perf/build/ci/revert 等\n- 简洁明了\n- 只输出提交信息，不要解释\n\n意图摘要：\n${intentSummary}\n\ndiff:\n\`\`\`\n${diff}\n\`\`\``
  };
}

export function buildReviewPrompt(diff: string, intentSummary: string, draftMessage: string): PromptResult {
  return {
    system: BASE_SYSTEM_PROMPT_ZH,
    user: `请审查提交信息是否准确描述代码变更并符合意图摘要。\n\n输出 JSON，禁止添加多余文字：\n{\n  "score": 1-5,\n  "reasons": ["原因1", "原因2"],\n  "candidates": ["备选1", "备选2", "备选3"]\n}\n\n规则：\n- score >= 4 表示通过\n- 如果 score < 4，必须给出 2-3 个备选；如果 score >= 4，candidates 允许为空数组\n- 备选必须彼此有差异（不同 scope/不同关注点/更具体或更保守）\n\n意图摘要：\n${intentSummary}\n\n草案提交信息：\n${draftMessage}\n\ndiff:\n\`\`\`\n${diff}\n\`\`\``
  };
}

export function buildCandidatesPrompt(diff: string, intentSummary: string, draftMessage: string, reasons: string[]): PromptResult {
  return {
    system: BASE_SYSTEM_PROMPT_ZH,
    user: `草案提交信息未达标，请生成 2-3 个备选提交信息。\n\n要求：\n- 使用中文\n- 格式: type(scope): subject\n- 备选必须彼此有差异\n- 只输出 JSON 数组，例如：["...", "..."]\n\n不达标原因：\n- ${reasons.join('\n- ')}\n\n意图摘要：\n${intentSummary}\n\n草案提交信息：\n${draftMessage}\n\ndiff:\n\`\`\`\n${diff}\n\`\`\``
  };
}
