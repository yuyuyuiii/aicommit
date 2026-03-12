import fs from 'fs';
import path from 'path';
import os from 'os';

export interface Config {
  provider: 'openai' | 'openrouter' | 'anthropic' | 'ollama';
  apiKey?: string;
  model?: string;
  baseURL?: string;
}

const CONFIG_PATH = path.join(os.homedir(), '.aicommit.json');

export function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch (e) {
    // ignore
  }
  return { provider: 'openai' };
}

export function saveConfig(config: Config): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function getApiKey(): string | undefined {
  const config = loadConfig();
  if (config.provider === 'openrouter') {
    return process.env.OPENROUTER_API_KEY || config.apiKey;
  }
  return process.env.OPENAI_API_KEY || config.apiKey;
}
