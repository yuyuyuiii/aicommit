import OpenAI from 'openai';
import { AIProvider, ProviderConfig } from './provider';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(config: ProviderConfig) {
    this.client = new OpenAI({ 
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });
    this.model = config.model || 'gpt-4';
  }

  async generateText(
    prompt: { system: string; user: string },
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    if (onChunk) {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ],
        stream: true,
      });

      let fullContent = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullContent += content;
        onChunk(content);
      }
      return fullContent.trim();
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
      ],
      stream: false,
    });

    return (response.choices[0]?.message?.content || '').trim();
  }
}
