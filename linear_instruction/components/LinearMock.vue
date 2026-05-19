<script setup>
import { computed } from 'vue'
const props = defineProps({
  mode: { type: String, default: 'map' },
  highlight: { type: String, default: '' },
  nav: { type: String, default: '' },
})

const navItems = [
  { key: 'projects', label: 'Projects' },
  { key: 'issues', label: 'Issues' },
  { key: 'views', label: 'Views' },
  { key: 'teams', label: 'Teams' },
]

const navByHighlight = {
  team: 'teams',
  project: 'projects',
  milestone: 'projects',
  issue: 'issues',
  comment: 'issues',
  update: 'projects',
  backlog: 'issues',
  todo: 'issues',
  doing: 'issues',
  done: 'issues',
}

const activeNav = computed(() => props.nav || navByHighlight[props.highlight] || (props.mode === 'board' || props.mode === 'thread' || props.mode === 'risk' ? 'issues' : 'projects'))

const lanes = [
  { key: 'backlog', title: 'Backlog', count: 3, cards: ['脚本清理', 'P2P 预研'] },
  { key: 'todo', title: 'Todo', count: 5, cards: ['机械模型确认', 'PlanningScene 接口'] },
  { key: 'doing', title: 'In Progress', count: 2, cards: ['TIM-41 MuJoCo 场景同步', 'TIM-39 教程设计'] },
  { key: 'done', title: 'Done', count: 8, cards: ['TIM-37 Updown 查表验收', 'TIM-28 BioIK 反绑修复'] },
]

const entities = [
  { key: 'team', label: 'Team', title: '部门 / 小组', desc: '工作归属与权限边界', icon: '◫' },
  { key: 'project', label: 'Project', title: '项目', desc: '方向、目标、边界', icon: '▣' },
  { key: 'milestone', label: 'Milestone', title: '阶段', desc: '阶段验收点', icon: '◇' },
  { key: 'issue', label: 'Issue', title: '任务 / 问题', desc: '具体执行闭环', icon: '●' },
  { key: 'comment', label: 'Comment', title: '评论', desc: '过程沟通与证据', icon: '✎' },
  { key: 'update', label: 'Update', title: 'Project Update', desc: '阶段汇报与决策', icon: '↗' },
]
</script>

<template>
  <div class="linear-shell">
    <aside class="linear-sidebar">
      <div class="linear-logo">L</div>
      <div class="side-title">Sevenova</div>
      <div
        v-for="item in navItems"
        :key="item.key"
        class="side-item"
        :class="{ active: activeNav === item.key }"
      >
        {{ item.label }}
      </div>
    </aside>

    <main class="linear-main">
      <div class="topbar">
        <div>
          <div class="crumb">ALFA / Workflow</div>
          <div class="page-title">Linear 工作流演示</div>
        </div>
        <div class="pill">AI-first project system</div>
      </div>

      <section v-if="mode === 'map'" class="entity-grid">
        <div
          v-for="item in entities"
          :key="item.key"
          class="entity-card"
          :class="{ glow: highlight === item.key }"
        >
          <div class="entity-icon">{{ item.icon }}</div>
          <div class="entity-label">{{ item.label }}</div>
          <div class="entity-title">{{ item.title }}</div>
          <div class="entity-desc">{{ item.desc }}</div>
        </div>
      </section>

      <section v-else-if="mode === 'board'" class="board">
        <div v-for="lane in lanes" :key="lane.key" class="lane" :class="{ glow: highlight === lane.key }">
          <div class="lane-head"><span>{{ lane.title }}</span><b>{{ lane.count }}</b></div>
          <div v-for="card in lane.cards" :key="card" class="issue-card mini">
            <div class="issue-id">TIM-{{ lane.key === 'done' ? '37' : lane.key === 'doing' ? '41' : 'XX' }}</div>
            <div>{{ card }}</div>
          </div>
        </div>
      </section>

      <section v-else-if="mode === 'thread'" class="thread-demo">
        <div class="issue-card hero">
          <div class="issue-id">TIM-41</div>
          <h3>MuJoCo 场景到 RViz 障碍闭环</h3>
          <p>目标：把仿真场景变成 MoveIt 可规划的真实障碍。</p>
          <div class="meta"><span>Assignee: 仿真工程师</span><span>Milestone: 可视化仿真</span></div>
        </div>
        <div class="comment c1">进展：50 个货箱已同步进 MuJoCo 场景。</div>
        <div class="comment c2">证据：scene.xml 加载通过，截图 / Rerun 已上传。</div>
        <div class="comment c3">下一步：发布 PlanningScene collision objects。</div>
      </section>

      <section v-else-if="mode === 'risk'" class="risk-demo">
        <div class="risk-card">
          <div class="risk-label">RISK</div>
          <h3>规划成功率不稳定，可能影响演示 Milestone</h3>
          <p>影响：演示验收 / 跨部门联调 / 老板决策</p>
          <div class="risk-row"><b>触发条件</b><span>成功率连续低于 80%</span></div>
          <div class="risk-row"><b>缓解方案</b><span>先冻结障碍简化版，另开优化 issue</span></div>
        </div>
      </section>
    </main>
  </div>
</template>
