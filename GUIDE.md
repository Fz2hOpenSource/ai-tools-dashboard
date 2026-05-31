# Claude Code Lens 使用指南

> 本地 AI 编程助手使用数据分析仪表盘。支持 **Claude Code**、**OpenClaw**、**Codex CLI** 三种工具。

---

## 目录

- [快速开始](#快速开始)
- [多工具支持](#多工具支持)
- [页面功能](#页面功能)
- [键盘快捷键](#键盘快捷键)
- [自定义配置](#自定义配置)
- [常见问题](#常见问题)

---

## 快速开始

### 方式一：npx 一键启动（推荐）

```bash
npx cc-lens
```

首次运行会在 `~/.cc-lens/` 下生成缓存，之后启动更快。

### 方式二：从源码运行

```bash
git clone https://github.com/Fz2hOpenSource/ai-tools-dashboard.git
cd ai-tools-dashboard
npm install
npm run dev
```

打开浏览器访问 `http://localhost:3000`。

---

## 多工具支持

cc-lens 能自动检测并同时展示来自不同 AI 工具的会话数据：

| 工具 | 数据目录 | 说明 |
|------|---------|------|
| **Claude Code** | `~/.claude/` | 默认支持，自动检测 |
| **OpenClaw** | `~/.openclaw/` | 需设置 `OPENCLAW_HOME`（如不在默认位置） |
| **Codex CLI** | `~/.codex/` | 需设置 `CODEX_HOME`（如不在默认位置） |

### 配置非默认路径

如果 OpenClaw 或 Codex 装在非标准路径，复制 `.env.example` 为 `.env.local` 并修改：

```bash
# .env.local
OPENCLAW_HOME=D:\MyProjects\.openclaw
CODEX_HOME=D:\Tools\.codex
```

重启 dev server 后，TopBar 右侧会出现工具切换下拉菜单，显示各工具检测到的会话数量。

### 如何确认配置成功？

访问 `http://localhost:3000/api/debug-providers` 查看 JSON 输出：
```json
{
  "claude":   { "available": true, "sessionCount": 51 },
  "openclaw": { "available": true, "sessionCount": 114 },
  "codex":    { "available": false }
}
```

---

## 页面功能

### 仪表盘总览 `/`
- 会话数、消息数、Token 用量、预估费用
- 使用趋势图、模型分布、高峰时段、项目活跃度
- 日期范围选择：7天 / 30天 / 90天 / 自定义

### 项目 `/projects`
- 可搜索、可排序的项目网格
- 每个项目卡片展示：会话数、总时长、预估费用、语言、Git 分支、常用工具
- 点击进入项目详情页

### 会话 `/sessions`
- 搜索 + 筛选（Compact / Agent / MCP / ⭐ 收藏）
- 按日期/项目/时长/消息数/成本排序
- ⭐ 点击星标收藏会话，持久化到本地
- j/k 键盘导航，Enter 打开详情
- 详情页：完整对话回放，Markdown 渲染，工具调用展示

### 费用 `/costs`
- 总费用、缓存节省、无缓存对比
- 按时间 + 按项目拆分
- 按模型明细表
- 缓存命中率面板

### 工具 `/tools`
- 工具排行榜、分类统计
- MCP Server 用量
- 功能采纳率、错误分析
- Claude Code 版本历史

### 活跃度 `/activity`
- GitHub 风格活跃日历
- 连续天数、最长连续、最活跃日
- 按小时、按星期分布

### 本地文件
- **历史记录** `/history` — 搜索 `~/.claude/history.jsonl`
- **待办事项** `/todos` — 浏览 `~/.claude/todos/`
- **计划文件** `/plans` — 浏览 `~/.claude/plans/`
- **记忆文件** `/memory` — 跨项目浏览和编辑 Memory
- **设置** `/settings` — 查看 settings.json、Skills、Plugins、MCP Server

### 导出 `/export`
- 导出 `.cclens.json` 文件
- 支持按日期过滤
- 拖入导出文件预览跨机器合并

---

## 键盘快捷键

| 按键 | 功能 |
|------|------|
| `g` + `s` | 跳转 Sessions |
| `g` + `p` | 跳转 Projects |
| `g` + `c` | 跳转 Costs |
| `g` + `t` | 跳转 Tools |
| `g` + `a` | 跳转 Activity |
| `g` + `m` | 跳转 Memory |
| `g` + `h` | 跳转首页 |
| `Cmd+K` / `/` | 全局搜索 |
| `?` | 显示所有快捷键 |
| `j` / `k` | 会话列表上下移动 |
| `Enter` | 打开选中会话 |
| `Esc` | 关闭/取消 |

---

## 自定义配置

### 模型价格

默认定价表在 `lib/pricing.ts`。如果模型价格变动或需要添加自定义模型，创建 `~/.cc-lens/pricing.json`：

```json
{
  "deepseek-v4-pro": {
    "input": 0.42,
    "output": 0.83,
    "cacheWrite": 0,
    "cacheRead": 0.0035
  }
}
```

单位：美元/百万 tokens。文件中的条目会覆盖默认值。

### 多配置目录

如果电脑上有多个 Claude Code 配置目录：

```bash
# macOS / Linux
CLAUDE_CONFIG_DIR=~/.claude-work npx cc-lens

# Windows PowerShell
$env:CLAUDE_CONFIG_DIR="C:\Users\you\.claude-work"; npx cc-lens
```

### OpenClaw 多 Agent

OpenClaw 支持多 Agent。cc-lens 默认读取 `agents/main/sessions/` 下的会话。如需读取其他 Agent，当前需切换 `OPENCLAW_HOME` 指向对应目录。

---

## 常见问题

### Q: 页面显示 404 错误？
A: 缺少 Claude Code 使用数据。确保至少运行过一次 Claude Code 命令。如果是 OpenClaw/Codex 用户，检查 `.env.local` 中的路径是否正确配置。

### Q: 费用数字不准？
A: cc-lens 基于定价表估算，不是真实账单。如使用非 Claude 模型（如 deepseek、MiniMax），默认按 Claude Opus 价格估算会偏高。请在 `~/.cc-lens/pricing.json` 中配置对应模型的真实价格。

### Q: 数据多久刷新一次？
A: 仪表盘每 5-30 秒自动刷新（取决于页面）。也可点 TopBar 的 Refresh 按钮手动刷新。

### Q: 数据会被上传吗？
A: 不会。cc-lens 完全本地运行，不联网、不登录、不上传数据。所有数据只存在于你的电脑上。

### Q: 如何备份数据？
A: 使用 Export 页面导出 `.cclens.json` 文件。可导入到另一台机器的 cc-lens 中预览合并。
