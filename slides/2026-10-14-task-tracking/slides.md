---
theme: default
title: 部门任务怎么推进 · WBS与任务接取
author: 李昊洋
info: |
  运控与力控部门任务跟踪：任务发布、接取、子Issue推进、交付验收与评价讨论。
colorSchema: light
fonts:
  provider: none
class: task-deck
canvasWidth: 1280
aspectRatio: 16/9
drawings:
  enabled: false
download: false
record: false
---

<div class="cover">
  <div class="eyebrow">运控 · 力控 / 2026.10.14</div>
  <h1>部门任务跟踪<br>使用说明</h1>
  <div class="cover-line"></div>
  <p class="subtitle">任务放在哪、谁来接、进展怎么记、成果怎么验收。</p>
  <div class="cover-bottom">包括运控和力控。六项评价权重先按本版采用。</div>
</div>

<div class="footer"><span>部门任务跟踪方案</span><span>{{ $page }} / {{ $nav.total }}</span></div>

<!-- 这是平时怎么一起做事的说明，不是宣布一套已经完全定好的绩效制度。 -->

---

<div class="eyebrow">分工</div>

# 发布任务、定分数和验收，分别由谁处理

| 谁 | 负责什么 |
| --- | --- |
| 我 | 确定需求、发布任务、协调依赖、验收和评价 |
| 老板 | 给任务打基础分 |
| 接取任务的人 | 可以是我，也可以是同事；拆子Issue、推进、提交成果 |
| 协作的人 | 在对应子Issue里记录自己负责的工作 |

<div class="strip">任务基础分由老板定；完成情况由我根据交付和证据评估。</div>

<div class="footer"><span>主责人写在父Issue的Assignee里，协作分工写在任务说明或子Issue里</span><span>{{ $page }} / {{ $nav.total }}</span></div>

---

<div class="eyebrow">任务结构</div>

# Project、Module和Issue分别放什么

<div class="wbs">
  <div class="wbs-box"><span>Project</span><strong>V3抓取规划算法<br>开发与验证</strong></div>
  <div class="arrow">→</div>
  <div class="wbs-box"><span>Module</span><strong>轨迹规划</strong></div>
  <div class="arrow">→</div>
  <div class="wbs-box"><span>发布的任务 / 父Issue</span><strong>候选选择与抽离计算提速</strong></div>
</div>

<div class="two" style="margin-top:30px">
  <div class="panel"><h2>Module：任务的能力归属</h2><p>规划提速放「轨迹规划」；路径后处理放「轨迹优化」。</p></div>
  <div class="panel"><h2>Milestone：交付节点</h2><p>例如「性能与误差验证通过」，可以包含不同模块的任务。</p></div>
</div>

<div class="footer"><span>任务类型另选：调研 / 功能开发 / 优化 / 缺陷修复 / 验证测试</span><span>{{ $page }} / {{ $nav.total }}</span></div>

---

<div class="eyebrow">从发布到验收</div>

# 发布、接取、推进、验收的六个步骤

<div class="steps">
  <div class="step"><div class="num">01</div><h2>我发布父Issue</h2><p>写需求、范围、产物、验收要求和时间。</p></div>
  <div class="step"><div class="num">02</div><h2>老板给基础分</h2><p>分数记录在发布的任务上。</p></div>
  <div class="step"><div class="num">03</div><h2>我或同事接取</h2><p>确认主责人、工作范围、依赖和计划。</p></div>
  <div class="step"><div class="num">04</div><h2>接取人开子Issue</h2><p>自己拆步骤，记录实现、实验和问题。</p></div>
  <div class="step"><div class="num">05</div><h2>回父Issue提交成果</h2><p>评论附结果、证据和还没完成的部分。</p></div>
  <div class="step"><div class="num">06</div><h2>我验收并给评价</h2><p>需要调整就继续；评估完成后由我设Done。</p></div>
</div>

<div class="footer"><span>子Issue做完，不等于父任务已经验收</span><span>{{ $page }} / {{ $nav.total }}</span></div>

---

<div class="eyebrow">父Issue的状态</div>

# 父Issue的状态和修改方式

<div class="states">
  <div class="st"><b>可接取</b><span>我发布，写好需求</span></div>
  <div class="arrow">→</div>
  <div class="st"><b>进行中</b><span>有人接了，开子Issue推进</span></div>
  <div class="arrow">→</div>
  <div class="st"><b>待验收</b><span>成果评论在父Issue下</span></div>
  <div class="arrow">→</div>
  <div class="st dark"><b>Done</b><span>我评估完、记下评价</span></div>
</div>

<div class="returns">
  <div><b>待验收 → 进行中</b><p>我在父Issue评论列出未通过的要求和需要补的内容，接取人继续处理。</p></div>
  <div><b>Done → 重新打开 → 进行中</b><p>接取人对评价有意见，自己重新打开，接着优化，做完再交一次。</p></div>
</div>

<div class="strip">谁能改状态：设Done只有我；重新打开接取人自己就可以。其他状态跟着实际进度走。</div>

<div class="footer"><span>状态名以实际使用的Issue工具为准</span><span>{{ $page }} / {{ $nav.total }}</span></div>

---

<div class="eyebrow">父Issue示例</div>

# 发布一项「规划提速」任务，要填这些信息

<dl class="task-example">
  <dt>任务</dt><dd>降低候选选择与抽离计算耗时。</dd>
  <dt>要达到什么</dt><dd>减少同一批任务的计算时间；成功率、失败情况和耗时一起比较。</dd>
  <dt>交什么</dt><dd>可运行代码、测试配置、优化前后对照、失败清单。</dd>
  <dt>怎么验收</dt><dd>用同一模型、场景、种子和预算重跑，核对成功率与耗时。</dd>
  <dt>接取前确认</dt><dd>主责人、预计时间、外部依赖，以及老板给的基础分。</dd>
</dl>

<div class="strip">后续修改需求时，在父Issue记录新要求、变更原因和调整后的时间。</div>

<div class="footer"><span>示例来自候选选择与规划提速，具体数值由任务本身确定</span><span>{{ $page }} / {{ $nav.total }}</span></div>

---

<div class="eyebrow">子Issue示例</div>

# 父Issue管交付，子Issue管怎么做

<div class="two">
  <div class="thread">
    <div class="thread-head"><strong>父任务：规划计算提速</strong><span class="tag">主责人已接取</span></div>
    <div class="child"><b>子任务：定位计算热点</b><span>耗时拆解</span></div>
    <div class="child"><b>子任务：实现候选处理优化</b><span>代码与回归</span></div>
    <div class="child"><b>子任务：统一案例对照</b><span>数据与报告</span></div>
    <p class="small" style="margin-top:18px">子任务怎么拆，由接取人根据实际工作决定。</p>
  </div>
  <div class="panel">
    <h2>子Issue里更新的内容</h2>
    <div class="facts">
      <div><b>现在</b>已经做了什么，结果如何。</div>
      <div><b>问题</b>卡在哪里，需要谁提供什么。</div>
      <div><b>证据</b>提交、PR、数据、日志或报告。</div>
      <div><b>下一步</b>接着做什么，时间有没有变化。</div>
    </div>
  </div>
</div>

<div class="footer"><span>建议只对接取的父任务计一次分，子Issue不重复计分</span><span>{{ $page }} / {{ $nav.total }}</span></div>

---

<div class="eyebrow">申请验收时</div>

# 提交验收时，父Issue评论包含哪些内容

<div class="thread">
  <div class="thread-head"><strong>交付评论的四项内容</strong><span class="tag">模板</span></div>
  <div class="facts">
    <div><b>完成内容</b>哪些要求已经完成，哪些还没完成。</div>
    <div><b>测试结果</b>同条件的成功率、耗时、失败原因和适用范围。</div>
    <div><b>产物链接</b>代码 / PR、报告、数据、运行方法和回放。</div>
    <div><b>已知限制</b>是否只测代表案例；还有哪些现场或参数没验证。</div>
  </div>
</div>

<div class="strip">成果可以分散存放，但代码、数据、报告和运行方法的入口统一列在这条评论里。</div>

<div class="footer"><span>调研交报告和结论；开发交可用功能；测试交记录和边界</span><span>{{ $page }} / {{ $nav.total }}</span></div>

---

<div class="eyebrow">验收处理</div>

# 验收之后，有三种处理

<div class="verdict">
  <div><h2>需要补东西</h2><p>缺数据、运行方法或工作记录。</p><p>我列清单，接取人补齐再提交。</p></div>
  <div><h2>需要继续调整</h2><p>结果不满足任务约定，或质量存在问题。</p><p>评论注明未通过项，接取人修正后重新提交。</p></div>
  <div><h2>可以完成评估</h2><p>成果和完成边界已经核实。</p><p>记录评价与依据，由我设置Done。</p></div>
</div>

<div class="strip">验收记录包含：通过项、未通过项、评价结果、对应证据和下一步处理。</div>

<div class="footer"><span>补充材料或修正结果后，仍在原父Issue中申请验收</span><span>{{ $page }} / {{ $nav.total }}</span></div>

---

<div class="eyebrow">重新打开</div>

# 对评价有异议，怎样重新提交

<div class="loop">
  <div class="loop-box">我记录评价依据<br>并设Done</div><div class="arrow">→</div>
  <div class="loop-box">接取人提出异议<br>或改进计划</div><div class="arrow">→</div>
  <div class="loop-box">重新打开任务<br>继续优化</div><div class="arrow">→</div>
  <div class="loop-box">提交新增成果<br>再次验收</div>
</div>

<div class="two" style="margin-top:35px">
  <div class="panel"><h2>保留每一次评价</h2><p>写明评价时间、结果、依据，以及后来改进了什么。</p></div>
  <div class="panel"><h2>同一任务的分数如何更新</h2><p>记录本次新增成果和评价变化。已汇报的分数怎么更正，由我结合具体情况确认。</p></div>
</div>

<div class="footer"><span>重新提交时附新增成果或复查依据，我据此再次评估</span><span>{{ $page }} / {{ $nav.total }}</span></div>

---

<div class="eyebrow">时间线示例</div>

# 一项任务从发布到再次验收的记录

<div class="timeline">
  <div><time>10/15</time><b>我</b><span>新建父Issue「规划计算提速」，写清需求和验收方式，标记<em>可接取</em></span></div>
  <div><time>10/15</time><b>老板</b><span>在父Issue上给出这个任务的基础分</span></div>
  <div><time>10/16</time><b>同事A</b><span>评论“我来接”，写下计划和预计完成时间，任务指派给他</span></div>
  <div><time>10/16</time><b>同事A</b><span>自己开3个子Issue：找计算热点 / 改候选处理 / 前后对照测试</span></div>
  <div><time>10/23</time><b>同事A</b><span>在父Issue评论提交成果：PR、对照数据、运行方法、已知限制</span></div>
  <div class="back"><time>10/24</time><b>我</b><span>验收：少了失败案例清单，<em>退回继续调整</em></span></div>
  <div><time>10/27</time><b>同事A</b><span>补齐后再次提交</span></div>
  <div class="done"><time>10/28</time><b>我</b><span>完成评估，写下各项评价和理由，<em>设为Done</em></span></div>
  <div class="back"><time>10/29</time><b>同事A</b><span>对评价有意见，<em>重新打开</em>，继续优化后再提交，我再验收一次</span></div>
</div>

<div class="footer"><span>日期和人名只是示例；所有记录都在同一个父Issue里能查到</span><span>{{ $page }} / {{ $nav.total }}</span></div>

---

<div class="eyebrow">任务分数和完成评价</div>

# 一个任务的分数怎么算

<div class="score-formula">任务基础分 × 验收评价系数 = 任务绩效贡献</div>

<div class="score-row">
  <div><b>基础分</b><p>这项任务值多少分，由老板确定。</p></div>
  <div><b>评价系数</b><p>完成程度、结果质量和交付情况，由我验收评估。</p></div>
  <div><b>部门量化</b><p>汇总任务贡献和依据，提交给老板参考。</p></div>
</div>

<div class="calc"><b>举个例子：</b>老板给某任务定 10 分。我按下一页六项打分：完成度90、质量80、按时100、交付清楚80、过程留痕70、可用复用80，加权后是 85%。这个任务记 <b>10 × 85% = 8.5 分</b>。</div>

<div class="strip">六项评价加权得到系数，再乘任务基础分。父任务记一次总分，子Issue用于确认各人的贡献。</div>

<div class="footer"><span>示例分数只用于说明算法，不对应任何员工的实际评价</span><span>{{ $page }} / {{ $nav.total }}</span></div>

---

<div class="eyebrow">目前采用的评价指标</div>

# 六项指标和对应的证据

<table class="criteria">
  <thead><tr><th>指标</th><th>主要看什么</th><th>当前权重</th></tr></thead>
  <tbody>
    <tr><td>完成度</td><td>任务约定的目标和范围，实际完成了多少。</td><td>40%</td></tr>
    <tr><td>结果质量</td><td>准确性、稳定性、边界处理和关键细节。</td><td>20%</td></tr>
    <tr><td>按时交付</td><td>是否在确认的期限完成；阻塞有没有及时提出。</td><td>10%</td></tr>
    <tr><td>交付清楚、容易验收</td><td>结论、证据、限制和运行方法是否好找、好理解。</td><td>10%</td></tr>
    <tr><td>过程可追溯</td><td>需求、子Issue、代码版本、实验与结论能否对上。</td><td>10%</td></tr>
    <tr><td>可用与复用</td><td>别人能否使用成果；是否有必要说明和可复用资产。</td><td>10%</td></tr>
  </tbody>
</table>

<div class="strip">调研任务看报告和路线结论；开发任务看功能及测试；验收任务看测试记录和可复现结果。</div>

<div class="footer"><span>每项0–100，加权得到评价系数；不直接使用Issue进度百分比</span><span>{{ $page }} / {{ $nav.total }}</span></div>

---

<div class="eyebrow">多人协作</div>

# 父任务指定一名负责人，按实际贡献分配分数

<div class="two">
  <div class="thread">
    <div class="thread-head"><strong>父任务：规划计算提速</strong><span class="tag">负责人：同事A</span></div>
    <div class="child"><b>子Issue：优化候选处理</b><span>同事A</span></div>
    <div class="child"><b>子Issue：对照测试与报告</b><span>同事B</span></div>
    <p class="small" style="margin-top:18px">父任务负责人汇总交付；各人工作、产物和协作情况记录在对应子Issue里。</p>
  </div>
  <div class="panel"><h2>分配示例</h2><p>任务总贡献：10 × 85% = <b>8.5分</b></p><p>确认A贡献60%、B贡献40%：</p><p>A：8.5 × 60% = <b>5.1分</b></p><p>B：8.5 × 40% = <b>3.4分</b></p><p class="small">比例仅为示例。根据实际贡献确认，不按负责人身份或子Issue数量自动分配。</p></div>
</div>

<div class="footer"><span>两人分配的总和仍是本任务8.5分，不给每个人各计一遍父任务总分</span><span>{{ $page }} / {{ $nav.total }}</span></div>

---

<div class="eyebrow">延期、需求变化和再次验收</div>

# 特殊情况具体确认，不设固定扣分表

<div class="questions">
  <div><b>01</b><p>外部条件没到位<small>在Issue里写明缺什么、影响哪些工作。我结合实际情况确认时间和评价。</small></p></div>
  <div><b>02</b><p>任务要求有变化<small>记录新要求、已经完成的部分及额外工作，再确认验收范围和时间。</small></p></div>
  <div><b>03</b><p>重新打开后再提交<small>记录新增成果和新的评价；涉及已汇报分数的调整，由我按具体情况确认。</small></p></div>
</div>

<div class="footer"><span>调整后的要求、时间和评价依据，都记录在原父Issue中</span><span>{{ $page }} / {{ $nav.total }}</span></div>
