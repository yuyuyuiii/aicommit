import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import simpleGit from 'simple-git';
import { getStagedDiff, hasStagedChanges } from '../git/diff';
import { getApiKey, loadConfig } from '../config/store';
import { OpenAIProvider } from '../ai/openai';
import { buildCandidatesPrompt, buildDraftPrompt, buildIntentPrompt, buildReviewPrompt } from '../prompt/agent';
import { parseJsonFromText } from '../utils/json';

interface ReviewResult {
  score: number;
  reasons: string[];
  candidates: string[];
}

export const commitCommand = new Command('commit')
  .description('使用 AI 生成并提交 commit message')
  .action(async () => {
    const spinner = ora();

    if (!(await hasStagedChanges())) {
      spinner.fail('没有暂存区变更，请先执行 "git add"。');
      process.exit(1);
    }

    const diff = await getStagedDiff();
    if (!diff) {
      spinner.fail('没有可提交的变更。');
      process.exit(1);
    }

    const config = loadConfig();
    const apiKey = getApiKey();

    if (!apiKey) {
      if (config.provider === 'openrouter') {
        spinner.fail('请设置 OPENROUTER_API_KEY 环境变量或配置 apiKey。');
      } else {
        spinner.fail('请设置 OPENAI_API_KEY 环境变量或配置 apiKey。');
      }
      process.exit(1);
    }

    const baseURL = config.baseURL || (config.provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : undefined);
    const provider = new OpenAIProvider({
      apiKey,
      model: config.model,
      baseURL
    });

    const reviewPassScore = 4;
    let intentSummary = '';
    let draftMessage = '';
    let review: ReviewResult | null = null;

    try {
      spinner.start('理解变更意图...');
      intentSummary = await provider.generateText(buildIntentPrompt(diff));
      spinner.succeed('意图摘要完成');
      console.log('\n意图摘要：');
      console.log(intentSummary);

      spinner.start('生成提交草案...');
      draftMessage = await provider.generateText(buildDraftPrompt(diff, intentSummary));
      spinner.succeed('草案生成完成');
      console.log('\n提交草案：');
      console.log(draftMessage);

      spinner.start('自检提交信息...');
      const reviewRaw = await provider.generateText(buildReviewPrompt(diff, intentSummary, draftMessage));
      review = parseJsonFromText<ReviewResult>(reviewRaw);
      spinner.succeed('自检完成');
    } catch (error) {
      spinner.fail('生成提交信息失败');
      console.error(error);
      process.exit(1);
    }

    if (!review) {
      console.error('自检结果为空，无法继续。');
      process.exit(1);
    }

    const reasons = Array.isArray(review.reasons) ? review.reasons : [];
    const score = Number.isFinite(review.score) ? review.score : 0;
    let candidates = Array.isArray(review.candidates) ? review.candidates : [];

    if (score < reviewPassScore && candidates.length < 2) {
      try {
        const candidatesRaw = await provider.generateText(
          buildCandidatesPrompt(diff, intentSummary, draftMessage, reasons)
        );
        candidates = parseJsonFromText<string[]>(candidatesRaw);
      } catch (error) {
        console.error('备选提交信息生成失败。');
        console.error(error);
        process.exit(1);
      }
    }

    console.log(`\n自检评分：${score}/5`);
    if (reasons.length > 0) {
      console.log('自检理由：');
      for (const reason of reasons) {
        console.log(`- ${reason}`);
      }
    }

    const choices = [
      { name: `草案（评分 ${score}/5）: ${draftMessage}`, value: draftMessage }
    ];
    for (const candidate of candidates) {
      choices.push({ name: `备选: ${candidate}`, value: candidate });
    }
    choices.push({ name: '取消 - 不提交', value: '__cancel__' });

    const { finalMessage } = await inquirer.prompt([
      {
        type: 'list',
        name: 'finalMessage',
        message: score >= reviewPassScore ? '请选择提交信息：' : '草案未达标，请选择更合适的提交信息：',
        choices
      }
    ]);

    if (finalMessage === '__cancel__') {
      console.log('已取消提交。');
      process.exit(0);
    }

    try {
      spinner.start('执行 git commit...');
      const git = simpleGit();
      await git.commit(finalMessage);
      spinner.succeed('提交完成。');
    } catch (error) {
      spinner.fail('执行 git commit 失败。');
      console.error(error);
      process.exit(1);
    }
  });
