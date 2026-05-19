<script setup>
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const props = defineProps({
  level: { type: Number, default: 0 },
  fromClicks: { type: Boolean, default: false },
})

const nav = useNav()
const currentLevel = computed(() => props.fromClicks ? Math.min(Math.max(nav.clicks.value, 0), 5) : props.level)

const items = [
  { key: 'company', label: '公司', detail: 'Sevenova', hint: '公司层：统一目标和协作规则', x: 48, y: 42, w: 82, h: 70 },
  { key: 'team', label: '部门', detail: '运控 / 机械 / 仿真', hint: '部门层：工作归属和职责边界', x: 51, y: 45, w: 66, h: 54 },
  { key: 'project', label: 'Project', detail: '新机械臂仿真闭环', hint: '项目层：为什么做、做到什么程度', x: 54, y: 48, w: 50, h: 40 },
  { key: 'milestone', label: 'Milestone', detail: '规划闭环', hint: '阶段层：阶段验收点', x: 57, y: 51, w: 34, h: 28 },
  { key: 'issue', label: 'Issue', detail: 'TIM-52 IK 失败定位', hint: '执行层：一个负责人能闭环的动作', x: 60, y: 54, w: 22, h: 17 },
]
</script>

<template>
  <div class="hierarchy-stage compact">
    <div class="hierarchy-bg">从公司目标逐步收敛到一个可执行 issue</div>
    <div class="hierarchy-empty" :class="{ hidden: currentLevel > 0 }">
      按下一步：从最大层级开始拆解
    </div>
    <div
      v-for="(item, index) in items"
      :key="item.key"
      class="hierarchy-box"
      :class="[{ active: currentLevel === index + 1, passed: currentLevel > index + 1, waiting: currentLevel < index + 1 }, item.key]"
      :style="{
        left: item.x + '%',
        top: item.y + '%',
        width: item.w + '%',
        height: item.h + '%',
      }"
    >
      <div class="h-label">{{ item.label }}</div>
      <div class="h-detail">{{ item.detail }}</div>
    </div>
    <div class="zoom-caption" :class="{ muted: currentLevel === 0 }">
      <span>当前讲解层级</span>
      <b>{{ currentLevel ? items[currentLevel - 1]?.label : '尚未开始' }}</b>
      <em>{{ currentLevel ? items[currentLevel - 1]?.hint : '下一步会逐层缩小范围' }}</em>
    </div>
  </div>
</template>
