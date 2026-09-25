# AionDocsReader

[AionUi](https://github.com/iOfficeAI/AionUi) 和 [AionCore](https://github.com/iOfficeAI/AionCore) 两个项目的文档阅读站，基于 [VitePress](https://vitepress.dev) 构建。

把两个仓库的 Markdown 文档同步成本地真实文件（不用符号链接），配上推荐阅读顺序、全文搜索、上一篇/下一篇翻页，另外还嵌入了一张用 [Archify](https://github.com/tt-a1i/archify) 生成的交互式项目架构图。

## 功能

- **推荐阅读顺序置顶**：学习上手 → 架构图 → 官方开发指南 → 目录规范 → 架构文档 → AGENTS 规则
- **全文搜索**：左上角搜索框，快捷键 `⌘K` 或 `/`
- **顺序翻页**：每篇底部「上一篇 / 下一篇」，按侧边栏顺序走
- **交互式架构图**：`architecture.md` 页面内嵌，支持节点搜索、深色/浅色、视角聚焦、导出 PNG/SVG
- **全中文界面**：大纲、回到顶部、深色模式切换等

## 快速开始

前置条件：[bun](https://bun.sh)（或 Node.js 18+）

```bash
bun install
bun run dev
```

浏览器打开 http://localhost:5273/ 。

## 命令一览

| 命令 | 作用 |
| --- | --- |
| `bun run dev` | 启动本地阅读站，端口 5273 |
| `bun run build` | 生产构建到 `.vitepress/dist/` |
| `bun run preview` | 预览构建产物 |
| `bun run sync` | 从两个仓库重新同步文档（见下） |

## 同步文档（`bun run sync`）

站点里的 `aionui/` 和 `aioncore/` 目录由 `scripts/sync-docs.mjs` 生成，**不要手工编辑**，下次同步会被覆盖。

前提：三个目录并排放在同一层：

```text
workspace/
├── AionDocsReader/
├── AionCore/
└── AionUi/
```

同步脚本做的事：

1. 整目录复制两个仓库的 `docs/`
2. 复制仓库根目录的 readme、AGENTS、CHANGELOG、CLAUDE、CONTRIBUTING、ARCHITECTURE 等文档
3. 复制 AionCore `crates/` 里的 Markdown（跳过 `assets/`、`tests/` 等目录）
4. 只复制被文档引用到的图片（`resources/` 里没引用的不进仓库）
5. 转义两类会被 Vue 编译器误判的写法：代码块外的 `<String>` 这类「非 HTML 标签」，以及行内代码里的 `{{ }}` 插值语法

同步后提交推送即可：

```bash
bun run sync
git add -A && git commit -m "docs: sync" && git push
```

## 部署到 Vercel

仓库根目录已带 `vercel.json`（框架 VitePress、构建 `bun run build`、输出 `.vitepress/dist`）。

在 [vercel.com/new](https://vercel.com/new) 导入本仓库，直接点 Deploy 即可；之后每次 push 到 `main` 自动重新部署。

## 目录结构

```text
AionDocsReader/
├── .vitepress/config.mts   # 站点配置：侧边栏自动生成、搜索、翻页、中文文案
├── scripts/sync-docs.mjs   # 文档同步脚本
├── architecture/           # 架构图源文件（Archify JSON）
├── public/architecture/    # 生成的交互式架构图 HTML
├── architecture.md         # 架构图展示页（iframe 嵌入）
├── index.md                # 首页
├── aionui/                 # 同步自 AionUi（脚本生成，勿手改）
├── aioncore/               # 同步自 AionCore（脚本生成，勿手改）
└── vercel.json             # Vercel 部署配置
```

## 修改架构图

图源文件是 `architecture/aionui-architecture.json`，改完后重新生成并校验：

```bash
node ~/.agents/skills/archify/bin/archify.mjs validate architecture architecture/aionui-architecture.json --quality showcase --json
node ~/.agents/skills/archify/bin/archify.mjs deliver architecture architecture/aionui-architecture.json public/architecture/aionui-architecture.html --quality showcase --json
```

## License

文档内容归 [AionUi](https://github.com/iOfficeAI/AionUi) / [AionCore](https://github.com/iOfficeAI/AionCore) 原仓库所有（Apache-2.0 / MIT）；本仓库的站点代码与配置以 MIT 发布。
