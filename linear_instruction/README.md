# Linear 工作流动态演示

这是面向 Sevenova / ALFA 团队的 Linear 工作流 Slidev 演示材料。

## 启动

```bash
cd /mnt/mydisk/ALFA/presentation/linear_instruction
pnpm install
pnpm run dev
```

默认会打开：<http://localhost:3030>

## 编辑入口

- `slides.md`：主剧情和页面顺序。
- `components/LinearMock.vue`：Linear 风格界面、看板、评论、风险卡片。
- `components/WorkflowScene.vue`：完整大项目串联动画。
- `components/MessageFlow.vue`：办公室对话流。
- `styles/custom.css`：整体视觉风格。

## 导出

```bash
pnpm run build
pnpm run export
```

PDF/PPTX/PNG 导出需要 Playwright 浏览器依赖；如果导出报浏览器错误，先安装 `playwright-chromium`。
