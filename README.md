# Sevenova Presentation

ALFA Robot 的工程架构、系统流程和协作演示静态站点。

公开入口：<https://231055558.github.io/sevenova_presentation/>

## 当前主题

- [运控组本周进展与下周安排（2026-09-23）](https://231055558.github.io/sevenova_presentation/weekly/2026-09-23/)
- [运控对象系统架构 v1](https://231055558.github.io/sevenova_presentation/motion_runtime_architecture/)
- [V1 状态机 × 数据流地图](https://231055558.github.io/sevenova_presentation/v1_state_data_flow_map/)

组会演示的 Slidev 源文件位于 `slides/2026-09-23/`，静态构建产物位于
`weekly/2026-09-23/`。

`motion_runtime_architecture/` 同步自：

```text
robot_motion_control/docs/motion_runtime_architecture/
```

该目录为静态 HTML/CSS/JavaScript，可直接由 GitHub Pages 从 `main` 分支根目录发布。

当前 M1 以一个 `MotionSystem`、启动期 `ObjectGraph`、任务类型 `TaskGraph`、请求级
`JobContext + TaskExecution` 为核心，已通过纯 C++ 全 Fake dual_grasp 纵向链与 90 项 CTest。
ROS2、MoveIt、真机、孪生与机器人资源继续作为准确 Adapter 或资源逐件接入；D-018 内核合同仍等待
负责人最终冻结确认。
