<script setup>
defineProps({
  label: { type: String, default: '点击' },
  x: { type: String, default: '50%' },
  y: { type: String, default: '50%' },
})
</script>

<template>
  <div class="click-pulse" :style="{ left: x, top: y }">
    <span />
    <em>{{ label }}</em>
  </div>
</template>
