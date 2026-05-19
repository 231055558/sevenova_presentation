<script setup>
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const nav = useNav()
const current = computed(() => Math.min(Math.max(nav.clicks.value, 0), 4))
const cards = [
  { title: '部门内协作', desc: '同一 team 内：issue + comment 快速闭环。', tag: 'Team 内' },
  { title: '部门间协作', desc: '跨 team：related / blocked by / subissue 明确依赖。', tag: '跨 Team' },
  { title: '需要他人介入', desc: '不要口头转发，直接在 issue 里 @ 人并说明要什么。', tag: '@ 协助' },
  { title: 'Resolve 评论', desc: '讨论点已有结论就 resolve；仍影响判断就不 resolve。', tag: '闭环讨论' },
]
</script>

<template>
  <div class="collab-board">
    <div class="team-column">
      <div class="team-title">运控 Team</div>
      <div class="mini-issue" :class="{ active: current === 1 }">TIM-52 IK 失败定位</div>
      <div class="mini-issue" :class="{ active: current === 4 }">评论：seed 已验证，可 resolve</div>
    </div>
    <div class="team-column">
      <div class="team-title">机械 Team</div>
      <div class="mini-issue" :class="{ active: current === 2 }">TIM-53 tool0 坐标复核</div>
      <div class="mini-issue" :class="{ active: current === 3 }">@机械：请确认新 URDF 路径</div>
    </div>
    <div class="dependency-line" :class="{ active: current >= 2 }">blocked by / related</div>
  </div>

  <div class="scene-card-row">
    <div
      v-for="(card, index) in cards"
      :key="card.title"
      class="entity-card explain-focus"
      :class="{ glow: current === index + 1, dim: current > 0 && current !== index + 1 }"
    >
      <div class="entity-label">{{ card.tag }}</div>
      <div class="entity-title">{{ card.title }}</div>
      <div class="entity-desc">{{ card.desc }}</div>
    </div>
  </div>
</template>
