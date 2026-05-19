<script setup>
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const nav = useNav()
const current = computed(() => Math.min(Math.max(nav.clicks.value, 0), 4))
const items = [
  { label: '部门验收', title: '技术上能不能关', desc: '日志、截图、视频、commit、产物路径。' },
  { label: '老板验收', title: '业务上值不值得过', desc: '是否达到目标、是否影响计划、是否可演示。' },
  { label: 'Done 证据', title: '关闭 issue 的依据', desc: '不是新任务，而是完成后的证据清单。' },
  { label: 'Project Update', title: '阶段管理摘要', desc: '引用关键 issue，写结论、风险、下一步。' },
]
</script>

<template>
  <div class="acceptance-layout">
    <div class="acceptance-stack">
      <div
        v-for="(item, index) in items"
        :key="item.label"
        class="entity-card explain-focus"
        :class="{ glow: current === index + 1, dim: current > 0 && current !== index + 1 }"
      >
        <div class="entity-label">{{ item.label }}</div>
        <div class="entity-title">{{ item.title }}</div>
        <div class="entity-desc">{{ item.desc }}</div>
      </div>
    </div>

    <div class="bridge-panel">
      <div class="bridge-title">桥接关系</div>
      <div class="bridge-row" :class="{ active: current === 1 }">工程师证据 → 部门判断是否完成</div>
      <div class="bridge-row" :class="{ active: current === 2 }">PM 摘要 → 老板判断是否验收</div>
      <div class="bridge-row" :class="{ active: current === 3 }">Done 证据 → 未来复盘和追溯</div>
      <div class="bridge-row" :class="{ active: current === 4 }">Project Update → 阶段状态对齐</div>
    </div>
  </div>
</template>
