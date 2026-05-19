---
theme: default
title: Linear 工作流说明
info: |
  ## Linear 工作流说明
  面向老板、PM、工程师与 AI 工程师的公司协作教程。
class: text-left
transition: fade
drawings:
  enabled: false
  persist: false
comark: true
lineNumbers: false
canvasWidth: 1280
aspectRatio: 16/9
duration: 22min
---

# <span class="big-gradient">Linear 工作流说明</span>

<div class="mt-8 text-3xl font-700">目标：让大家少问重复问题，多留下可追溯结果</div>

<div class="mt-14 grid grid-cols-3 gap-5">
  <div v-click class="entity-card explain-focus">
    <div class="entity-label">老板</div>
    <div class="entity-title">快速看懂项目</div>
    <div class="entity-desc">进度、风险、证据、决策点</div>
  </div>
  <div v-click class="entity-card explain-focus">
    <div class="entity-label">PM</div>
    <div class="entity-title">拆解和同步</div>
    <div class="entity-desc">Project / Milestone / Issue / Update</div>
  </div>
  <div v-click class="entity-card explain-focus">
    <div class="entity-label">工程师 & AI</div>
    <div class="entity-title">知道自己该做什么</div>
    <div class="entity-desc">短评论、Refs、验收证据、Done</div>
  </div>
</div>

<div class="abs-br m-8 text-sm opacity-55">按 Space / → 推进动画</div>

<!--
讲稿：
- 今天不是介绍一个软件有多厉害，而是说明我们公司准备怎么用它减少协作损耗。
- 现在真实工作会发生在代码、机械安装、测试、会议、采购、人事等很多地方，最大问题是信息容易散。
- Linear 在这里的作用是：让老板快速看状态，让 PM 能拆解同步，让工程师和 AI 知道自己该接哪一步。
- 先记住一句话：Linear 不替大家工作，它负责让工作不丢、结果可追溯。
-->

---
layout: section
---

# 第一部分：Linear 里的元素到底各管什么？

<div class="text-2xl opacity-75 mt-6">不是所有东西都叫“任务”，不同元素负责不同层级的信息。</div>

<!--
讲稿：
- 第一部分先不讲具体项目，只讲名词边界。
- 我们过去容易把项目、阶段、问题、评论、汇报都混成“任务”，这样后面一定乱。
- 接下来我会按从粗到细解释：Team、Project、Milestone、Issue、Comment、Update / Done。
-->

---
clicks: 6
---

# 1. 元素地图：同一个界面，逐次切换讲解焦点

<ElementFocus />

<!--
讲稿：
- 初始：先看这是一套模拟 Linear 界面，左侧不是装饰，会跟着讲解对象切换。
- click 1 Team：Team 是部门/小组归属，不是微信群；它决定权限、工作池和部门内协作边界。
- click 2 Project：Project 写方向和边界，例如为什么做、做到什么程度、谁判断成败。
- click 3 Milestone：Milestone 是阶段验收点，不是把所有任务塞进去的篮子。
- click 4 Issue：Issue 是最小执行闭环，最好一个负责人能推进，一个结果能判断。
- click 5 Comment：评论不是作文区，只写进展、证据、风险、下一步。
- click 6 Update / Done：Update 是阶段汇报，Done 是关闭依据；两者都要引用证据，不替代具体 issue。
-->

---
clicks: 5
---

# 2. 从公司拆到一个极小 issue

<HierarchyZoom from-clicks />

<!--
讲稿：
- 这页讲颗粒度：越上层字段越完整，越下层越轻量。
- click 1 公司：公司层面关心方向和资源，不适合记录每个小动作。
- click 2 部门：部门负责某类能力，例如运控、机械、仿真、GitOps。
- click 3 Project：项目承载一个明确方向，比如“新机械臂仿真闭环”。
- click 4 Milestone：阶段把大项目切成可验收节点。
- click 5 Issue：最终落到一个极小问题，工程师和 AI 打开就能做。
- 这也是减少字段负担的核心：不是每个小任务都填一堆大项目字段。
-->

---
layout: section
---

# 第二部分：一个小问题如何真实推进？

<div class="text-2xl opacity-75 mt-6">办公室里最常见的不是大项目，而是一个具体卡点。</div>

<!--
讲稿：
- 第二部分讲日常最常见场景：不是新建大工程，而是某个具体问题卡住了。
- 我们希望大家不要一遇到问题就口头散聊，也不要什么都建 Project。
- 合理做法是：先建 issue，推进中用短评论，必要时拆 subissue，最后留证据关闭。
-->

---
clicks: 5
---

# 3. 小问题推进：从 issue 到证据闭环

<SmallIssueScene />

<!--
讲稿：
- click 1 建 issue：例如 IK 失败定位，标题要具体，验收要能判断。
- click 2 短评论：运控只写关键进展和证据，不写长篇推理；长内容可以放文档链接。
- click 3 拆 subissue：如果 tool0 坐标复核需要机械单独负责，就拆 subissue；如果只是排查步骤，就留在原评论。
- click 4 Git Refs：代码提交写 `Refs TIM-52: ...`，让代码和 Linear 关联起来。
- click 5 Done 证据：关闭前留下结论、日志/截图/视频、commit、产物路径、后续问题链接。
- 补充：如果是机械安装、会议、测试、采购这类非代码工作，也一样可以用 issue，只是证据换成照片、视频、会议纪要、采购单或测试记录。
-->

---
layout: section
---

# 第三部分：部门内和部门间协作怎么做？

<div class="text-2xl opacity-75 mt-6">部门内靠短闭环，部门间靠显式依赖，不靠口头转发。</div>

<!--
讲稿：
- 第三部分讲协作边界。
- 部门内问题可以快一点，评论里问清楚就行。
- 部门间就不能靠“帮我问一下”，需要显式留下依赖关系，否则 PM 和老板都看不见真实阻塞。
-->

---
clicks: 4
---

# 4. 协作流程：部门内快，部门间清楚

<CollaborationScene />

<!--
讲稿：
- click 1 部门内：同一个 team 里，能在原 issue 评论解决的就别乱拆。
- click 2 部门间：跨 team 时，用 related / blocked by / subissue，把依赖放到系统里。
- click 3 需要他人介入：@ 人的时候要说明希望对方确认什么、给什么输入、是否影响验收。
- click 4 Resolve：评论 resolve 只表示这个讨论点闭环；仍影响验收、风险判断、老板决策的评论不要 resolve。
- 补充：Linear 的 issue 默认单 assignee，所以多人协作时用主负责人 + subissue / 评论 @ 人来表达协作，不要让“多人负责”等于没人负责。
-->

---
layout: section
---

# 第四部分：验收、证据、Update，分别给谁看？

<div class="text-2xl opacity-75 mt-6">部门推进和老板验收不是同一件事，中间要靠证据桥接。</div>

<!--
讲稿：
- 第四部分是最容易混的：部门说完成了，老板未必知道它为什么算完成。
- 工程师负责留下技术证据，PM 负责把证据翻译成管理语言和业务结论。
- 所以 issue、Done 证据、Project Update 的职责不同，不能互相替代。
-->

---
clicks: 4
---

# 5. 结果表达：验收、证据、Update 的分工

<AcceptanceScene />

<!--
讲稿：
- click 1 部门验收：看技术上能不能关，例如能运行、误差达标、稳定性达标、实物安装完成。
- click 2 老板验收：看业务上值不值得过，例如能否演示、是否影响交付、是否符合当前目标。
- click 3 Done 证据：不是新任务，而是 issue 关闭依据，未来复盘时能知道为什么当时认为完成。
- click 4 Project Update：写阶段摘要，引用关键 issue，不复制 issue 全文；它给老板、PM、跨部门快速同步用。
- 这里的桥接关系是：工程师证据 → PM 摘要 → 老板判断。
-->

---
layout: section
---

# 第五部分：风险、阻塞、延期怎么处理？

<div class="text-2xl opacity-75 mt-6">风险不要藏在评论深处，阻塞不要只写“卡住了”。</div>

<!--
讲稿：
- 第五部分讲异常情况。
- 项目管理里最大的问题不是出问题，而是问题已经影响计划但没人提前看见。
- 所以风险、阻塞、延期要有标准写法。
-->

---
clicks: 3
---

# 6. 特殊情况：Risk / Blocked / Delay

<RiskScene />

<!--
讲稿：
- click 1 Risk issue：风险不是普通 bug，而是可能影响 Milestone、交付时间、成本、跨部门资源或老板决策的不确定性。
- click 2 Blocked：不要只写“卡住了”，要写被什么卡住、等谁、需要什么输入、解除后下一步是什么。
- click 3 Delay：延期不只是改 due date，要写原因、剩余工作、新截止时间、是否影响上级 Milestone。
- 小问题先留评论；只有影响计划时，才升级成 Risk issue。
-->

---
layout: section
---

# 最后一部分：用一个大项目串起来

<div class="text-2xl opacity-75 mt-6">把前面的元素放回真实项目主线里看。</div>

<!--
讲稿：
- 最后用一个完整项目把前面的东西串起来。
- 这样大家会看到：Project、Milestone、Issue、评论、Git、Risk、验收、Update 不是互相割裂的功能，而是一条推进链路。
-->

---
clicks: 10
---

# 7. 完整主线：新机械臂仿真闭环项目

<WorkflowScene from-clicks />

<!--
讲稿：
- click 1 老板提出目标：两周内看到新机械臂仿真闭环演示。
- click 2 PM 建 Project：写目标、边界、时间、验收口径。
- click 3 拆 Milestone：场景搭建、规划闭环、演示验收。
- click 4 创建 Issues：机械、仿真、运控、GitOps 分工，每个 issue 有负责人和验收。
- click 5 部门内推进：工程师用短评论留下进展、证据、风险、下一步。
- click 6 跨部门 subissue：模型坐标、接口、场景等跨部门问题显式拆出来。
- click 7 Git Refs：提交和 issue 关联，后续能从 Linear 追到代码。
- click 8 Risk 升级：影响 Milestone 的不确定性单独追踪。
- click 9 老板验收：老板看 Update 和关键证据，PM 负责翻译技术结果。
- click 10 Done 证据归档：结论、证据、commit、产物路径保留，后续方向进 Backlog 或新 issue。
- 补充 AI 场景：AI 工程师接手时，先读 issue 描述、最新评论、关联 commit；完成后必须留下交接说明。
-->

---

# 这套流程的目标

<div class="grid grid-cols-2 gap-6 mt-8">
  <div class="entity-card explain-focus"><div class="entity-title">少重复解释</div><div class="entity-desc">AI / 人类工程师打开 issue 就能知道上下文。</div></div>
  <div class="entity-card explain-focus"><div class="entity-title">少长篇作文</div><div class="entity-desc">评论写结论和证据，复杂推理放文档链接。</div></div>
  <div class="entity-card explain-focus"><div class="entity-title">少隐藏风险</div><div class="entity-desc">影响计划的风险单独追踪，别埋在聊天记录里。</div></div>
  <div class="entity-card explain-focus"><div class="entity-title">多可验收结果</div><div class="entity-desc">Done 不是“我做完了”，而是证据足够关闭。</div></div>
</div>

<!--
讲稿：
- 这页收束成四个目标。
- 少重复解释：新人和 AI 不需要每次重新问背景。
- 少长篇作文：Linear 里放结论和证据，复杂推理放链接。
- 少隐藏风险：影响计划的事情要独立可见。
- 多可验收结果：Done 要能经得起未来复盘。
-->

---

# 结束

<div class="mt-10 text-3xl font-800">一句话：Linear 不替大家工作，它负责让工作不丢。</div>

<div class="mt-8 text-xl opacity-70">接下来我们会把真实项目按这套方法逐步迁移。</div>

<!--
讲稿：
- 最后提醒大家：先不用追求完美流程，先做到关键内容不丢。
- 新项目从 Project 开始，小问题从 issue 开始，跨部门依赖显式写出来，完成一定留证据。
- 后续我们会根据真实使用情况继续调整这套规则。
-->
