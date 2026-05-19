<script setup>
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const nav = useNav()
const current = computed(() => Math.min(Math.max(nav.clicks.value, 0), 5))
const steps = [
  { title: '建 issue', detail: '先把小问题写清楚：目标、范围、验收。' },
  { title: '短评论推进', detail: '评论只写进展、证据、风险、下一步。' },
  { title: '拆 subissue', detail: '出现独立卡点，就拆出能单独验收的 subissue。' },
  { title: 'Refs 关联代码', detail: '提交写 Refs TIM-52，让 Linear 自动关联代码变更。' },
  { title: 'Done 证据', detail: '关闭前留下结论、截图/日志、commit、产物路径。' },
]
</script>

<template>
  <div class="workbench">
    <aside class="wb-left">
      <div class="issue-card hero" :class="{ glow: current === 1 }">
        <div class="issue-id">TIM-52</div>
        <h3>IK 失败原因定位</h3>
        <p>判断失败来自碰撞、可达性、姿态约束还是 seed。</p>
        <div class="meta"><span>Status: {{ current >= 5 ? 'Done' : current >= 2 ? 'In Progress' : 'Todo' }}</span><span>Assignee: 运控</span></div>
      </div>

      <div class="subissue-card" :class="{ active: current >= 3, glow: current === 3 }">
        <div class="issue-id">TIM-53 subissue</div>
        <b>机械模型 tool0 坐标复核</b>
        <span>blocked by / 独立验收</span>
      </div>
    </aside>

    <main class="wb-main">
      <div class="step-tabs">
        <div
          v-for="(step, index) in steps"
          :key="step.title"
          class="step-tab"
          :class="{ active: current === index + 1, done: current > index + 1 }"
        >{{ index + 1 }}</div>
      </div>

      <div class="issue-thread compact-thread">
        <div class="comment" :class="{ glow: current === 2 }"><b>运控：</b>已复现，失败集中在 pitch +15° 姿态。</div>
        <div class="comment c2" :class="{ glow: current === 3 }"><b>机械：</b>tool0 坐标可能偏 12mm，拆 subissue 复核。</div>
        <div class="comment c3" :class="{ glow: current === 4 }"><b>GitOps：</b>Refs TIM-52: 增加 IK 失败分类日志。</div>
        <div class="comment c4" :class="{ glow: current === 5 }"><b>统筹者：</b>Done 证据齐：日志、截图、commit、结论。</div>
      </div>

      <section class="scene-note" :class="{ idle: current === 0 }">
        <template v-if="current === 0">按下一步：从建立一个小 issue 开始。</template>
        <template v-else><b>{{ steps[current - 1].title }}</b>：{{ steps[current - 1].detail }}</template>
      </section>
    </main>
  </div>
</template>
