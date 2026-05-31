![AI-DB](./public/cc-lens.png)

# AI-DB — 本地 AI 使用数据分析仪表盘

支持 **Claude Code**、**OpenClaw**、**Codex CLI**。自动检测已安装的 AI 编程工具，读取本地会话数据，可视化展示使用统计、费用估算、工具分析。完全本地运行，不联网、不上传数据、不需要 API Key。

---

## 快速开始

```bash
git clone https://github.com/Fz2hOpenSource/ai-tools-dashboard.git
cd ai-tools-dashboard
npm install
npm run dev
```

打开 http://localhost:3000

### 多工具配置

如果 OpenClaw 或 Codex 装在非默认路径，复制 `.env.example` 为 `.env.local`：

```bash
OPENCLAW_HOME=D:\YourPath\.openclaw
CODEX_HOME=D:\YourPath\.codex
```

重启 dev server 即可自动检测。支持的工具和数据目录：

| 工具 | 默认路径 | 环境变量 |
|------|---------|---------|
| Claude Code | `~/.claude/` | `CLAUDE_CONFIG_DIR` |
| OpenClaw | `~/.openclaw/` | `OPENCLAW_HOME` |
| Codex CLI | `~/.codex/` | `CODEX_HOME` |

---

## 功能一览

### 仪表盘总览
- 会话数、消息数、Token 用量、预估费用、本地存储大小
- 使用趋势图、模型分布饼图、高峰时段柱状图、项目活跃度
- 日期范围选择：7天 / 30天 / 90天 / 自定义

### 项目管理
- 可搜索、可排序的项目网格（按最近/费用/会话数/时间）
- 项目卡片：会话数、时长、预估费用、语言、Git 分支、工具用量
- 项目详情页：费用趋势、语言分布、分支活跃度

### 会话浏览
- 搜索 + 多条件筛选（压缩/Agent/MCP/收藏）
- 按日期/项目/时长/消息数/工具/费用排序
- 完整对话回放：Markdown 渲染、工具调用内联展示、思考过程折叠
- ⭐ 收藏功能：本地持久化，跨会话保留

### 费用分析
- 总预估费用、缓存节省、无缓存对比
- 按时间 + 按项目拆分费用
- 按模型 Token/费用明细表
- 缓存命中率面板
- 支持 `~/.cc-lens/pricing.json` 自定义模型价格

### 工具统计
- 工具排行榜、分类统计（文件 I/O / Shell / Agent / Web / MCP）
- MCP Server 用量详情
- 功能采纳率、工具错误分析
- Claude Code 版本历史、Git 分支分析

### 活跃度
- GitHub 风格活跃日历（52 周）
- 连续天数、最长连续、活跃天数、最活跃日
- 按小时、按星期分布

### 本地文件浏览
- 命令历史（`~/.claude/history.jsonl`）
- 待办事项（`~/.claude/todos/`）
- 计划文件（`~/.claude/plans/`）
- 记忆管理（跨项目浏览和编辑）
- 设置查看（Skills、Plugins、MCP Server）

### 导出导入
- 导出 `.cclens.json` 备份文件
- 按日期过滤导出
- 拖入文件预览跨机器合并

### 中英文切换
- TopBar 右侧语言切换按钮
- 侧边栏、页面标题、筛选标签、排序表头全部翻译
- 浏览器中文自动显示中文界面

### 键盘快捷键
| 按键 | 功能 |
|------|------|
| `g` + 字母 | 页面导航（`g s` 会话、`g p` 项目…） |
| `Cmd+K` / `/` | 全局搜索 |
| `?` | 显示所有快捷键 |
| `j` / `k` | 列表上下移动 |
| `Enter` | 打开选中项 |
| `Esc` | 关闭/取消 |

---

## 架构

```
浏览器                     Next.js 服务端                    硬盘
  │                            │                              │
  ├─ SWR 轮询(30s) ──────────→├─ 17 个 API 路由 ────────────→├─ ~/.claude/
  │                            │                              ├─ ~/.openclaw/
  │                            ├─ Provider Reader 抽象层       ├─ ~/.codex/
  │                            │  ├─ ClaudeReader              │
  │                            │  ├─ OpenClawReader            │
  │                            │  └─ CodexReader               │
  │                            │                              │
  │                            ├─ 三层缓存                     │
  │                            │  1. 内存(5min TTL) ~0.03s    │
  │                            │  2. 磁盘(永久)     ~2s       │
  │                            │  3. 源文件解析     ~8s       │
  │                            │                              │
  │←── JSON ──────────────────├←─────────────────────────────┤
```

### 数据更新周期
- **正常使用**：SWR 每 30 秒后台轮询 → 内存缓存 → 0.03s 响应
- **新会话出现**：5 分钟内自动检测（内存缓存过期触发源文件重解析）
- **重启服务**：2 秒磁盘缓存预热
- **手动刷新**：点 Refresh 按钮 → 清缓存 → 强制重解析 8s

### 缓存文件
- 内存缓存：Node.js 进程内，5 分钟 TTL
- 磁盘缓存：`%TEMP%/cc-lens-sessions-cache.json`（~250KB for 165 sessions）
- Refresh 按钮清除全部缓存，点击后重新从源文件解析

---

## 项目结构

```
ai-tools-dashboard/
├── app/                        # 页面 + API 路由
│   ├── page.tsx                # 总览页
│   ├── layout.tsx              # 根布局
│   ├── globals.css             # Terminal Observatory 主题
│   ├── api/                    # 17 个 API 路由
│   ├── sessions/               # 会话列表 + 详情回放
│   ├── projects/               # 项目列表 + 详情
│   ├── costs/                  # 费用分析
│   ├── tools/                  # 工具统计
│   ├── activity/               # 活跃度
│   ├── history|todos|plans|memory|settings|export/
├── components/
│   ├── layout/                 # Sidebar, TopBar, BottomNav
│   ├── ui/                     # shadcn/ui + AnimatedCounter, Toaster, SkeletonCard
│   ├── overview/               # StatCard, 图表组件
│   ├── sessions/               # SessionTable, Replay 组件
│   ├── costs|tools|projects|activity/
│   ├── provider-selector.tsx   # 多 Provider 切换
│   ├── language-switcher.tsx   # 中英文切换
│   ├── keyboard-help.tsx       # 快捷键面板
│   ├── page-transition.tsx     # 页面过渡动画
│   └── back-to-top.tsx         # 回顶按钮
├── lib/
│   ├── claude-reader.ts        # Claude Code 读取 + 缓存
│   ├── readers/                # Provider 抽象层
│   │   ├── types.ts            # 统一接口
│   │   ├── openclaw.ts         # OpenClaw 解析
│   │   ├── codex.ts            # Codex 解析
│   │   └── index.ts            # 自动检测 + 聚合
│   ├── i18n.tsx                # 中英文翻译(200+ key)
│   ├── pricing.ts              # 模型定价表
│   ├── decode.ts               # 格式化工具
│   ├── bookmarks.ts            # 收藏管理
│   └── toast.tsx               # 通知系统
├── GUIDE.md                    # 完整操作手册
├── .env.example                # 环境变量模板
└── package.json
```

---

## 模型定价

内置定价表（`lib/pricing.ts`）：

| 模型 | Input | Output | Cache Read |
|------|-------|--------|------------|
| Claude Opus 4.7 | $5.00 | $25.00 | $0.50 |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $0.30 |
| Claude Haiku 4.5 | $1.00 | $5.00 | $0.10 |
| GPT-5.5 | $5.00 | $30.00 | $0.50 |
| DeepSeek V4-Pro | $0.42 | $0.83 | $0.0035 |
| MiniMax M2.7 | $0.30 | $1.20 | $0.06 |

单位：美元/百万 tokens。可通过 `~/.cc-lens/pricing.json` 自定义覆盖。

---

## 技术栈

- **Next.js 16** (App Router, Turbopack)
- **React 19** + TypeScript
- **Tailwind CSS v4** + shadcn/ui (New York)
- **Recharts** — 图表
- **SWR** — 数据获取
- **Framer Motion** — 动画
- **cmdk** — 命令面板
- **lucide-react** — 图标
- **react-markdown** + remark-gfm — 会话回放

---

## 详细文档

完整操作手册见 **[GUIDE.md](./GUIDE.md)**，包括：
- 多 Provider 配置详解
- 数据解析原理（OpenClaw JSONL / Codex rollout 格式）
- 缓存机制与性能
- API 路由参考
- 故障排查指南

---

## 致谢

- 原作者 [Arindam Majumder](https://github.com/Arindam200) — [cc-lens](https://github.com/Arindam200/cc-lens)
- 视觉设计 & 多功能增强由 [Fz2hOpenSource](https://github.com/Fz2hOpenSource) 贡献

## License

MIT
