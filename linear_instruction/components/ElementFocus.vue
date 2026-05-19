<script setup>
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const nav = useNav()
const current = computed(() => Math.min(Math.max(nav.clicks.value, 0), 6))
const items = [
  { key: 'team', nav: 'Teams', label: 'Team', title: '部门 / 小组', desc: '工作归属与权限边界。', note: '不是微信群，不负责写每个任务细节。' },
  { key: 'project', nav: 'Projects', label: 'Project', title: '项目', desc: '方向、目标、边界。', note: 'Project Update 和 issue 不是自动等价关系，需要手动汇总关键 issue。' },
  { key: 'milestone', nav: 'Projects', label: 'Milestone', title: '阶段', desc: '阶段验收点。', note: '它不是任务篮子，而是阶段验收口径。' },
  { key: 'issue', nav: 'Issues', label: 'Issue', title: '任务 / 问题', desc: '具体执行闭环。', note: '小问题用 issue；大到跨阶段才升级成 project。' },
  { key: 'comment', nav: 'Issues', label: 'Comment / Reply', title: '过程沟通', desc: '进展、证据、风险。', note: '评论 resolve 表示讨论点闭环，不等于 issue 完成。' },
  { key: 'update', nav: 'Projects', label: 'Update / Done', title: '汇报和完成依据', desc: '阶段摘要与关闭证据。', note: '老板验收看结论，部门推进看技术证据，中间要桥接。' },
]

const activeItem = computed(() => current.value > 0 ? items[current.value - 1] : null)
</script>

<template>
  <div class="element-focus">
    <aside class="ef-sidebar">
      <div class="linear-logo">L</div>
      <div class="side-title">Sevenova</div>
      <div
        v-for="navItem in ['Teams', 'Projects', 'Issues', 'Views']"
        :key="navItem"
        class="side-item"
        :class="{ active: activeItem?.nav === navItem }"
      >
        {{ navItem }}
      </div>
    </aside>

    <main class="ef-main">
      <div class="topbar compact">
        <div>
          <div class="crumb">ALFA / Workflow</div>
          <div class="page-title">Linear 元素地图</div>
        </div>
        <div class="pill">click {{ current }} / 6</div>
      </div>

      <section class="ef-grid">
        <div
          v-for="(item, index) in items"
          :key="item.key"
          class="entity-card ef-card"
          :class="{ glow: current === index + 1, dim: current > 0 && current !== index + 1 }"
        >
          <div class="entity-label">{{ item.label }}</div>
          <div class="entity-title">{{ item.title }}</div>
          <div class="entity-desc">{{ item.desc }}</div>
        </div>
      </section>

      <section class="ef-explain" :class="{ idle: !activeItem }">
        <template v-if="activeItem">
          <div class="entity-label">当前讲解</div>
          <div class="ef-explain-title">{{ activeItem.label }}：{{ activeItem.title }}</div>
          <div class="ef-explain-desc">{{ activeItem.note }}</div>
        </template>
        <template v-else>
          <div class="ef-explain-title">先看整体界面</div>
          <div class="ef-explain-desc">下一次点击开始依次高亮 6 个元素。</div>
        </template>
      </section>
    </main>
  </div>

  <FlowHighlight :from-clicks="true" />
</template>
