export function createStreamingOutput(onChunk: (text: string) => void) {
  let buffer = '';
  
  return {
    write(chunk: string) {
      buffer += chunk;
      onChunk(chunk);
    },
    getContent() {
      return buffer;
    },
    clear() {
      buffer = '';
    }
  };
}
