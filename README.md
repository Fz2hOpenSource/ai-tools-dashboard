![AI-DB](./public/cc-lens.png)

# AI-DB — 本地 AI 使用数据分析仪表盘

支持 **Claude Code**、**OpenClaw**、**Codex CLI**。无需云端、不上传数据、不需要 API Key，直接读取本地数据，可视化展示你的 AI 使用情况。

```bash
npx cc-lens
```

CLI 会自动找一个空闲端口，启动仪表盘并在浏览器打开。

---

## 📌 项目来源

本项目基于 **[Arindam200/cc-lens](https://github.com/Arindam200/cc-lens)**（v0.3.3）进行深度优化，原作者 **Arindam Majumder**。

在此基础上做了以下增强：

### 🎨 视觉升级 — Terminal Observatory 主题
- 深空蓝黑底色 + 琥珀色暖光氛围
- 全屏噪点纹理（CRT 观测镜头质感）
- 卡片渐变背景、hover 发光边缘、斜向光扫动画
- 页面加载 stagger 渐进淡入（StatCard → Chart → Table）
- 暗色/亮色双主题，`prefers-reduced-motion` 无障碍支持

### ✂️ 代码优化
- 统一模型名显示：4 处硬编码 if-else 收敛为 `modelDisplayName()` / `modelShortId()`
- 合并冗余循环：projects/route.ts 9 次 reduce → 1 次 for；stats/route.ts 2 次遍历 → 1 次
- Session 页：筛选器改为圆角药丸按钮 + lucide 图标；行点击即进入详情
- SessionBadges 组件：emoji → lucide 图标，配置化驱动渲染
- 删除 TopBar 的 Star on GitHub 按钮，界面更干净
- SWR 轮询间隔 5s → 30s，减少不必要的文件扫描

---

## 快速开始

直接用 npx 运行（Node.js 18+）：

```bash
npx cc-lens
```

首次运行会在 `~/.cc-lens/` 下生成缓存，之后启动更快。

---

## 功能一览

### 📊 总览
- 会话数、消息数、Token 用量、预估费用、本地存储大小
- 带迷你趋势图的统计卡片
- 7/30/90 天预设 + 自定义日期范围
- 用量趋势、模型分布、高峰时段、项目活跃度、Token 分类、最近会话

### 📁 项目
- 可搜索、可排序的项目网格
- 每个项目卡片展示会话数、时长、预估费用、语言、Git 分支、MCP/Agent 标记、常用工具
- 项目详情页含成本趋势、语言分布、分支活跃度、工具用量

### 💬 会话
- 搜索 + 筛选（Compaction / Agent / MCP）+ 排序
- 从 JSONL 还原完整会话回放
- Assistant 回复渲染为 GFM Markdown
- 内联展示工具调用和工具结果
- 文件读写工具结果解析为可读卡片
- 每轮对话的模型、耗时、Token 明细、预估费用
- Compaction 事件上下文 + Token 累积图

### 💰 成本
- 总预估费用、缓存节省、无缓存对比
- 按时间和按项目拆分成本
- 按模型 Token/成本明细表
- 缓存命中率面板
- 定价参考表（支持 `~/.cc-lens/pricing.json` 自定义）

### 🔧 工具 & 功能
- 全会话工具排行榜
- 工具分类统计（文件 I/O / Shell / Agent / Web / 规划 / Todo / Skill / MCP）
- MCP Server 用量详情
- 功能采纳率
- 工具错误分析
- Claude Code 版本历史

### 📅 活跃度
- GitHub 风格活跃日历
- 连续天数、最长连续、活跃天数、最活跃日
- 按小时、按星期分布

### 📂 本地文件浏览
- **历史记录**：搜索 `~/.claude/history.jsonl`
- **待办事项**：浏览 `~/.claude/todos/`
- **计划文件**：浏览 `~/.claude/plans/`
- **记忆文件**：跨项目浏览和编辑 Memory
- **设置**：查看 settings.json、Skills、Plugins、MCP Server、存储用量

### 📤 导出 & 导入
- 导出 `.cclens.json`（含统计、会话元数据、Facets、历史记录）
- 下载前预览导出数量
- 支持按日期过滤
- 拖入导出文件可预览跨机器合并（预览模式，不写回 `~/.claude/`）

---

## 导航

- 全局搜索：`Cmd+K` / `Ctrl+K` / `/`
- 会话列表键盘导航：`j` / `k` 移动，`Enter` 打开，`Esc` 清除
- 页面快捷键：`g s` 会话，`g p` 项目，`g c` 成本
- 响应式布局：桌面侧栏 + 可折叠 + 手机底部导航
- 明暗双主题

---

## 多配置目录

默认读取 `~/.claude/`，可通过环境变量切换：

```bash
CLAUDE_CONFIG_DIR=~/.claude-work npx cc-lens
```

Windows PowerShell:

```powershell
$env:CLAUDE_CONFIG_DIR="C:\Users\you\.claude-work"; npx cc-lens
```

---

## 从源码运行

```bash
npm install
npm run dev          # 开发模式 → http://localhost:3000
npm run build        # 生产构建
npm start
```

---

## 数据来源

`cc-lens` 直接读取以下本地文件：

- `~/.claude/projects/<slug>/*.jsonl` — 会话数据 & 回放
- `~/.claude/stats-cache.json` — 聚合统计
- `~/.claude/usage-data/session-meta/` — 会话元数据（回退）
- `~/.claude/history.jsonl` — 命令历史
- `~/.claude/todos/` — 待办事项
- `~/.claude/plans/` — 计划文件
- `~/.claude/projects/*/memory/` — 项目记忆
- `~/.claude/settings.json` — 设置、Skills、Plugins、MCP

---

## 隐私

完全本地运行，不联网、不登录、不上传数据。你的 Claude Code 使用记录始终留在你的电脑上。

---

## 费用估算说明

Claude Code 存储的是 Token 计数和模型标识，不含账单数据。`cc-lens` 基于 `lib/pricing.ts` 中的定价表进行估算。若官方定价调整，可编辑该文件或创建 `~/.cc-lens/pricing.json` 覆盖。

---

## 致谢

- 原作者 **[Arindam Majumder](https://github.com/Arindam200)** — [cc-lens](https://github.com/Arindam200/cc-lens)
- 视觉设计 & 代码优化由 **[Fz2hOpenSource](https://github.com/Fz2hOpenSource)** 贡献
