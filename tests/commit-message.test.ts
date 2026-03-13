import { describe, it, expect } from 'vitest';
import { normalizeDraft, parseDraftOrFallback, renderCommitMessage } from '../src/commit/message';

describe('renderCommitMessage', () => {
  it('renders summary + blank line + items list', () => {
    const output = renderCommitMessage({
      summary: '更新核心模块并修复问题',
      items: [
        { type: 'feat', scope: 'core', subject: '新增X模块' },
        { type: 'fix', scope: 'api', subject: '修复Y错误' }
      ]
    });

    expect(output).toBe(
      '更新核心模块并修复问题\n\n' +
      '- feat(core): 新增X模块\n' +
      '- fix(api): 修复Y错误'
    );
  });
});

describe('normalizeDraft', () => {
  it('drops invalid items and trims fields', () => {
    const result = normalizeDraft({
      summary: '  总结  ',
      items: [
        { type: 'feat', scope: 'core', subject: '新增X' },
        { type: 'unknown', scope: 'bad', subject: '忽略' },
        { type: 'fix', scope: '', subject: '缺scope' }
      ]
    });

    expect(result.summary).toBe('总结');
    expect(result.items).toEqual([{ type: 'feat', scope: 'core', subject: '新增X' }]);
  });
});

describe('parseDraftOrFallback', () => {
  it('falls back to single-line when items empty', () => {
    const output = parseDraftOrFallback('{"summary":"总结","items":[]}', 'fallback');
    expect(output).toBe('总结');
  });
});
