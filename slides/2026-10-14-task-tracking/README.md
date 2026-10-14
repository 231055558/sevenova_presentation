# 部门任务跟踪演示 · 2026-10-14

Slidev源文件：`slides.md`。黑白样式：`style.css`。

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

本地开发入口：`http://localhost:3040/`。
静态输出：仓库根目录`task-tracking/`。
GitHub Pages路径：`/sevenova_presentation/task-tracking/`，采用hash路由，无需服务端重写。

## 当前内容状态

- 发布父Issue、接取、员工开子Issue推进、父Issue提交交付、验收退回/Done及重新打开流程已写入。
- 老板定任务基础分，李昊洋验收评价；李昊洋本人也可以接取任务。
- 六项评价及40/20/10/10/10/10权重暂时采用；多人任务由父Issue指定一名负责人，根据子Issue分工和实际贡献确认分配比例。
- 外部阻塞、需求变化、延期及跨周期重新验收按具体情况确认，规则见`评价规则.md`。
- 页面未包含任何员工实际得分或个人绩效数据。
- 已完成静态构建；源码和产物可由仓库现有GitHub Pages发布。
