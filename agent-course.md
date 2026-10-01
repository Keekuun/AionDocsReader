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

---

*课程持续更新。教学状态（使命、学习记录）保存在本地 `agent-learning/` 目录。*
