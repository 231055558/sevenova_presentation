<script setup>
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const props = defineProps({
  step: { type: Number, default: 0 },
  fromClicks: { type: Boolean, default: false },
})

const nav = useNav()

const steps = [
  { title: '战略负责人提出方向', role: 'Strategy', text: '两周内看到仿真闭环演示，用于判断下一步取舍', color: 'boss' },
  { title: '统筹者建 Project', role: 'Coordinator', text: '定义目标、边界、验收口径', color: 'pm' },
  { title: '拆 Milestone', role: 'Coordinator', text: '场景搭建 / 规划闭环 / 演示验收', color: 'pm' },
  { title: '创建 Issues', role: 'Team', text: '机械、仿真、运控、GitOps 分工', color: 'team' },
  { title: '部门内推进', role: 'Engineer', text: '短评论：进展 / 证据 / 风险 / 下一步', color: 'eng' },
  { title: '跨部门 subissue', role: 'Team', text: '用 blocked by / related 表达依赖', color: 'team' },
  { title: 'Git Refs 关联', role: 'GitOps', text: 'Refs TIM-xx: 同步障碍到 MoveIt', color: 'git' },
  { title: 'Risk 升级', role: 'Coordinator', text: '影响 Milestone 的不确定性单独追踪', color: 'risk' },
  { title: '战略验收', role: 'Strategy', text: '统筹者将技术证据翻译为业务结论', color: 'boss' },
  { title: 'Done 证据归档', role: 'All', text: '结论、证据、commit、产物路径可追溯', color: 'done' },
]

const currentStep = computed(() => props.fromClicks ? Math.min(Math.max(nav.clicks.value, 0), steps.length) : props.step)
</script>

<template>
  <div class="workflow-wrap one-page">
    <div class="rail">
      <div
        v-for="(item, index) in steps"
        :key="item.title"
        class="rail-node"
        :class="[{ active: index + 1 <= currentStep, current: index + 1 === currentStep }, item.color]"
      >
        <span>{{ index + 1 }}</span>
      </div>
    </div>
    <div class="scene-stage">
      <div class="scene-placeholder" :class="{ hidden: currentStep > 0 }">
        按下一步：从战略负责人提出方向开始
      </div>
      <div
        v-for="(item, index) in steps"
        :key="item.title"
        class="scene-card"
        :class="[{ active: index + 1 === currentStep, done: index + 1 < currentStep, waiting: index + 1 > currentStep }, item.color]"
      >
        <div class="scene-role">{{ item.role }}</div>
        <h3>{{ item.title }}</h3>
        <p>{{ item.text }}</p>
      </div>
    </div>
  </div>
</template>
