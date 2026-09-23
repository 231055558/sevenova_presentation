---
theme: default
title: 运控组本周进展 · 2026-09-23
info: |
  运控部门周会：回顾 9 月第三周进展，讨论下一周工作安排。
class: motion-deck
transition: fade
drawings:
  enabled: false
canvasWidth: 1280
aspectRatio: 16/9
duration: 22min
---

<div class="cover-copy">
  <div class="kicker">MOTION CONTROL · WEEKLY REVIEW</div>
  <h1>运控组本周进展<br><span>与下周安排</span></h1>
  <p>用几个实际案例对齐当前状态和下一步</p>
  <div class="cover-meta">2026.09.23 / Wednesday</div>
</div>

<div class="cover-image">
  <img :src="'./assets/v3-model-review.png'" alt="V3.1.1 双臂机器人模型 Rerun 验证画面">
</div>

<div class="page-no">01 / 11</div>

<!--
开场：今天简单回顾本周做了什么，再用几个具体案例讨论下周怎么继续推进。
-->

---

<div class="kicker">01 · 本周结论</div>

# 这周主要推进了四件事

<div class="result-grid mt-8">
  <div class="result-item accent-green">
    <div class="result-top"><b>592 / 592</b><span>核心测试</span></div>
    <h3>三代模型与算法基础</h3>
    <p>吸盘 26 轴、夹爪 28 轴；FK、解析 / 数值 IK、FCL 验证通过，ROS 2 测试 9 / 9。</p>
  </div>
  <div class="result-item accent-cyan">
    <div class="result-top"><b>25 / 25</b><span>仿真最小闭环</span></div>
    <h3>箱墙搬运</h3>
    <p>旧 V3 连续搬运跑通；V3.1.1 铲式方案完成抓取与空载过渡，长尾仍需优化。</p>
  </div>
  <div class="result-item accent-yellow">
    <div class="result-top"><b>14 轴</b><span>真实状态读取</span></div>
    <h3>滚动目标联调</h3>
    <p>建立当前姿态 HOLD 入口；现场出现过 UPDATE_TIMEOUT，连续更新稳定性尚未验收。</p>
  </div>
  <div class="result-item accent-red">
    <div class="result-top"><b>3.75 N</b><span>独立姿态 RMSE</span></div>
    <h3>六维力与拖动示教</h3>
    <p>20 组拟合、5 组验证；影子链路跑通，尚未形成真机拖动验收结论。</p>
  </div>
</div>

<div class="bottom-note">整体判断：基础能力有明显推进，部分结果还需要继续补性能和实机验证。</div>
<div class="page-no">02 / 11</div>

---

<div class="kicker">02 · 协作复盘</div>

# 本周有三处典型的协作记录问题

<div class="case-overview mt-8">
  <div>
    <span class="person">张泽临</span>
    <b>结果有记录，后续任务没接上</b>
    <p>MOTION-224 已完成，个人周报里的技术证据很完整；但双臂异步和学习调研还没有对应的在办 Linear 任务。</p>
    <em>典型问题：任务交接断档</em>
  </div>
  <div>
    <span class="person">蒋梓欣</span>
    <b>飞书和 Linear 状态没有对齐</b>
    <p>WPF 工作站只在飞书任务中；拖动示教仍停在 MOTION-197 Review，影子测试与真机验收边界不直观。</p>
    <em>典型问题：平台分散、状态含义不清</em>
  </div>
  <div>
    <span class="person">李昊洋 · 文子轩</span>
    <b>并行实验没有共用比较口径</b>
    <p>5×5 两条路线分别记录约 50 秒 / 箱和核心规划平均 2.60 秒，但输入、计时边界和重试口径不同。</p>
    <em>典型问题：结果无法直接横向比较</em>
  </div>
</div>

<div class="bottom-note warning">这里复盘的是协作记录，不是否定具体工作结果。</div>
<div class="page-no">03 / 11</div>

---

<div class="kicker">03 · 典型一</div>

# 张泽临：结果很完整，但任务链没有继续

<div class="case-detail mt-8">
  <div class="case-fact good">
    <span>做得好的部分</span>
    <h3>MOTION-224 与个人周报</h3>
    <p>25 / 25 抓取、25 / 25 空载过渡、平均 2.60 秒、中位 1.31 秒、困难箱编号和 Rerun / CSV 都写清楚了。</p>
  </div>
  <div class="case-arrow">→</div>
  <div class="case-fact missing">
    <span>断掉的部分</span>
    <h3>下一步没有进入在办任务</h3>
    <p>困难箱长尾、双臂异步、学习算法调研已经进入讨论，但当前看不到对应的活动 Issue 和承接关系。</p>
  </div>
</div>

<div class="fix-strip mt-8">
  <b>这次怎么改</b>
  <span>在 MOTION-224 结论中链接后续 Issue</span>
  <i>→</i>
  <span>双臂异步与学习调研分别建立任务</span>
  <i>→</i>
  <span>下周进展回到对应 Issue 更新</span>
</div>
<div class="bottom-note">重点不是多建任务，而是让“已完成结果 → 下一步工作”能够顺着链接找到。</div>
<div class="page-no">04 / 11</div>

---

<div class="kicker">04 · 典型二、三</div>

# 状态要对齐，平行实验要能比较

<div class="dual-cases mt-7">
  <div class="named-case">
    <div class="case-head"><span>蒋梓欣</span><b>任务状态分散</b></div>
    <div class="case-line"><em>飞书</em><p>WPF 工作站：进行中</p></div>
    <div class="case-line"><em>Linear</em><p>MOTION-197 拖动示教：In Review</p></div>
    <div class="case-line"><em>实际边界</em><p>影子链路已跑通，真机运动尚未验收</p></div>
    <div class="case-fix"><b>补法</b><span>WPF 建对应 Issue；MOTION-197 更新“已验证 / 未验证 / 下一步”。</span></div>
  </div>
  <div class="named-case">
    <div class="case-head"><span>李昊洋 · 文子轩</span><b>平行结果不可直接比较</b></div>
    <div class="compare-mini"><strong>约 50 s / 箱</strong><i>≠</i><strong>2.60 s 平均</strong></div>
    <p class="case-explain">前者观察完整流程，后者只统计核心规划；两边没有先共用 benchmark 定义。</p>
    <div class="case-fix"><b>补法</b><span>共用输入集、算法版本、计时起止、超时与重试规则。</span></div>
  </div>
</div>

<div class="bottom-note success">最小要求：Linear 能看懂当前边界；实验之间能用同一口径做比较。</div>
<div class="page-no">05 / 11</div>

---

<div class="kicker">05 · 近期主线一</div>

# 固定底盘：下周继续优化 5 × 5

<div class="wall-layout mt-7">
  <div class="box-wall" aria-label="25 箱困难箱位示意">
    <div><span>21</span></div><div><span>22</span></div><div class="hard"><span>23</span></div><div><span>24</span></div><div><span>25</span></div>
    <div class="hard"><span>16</span></div><div><span>17</span></div><div class="hard"><span>18</span></div><div class="hard"><span>19</span></div><div class="hard"><span>20</span></div>
    <div><span>11</span></div><div><span>12</span></div><div class="hard"><span>13</span></div><div><span>14</span></div><div><span>15</span></div>
    <div><span>06</span></div><div class="hard"><span>07</span></div><div><span>08</span></div><div><span>09</span></div><div><span>10</span></div>
    <div><span>01</span></div><div><span>02</span></div><div class="hard"><span>03</span></div><div><span>04</span></div><div><span>05</span></div>
  </div>
  <div class="work-list">
    <div><b>当前基线</b><span>25 / 25 抓取、25 / 25 空载过渡</span></div>
    <div><b>优先难箱</b><span>3、7、13、19、20、21、23</span></div>
    <div><b>本轮优化</b><span>失败重试长尾、离线缓存、完整墙泛化</span></div>
    <div><b>统一验收</b><span>相同输入集与计时口径，输出失败清单</span></div>
  </div>
</div>

<div class="bottom-note">25 箱定义：摆放状态良好的箱墙测试；不把它扩大解释成任意箱墙泛化。</div>
<div class="page-no">06 / 11</div>

---

<div class="kicker">06 · 近期主线二</div>

# 双臂异步：先讨论第一步怎么改

<div class="timeline-compare mt-9">
  <div>
    <h3>现在：最慢一臂决定整组节拍</h3>
    <div class="arm-line"><b>L</b><span class="seg plan">规划</span><span class="seg move wide">运动</span><span class="seg wait">等待</span></div>
    <div class="arm-line"><b>R</b><span class="seg plan long">规划</span><span class="seg move">运动</span><span class="seg done">完成</span></div>
  </div>
  <div>
    <h3>目标：各臂独立推进，共享冲突门控</h3>
    <div class="arm-line"><b>L</b><span class="seg plan">规划</span><span class="seg move wide">运动</span><span class="seg done">下一箱</span></div>
    <div class="arm-line"><b>R</b><span class="seg plan long">规划</span><span class="seg move">运动</span><span class="seg done">下一箱</span></div>
  </div>
</div>

<div class="decision-row mt-10">
  <div><b>独立状态机</b><span>每臂可单独规划、执行、失败与恢复</span></div>
  <div><b>共享资源门控</b><span>升降轴、车体中区、放置区、双负载碰撞</span></div>
  <div><b>统一场景快照</b><span>两臂规划必须消费同一版本障碍与附着物</span></div>
</div>

<div class="bottom-note warning">建议先讨论：从“异步规划 + 串行执行”起步，还是直接验证并行执行。</div>
<div class="page-no">07 / 11</div>

---

<div class="kicker">07 · 近期主线三</div>

# 底盘 x / y / yaw：并行做一组可达性验证

<div class="base-plan mt-8">
  <div class="base-stage active">
    <span>STEP 1</span><b>固定底盘</b><p>先建立可比较基线</p>
  </div>
  <i>→</i>
  <div class="base-stage">
    <span>STEP 2</span><b>底盘先行</b><p>固定底盘不可达时推荐重定位</p>
  </div>
  <i>→</i>
  <div class="base-stage future">
    <span>STEP 3</span><b>同步联合规划</b><p>收益明确后再增加复杂度</p>
  </div>
</div>

<div class="base-dof mt-9">
  <div class="base-shape"><span>x</span><span>y</span><span>yaw</span></div>
  <div class="base-copy">
    <h3>本阶段交付</h3>
    <p>至少形成一组“固定底盘不可达、重定位后可达”的可复现实例，并比较可达率、耗时和碰撞安全性。</p>
    <div class="issue-tags"><span>MOTION-225</span><span>MOTION-226</span><span>MOTION-231</span><span>MOTION-198</span></div>
  </div>
</div>

<div class="page-no">08 / 11</div>

---

<div class="kicker">08 · 新研究启动</div>

# cuRobo 与学习算法：先从小验证开始

<div class="research-grid mt-7">
  <div class="research-item">
    <img :src="'./assets/curobo-sphere-approx.png'" alt="cuRobo 球状碰撞近似示意">
    <div>
      <span>GPU MOTION PLANNING</span>
      <h3>cuRobo 适配 V3</h3>
      <p>先完成球状碰撞模型、基础规划片段与现有 FCL / RRT 基线对比。</p>
      <b>定位：规划与碰撞核心，不是数字孪生。</b>
    </div>
  </div>
  <div class="research-item learning">
    <div class="learning-visual"><span>示教</span><i>→</i><span>数据</span><i>→</i><span>策略</span><i>→</i><span>验证</span></div>
    <div>
      <span>ROBOT LEARNING</span>
      <h3>多轴动作学习调研</h3>
      <p>优先回答可落地任务、数据来源、安全边界、部署成本与可参考项目。</p>
      <b>交付：可行性结论 + 后续研究路线。</b>
    </div>
  </div>
</div>

<div class="bottom-note">先做小规模验证，不急着替换现有算法；结果仍与当前基线同场景对比。</div>
<div class="page-no">09 / 11</div>

---

<div class="kicker">09 · 下周重点</div>

# 按当前工作方向继续推进

<table class="owner-table mt-7">
  <thead><tr><th>同事</th><th>主要方向</th><th>下周重点</th></tr></thead>
  <tbody>
    <tr><td><b>李昊洋</b></td><td>底盘联合规划、整组基线与接口收口</td><td>重定位可达案例；整理 benchmark 口径</td></tr>
    <tr><td><b>文子轩</b></td><td>固定底盘泛化、算法对比、离线缓存</td><td>困难箱改进数据；准备 cuRobo 适配输入</td></tr>
    <tr><td><b>张泽临</b></td><td>困难箱长尾、双臂异步、学习算法调研</td><td>梳理异步状态与资源冲突；明确调研范围</td></tr>
    <tr><td><b>蒋梓欣</b></td><td>力控验证、WPF 工作站</td><td>继续核对拖动示教安全项；补充实验记录</td></tr>
  </tbody>
</table>

<div class="bottom-note warning">这页只是方便大家对齐，具体安排可以现场微调。</div>
<div class="page-no">10 / 11</div>

---

<div class="kicker">10 · 讨论项</div>

# 明天想和大家确认的几件事

<div class="decision-grid mt-9">
  <div><span>01</span><b>性能怎么记录</b><p>25 箱测试采用怎样的输入集、计时边界和重试规则。</p></div>
  <div><span>02</span><b>异步先做到哪一步</b><p>先验证异步规划，还是同步推进并行执行。</p></div>
  <div><span>03</span><b>两条主线怎么并行</b><p>固定底盘优化和底盘重定位各自先做哪些案例。</p></div>
  <div><span>04</span><b>新研究从哪开始</b><p>cuRobo、学习算法各自选择一个最小验证目标。</p></div>
</div>

<div class="next-week mt-10"><b>下周希望看到：</b><span>各主线有一个具体结果，并把对应数据和结论放到能找到的位置。</span></div>

<div class="closing">进展 / 问题 / 下一步</div>
<div class="page-no">11 / 11</div>
