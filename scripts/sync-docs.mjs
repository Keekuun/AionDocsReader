#!/usr/bin/env node
/**
 * 把 AionUi / AionCore 两个仓库的文档同步为 AionDocsReader 里的真实文件。
 * 不用符号链接，保证仓库自包含，可以直接推到 GitHub / 部署到 Vercel。
 *
 * 用法：在 AionDocsReader 目录下执行 `bun run sync`（或 node scripts/sync-docs.mjs）
 * 前提：AionDocsReader、AionUi、AionCore 三个目录并排放在同一层。
 */
import fs from 'node:fs';
import path from 'node:path';

const SITE_ROOT = process.cwd();
const WORKSPACE = path.resolve(SITE_ROOT, '..');
const AIONUI = path.join(WORKSPACE, 'AionUi');
const AIONCORE = path.join(WORKSPACE, 'AionCore');

for (const repo of [AIONUI, AIONCORE]) {
  if (!fs.existsSync(repo)) {
    console.error(`找不到仓库目录: ${repo}（需要和 AionDocsReader 并排放在同一层）`);
    process.exit(1);
  }
}

/** crates 里这些目录的 md 不收录（和 .vitepress/config.mts 的 srcExclude 保持一致） */
const SKIP_DIRS = new Set(['node_modules', 'target', 'assets', 'tests', 'dist', 'out']);

const AIONUI_ROOT_MDS = ['readme.md', 'AGENTS.md', 'CHANGELOG.md', 'CLAUDE.md', 'CONTRIBUTING.md', 'CONTRIBUTING.zh.md'];
const AIONCORE_ROOT_MDS = ['ARCHITECTURE.md', 'ARCHITECTURE.zh-CN.md', 'AGENTS.md', 'CHANGELOG.md', 'CLAUDE.md'];

function copyFileInto(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

/** 递归复制 crates 下的 md 文件，跳过 SKIP_DIRS */
function copyCratesMd(srcDir, dstDir, counter) {
  for (const name of fs.readdirSync(srcDir)) {
    if (name.startsWith('.') || SKIP_DIRS.has(name)) continue;
    const src = path.join(srcDir, name);
    const dst = path.join(dstDir, name);
    if (fs.statSync(src).isDirectory()) copyCratesMd(src, dst, counter);
    else if (/\.md$/i.test(name)) {
      copyFileInto(src, dst);
      counter.count += 1;
    }
  }
}

/** 收集目录下所有 md 文件路径 */
function collectMd(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) collectMd(full, out);
    else if (/\.md$/i.test(name)) out.push(full);
  }
  return out;
}

// ---------- 1. 清空旧内容 ----------
fs.rmSync(path.join(SITE_ROOT, 'aionui'), { recursive: true, force: true });
fs.rmSync(path.join(SITE_ROOT, 'aioncore'), { recursive: true, force: true });

// ---------- 2. docs 整目录 ----------
fs.cpSync(path.join(AIONUI, 'docs'), path.join(SITE_ROOT, 'aionui/docs'), { recursive: true });
fs.cpSync(path.join(AIONCORE, 'docs'), path.join(SITE_ROOT, 'aioncore/docs'), { recursive: true });

// ---------- 3. 仓库根目录文档 ----------
let rootCount = 0;
for (const f of AIONUI_ROOT_MDS) {
  const src = path.join(AIONUI, f);
  if (fs.existsSync(src)) {
    copyFileInto(src, path.join(SITE_ROOT, 'aionui', f));
    rootCount += 1;
  }
}
for (const f of AIONCORE_ROOT_MDS) {
  const src = path.join(AIONCORE, f);
  if (fs.existsSync(src)) {
    copyFileInto(src, path.join(SITE_ROOT, 'aioncore', f));
    rootCount += 1;
  }
}

// ---------- 4. AionCore crates 里的 md ----------
const cratesCounter = { count: 0 };
copyCratesMd(path.join(AIONCORE, 'crates'), path.join(SITE_ROOT, 'aioncore/crates'), cratesCounter);

// ---------- 5. 复制被引用到的图片（AionUi/resources） ----------
// 匹配 md 里的 resources/ 引用，允许路径中带空格（如 "offica-ai BANNER-function.png"）
const REF_RE = /(?:\.\/|\.\.\/)*(resources\/[^)"'\s]+(?: [^)"'\s]+)*)/g;
const referenced = new Set();
for (const md of collectMd(path.join(SITE_ROOT, 'aionui'))) {
  const text = fs.readFileSync(md, 'utf8');
  for (const m of text.matchAll(REF_RE)) referenced.add(m[1]);
}
let imgCount = 0;
let imgBytes = 0;
for (const rel of referenced) {
  const src = path.join(AIONUI, rel);
  if (!fs.existsSync(src) || !fs.statSync(src).isFile()) continue; // 跳过文字里误匹配的非文件
  copyFileInto(src, path.join(SITE_ROOT, 'aionui', rel));
  imgCount += 1;
  imgBytes += fs.statSync(src).size;
}

// ---------- 6. 转义裸露的「非 HTML 标签」 ----------
// Rust 文档里有大量 <String>、<dyn Trait> 这类泛型写法，VitePress 构建时
// 会被 Vue 编译器当成未闭合标签而报错。这里把不在 HTML 白名单里的 <tag>
// 转义成 &lt;tag&gt;（跳过代码块和行内代码，它们本来就是安全的）。
const HTML_TAGS = new Set(
  'br,img,hr,a,p,div,span,table,thead,tbody,tr,td,th,b,i,em,strong,code,pre,sub,sup,kbd,details,summary,ul,ol,li,h1,h2,h3,h4,h5,h6,blockquote,figure,figcaption,video,source,picture,center,font,small,big,del,ins,mark,abbr,cite,q,section,article,aside,header,footer,nav,main'.split(
    ','
  )
);
const RAW_TAG_RE = /<\/?([A-Za-z][\w-]*)[^<>\n]*>/g;

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sanitizeLine(line) {
  // 按行内代码（`...`）分段
  return line
    .split(/(`[^`]*`)/)
    .map((part, idx) => {
      if (idx % 2 === 1) {
        // 行内代码里的 {{ }} 会被 Vue 当成插值表达式（VitePress 只给围栏代码块
        // 加 v-pre，行内代码没有），改写成 <code v-pre> 跳过 Vue 编译。
        if (part.includes('{{')) {
          const inner = part.slice(1, -1);
          return `<code v-pre>${escapeHtml(inner)}</code>`;
        }
        return part;
      }
      return part.replace(RAW_TAG_RE, (raw, tag) =>
        HTML_TAGS.has(tag.toLowerCase()) ? raw : raw.replace('<', '&lt;').replace(/>$/, '&gt;')
      );
    })
    .join('');
}

function sanitizeMd(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let inCode = false;
  let changed = false;
  const out = lines.map((line) => {
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
      return line;
    }
    if (inCode) return line;
    const fixed = sanitizeLine(line);
    if (fixed !== line) changed = true;
    return fixed;
  });
  if (changed) fs.writeFileSync(file, out.join('\n'));
  return changed;
}

let sanitizedCount = 0;
for (const base of ['aionui', 'aioncore']) {
  for (const md of collectMd(path.join(SITE_ROOT, base))) {
    if (sanitizeMd(md)) sanitizedCount += 1;
  }
}

console.log('同步完成：');
console.log(`  aionui/docs + aioncore/docs 已整目录复制`);
console.log(`  根目录文档 ${rootCount} 篇，crates 文档 ${cratesCounter.count} 篇`);
console.log(`  引用图片 ${imgCount} 个，共 ${(imgBytes / 1024 / 1024).toFixed(1)} MB`);
console.log(`  转义非 HTML 标签的文档 ${sanitizedCount} 篇`);
