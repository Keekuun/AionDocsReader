import { defineConfig } from 'vitepress';
import fs from 'node:fs';
import path from 'node:path';

// 注意：VitePress 会把配置打包到临时目录执行，__dirname 不可靠；
// dev/build 都从 AionDocsReader 目录运行，用 process.cwd() 作为站点根。
const SITE_ROOT = process.cwd(); // AionDocsReader/
// 文档是 scripts/sync-docs.mjs 从两个仓库复制来的真实文件，站点自包含，
// 不再需要 vite fs.allow 放行仓库外路径。

// ---------- 工具函数 ----------

/** 取 markdown 第一个一级标题作为侧边栏文字 */
function titleOf(absPath: string, fallback: string): string {
  try {
    const head = fs.readFileSync(absPath, 'utf8').slice(0, 4000);
    const m = head.match(/^#\s+(.+)$/m);
    if (m) return m[1].trim().replace(/[#*`]/g, '');
  } catch {
    /* 读取失败就用文件名 */
  }
  return fallback;
}

const SKIP_DIRS = new Set(['node_modules', 'target', 'assets', 'tests', 'dist', 'out']);

/** 递归收集目录下的 .md 文件（会跟随软链） */
function walkMd(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.') || SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    let st: fs.Stats;
    try {
      st = fs.statSync(full); // statSync 跟随软链
    } catch {
      continue;
    }
    if (st.isDirectory()) out.push(...walkMd(full));
    else if (/\.md$/i.test(name)) out.push(full);
  }
  return out;
}

/** 绝对路径 -> VitePress 路由链接 */
function toLink(absPath: string): string {
  const rel = path.relative(SITE_ROOT, absPath).split(path.sep).join('/');
  return '/' + rel.replace(/\.md$/i, '');
}

// ---------- 推荐阅读顺序（固定在侧边栏最前） ----------

const RECOMMENDED: { text: string; file: string }[] = [
  { text: '① AionUi 学习上手（先读这篇）', file: 'aionui/docs/architecture/学习上手.md' },
  { text: '② AionCore 学习上手（Rust 零基础）', file: 'aioncore/docs/学习上手.md' },
  { text: '③ 项目架构图（交互式）', file: 'architecture.md' },
  { text: '④ AionUi 官方开发指南', file: 'aionui/docs/contributing/development.md' },
  { text: '⑤ AionUi 目录与命名规范', file: 'aionui/docs/contributing/file-structure.md' },
  { text: '⑥ AionCore 官方架构文档', file: 'aioncore/ARCHITECTURE.zh-CN.md' },
  { text: '⑦ AionCore AGENTS 规则', file: 'aioncore/AGENTS.md' },
];

const recommendedAbs = new Set(RECOMMENDED.map((r) => path.join(SITE_ROOT, r.file)));

const recommendedGroup = {
  text: '推荐阅读顺序',
  collapsed: false,
  items: RECOMMENDED.map((r) => ({ text: r.text, link: toLink(path.join(SITE_ROOT, r.file)) })),
};

// ---------- 自动分组 ----------

function group(title: string, dirAbs: string, collapsed = true) {
  const files = walkMd(dirAbs)
    .filter((f) => !recommendedAbs.has(f))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
  if (!files.length) return null;
  return {
    text: `${title}（${files.length}）`,
    collapsed,
    items: files.map((f) => ({ text: titleOf(f, path.basename(f, '.md')), link: toLink(f) })),
  };
}

/** 只取目录下直接平铺的 md（不递归），用于「根目录文档」分组 */
function flatFiles(title: string, dirAbs: string, collapsed = true) {
  if (!fs.existsSync(dirAbs)) return null;
  const files = fs
    .readdirSync(dirAbs)
    .filter((name) => /\.md$/i.test(name))
    .map((name) => path.join(dirAbs, name))
    .filter((f) => fs.statSync(f).isFile() && !recommendedAbs.has(f))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));
  if (!files.length) return null;
  return {
    text: `${title}（${files.length}）`,
    collapsed,
    items: files.map((f) => ({ text: titleOf(f, path.basename(f, '.md')), link: toLink(f) })),
  };
}

const AIONUI = path.join(SITE_ROOT, 'aionui');
const AIONCORE = path.join(SITE_ROOT, 'aioncore');

const sidebar = [
  recommendedGroup,
  group('AionUi · 使用指南', path.join(AIONUI, 'docs/guides')),
  group('AionUi · 贡献者文档', path.join(AIONUI, 'docs/contributing')),
  group('AionUi · 架构', path.join(AIONUI, 'docs/architecture')),
  group('AionUi · 产品需求 PRD', path.join(AIONUI, 'docs/prds')),
  group('AionUi · 主题', path.join(AIONUI, 'docs/theming')),
  group('AionUi · 多语言 readme', path.join(AIONUI, 'docs/readme')),
  flatFiles('AionUi · docs 其他', path.join(AIONUI, 'docs')),
  flatFiles('AionUi · 仓库根目录', AIONUI),
  flatFiles('AionCore · docs', path.join(AIONCORE, 'docs')),
  group('AionCore · crates 文档', path.join(AIONCORE, 'crates')),
  flatFiles('AionCore · 仓库根目录', AIONCORE),
].filter(Boolean);

// ---------- VitePress 配置 ----------

export default defineConfig({
  lang: 'zh-CN',
  title: 'Aion 文档站',
  description: 'AionUi / AionCore 学习文档阅读站',
  ignoreDeadLinks: true, // 两个仓库的 md 里有指向未收录文件的链接，dev 阶段不因此报错

  //  crates 下的 assets/tests 不收录（builtin-skills 等 100+ 篇技能文件，噪声大）
  srcExclude: ['aioncore/crates/**/assets/**', 'aioncore/crates/**/tests/**', '**/node_modules/**'],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '从第一篇开始', link: '/aionui/docs/architecture/学习上手' },
      { text: 'AionCore（Rust）', link: '/aioncore/docs/学习上手' },
    ],

    sidebar,

    outline: { level: [2, 3], label: '本页内容' },
    docFooter: { prev: '上一篇', next: '下一篇' },

    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                noResultsText: '没有找到相关结果',
                resetButtonTitle: '清除搜索条件',
                displayDetails: '显示详情',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    externalLinkIcon: true,
  },
});
