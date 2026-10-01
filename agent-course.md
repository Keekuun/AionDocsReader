# Agent 原理课

目标：**造出自己的生产级 Agent**。基于本机的 aionrs 真实源码（生产级 agent 引擎）逐课拆解原理，每课配交互演示、小测验和动手任务。

## 课程列表

### 第 1 课：Agent 循环 —— 一切 Agent 的最小内核

Agent = 一个 while 循环。学完能在 aionrs 源码里找到它，并说清 run / turn / tool round 的关系。

<iframe src="/agent-course/lessons/0001-the-agent-loop.html" style="width:100%;height:85vh;min-height:600px;border:1px solid var(--vp-c-divider);border-radius:8px" title="第 1 课：Agent 循环"></iframe>

<a href="/agent-course/lessons/0001-the-agent-loop.html" target="_blank" rel="noopener">在新标签页中打开本课</a>

### 第 2 课：工具 —— Agent 的手和眼

模型从不「执行」任何东西，它只是发出工具调用请求。学完能说清工具的三张名片（name / description / schema），并理解「description 就是写给模型的 prompt」。

<iframe src="/agent-course/lessons/0002-tools-hands-and-eyes.html" style="width:100%;height:85vh;min-height:600px;border:1px solid var(--vp-c-divider);border-radius:8px" title="第 2 课：工具"></iframe>

<a href="/agent-course/lessons/0002-tools-hands-and-eyes.html" target="_blank" rel="noopener">在新标签页中打开本课</a>

### 第 3 课：上下文工程 —— 对话变长之后

每个 turn 都重发全部历史，又贵又慢还会撞墙。aionrs 的三级压缩（microcompact / autocompact / emergency）和持久记忆。

<iframe src="/agent-course/lessons/0003-context-engineering.html" style="width:100%;height:85vh;min-height:600px;border:1px solid var(--vp-c-divider);border-radius:8px" title="第 3 课：上下文工程"></iframe>

<a href="/agent-course/lessons/0003-context-engineering.html" target="_blank" rel="noopener">在新标签页中打开本课</a>

### 第 4 课：权限与确认 —— 让人类保持控制权

agent 能写文件、能执行 shell，怎么防闯祸？确认器、允许列表、YOLO 模式的代价，以及确认请求如何从引擎一路弹到界面。

<iframe src="/agent-course/lessons/0004-permissions-and-confirmation.html" style="width:100%;height:85vh;min-height:600px;border:1px solid var(--vp-c-divider);border-radius:8px" title="第 4 课：权限与确认"></iframe>

<a href="/agent-course/lessons/0004-permissions-and-confirmation.html" target="_blank" rel="noopener">在新标签页中打开本课</a>

### 第 5 课：会话与持久化 —— 关掉窗口，对话还在

每步落盘、会话级文件锁、格式迁移、fork 分叉。以及「JSON 文件 vs SQLite」的持久化选型权衡。

<iframe src="/agent-course/lessons/0005-sessions-and-persistence.html" style="width:100%;height:85vh;min-height:600px;border:1px solid var(--vp-c-divider);border-radius:8px" title="第 5 课：会话与持久化"></iframe>

<a href="/agent-course/lessons/0005-sessions-and-persistence.html" target="_blank" rel="noopener">在新标签页中打开本课</a>

### 第 6 课：防护与停止条件 —— 生产级的完整自保清单

循环的四种死法（无限轮回 / 格式坏掉 / 反复失败 / 转圈）和 aionrs 的对策。最妙的一招：把警告写成自然语言注入工具结果，让模型自救。

<iframe src="/agent-course/lessons/0006-guards-and-stop-conditions.html" style="width:100%;height:85vh;min-height:600px;border:1px solid var(--vp-c-divider);border-radius:8px" title="第 6 课：防护与停止条件"></iframe>

<a href="/agent-course/lessons/0006-guards-and-stop-conditions.html" target="_blank" rel="noopener">在新标签页中打开本课</a>

### 第 7 课（终课）：动手写你自己的最小 Agent

80 行 TypeScript：循环 + 工具 + 护栏，真的读你电脑上的文件。附「玩具 → 生产」六课对照清单和迭代路线图。

<iframe src="/agent-course/lessons/0007-build-your-own-agent.html" style="width:100%;height:85vh;min-height:600px;border:1px solid var(--vp-c-divider);border-radius:8px" title="第 7 课：动手写你自己的最小 Agent"></iframe>

<a href="/agent-course/lessons/0007-build-your-own-agent.html" target="_blank" rel="noopener">在新标签页中打开本课</a>

---

*教学状态（使命、学习记录）保存在本地 `agent-learning/` 目录。*
