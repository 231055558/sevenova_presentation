# Sevenova Presentation

ALFA Robot 的工程架构、系统流程和协作演示静态站点。

公开入口：<https://231055558.github.io/sevenova_presentation/>

## 当前主题

- [运控对象系统架构 v1](https://231055558.github.io/sevenova_presentation/motion_runtime_architecture/)
- [V1 状态机 × 数据流地图](https://231055558.github.io/sevenova_presentation/v1_state_data_flow_map/)

`motion_runtime_architecture/` 同步自：

```text
robot_motion_control/docs/motion_runtime_architecture/
```

该目录为静态 HTML/CSS/JavaScript，可直接由 GitHub Pages 从 `main` 分支根目录发布。

当前 v1 以一个 `MotionSystem`、启动期 `ObjectGraph`、任务类型 `TaskGraph` 和请求级
`JobContext` 为核心；ROS2、MoveIt、真机、孪生与机器人资源均作为准确对象实现或资源接入。
