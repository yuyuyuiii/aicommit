import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import { getStagedDiff, hasStagedChanges } from '../git/diff';
import { getApiKey, loadConfig } from '../config/store';
import { OpenAIProvider } from '../ai/openai';
import { buildPrompt } from '../prompt/build';

export const commitCommand = new Command('commit')
  .description('Generate commit message with AI')
  .action(async () => {
    const spinner = ora();
    
    if (!(await hasStagedChanges())) {
      spinner.fail('No staged changes. Please run "git add" first.');
      process.exit(1);
    }

    const diff = await getStagedDiff();
    if (!diff) {
      spinner.fail('No changes to commit.');
      process.exit(1);
    }

    const config = loadConfig();
    const apiKey = getApiKey();
    
    if (!apiKey) {
      if (config.provider === 'openrouter') {
        spinner.fail('Please set OPENROUTER_API_KEY environment variable or configure apiKey.');
      } else {
        spinner.fail('Please set OPENAI_API_KEY environment variable or configure apiKey.');
      }
      process.exit(1);
    }

    const prompt = buildPrompt(diff);

    spinner.start('Generating commit message...');
    
    let fullMessage = '';
    const baseURL = config.baseURL || (config.provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : undefined);
    const provider = new OpenAIProvider({ 
      apiKey, 
      model: config.model,
      baseURL
    });
    
    try {
      spinner.stop();
      process.stdout.write('Generating: ');
      
      fullMessage = await provider.generateCommitMessage(prompt, (chunk) => {
        process.stdout.write(chunk);
      });
      
      console.log('\n');
      spinner.succeed('Commit message generated!');
      console.log('\n📝 Generated message:');
      console.log(fullMessage);
    } catch (error) {
      spinner.fail('Failed to generate commit message');
      console.error(error);
      process.exit(1);
    }

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Commit message:',
        choices: [
          { name: 'Confirm - Use this message', value: 'confirm' },
          { name: 'Edit - Modify the message', value: 'edit' },
          { name: 'Cancel - Do not commit', value: 'cancel' }
        ]
      }
    ]);

    if (action === 'cancel') {
      console.log('Cancelled.');
      process.exit(0);
    }

    let finalMessage = fullMessage;
    
    if (action === 'edit') {
      const { editedMessage } = await inquirer.prompt([
        {
          type: 'editor',
          name: 'editedMessage',
          message: 'Edit commit message:',
          default: fullMessage
        }
      ]);
      finalMessage = editedMessage;
    }

    console.log('\n--- Final Commit Message ---');
    console.log(finalMessage);
    console.log('----------------------------');
    console.log('\nUse: git commit -m "' + finalMessage.replace(/"/g, '\\"') + '"');
  });
