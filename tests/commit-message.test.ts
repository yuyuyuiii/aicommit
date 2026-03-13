import { describe, it, expect } from 'vitest';
import { renderCommitMessage } from '../src/commit/message';

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
