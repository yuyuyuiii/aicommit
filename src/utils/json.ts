export function parseJsonFromText<T>(text: string): T {
  const trimmed = text.trim();
  const firstBrace = trimmed.indexOf('{');
  const firstBracket = trimmed.indexOf('[');

  let start = -1;
  let end = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
    end = trimmed.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    start = firstBracket;
    end = trimmed.lastIndexOf(']');
  }

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('无法解析 JSON 输出。');
  }

  const jsonText = trimmed.slice(start, end + 1);
  return JSON.parse(jsonText) as T;
}
