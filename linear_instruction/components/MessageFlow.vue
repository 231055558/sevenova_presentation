<script setup>
defineProps({
  variant: { type: String, default: 'small' },
})
</script>

<template>
  <div class="message-flow" :class="variant">
    <div class="avatar boss">B</div>
    <div class="bubble boss-b">目标：我要看到可演示的结果，不是只看代码。</div>
    <div class="avatar pm">P</div>
    <div class="bubble pm-b">我把它拆成 Project、Milestone 和 issue。</div>
    <div class="avatar eng">E</div>
    <div class="bubble eng-b">我在 issue 里交付技术证据。</div>
    <div class="avatar pm second">P</div>
    <div class="bubble pm-b second">我把技术证据翻译成 Project Update。</div>
  </div>
</template>
