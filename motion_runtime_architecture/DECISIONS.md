# 目标架构决策记录

本文件记录目标架构 `v1` 已确认、会影响后续代码形状的决策。`v1` 取代 `v0` 中以多个目标 ROS2
package、Task Pack 和 Runtime Pack 为中心的表达；轨迹、并发和测试等未冲突决策继续有效。

## D-001：一个 MotionSystem，而不是一组互相调用的 ROS 包

- `robot_motion_control` 目标上是一个统一程序仓库，核心代码按责任目录和 C++ namespace 组织。
- `MotionSystem` 是构建、启动、提交任务和关闭系统的唯一公共门面。
- ROS2 package 只承载 ROS 入口与 IDL 等部署需求，不决定内部领域对象边界。
- URDF、SRDF、mesh、MoveIt 参数和标定属于资源或对象配置，不是顶层架构组件。

## D-002：统一对象协议，准确家族接口

- `MotionObject` 只统一描述、依赖声明、配置来源和兼容性校验。
- 只有持有线程、连接或设备资源的对象才继承 `ActiveObject` 生命周期接口。
- IK、规划、轨迹、执行、通信和观察分别使用准确家族接口，不建设巨大 `AlgorithmBase` 或
  `Registry<ISkill>`。
- 子类独有方法可以用于实现内部；若被多个消费者依赖，应提升为更准确的能力接口。

## D-003：发现和绑定分离

- `ObjectCatalog` 记录“有哪些类型安全工厂可用”，只在启动构建期使用。
- `SystemBuilder` 根据 `SystemConfig` 创建对象、注入依赖、校验组合并冻结 `ObjectGraph`。
- 一个 planner 需要特定 IK 时，通过构造依赖或命名角色显式绑定；不同 planner 可以同时绑定不同 IK。
- Job 运行时只使用 `ObjectGraph` 中的 typed handle，不查目录、不做 `dynamic_cast`、不临时换绑。

## D-004：ObjectGraph 和 TaskGraph 分工

- `ObjectGraph` 是应用级依赖图，回答“这次启动实际使用谁”；对象实例和连接在 READY 前固定。
- `TaskGraph` 是任务类型级流程图，回答“这种任务按什么步骤运行”；由配置编译为类型化节点和边。
- `JobContext` 是请求级上下文，只保存冻结图引用、快照、租约、取消、deadline 和关联信息。
- 配置只表达对象选择、绑定和流程，不承载任意 Python 代码或隐藏业务副作用。

## D-005：功能核心与外部框架隔离

- `MotionEngine`、TaskGraph、Job、错误策略和主要 Value Object 不依赖 ROS、MoveIt、EtherCAT 或孪生框架。
- MoveIt 是 `MotionPlanner`、`IKSolver` 或 `TrajectoryProcessor` 的实现依赖；ROS 是
  `Communication` 实现；EtherCAT 和孪生属于 `RobotRuntime` 实现。
- 主要任务流程必须可通过 `DirectCommunication + FakeRobotRuntime` 在单进程、无 ROS 环境测试。

## D-006：完整定时轨迹由运控生成，实时插值由主站执行

- 运控负责几何路径、片段拼接、平滑、速度/加速度约束、时间参数化和执行前验证。
- 运控发送完整定时轨迹；每个点必须携带 `positions`、`velocities` 和 `time_from_start`。
  `accelerations` 是否强制由执行能力合同声明，但存在时必须完整且合法。
- EtherCAT 主站在运动开始前完整缓存轨迹，在确定性周期中插值并同步下发各轴。
- `ExecutionAdapter` 负责关节名称、顺序、方向、单位和协议转换；`ExecutionSupervisor` 管理提交、接受、
  进度、超时、取消、跟踪和最终到位；主站继续负责周期通信、驱动和急停保护。
- 未来视觉伺服、力控或 MPC 使用独立 Streaming Motion Interface，不改变批量轨迹合同。

## D-007：真机、孪生、Fake 和 Replay 是同族对象组合

- `RealRobotRuntime`、`DigitalTwinRuntime`、`FakeRobotRuntime` 和 `ReplayRobotRuntime` 提供同族执行、
  状态、健康、时钟和遥测接口，任务流程不写 simulation 分支。
- 数字孪生必须尽量复现真机的轨迹字段、插值模式、反馈、取消和错误语义。
- Rerun、RViz、JSONL 和 metrics 是 Observer，不拥有真机或孪生执行权。

## D-008：Job 状态串行，Operation 有界并发

- 每个 `MotionJob` 通过 mailbox 串行处理会改变任务状态的 Result。
- IK、规划和执行等待等 Operation 共享固定 worker pool 或异步 I/O completion。
- 注册一个对象不会创建一个线程；并发预算由调度器和资源租约控制。
- 对象必须声明线程安全性、内部并行度、最大并发和上下文隔离要求。

## D-009：错误入口统一，Hook 按权限拆分

- 所有 TaskNode 和 MotionObject 调用通过统一 Invoker 附加 job、node、object、snapshot、attempt、deadline
  和耗时，并把异常归一化为结构化 `MotionError`。
- Guard 同步执行并可阻止流程；Observer 只读异步消费事实；LifecycleListener 只观察对象生命周期。
- Observer 或日志失败不能伪装成任务失败，关键审计和 best-effort 输出采用不同背压策略。

## D-010：Command、Result、Event、Telemetry 和 Snapshot 分工

- Command 有明确接收对象；Result 可靠返回 Job mailbox 并影响控制流。
- Event 表达已发生事实，交给零到多个 Observer；Telemetry 承载高频状态，使用独立有界通道。
- Snapshot 固定一次计算所用的版本化事实；执行前重新验证实时条件。
- `Communication` 只负责系统边界上的类型化通道，不取代上述进程内领域语义。

## D-011：薄骨架先行，按纵向任务链迁移

- 先建立完整但薄的 `MotionSystem → ObjectGraph → TaskGraph → MotionJob` 无 ROS 纵向链。
- 第一条验收链使用内存配置、Fake 对象和手动时钟完成一个完整任务。
- 随后按当前算法实现、数字孪生、ROS 边界、主站 SIL、真机 canary 的顺序替换具体对象。
- 不维护长期 `v2/` 复制树，不先做整仓文件搬家；每个 PR 交付一条可验证的纵向能力。
