# aicommit

AI 驱动的 Git 提交信息生成器（命令行工具）。

## 功能
- 基于暂存区 diff 自动生成提交信息
- 交互式确认/编辑提交信息
- 支持多种提供方：OpenAI、OpenRouter、Anthropic、Ollama

## 安装
```bash
npm install
```

## 构建
```bash
npm run build
```

## 使用
```bash
aicommit --help
```

```bash
aicommit config
```

```bash
aicommit
```

说明：
- 运行 `aicommit` 前请先 `git add` 暂存修改。

## 配置
配置文件默认写入 `~/.aicommit.json`，也可通过环境变量提供密钥。

OpenAI：
- 环境变量：`OPENAI_API_KEY`
- 可选配置：`model`、`baseURL`

OpenRouter：
- 环境变量：`OPENROUTER_API_KEY`
- 可选配置：`model`（例如 `openai/gpt-4o-mini`）
- `baseURL` 留空时默认使用 `https://openrouter.ai/api/v1`

## 开发
```bash
npm run dev
```

## 目录结构
- `src/` 源码
- `dist/` 编译输出
- `docs/` 文档

## 许可证
MIT
