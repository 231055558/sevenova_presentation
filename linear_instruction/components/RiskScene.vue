<script setup>
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const nav = useNav()
const current = computed(() => Math.min(Math.max(nav.clicks.value, 0), 3))
const items = [
  { title: 'Risk issue', desc: '影响计划但还没确定发生的问题，单独追踪。' },
  { title: 'Blocked', desc: '说明被什么卡住、谁能解除、解除后做什么。' },
  { title: 'Delay', desc: '延期前先写影响范围、替代方案和新验收日期。' },
]
</script>

<template>
  <div class="risk-grid">
    <div
      v-for="(item, index) in items"
      :key="item.title"
      class="risk-card compact-risk explain-focus"
      :class="{ glow: current === index + 1, dim: current > 0 && current !== index + 1 }"
    >
      <div class="risk-label">{{ item.title }}</div>
      <h3>{{ item.desc }}</h3>
      <div class="risk-row"><span>Owner</span><b>{{ index === 0 ? 'PM' : index === 1 ? '解除方' : '负责人' }}</b></div>
      <div class="risk-row"><span>必须写清</span><b>{{ index === 0 ? '影响什么' : index === 1 ? '卡在哪里' : '新日期' }}</b></div>
    </div>
  </div>
</template>
