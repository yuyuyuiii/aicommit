export interface AIProvider {
  generateText(
    prompt: { system: string; user: string },
    onChunk?: (chunk: string) => void
  ): Promise<string>;
}

export interface ProviderConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
}
