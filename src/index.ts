#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import { commitCommand } from './commands/commit';
import { loadConfig, saveConfig } from './config/store';

const program = new Command();

program
  .name('aicommit')
  .description('AI-powered git commit message generator')
  .version('1.0.0');

program.addCommand(commitCommand);

program.command('config')
  .description('Configure aicommit')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select AI provider:',
        choices: ['openai', 'anthropic', 'ollama'],
        default: 'openai'
      },
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter API key (optional, can use env var):',
        default: ''
      },
      {
        type: 'input',
        name: 'model',
        message: 'Enter model name:',
        default: 'gpt-4'
      },
      {
        type: 'input',
        name: 'baseURL',
        message: 'Enter base URL (optional, for custom endpoints):',
        default: ''
      }
    ]);
    
    const config = loadConfig();
    config.provider = answers.provider;
    if (answers.apiKey) {
      config.apiKey = answers.apiKey;
    }
    if (answers.model) {
      config.model = answers.model;
    }
    if (answers.baseURL) {
      config.baseURL = answers.baseURL;
    }
    saveConfig(config);
    console.log('Configuration saved.');
  });

program.parse(process.argv);
