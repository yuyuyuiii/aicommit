export interface CommitItem {
  type: string;
  scope: string;
  subject: string;
}

export interface CommitMessageDraft {
  summary: string;
  items: CommitItem[];
}

const ALLOWED_TYPES = new Set([
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'test',
  'chore',
  'perf',
  'build',
  'ci',
  'revert'
]);

export function renderCommitMessage(draft: CommitMessageDraft): string {
  const lines = draft.items.map(item => `- ${item.type}(${item.scope}): ${item.subject}`);
  return `${draft.summary}\n\n${lines.join('\n')}`;
}

export function normalizeDraft(input: CommitMessageDraft): CommitMessageDraft {
  const summary = (input.summary || '').trim();
  const items = (input.items || [])
    .map(item => ({
      type: (item.type || '').trim(),
      scope: (item.scope || '').trim(),
      subject: (item.subject || '').trim()
    }))
    .filter(item => ALLOWED_TYPES.has(item.type) && item.scope && item.subject)
    .filter(
      (item, index, list) =>
        list.findIndex(
          other =>
            other.type === item.type &&
            other.scope === item.scope &&
            other.subject === item.subject
        ) === index
    );

  return { summary, items };
}
