# AI Dashboard 完整操作手册

> 本地 AI 编程助手使用数据分析仪表盘。支持 **Claude Code**、**OpenClaw**、**Codex CLI** 三种工具。
> 完全本地运行，不联网、不上传数据、不需要 API Key。

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

### Q: 页面切换很慢？
A: 首次打开需要从硬盘解析所有会话文件（165 个文件约需 8 秒）。之后所有页面切换都在 0.03 秒内完成。重启 dev server 后首次请求约 2 秒（从磁盘缓存恢复）。数据每 5 分钟自动刷新，刷新期间走缓存不影响使用。

### Q: 新会话什么时候出现？
A: 内存缓存有 5 分钟 TTL。过期后自动从源文件重新解析，新数据最长 5 分钟自动出现。想立即刷新点 TopBar 的 Refresh 按钮。

---

## 架构原理

### 数据流

```
用户浏览器                Next.js 服务端              硬盘
    │                        │                      │
    ├─ SWR 轮询(30s) ──────→├─ API Route ──────────→├─ ~/.claude/projects/
    │                        │                      ├─ ~/.openclaw/agents/main/sessions/
    │                        │                      ├─ ~/.codex/sessions/
    │                        │                      │
    │                        ├─ 三层缓存:             │
    │                        │  1. 内存缓存(5min)    │
    │                        │  2. 磁盘缓存(永久)    │
    │                        │  3. 源文件解析(8s)    │
    │                        │                      │
    │←── JSON 响应 ──────────├←─────────────────────┤
```

### Provider 自动检测

服务启动时，依次检查以下目录：

| 工具 | 默认路径 | 环境变量 |
|------|---------|---------|
| Claude Code | `~/.claude/projects/` | `CLAUDE_CONFIG_DIR` |
| OpenClaw | `~/.openclaw/agents/main/sessions/` | `OPENCLAW_HOME` |
| Codex | `~/.codex/sessions/` | `CODEX_HOME` |

目录存在即视为该工具已安装，自动加载数据。TopBar 右侧显示检测到的工具数和会话数。

### OpenClaw 数据解析

每个 JSONL 会话文件的解析逻辑（`lib/readers/openclaw.ts`）：

1. 读取文件全部内容（`fs.readFile`）
2. 按行分割，逐行 `JSON.parse`
3. 识别事件类型：
   - `type: "session"` → 提取 cwd（项目路径）、start_time
   - `type: "model_change"` → 提取模型名（modelId）
   - `type: "message"` + `role: "user"` → 计数用户消息、提取首条提示
   - `type: "message"` + `role: "assistant"` → 累加 token（usage.input/output/cacheRead）、统计工具调用
4. 组装为统一的 `ParsedSession` 格式，与 Claude Code 数据合并展示

### Codex 数据解析

Codex 的 rollout JSONL 格式（`lib/readers/codex.ts`）：

1. 递归扫描 `sessions/YYYY/MM/DD/rollout-*.jsonl`
2. 每行包含 `$rollout_item_type` 字段：
   - `SessionMeta` → 提取 session_id、cwd、model_provider
   - `EventMsg.TokenCount` → 提取累计 token 值
   - `EventMsg.UserMessage/AgentMessage` → 计数消息
   - `TurnContext` → 提取模型名
3. TokenCount 使用累计值取最大值（非增量计算）

### 缓存机制

三层缓存架构，逐级回退：

| 层级 | 位置 | 命中速度 | 有效期 | 触发条件 |
|------|------|---------|--------|---------|
| 内存缓存 | Node.js 进程 | ~0.03s | 5 分钟 | 正常页面切换 / SWR 轮询 |
| 磁盘缓存 | `%TEMP%/cc-lens-sessions-cache.json` | ~2s | 永久（重启不丢） | 服务重启后首次请求 |
| 源文件解析 | `fs.readFile` JSONL 文件 | ~8s | — | 首次安装 / 点 Refresh |

SWR 后台轮询走内存缓存（秒返），不影响用户操作。缓存过期自动触发源文件重解析，对用户透明。

### API 路由参考

| 路由 | 数据来源 | 说明 |
|------|---------|------|
| `/api/stats` | stats-cache.json + sessions | 聚合统计（会话数、消息数、token 等） |
| `/api/sessions` | getAllParsedSessions() | 会话列表 + 元数据 |
| `/api/sessions/[id]` | 单 session meta | 会话元数据 |
| `/api/sessions/[id]/replay` | JSONL 文件全文 | 完整对话回放 |
| `/api/projects` | 按 project_path 聚合 | 项目列表 |
| `/api/costs` | sessions + 定价表 | 费用估算 |
| `/api/tools` | sessions tool_counts | 工具使用统计 |
| `/api/activity` | sessions 时间戳 | 活跃度分析 |
| `/api/history` | history.jsonl | 命令历史 |
| `/api/todos` | ~/.claude/todos/ | 待办事项 |
| `/api/plans` | ~/.claude/plans/ | 计划文件 |
| `/api/memory` | ~/.claude/projects/*/memory/ | 记忆文件 |
| `/api/settings` | settings.json + skills/plugins | 设置信息 |
| `/api/export` | 聚合数据导出 | 导出 .cclens.json |
| `/api/debug-providers` | 各 reader 状态 | Provider 检测诊断 |
| `/api/refresh` | 清除所有缓存 | 强制重新解析 |

全部路由使用 `export const dynamic = 'force-dynamic'`，无静态缓存。

---

## 故障排查

### 诊断 Provider 状态

```bash
curl http://localhost:3000/api/debug-providers
```

返回示例：
```json
{
  "claude":   { "available": true, "sessionCount": 51 },
  "openclaw": { "available": true, "sessionCount": 114 },
  "codex":    { "available": false }
}
```

- `available: false` → 工具未安装或路径配置错误
- `sessionCount: 0` → 工具已安装但无会话数据

### API 响应时间诊断

```bash
curl -w "time: %{time_total}s" -s -o /dev/null http://localhost:3000/api/sessions
```

- < 0.5s：正常（内存缓存命中）
- 2-3s：磁盘缓存加载中（首次请求或刚重启）
- > 8s：从源文件解析中（缓存未命中，首次安装）

### 缓存强制清理

如果数据异常，手动删除缓存：

```bash
# Windows
del %TEMP%\cc-lens-sessions-cache.json

# macOS / Linux
rm /tmp/cc-lens-sessions-cache.json
```

或者直接点 TopBar 的 Refresh 按钮（调用 `/api/refresh` 清除全部缓存）。

### .env.local 未生效

确认文件在项目根目录，且格式正确：
```bash
# 正确格式
OPENCLAW_HOME=D:\Cadence\SPB_Date\.openclaw

# 错误 — 不要加引号
OPENCLAW_HOME="D:\path\.openclaw"

# 错误 — 反斜杠不用转义
OPENCLAW_HOME=D:\\path\\.openclaw
```

修改后需重启 dev server。

---

## 项目结构速查

```
ai-tools-dashboard/
├── app/                        # Next.js App Router 页面 + API
│   ├── page.tsx                # 总览页
│   ├── layout.tsx              # 根布局
│   ├── globals.css             # Terminal Observatory 主题
│   ├── overview-client.tsx     # 总览页客户端组件
│   ├── api/                    # 17 个 API 路由
│   ├── sessions/               # 会话列表 + 详情
│   ├── projects/               # 项目列表 + 详情
│   ├── costs/                  # 费用分析
│   ├── tools/                  # 工具统计
│   ├── activity/               # 活跃度
│   ├── history/                # 命令历史
│   ├── todos/                  # 待办事项
│   ├── plans/                  # 计划文件
│   ├── memory/                 # 记忆管理
│   ├── settings/               # 设置查看
│   └── export/                 # 导出导入
├── components/
│   ├── layout/                 # Sidebar, TopBar, BottomNav
│   ├── ui/                     # shadcn/ui 组件 + AnimatedCounter, Toaster, SkeletonCard
│   ├── overview/               # StatCard, 图表组件
│   ├── sessions/               # SessionTable, SessionBadges, Replay
│   ├── costs/                  # 费用图表
│   ├── tools/                  # 工具图表
│   ├── projects/               # ProjectCard
│   ├── activity/               # 活跃度图表
│   ├── provider-selector.tsx   # 多 Provider 切换
│   ├── language-switcher.tsx   # 中英文切换
│   ├── keyboard-help.tsx       # 快捷键帮助面板
│   ├── page-transition.tsx     # 页面过渡动画
│   └── back-to-top.tsx         # 回顶按钮
├── lib/
│   ├── claude-reader.ts        # Claude Code 数据读取 + 缓存
│   ├── readers/                # 多 Provider 抽象层
│   │   ├── types.ts            # ProviderReader 接口
│   │   ├── openclaw.ts         # OpenClaw 会话解析
│   │   ├── codex.ts            # Codex 会话解析
│   │   └── index.ts            # 自动检测 + 聚合
│   ├── i18n.tsx                # 中英文翻译字典
│   ├── pricing.ts              # 模型定价表
│   ├── decode.ts               # 格式化工具函数
│   ├── bookmarks.ts            # Session 收藏
│   └── toast.tsx               # Toast 通知
├── types/claude.ts             # TypeScript 类型定义
├── GUIDE.md                    # 本文档
├── .env.example                # 环境变量模板
└── .env.local                  # 本地环境变量（不提交 Git）
```
