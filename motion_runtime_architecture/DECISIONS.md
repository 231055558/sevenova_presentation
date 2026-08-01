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
- `final` 不作为实用算法类的默认安全标记。领域值对象和确认不再扩展的叶子实现可以使用 `final`；真实算法、
  可复用实现基类和预期允许局部重写的类默认保持可继承，并通过少量 `protected virtual` 扩展点复用公共流程。
- 参数差异优先使用 Config，同合同的小块行为差异优先使用策略组合或局部重写；不得为每组参数建立一个子类，
  也不得为了复用一处差异复制整套 Planner 流程。

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
- MoveIt 是 `MotionPlanner`、`IKSolver` 或 `TimeParameterizer` 的实现依赖；轨迹组合、时间参数化和验证分别
  使用 `TrajectoryComposer`、`TimeParameterizer`、`TrajectoryValidator`，不建立万能轨迹处理基类。ROS 是
  `Communication` 实现；EtherCAT 和孪生属于 `RobotRuntime` 实现。
- 主要任务流程必须可通过 `DirectCommunication + FakeRobotRuntime` 在单进程测试，测试过程不启动或调用
  ROS 通信；开发机是否安装 ROS 不属于该 Interface 的验收条件。

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

## D-012：第三方依赖按使用切片采购并隔离

- 当前采购白名单是 Taskflow、yaml-cpp、spdlog 和 MoveIt TOTG；白名单表示允许评估，不表示可以提前引入。
- Taskflow 只在 Operation 有界并发切片引入；yaml-cpp 只负责配置文本解析，schema 和领域校验由
  SystemConfig Module 负责；spdlog 从 S1.6 起只作为日志 Adapter 的实现依赖；MoveIt TOTG 只在 M3
  时间参数化实现中引入。
- 不采用 BehaviorTree.CPP 代替类型化 `TaskGraph`，当前也不引入 AimRT。新增框架类依赖必须先有
  可删除的 spike 证据，并新增架构决策。
- 第三方类型不得出现在 `alfa_motion/include/` 公共 Interface；每个第三方依赖只能从一个明确的
  Adapter 实现目录进入，调用方只依赖领域类型。

## D-013：MotionError 使用单一错误目录

- 稳定错误码集中在一个 catalog，初始分为 CONFIG、RESOURCE、ALGORITHM、EXECUTION 和
  COMMUNICATION 域；编号段固定为 CONFIG `1000-1999`、RESOURCE `2000-2999`、ALGORITHM
  `3000-3999`、EXECUTION `4000-4999`、COMMUNICATION `5000-5999`。错误码全局唯一，不允许
  Module 私自增加散落枚举或字符串码；暂时没有真实错误的编号段保持为空，不创建占位错误。
- 每个错误码声明稳定语义、默认可重试性和静态描述；具体诊断、原始异常和上下文字段可以追加，不能替代
  稳定错误码。
- 未知异常在 `ObjectInvoker` 处归一化；错误目录扩展必须同时增加唯一性测试和调用方策略测试。

## D-014：human-gate 是一等 TaskGraph 节点

- Gate 节点拥有稳定 `gate_id`，进入等待后只接受类型化确认、取消或 deadline 到期，不通过日志、topic
  副作用暗中放行。
- 第一次有效确认使节点继续；同一确认重复到达必须幂等。未配置 deadline 可以持续等待，已配置 deadline
  到期产生稳定超时错误；取消产生取消结果。
- 确认、取消和超时按 Job 串行事件顺序裁决，只有第一个终结 Gate 等待的事件生效，后续事件只记录审计事实。

## D-015：alfa_motion 核心使用独立纯 CMake 构建

- `alfa_motion/` 使用 CMake 和 C++20 独立配置、构建、测试，不调用 ament，也不 include、链接或传递
  ROS、MoveIt、EtherCAT 与孪生框架类型。
- ROS2/ament 只允许进入后续 `integrations/ros2` 部署 Adapter；开发机可以已安装或已 source ROS，验收不要求
  提供完全未安装 ROS 的主机或容器。
- 每个切片必须运行独立 CMake 构建与 CTest，并检查本次 diff、CMake target 和公共头没有新增 ROS 通信、
  `ament_*`、`rclcpp` 或 ROS message 依赖。环境中存在 ROS 不能成为核心依赖泄漏的理由。
- gtest 从 S0.2 起通过 CMake 测试底座提供；现有 ROS package 和 colcon 构建在明确迁移切片之外不受影响。

## D-016：Event、Result 和 Snapshot 录制格式版本化

- S1.6 起每份 per-Job JSONL 首条记录携带 `schema_version`；Event、Result、MotionError 和 Snapshot 引用
  使用稳定字段名，供 replay/diff 和回归测试消费。
- “冻结”表示已有版本可重放，不表示格式永不演进。兼容新增字段可以在原版本追加；删除、改名或语义变化
  必须升级版本，并为仍受支持的历史版本保留读取测试。
- 关键审计记录和 best-effort 日志使用不同可靠性策略；spdlog 失败不能使 Job 失败，也不能成为唯一审计事实。

## D-017：Job 在准入时固定版本化 MotionSnapshot

- `MotionSnapshot` 至少携带 `snapshot_id`、采集时间、RobotDefinition 修订和场景修订；一旦进入 JobContext
  就不可变，同一次计算链不得重新读取 ROS topic 或其他 live 状态来替换它。
- Job 准入时通过明确的 Snapshot Provider Seam 获取一次快照；M1 使用确定性 Fake Provider，后续再接版本化
  Store、Replay 或 ROS/孪生状态 Adapter。
- Result、Event、MotionError 关联和 per-Job journal 必须携带同一 `snapshot_id`。执行前对实时状态的安全复验
  产生独立 Result，不修改历史计算所使用的 Snapshot。

## D-018：接口按真实 Adapter 证据分阶段成熟和冻结

- S1.2 产生的是 M1 首批候选 Interface，不存在固定数量的“全部家族”。只有 Fake Adapter 时，Seam 仍是假设，
  不能因为能编译就宣布永久冻结。
- S1.7 冻结内核合同：`Result/MotionError` 包络、Job 生命周期、TaskGraph 节点结果语义、ObjectGraph 冻结与
  typed handle、Invoker 关联字段，以及 Snapshot 固定与追溯不变量。
- IKSolver/MotionPlanner 在 S2.4 接入当前真实 Implementation 并通过 replay/diff 后冻结；轨迹与执行合同在
  S3.3 故障剧本通过后冻结；Communication 在 S5.2 Direct/ROS2 等价性验证后冻结；RobotRuntime 在 M6
  孪生、主站 SIL 与真机 canary 形成证据后冻结。
- 已冻结 Interface 的类型、语义、不变量、错误模式或调用顺序如需改变，必须先新增决策条目并经用户确认；
  未冻结候选 Interface 仍需在 PR 中说明兼容影响并由对应闸口评审。

## D-019：空间语义不靠裸 Pose6d 或隐含 frame 猜测

- 核心使用右手系、米、弧度和 `x/y/z/w` 单位四元数。`Pose6d` 只保存三维平移与单位四元数，不包含
  reference frame、被描述对象、采集来源、时间或协方差；它是可被其他领域类型组合的纯数学值。
- 当前 S1.1 不在 RobotState 或 MotionSnapshot 中预设导航、定位、`world -> base_link` 或统一
  `planning_frame` 能力。缺少导航不能阻止只依赖关节状态的运控任务运行。
- 真实 Interface 首次需要笛卡尔输入时，必须依据调用语义区分“某对象在指定 frame 中的 Pose”和“两个
  frame 之间的 Transform”，不得用一个含糊类型兼任两者；对应数据来源、缺失语义和转换责任必须在同一
  切片由真实 Adapter 证据确定。

## D-020：TaskStage 是语义复用层，不是执行原子

- `TaskDefinition` 由可复用 `TaskStage` 组合；Stage 通过 `TaskFragment` 提供 typed port、节点和边，构建后
  展开为不可变的扁平 `TaskGraph`。Stage/Fragment 不是 `MotionObject`，不注册对象工厂，也不拥有运行资源。
- `TaskStage` 回答“哪段业务流程值得复用”，`TaskNode` 回答“哪一步需要独立控制与审计”，`Operation`
  专指一条 Command 被执行的一次 attempt。一个 Stage 可以拆成多个 Operation，多个纯计算 Stage 也可由
  显式组合实现联合计算；两种情况都必须保留 `stage_path/node_id` 和原有错误、取消、幂等与审计语义。
- typed port 不假设结果唯一，可以承载单值或领域专属候选集合；候选集合收缩为单值必须经过显式选择。
  后级可行性影响前级选择时，传播带来源的候选链并延迟决策，或由有预算的 Composite Stage 联合搜索，
  不把大规模候选循环展开成 TaskGraph 节点。
- Builder 在启动构建期检查端口类型、生产者、角色和流程完整性；具体候选的起终状态、Snapshot、关节、工具、
  负载与 frame 连续性在运行期校验。真实候选值对象等其生产者和消费者进入同一算法切片时再定义。
- human-gate、外部副作用、Snapshot/实时条件复验、资源租约、重试预算和 checkpoint 是不可静默跨越的执行
  边界。M1 只交付 Stage/Fragment 到扁平 TaskGraph 的编译语义，不实现节点融合或 OperationScheduler。
