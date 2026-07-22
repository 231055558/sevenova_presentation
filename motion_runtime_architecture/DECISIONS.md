# 目标架构决策记录

本文件记录本轮已经确认、会影响后续代码形状的决策。它不是算法参数文档。

## D-001：功能核心与 Adapter 外壳

- `MotionEngine`、Workflow、Job 状态、错误策略和主要领域类型不依赖 ROS、MoveIt、
  EtherCAT 或数字孪生框架。
- ROS、MoveIt、真机主站、数字孪生和日志系统通过 Adapter 接入稳定 Interface。
- 目标是让主要任务流程可以在单进程、无 ROS 环境下完成确定性测试。

## D-002：注册和绑定分离

- `RegistryHub` 使用按能力家族划分的类型安全注册表，不建设单一巨大
  `Registry<ISkill>`。
- 注册表示“系统有哪些实现”；绑定表示“本次启动的任务类型具体使用哪些实现”。
- `RuntimeGraph` 在启动阶段构建并冻结；运行中的 Job 不再临时查找或切换实现。
- 一个 planner 若需要特定 IK 能力，应通过准确 Interface 注入；若两者不可分割，则作为
  一个组合 Implementation 注册。

## D-003：完整定时轨迹由运控生成，实时插值由主站执行

- 运控负责路径平滑、片段拼接、时间参数化和执行前验证。
- 运控发送完整定时轨迹；每个轨迹点必须携带 `positions`、`velocities` 和
  `time_from_start`。`accelerations` 是否强制由执行能力合同声明，但存在时必须完整且合法。
- EtherCAT 主站在运动开始前完整缓存轨迹，并在确定性控制周期中插值、同步下发各轴。
- `ExecutionAdapter` 负责关节名称、顺序、方向、单位和协议转换，不承担实时插值。
- `ExecutionSupervisor` 负责提交、接受、进度、超时、取消、跟踪偏差和最终到位判断；
  主站继续负责高频跟随误差、通信、驱动器和急停保护。
- 将来若需要视觉伺服、力控或 MPC，使用独立 Streaming Motion Interface，不改变批量轨迹
  执行合同。

## D-004：数字孪生是正式 Runtime Pack

- 数字孪生不是任务代码中的 `if simulation` 分支，也不是只负责画图的旁路脚本。
- `DigitalTwinRuntimePack` 与 `RealRobotRuntimePack` 注册同族的执行、状态、健康和遥测
  Adapter。
- 数字孪生必须尽量复现真机主站的轨迹字段要求、插值模式、反馈语义、取消和错误模式。
- Rerun/RViz/JSONL 属于 Observer，不拥有数字孪生或真机的执行权。

## D-005：Job 状态串行，Operation 有界并发

- 每个 `MotionJob` 通过 mailbox 串行处理会改变任务状态的消息。
- IK、规划、执行等待等 Operation 可由固定 worker pool 或异步 Adapter 并发完成。
- 注册一个算法不会创建一个线程；并发预算由 `OperationScheduler` 和
  `ResourceScheduler` 控制。
- 并发实现必须声明线程安全性、内部并行度和资源需求。

## D-006：Command、Result、Event、Telemetry 和 Snapshot 分工

- Command 有一个明确接收者，要求产生某个效果。
- Result 返回 Operation 的成功或失败，并进入 Job mailbox 影响控制流。
- Event 表达已经发生的领域事实，交给零到多个 Observer。
- Telemetry 承载高频状态，不通过普通 EventHub 淹没审计和任务事件。
- Snapshot 固定一次计算使用的版本化事实；执行前必须重新验证实时前置条件。

## D-007：薄骨架先行，按纵向任务链迁移

- 先建立完整但薄的启动、注册、RuntimeGraph、Job、Engine、执行和观察骨架。
- 第一条验收链使用 Fake Adapter，在无 ROS 环境完成一个完整任务。
- 随后按 Fake → 当前算法 Adapter → 数字孪生 → 真机主站的顺序逐个替换。
- 不先横向重写全部 IK、全部规划或全部执行，也不在一个长期分支内完成整仓搬家。
