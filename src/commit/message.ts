export interface CommitItem {
  type: string;
  scope: string;
  subject: string;
}

export interface CommitMessageDraft {
  summary: string;
  items: CommitItem[];
}

export function renderCommitMessage(draft: CommitMessageDraft): string {
  const lines = draft.items.map(item => `- ${item.type}(${item.scope}): ${item.subject}`);
  return `${draft.summary}\n\n${lines.join('\n')}`;
}
