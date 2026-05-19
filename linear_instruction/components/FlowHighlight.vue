<script setup>
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const props = defineProps({
  active: { type: Number, default: 0 },
  fromClicks: { type: Boolean, default: false },
})
const nav = useNav()
const current = computed(() => props.fromClicks ? Math.min(Math.max(nav.clicks.value, 0), 6) : props.active)
const nodes = [
  { title: 'Team', sub: '归属边界' },
  { title: 'Project', sub: '方向目标' },
  { title: 'Milestone', sub: '阶段验收' },
  { title: 'Issue', sub: '具体动作' },
  { title: 'Comment', sub: '过程证据' },
  { title: 'Update/Done', sub: '汇报依据' },
]
</script>

<template>
  <div class="flow-highlight" :class="{ idle: current === 0 }">
    <div
      v-for="(node, index) in nodes"
      :key="node.title"
      class="flow-node"
      :class="{ active: current === index + 1, before: current > index + 1 }"
    >
      <div class="flow-index">{{ index + 1 }}</div>
      <div class="flow-title">{{ node.title }}</div>
      <div class="flow-sub">{{ node.sub }}</div>
    </div>
  </div>
</template>
