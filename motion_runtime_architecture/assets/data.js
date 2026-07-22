window.MOTION_ARCH_DATA = {
  meta: {
    title: "robot_motion_control 目标运行时架构",
    version: "v0",
    updated: "2026-07-22",
    status: "设计基线",
    note: "描述目标架构，不表示当前代码已经完成。算法细节不在此冻结。"
  },

  nav: [
    ["index.html", "整体架构", "overview"],
    ["flows.html", "启动与任务流", "flows"],
    ["modules.html", "局部模块", "modules"],
    ["execution.html", "轨迹与执行", "execution"],
    ["runtime.html", "真机与孪生", "runtime"],
    ["testing.html", "测试与模拟", "testing"],
    ["technology.html", "技术栈与迁移", "technology"]
  ],

  principles: [
    {
      title: "功能核心不依赖 ROS",
      text: "Workflow、MotionJob、MotionEngine、错误策略和领域类型可以在单进程中直接测试；ROS 只存在于 Adapter 外壳。",
      tag: "testable"
    },
    {
      title: "注册不等于绑定",
      text: "RegistryHub 保存可用工厂；RuntimeGraph 在启动时为每个任务角色选择并注入具体实现，运行中不再猜类型。",
      tag: "typed"
    },
    {
      title: "事实通过 Snapshot 固定",
      text: "机器人模型、关节状态、场景、工具和标定均带版本；规划基于不可变快照，执行前重新校验实时前置条件。",
      tag: "coherent"
    },
    {
      title: "Job 状态串行",
      text: "每个 MotionJob 通过 mailbox 串行改变状态；耗时 Operation 使用固定 worker pool 或异步 Adapter 有界并发。",
      tag: "concurrent"
    },
    {
      title: "主站拥有实时插值",
      text: "运控生成完整定时轨迹并携带速度信息；主站缓存后按确定性周期插值和同步下发，Supervisor 监督生命周期。",
      tag: "realtime"
    },
    {
      title: "真机与孪生同族替换",
      text: "RealRobotRuntimePack、DigitalTwinRuntimePack 和 FakeRuntimePack 满足相同 Interface，任务流程不出现 simulation 分支。",
      tag: "replaceable"
    }
  ],

  layers: [
    {
      id: "evidence",
      name: "入口与事实证据",
      tone: "cyan",
      purpose: "把外部请求和持续变化的世界证据转换为稳定领域类型。",
      items: [
        ["TaskIngressAdapter", "ROS Action / CLI / IPC 请求转为 MotionTaskRequest"],
        ["RobotStateSource", "真机或孪生关节状态、控制器状态"],
        ["SceneSource", "障碍、箱体、附着物和场景版本"],
        ["RobotProfileLoader", "URDF/SRDF、限位、标定、工具和执行合同"]
      ]
    },
    {
      id: "composition",
      name: "启动组合",
      tone: "blue",
      purpose: "任务入口开放前完成注册、编译、绑定、兼容性检查和预热。",
      items: [
        ["MotionApplication", "生命周期根与 composition root"],
        ["RuntimeManifest", "选择 robot profile、Task Pack、Adapter 和观察者"],
        ["RegistryHub", "按能力家族保存类型安全工厂"],
        ["WorkflowCompiler", "YAML → 不可变 CompiledWorkflow"],
        ["RuntimeGraph", "任务角色到具体实例的冻结绑定图"]
      ]
    },
    {
      id: "orchestration",
      name: "任务运行核心",
      tone: "violet",
      purpose: "管理 MotionJob、状态流转、快照、资源和 Operation，而不直接调用外部框架。",
      items: [
        ["JobManager", "准入、幂等、查询、取消和结果"],
        ["MotionEngine", "state + event → new state + commands"],
        ["SnapshotManager", "版本化事实的一致快照"],
        ["ResourceScheduler", "机器人、轴组和工具资源租约"],
        ["OperationScheduler", "有界 worker、超时和协作取消"]
      ]
    },
    {
      id: "capability",
      name: "能力家族",
      tone: "amber",
      purpose: "用小而准确的 Interface 表达会真正变化的算法与动作能力。",
      items: [
        ["IK Family", "IIKSolver / IIKCandidateGenerator / 约束能力"],
        ["Planning Family", "IExtractPlanner / ILoadedPlanner / 通用规划"],
        ["Trajectory Family", "拼接、平滑、时间参数化、验证"],
        ["Primitive Family", "Attach、Release、Approach 等原子行为"],
        ["Policy Family", "重试、恢复、超时和候选选择"]
      ]
    },
    {
      id: "runtime",
      name: "运行时与 Adapter",
      tone: "green",
      purpose: "把领域 Command 翻译给 MoveIt、数字孪生、ROS 或真机主站，并把结果翻回领域事件。",
      items: [
        ["Planning Adapter", "MoveIt / 自研 / Fake"],
        ["Execution Adapter", "真机 buffered trajectory / twin / fake"],
        ["State & Scene Adapter", "ROS topic、进程内 store 或 replay"],
        ["ToolIO Adapter", "真空、电磁阀和工具状态"],
        ["RuntimeHealth", "能力、时钟、控制器和依赖健康"]
      ]
    },
    {
      id: "observe",
      name: "观察与验证",
      tone: "rose",
      purpose: "记录事实和高频遥测，但不拥有任务状态或执行权。",
      items: [
        ["EventHub", "领域事件扇出与审计"],
        ["TelemetryStream", "高频关节、控制误差和仿真状态"],
        ["Observer", "JSONL、Rerun、RViz、metrics、ROS feedback"],
        ["FaultInjector", "测试环境故障与时序注入"],
        ["Replay", "按事件、快照和配置复现实验"]
      ]
    }
  ],

  overallFlow: [
    ["1", "启动选择", "RuntimeManifest 选择 robot profile、Task Pack、算法实例、Runtime Pack 和 Observer。"],
    ["2", "注册冻结", "各 Pack 安装类型安全工厂；RegistryHub 完成重复 ID、类型和版本检查后冻结。"],
    ["3", "Workflow 编译", "声明式 YAML 经 schema、语义、资源和可达分支检查，生成 CompiledWorkflow。"],
    ["4", "绑定构图", "RuntimeGraphBuilder 为 extract_ik、loaded_planner、execution 等命名角色注入实例。"],
    ["5", "READY", "完成兼容性、健康、执行合同和预热检查后才开放任务入口。"],
    ["6", "任务准入", "JobManager 校验请求、幂等键、系统状态和资源，创建 MotionJob。"],
    ["7", "固定事实", "SnapshotManager 捕获机器人、场景、工具、标定和配置版本。"],
    ["8", "状态决策", "MotionEngine 根据 JobState 与输入 Event 产生一个或多个领域 Command。"],
    ["9", "执行 Operation", "OperationScheduler 将 Command 交给已绑定 Adapter；算法和 I/O 可并发运行。"],
    ["10", "结果回流", "Result 进入 Job mailbox；EventHub 向 Observer 广播已发生事实。"],
    ["11", "轨迹执行", "ExecutionSupervisor 验证、提交完整定时轨迹并监督真机或孪生。"],
    ["12", "收口", "确认最终状态、持久化结果、释放资源；成功、失败和取消都形成可审计终态。"]
  ],

  keyConcepts: [
    {
      name: "TaskPack",
      question: "一种任务需要什么？",
      answer: "声明请求/结果类型、Workflow、Primitive、能力角色、策略、资源和支持的机器人配置。",
      lifetime: "任务类型级"
    },
    {
      name: "RuntimeGraph",
      question: "这次启动实际用了谁？",
      answer: "记录每个命名角色到具体 Adapter/Implementation 实例的依赖图，启动后冻结并随 Job 记录版本。",
      lifetime: "应用级"
    },
    {
      name: "MotionJob",
      question: "这一次任务正在做什么？",
      answer: "保存请求、当前状态、快照引用、资源租约、Operation、取消令牌、事件链和最终结果。",
      lifetime: "单次请求"
    }
  ],

  lifecycleStates: [
    ["CREATED", "进程对象已创建，尚未接受注册。", "next"],
    ["REGISTERING", "Core、Task、Runtime、Observer Pack 安装工厂。", "next"],
    ["BUILDING", "编译 Workflow、实例化 Adapter、构建 RuntimeGraph。", "next"],
    ["VALIDATING", "检查类型、语义、机器人兼容性、资源和执行能力。", "next"],
    ["WARMING_UP", "加载模型、插件、缓存，做无运动健康检查。", "next"],
    ["READY", "入口开放，可接收任务。", "ready"],
    ["RUNNING", "存在活跃 Job；应用仍可接收符合资源策略的请求。", "active"],
    ["DRAINING", "停止接受新 Job，等待或取消现有 Job。", "stop"],
    ["STOPPED", "资源释放完毕。", "stop"],
    ["STARTUP_FAILED", "任一启动验证失败，入口保持关闭并输出结构化错误。", "error"]
  ],

  startupSteps: [
    ["01", "读取 RuntimeManifest", "只解析启动选择，不实例化运行中 Job。", "RuntimeManifest"],
    ["02", "加载 RobotProfile", "确定模型、关节语义、工具、标定、限制和执行轴合同。", "RobotProfile"],
    ["03", "安装 Core Pack", "注册错误码、时钟、序列化、默认策略等基础工厂。", "RegistryHub OPEN"],
    ["04", "安装 Capability Pack", "注册 IK、规划、轨迹和 Primitive 家族工厂。", "Typed factories"],
    ["05", "安装 Runtime Pack", "真机、数字孪生、Fake 或 Replay 注册执行/状态/健康 Adapter。", "Runtime providers"],
    ["06", "安装 Task Pack", "注册任务 schema、Workflow、所需角色、策略和资源声明。", "TaskCatalog source"],
    ["07", "安装 Observer Pack", "注册 JSONL、Rerun、metrics、控制台和 ROS feedback sink。", "Event sinks"],
    ["08", "冻结 RegistryHub", "拒绝重复 ID 和启动后的隐式变更。", "RegistryHub FROZEN"],
    ["09", "编译并绑定", "WorkflowCompiler + RuntimeGraphBuilder 生成不可变定义和实例依赖图。", "CompiledWorkflow + RuntimeGraph"],
    ["10", "验证与预热", "兼容性、线程安全、主站执行能力、状态新鲜度、模型加载和无运动探测。", "ReadinessReport"],
    ["11", "构建运行核心", "启动 JobManager、Engine、Scheduler、SnapshotManager、Supervisor 和 EventHub。", "Runtime ready"],
    ["12", "开放 Ingress", "最后启动 ROS/CLI/IPC Adapter；此前任何任务请求都被拒绝。", "READY"]
  ],

  jobSteps: [
    ["01", "请求进入", "Ingress Adapter 转换为领域 MotionTaskRequest，保留 request_id 和 deadline。", "command"],
    ["02", "准入", "JobManager 检查 READY、schema、幂等、资源和任务类型。", "decision"],
    ["03", "创建 Job", "固定 RuntimeGraph/Workflow/RobotProfile 版本并创建 mailbox、journal、cancel token。", "state"],
    ["04", "捕获快照", "按阶段获取一致 RobotState、Scene、Tool、Calibration 快照。", "snapshot"],
    ["05", "Engine 决策", "MotionEngine 纯计算下一状态和 Command，不直接调用 ROS/MoveIt。", "decision"],
    ["06", "调度 Operation", "Scheduler 根据资源、并发预算和线程安全声明执行一个或多个 Command。", "parallel"],
    ["07", "Adapter 工作", "已绑定 Adapter 调用算法、主站、数字孪生或 Fake，返回 Result。", "adapter"],
    ["08", "回到 mailbox", "Result 按 Job 内顺序处理；迟到、重复和已取消结果有明确规则。", "result"],
    ["09", "监督执行", "轨迹由 ExecutionSupervisor 提交并监控，反馈作为 Result/Event 回流。", "feedback"],
    ["10", "结束或恢复", "Engine 根据事实和 RecoveryPolicy 完成、重试、重规划或安全终止。", "decision"],
    ["11", "最终确认", "确认最终机器人/工具状态，写入 JobResult 和完整事件链。", "state"],
    ["12", "释放", "释放资源租约、Operation 和 Job 数据；保留可查询摘要与审计记录。", "result"]
  ],

  communicationTypes: [
    {
      name: "Command",
      cardinality: "1 → 1",
      example: "ExecuteTrajectory、PlanExtract、AttachPayload",
      rule: "表达意图并指定接收角色；携带 job_id、operation_id、snapshot_id、deadline 和取消语义。"
    },
    {
      name: "Result",
      cardinality: "1 → 1",
      example: "PlanSucceeded、ExecutionFailed",
      rule: "Operation 的类型化结果；必须回到 Job mailbox，决定控制流，不依赖 EventHub 投递。"
    },
    {
      name: "Event",
      cardinality: "1 → 0..N",
      example: "StageStarted、IKCandidateSelected、JobCompleted",
      rule: "表达已经发生的事实；Observer 不能通过回调修改 Job 或取得执行权。"
    },
    {
      name: "Telemetry",
      cardinality: "stream",
      example: "joint state、desired/actual/error、仿真世界状态",
      rule: "高频、可降采样；使用独立队列和背压策略，不阻塞任务状态机。"
    },
    {
      name: "Snapshot",
      cardinality: "versioned read",
      example: "RobotState + Scene + Tool + Calibration",
      rule: "不可变事实集合；规划结果必须记录 snapshot_id，执行前重新验证实时条件。"
    }
  ],

  concurrencyRules: [
    ["Job mailbox", "逻辑串行队列，不等于一个 OS 线程；同一 Job 的状态变更按序处理。"],
    ["Operation worker pool", "固定大小、有界队列；CPU 算法共享 worker，不为每个注册项创建线程。"],
    ["Adapter async I/O", "ROS Action、真机反馈和定时器通过回调返回 Result，不阻塞 Engine。"],
    ["并行 join", "Engine 可发出左右臂或候选并行 Command，并以 operation group + join policy 收口。"],
    ["线程安全声明", "Implementation 声明 thread_safe、internal_parallelism、max_concurrency 和所需上下文。"],
    ["资源租约", "ResourceScheduler 防止多个 Job 同时控制相同机器人、轴组、工具或场景写权限。"],
    ["协作取消", "取消令牌传播给尚未开始和正在运行的 Operation；结果迟到时不得复活已终止 Job。"],
    ["不可变快照", "并行规划共享只读 Snapshot；存在内部缓存的 MoveIt/FCL 上下文应按 worker 隔离。"]
  ],

  snapshotLayers: [
    {
      name: "启动固定事实",
      lifetime: "Application / Job",
      data: "RobotProfile、RuntimeGraph、CompiledWorkflow、执行能力合同",
      invalidation: "运行期间不热改；版本变化需要新 RuntimeGraph 或重启"
    },
    {
      name: "规划快照",
      lifetime: "每次 planning attempt",
      data: "RobotState、ObstacleScene、AttachedPayload、ToolState、TF/Calibration",
      invalidation: "新鲜度、时间偏差、模型/场景版本不一致时拒绝捕获"
    },
    {
      name: "执行前置检查",
      lifetime: "每个 trajectory segment",
      data: "当前起点、场景 revision、控制器状态、资源租约",
      invalidation: "偏差超限则重新验证、重新规划或终止，不修改原 Snapshot"
    },
    {
      name: "执行观测流",
      lifetime: "执行期间",
      data: "desired、actual、error、controller state、tool feedback",
      invalidation: "持续更新，不作为原规划 Snapshot 的可变替身"
    }
  ],

  modules: [
    {
      id: "motion-application",
      name: "MotionApplication",
      group: "startup",
      lifetime: "Application",
      purpose: "整个进程的 composition root 和生命周期根，只组织 Module，不承载任务业务。",
      inputs: ["RuntimeManifest", "进程停止/重载请求"],
      outputs: ["READY/FAILED 状态", "JobManager ingress", "ReadinessReport"],
      owns: ["RegistryHub", "RuntimeGraph", "运行核心 Module 的生命周期"],
      invariants: ["Ingress 最后开放", "任一关键启动失败都 fail closed", "停止顺序与启动顺序相反"],
      errors: ["MANIFEST_INVALID", "STARTUP_DEPENDENCY_FAILED", "WARMUP_FAILED"],
      stack: "C++17；纯 composition 层；ROS main 位于外部 Adapter executable",
      tests: "使用全部 Fake Pack 验证生命周期、启动失败和安全关闭"
    },
    {
      id: "runtime-manifest",
      name: "RuntimeManifest",
      group: "startup",
      lifetime: "Application",
      purpose: "描述这次启动选择哪些机器人、任务、能力实例、Runtime Pack、Observer 和并发预算。",
      inputs: ["版本化 YAML", "受控命令行覆盖"],
      outputs: ["类型化启动模型"],
      owns: ["选择，不拥有实例", "配置 provenance 与版本"],
      invariants: ["生产配置不执行任意 Python", "未知字段和重复实例 ID 拒绝", "安全阈值不能由任务任意覆盖"],
      errors: ["SCHEMA_ERROR", "UNKNOWN_IMPLEMENTATION", "UNSAFE_OVERRIDE"],
      stack: "YAML + yaml-cpp 候选；版本化 schema；配置打印脱敏",
      tests: "schema fixture、错误路径、默认值和升级兼容测试"
    },
    {
      id: "task-pack",
      name: "TaskPack",
      group: "startup",
      lifetime: "Task type",
      purpose: "一种任务类型的安装入口，声明 Workflow、能力角色、Primitive、策略、资源和请求结果类型。",
      inputs: ["TaskPackBuilder", "Task 配置"],
      outputs: ["Workflow source", "DependencySpec", "Task schema"],
      owns: ["任务语义", "不拥有算法实例或 Job 状态"],
      invariants: ["任务角色使用命名依赖", "不可在 install 时启动线程", "不可调用硬件"],
      errors: ["TASK_SCHEMA_INVALID", "MISSING_ROLE", "UNSUPPORTED_ROBOT_PROFILE"],
      stack: "C++17 安装入口 + 声明式 Workflow YAML",
      tests: "编译 Workflow、缺依赖、资源冲突和分支完整性"
    },
    {
      id: "registry-hub",
      name: "RegistryHub",
      group: "startup",
      lifetime: "Application",
      purpose: "按能力家族保存类型安全工厂，支持 OPEN → FROZEN 两阶段。",
      inputs: ["Pack install", "ModuleDescriptor", "Factory"],
      outputs: ["按 Interface 类型查询的 factory handle"],
      owns: ["ID 唯一性", "实现元数据", "工厂生命周期"],
      invariants: ["不提供巨大 Registry<ISkill>", "冻结后不可隐式写入", "运行时不做 dynamic_cast 猜类型"],
      errors: ["DUPLICATE_ID", "REGISTRY_FROZEN", "WRONG_FAMILY"],
      stack: "C++ 模板 TypedRegistry<T>；type-safe handle",
      tests: "重复 ID、错误 family、冻结、工厂异常和 descriptor 校验"
    },
    {
      id: "workflow-compiler",
      name: "WorkflowCompiler",
      group: "startup",
      lifetime: "Application / Task type",
      purpose: "把声明式流程编译为不可变、可执行且已验证的 CompiledWorkflow。",
      inputs: ["Workflow YAML", "Task schema", "Registry descriptors"],
      outputs: ["CompiledWorkflow", "诊断列表"],
      owns: ["语法、类型、分支、重试、超时、资源和可达终态检查"],
      invariants: ["运行时不再解析 YAML", "所有 stage 均有类型", "循环必须有退出/预算"],
      errors: ["UNKNOWN_STAGE", "INVALID_BRANCH", "UNBOUNDED_RETRY", "RESOURCE_DEADLOCK"],
      stack: "C++17 编译器；YAML 输入；稳定内部 AST",
      tests: "golden workflow、非法图、循环预算、schema 迁移"
    },
    {
      id: "runtime-graph",
      name: "RuntimeGraph",
      group: "startup",
      lifetime: "Application，版本固定到 Job",
      purpose: "保存任务命名角色到具体实例的依赖图，解决不同 planner 绑定不同 IK 的问题。",
      inputs: ["CompiledWorkflow", "RuntimeManifest bindings", "RegistryHub factories"],
      outputs: ["不可变 typed handles", "绑定审计图"],
      owns: ["实例构造顺序", "依赖注入", "共享与独占实例策略"],
      invariants: ["所有必需角色启动时绑定", "Job 运行中不热切换", "组合兼容性已验证"],
      errors: ["BINDING_NOT_FOUND", "CAPABILITY_MISMATCH", "DEPENDENCY_CYCLE"],
      stack: "C++17 shared/unique handle；GraphBuilder；DOT/JSON 审计输出候选",
      tests: "双 IK 分角色绑定、组合错误、实例共享和构造失败"
    },
    {
      id: "job-manager",
      name: "JobManager",
      group: "runtime",
      lifetime: "Application",
      purpose: "任务准入、幂等、创建、查询、取消、结果保留和容量控制。",
      inputs: ["MotionTaskRequest", "Cancel/Query", "系统 readiness"],
      outputs: ["JobHandle", "JobResult", "AdmissionError"],
      owns: ["活跃 Job 表", "request_id 幂等", "结果保留策略"],
      invariants: ["非 READY 不接任务", "相同幂等键不重复执行", "取消可重复调用"],
      errors: ["NOT_READY", "BUSY", "DUPLICATE_REQUEST_CONFLICT", "UNKNOWN_TASK_TYPE"],
      stack: "C++17；线程安全索引；不包含 ROS 类型",
      tests: "并发准入、幂等、取消竞争、容量和结果过期"
    },
    {
      id: "motion-job",
      name: "MotionJob",
      group: "runtime",
      lifetime: "Single request",
      purpose: "一项任务的全部可恢复状态和关联身份，是事件、Operation、快照和错误的聚合根。",
      inputs: ["CompiledWorkflow", "TaskRequest", "RuntimeGraph version"],
      outputs: ["JobState", "JobResult", "Journal records"],
      owns: ["mailbox", "取消令牌", "当前 stage", "资源租约", "Operation 索引"],
      invariants: ["状态只由 mailbox 消费者修改", "终态不可逆", "每个外部结果按 operation_id 去重"],
      errors: ["INVALID_TRANSITION", "LATE_RESULT", "JOB_DEADLINE_EXCEEDED"],
      stack: "C++17 value state + mailbox；持久化格式独立",
      tests: "状态机属性测试、重复/乱序结果、取消与终态竞争"
    },
    {
      id: "motion-engine",
      name: "MotionEngine",
      group: "runtime",
      lifetime: "Application，处理多个 Job",
      purpose: "纯领域决策：JobState + Event/Result → NewState + Commands。",
      inputs: ["JobState", "类型化 Result/Event", "CompiledWorkflow"],
      outputs: ["NewState", "Command list", "领域 Event"],
      owns: ["阶段切换", "join 条件", "重试/恢复策略应用", "任务取消语义"],
      invariants: ["不调用 ROS/MoveIt/主站", "相同输入得到相同决策", "不阻塞等待 Operation"],
      errors: ["UNHANDLED_RESULT", "POLICY_EXHAUSTED", "WORKFLOW_INVARIANT_BROKEN"],
      stack: "C++17 reducer/state machine；std::variant 或明确事件层次",
      tests: "表驱动状态转移、失败恢复、并发 join、取消和 replay"
    },
    {
      id: "snapshot-manager",
      name: "SnapshotManager",
      group: "runtime",
      lifetime: "Application",
      purpose: "从版本化事实 Store 捕获一次计算需要的一致、不可变 MotionSnapshot。",
      inputs: ["RobotStateStore", "SceneStore", "ToolStore", "CalibrationStore", "CaptureRequirements"],
      outputs: ["MotionSnapshot", "SnapshotError"],
      owns: ["新鲜度、最大时间偏差、frame/model/revision 一致性"],
      invariants: ["Snapshot 对象不可变", "不静默拼接不一致事实", "大场景使用 shared immutable data"],
      errors: ["STATE_STALE", "SCENE_STALE", "TIME_SKEW", "MODEL_MISMATCH", "FRAME_UNAVAILABLE"],
      stack: "C++17；mutex + shared_ptr<const T> 起步；带时间 ring buffer",
      tests: "并发更新捕获、stale/skew、版本变化和执行前复核"
    },
    {
      id: "resource-scheduler",
      name: "ResourceScheduler",
      group: "runtime",
      lifetime: "Application",
      purpose: "为机器人、双臂、PP 轴、工具和场景写权限分配显式租约。",
      inputs: ["ResourceRequest", "Job priority", "cancel/deadline"],
      outputs: ["ResourceLease", "排队/拒绝结果"],
      owns: ["互斥规则", "公平性", "租约释放"],
      invariants: ["无租约不得执行副作用 Command", "终态释放", "资源排序避免死锁"],
      errors: ["RESOURCE_BUSY", "LEASE_EXPIRED", "DEADLOCK_PREVENTED"],
      stack: "C++17；有界队列；策略可配置但安全资源不可绕过",
      tests: "多 Job 争用、取消排队、超时、异常释放"
    },
    {
      id: "operation-scheduler",
      name: "OperationScheduler",
      group: "runtime",
      lifetime: "Application",
      purpose: "把 Command 交给已绑定 Adapter，并管理 worker、并发预算、deadline 和协作取消。",
      inputs: ["Command", "RuntimeGraph handle", "ResourceLease"],
      outputs: ["OperationHandle", "Result envelope"],
      owns: ["固定 worker pool", "per-family concurrency", "OperationId 和取消传播"],
      invariants: ["注册不创建线程", "队列有界", "非线程安全实例不得并发调用"],
      errors: ["QUEUE_FULL", "OPERATION_TIMEOUT", "ADAPTER_EXCEPTION", "CANCELED"],
      stack: "C++17 固定线程池 + async I/O completion；不使用 detached thread",
      tests: "并发上限、超时、异常归一化、取消和 worker 饥饿"
    },
    {
      id: "trajectory-pipeline",
      name: "TrajectoryPipeline",
      group: "capability",
      lifetime: "Operation / shared stateless",
      purpose: "把一个或多个规划片段变成可执行定时轨迹：拼接、平滑、时间参数化和合同验证。",
      inputs: ["TrajectorySegment[]", "RobotLimits", "ExecutionCapabilities"],
      outputs: ["TimedJointTrajectory", "ValidationReport"],
      owns: ["段连接连续性", "position/velocity/acceleration/time", "执行 profile 适配"],
      invariants: ["positions/velocities/time_from_start 完整", "时间严格递增", "不跨 attach/release barrier 盲拼"],
      errors: ["DISCONTINUOUS_SEGMENT", "TIME_PARAMETERIZATION_FAILED", "LIMIT_EXCEEDED", "UNSUPPORTED_PROFILE"],
      stack: "C++17；纯数据与算法 Interface；可包装 MoveIt 时间参数化",
      tests: "段拼接、同步、限位、字段完整性和轨迹属性测试"
    },
    {
      id: "execution-supervisor",
      name: "ExecutionSupervisor",
      group: "execution",
      lifetime: "Application + one state per execution",
      purpose: "管理一条轨迹从提交、接受、运行、取消到最终到位的完整生命周期。",
      inputs: ["ExecuteTrajectory Command", "live state", "Adapter feedback", "ExecutionPolicy"],
      outputs: ["Execution Result/Event", "Cancel/Stop Command", "监督诊断"],
      owns: ["起点复核", "接受/启动超时", "进度/跟踪", "最终状态确认"],
      invariants: ["不做 EtherCAT 周期插值", "不替代主站急停", "完成必须有实际状态证据"],
      errors: ["START_STATE_MISMATCH", "GOAL_REJECTED", "TRACKING_ERROR", "EXECUTION_TIMEOUT", "FINAL_STATE_MISMATCH"],
      stack: "C++17 非硬实时状态机；Adapter callback；monotonic clock",
      tests: "Fake clock、反馈乱序、取消、主站失联、终点偏差"
    },
    {
      id: "event-hub",
      name: "EventHub",
      group: "observe",
      lifetime: "Application",
      purpose: "把领域 Event 分发给多个 Observer，统一关联、审计和非阻塞隔离。",
      inputs: ["DomainEvent envelope"],
      outputs: ["InMemoryJournal", "JSONL", "Rerun", "metrics", "ROS feedback"],
      owns: ["event_id", "correlation/causation", "sink 队列和失败隔离"],
      invariants: ["Observer 不改变控制流", "控制 Result 不依赖 EventHub", "关键审计与 best-effort sink 分策略"],
      errors: ["SINK_BACKPRESSURE", "SINK_FAILED", "SERIALIZATION_FAILED"],
      stack: "C++17 event envelope；异步有界 sink；Python/Rerun Adapter 可跨进程",
      tests: "坏 Observer 不影响 Job、背压、顺序和事件关联"
    },
    {
      id: "telemetry-stream",
      name: "TelemetryStream",
      group: "observe",
      lifetime: "Runtime Pack / Application",
      purpose: "承载高频机器人状态、desired/actual/error 和孪生世界状态，供 Snapshot Store 与 Observer 消费。",
      inputs: ["Runtime Provider samples"],
      outputs: ["Versioned state stores", "可降采样 Observer stream"],
      owns: ["采样时间", "丢弃/降采样策略", "高低优先级通道"],
      invariants: ["不阻塞主站控制周期", "状态使用领域/ROS 正向语义", "慢 Observer 不无限堆积"],
      errors: ["TELEMETRY_STALE", "SEQUENCE_GAP", "CLOCK_JUMP"],
      stack: "进程内 ring buffer；ROS topic Adapter；Rerun/metrics sink",
      tests: "高频背压、时钟跳变、丢样和 snapshot 查询"
    }
  ],

  moduleGroups: [
    ["all", "全部"],
    ["startup", "启动组合"],
    ["runtime", "任务运行"],
    ["capability", "轨迹能力"],
    ["execution", "执行监督"],
    ["observe", "观察与遥测"]
  ],

  interfaceFamilies: [
    {
      family: "IK",
      registry: "TypedRegistry<IIKSolver>",
      interfaces: ["IIKSolver", "IIKCandidateGenerator", "IConstrainedIKSolver"],
      adapters: ["解析 IK", "BioIK/multi-seed", "Fake IK"],
      compatibility: "robot profile、DOF、joint group、frame、单/双臂、候选能力、线程安全"
    },
    {
      family: "Planning",
      registry: "TypedRegistry<IExtractPlanner> / TypedRegistry<ILoadedPlanner>",
      interfaces: ["IExtractPlanner", "ILoadedPlanner", "IJointPathPlanner"],
      adapters: ["MoveIt Adapter", "自研规划 Adapter", "Fake Planner"],
      compatibility: "所需 IK Interface、场景语义、附着物、约束类型、并发上下文"
    },
    {
      family: "Trajectory",
      registry: "TypedRegistry<ITrajectoryStage>",
      interfaces: ["ITrajectoryComposer", "ITimeParameterizer", "ITrajectoryValidator"],
      adapters: ["MoveIt time parameterization", "领域验证器", "Deterministic Fake"],
      compatibility: "关节集合、速度/加速度字段、插值 profile、同步轴组"
    },
    {
      family: "Execution",
      registry: "TypedRegistry<IBufferedTrajectoryExecutor>",
      interfaces: ["IBufferedTrajectoryExecutor", "IRobotStateSource", "IRuntimeHealth"],
      adapters: ["RealRobot", "DigitalTwin", "Fake", "Replay"],
      compatibility: "轴合同、插值方式、必需轨迹字段、控制周期、取消/停止/反馈能力"
    },
    {
      family: "Primitive / Tool",
      registry: "TypedRegistry<IPrimitive> / TypedRegistry<IToolIO>",
      interfaces: ["IAttachPayload", "IReleasePayload", "IToolIO"],
      adapters: ["真空/电磁阀 Adapter", "Twin Tool", "Fake Tool"],
      compatibility: "工具型号、确认反馈、超时、幂等、安全状态"
    },
    {
      family: "Observer",
      registry: "TypedRegistry<IEventSink>",
      interfaces: ["IEventSink", "ITelemetrySink"],
      adapters: ["JSONL", "Rerun", "RViz", "metrics", "ROS feedback"],
      compatibility: "可靠/尽力投递、队列容量、序列化格式、采样频率"
    }
  ],

  trajectoryFields: [
    ["joint_names[N]", "必需", "领域标准名称；Adapter 在发送 Seam 统一映射顺序、方向和单位。"],
    ["points[i].positions[N]", "必需", "绝对关节位置；所有点维度必须与 joint_names 一致。"],
    ["points[i].velocities[N]", "必需", "本架构明确要求随轨迹点发送；用于主站插值、前馈和合同验证。"],
    ["points[i].accelerations[N]", "能力合同决定", "若 ExecutionCapabilities 声明需要则每点必需；存在时必须完整、有限且受限。"],
    ["points[i].time_from_start", "必需", "严格单调递增，使用定时轨迹的相对单调时间语义。"],
    ["trajectory_id / segment_id", "必需", "用于反馈关联、取消、重放和多段任务审计。"],
    ["snapshot_id", "必需", "记录轨迹基于哪个机器人/场景/工具快照生成。"],
    ["profile_id", "必需", "指向主站声明的插值、字段、限制和停止语义。"]
  ],

  trajectoryPipeline: [
    ["几何路径", "planner 输出关节路径或多个语义片段，不承诺可直接下发。", "planning"],
    ["片段组合", "TrajectoryComposer 处理同一运动块内的衔接、去重和左右臂同步；不跨工具/场景 barrier。", "compose"],
    ["平滑", "消除不连续和不必要折点，同时保持碰撞与任务约束。", "smooth"],
    ["时间参数化", "根据 joint limits 和 profile 计算每点 time、velocity、acceleration。", "timing"],
    ["合同验证", "检查维度、有限值、严格时间、位置/速度/加速度限制、起终点和 ExecutionCapabilities。", "validate"],
    ["执行前复核", "Supervisor 对 live start、scene revision、资源、控制器状态和 deadline 再检查。", "guard"],
    ["完整提交", "Adapter 一次提交完整定时轨迹；运动开始前 Runtime Provider 完整缓存。", "submit"],
    ["实时插值", "真机主站或 Twin Executor 按 profile 和确定性周期插值，生成同步 setpoint。", "realtime"],
    ["反馈闭环", "desired/actual/error、progress、controller state 回到 Supervisor 和 TelemetryStream。", "feedback"]
  ],

  executionResponsibilities: [
    {
      layer: "MotionEngine",
      clock: "离散任务时间",
      owns: ["是否执行哪一段", "阶段切换", "失败后的重试/重规划/终止"],
      rejects: ["直接插值", "直接发送 EtherCAT", "读取驱动器原始编码器"]
    },
    {
      layer: "TrajectoryPipeline",
      clock: "规划时间",
      owns: ["拼接和平滑", "定时、速度、加速度", "轨迹静态合同和限制"],
      rejects: ["执行进度", "主站周期调度", "硬件急停"]
    },
    {
      layer: "ExecutionSupervisor",
      clock: "非硬实时监督时间",
      owns: ["起点/场景复核", "提交、超时、取消", "跟踪趋势和最终到位"],
      rejects: ["EtherCAT 周期循环", "电流环", "替代主站快速保护"]
    },
    {
      layer: "ExecutionAdapter",
      clock: "请求/反馈时间",
      owns: ["名称、顺序、方向、单位", "协议与错误翻译", "能力查询"],
      rejects: ["改变轨迹数学语义", "擅自重新规划", "隐藏未支持轴"]
    },
    {
      layer: "EtherCAT 主站 / Twin Executor",
      clock: "确定性控制周期",
      owns: ["完整缓存", "实时插值与多轴同步", "快速跟随误差、通信和停止"],
      rejects: ["任务阶段决策", "碰撞场景规划", "业务恢复策略"]
    },
    {
      layer: "驱动器",
      clock: "驱动内部周期",
      owns: ["位置/速度/电流内环", "过流、温度、编码器和自身保护"],
      rejects: ["轨迹拼接", "任务语义", "场景判断"]
    }
  ],

  executionCapabilities: [
    ["mode", "buffered_timed_trajectory", "当前主合同；完整缓存后启动。"],
    ["interpolation_profile", "linear / cubic / quintic / controller-defined", "必须可查询并记录；Twin 应匹配真机。"],
    ["required_fields", "position + velocity + time；acceleration 由 profile 声明", "启动时与 TrajectoryPipeline 兼容性验证。"],
    ["joint_contract", "支持的关节名、完整/partial、顺序策略", "Adapter 根据名字映射，不能静默丢轴。"],
    ["limits", "max points、duration、velocity、acceleration、可选 jerk", "运控前置检查与主站二次检查。"],
    ["clock", "单调时钟、start semantics、control period", "反馈必须能关联 trajectory time。"],
    ["stop", "cancel、controlled stop、emergency stop", "每种停止的确认和最终状态语义必须明确。"],
    ["feedback", "accepted、started、desired、actual、error、progress、terminal result", "Supervisor 不用猜执行状态。"],
    ["streaming", "false by default", "未来若需要在线控制，使用独立 Interface。"]
  ],

  multiAxisPlan: [
    {
      name: "同一控制器内的双臂",
      form: "一个 TimedJointTrajectory",
      synchronization: "左右 12 轴共享 time_from_start 和主站控制周期",
      owner: "TrajectoryComposer + 主站"
    },
    {
      name: "独立 PP/updown 控制器",
      form: "TrajectoryBundle 中的独立 Segment/Command",
      synchronization: "明确阶段 barrier、共同 start token 或由 Supervisor 等待完成",
      owner: "MotionEngine + ExecutionSupervisor"
    },
    {
      name: "真空/电磁阀",
      form: "Tool Command + 状态确认 barrier",
      synchronization: "不得伪装成关节轨迹点；必须有超时和幂等语义",
      owner: "Primitive + ToolIO Adapter"
    },
    {
      name: "未来统一多轴主站",
      form: "扩展 ExecutionCapabilities 后的统一 TrajectoryBundle",
      synchronization: "只有真实主站支持共同时间基时才启用",
      owner: "新的 Runtime Adapter，不修改 Task Workflow 语义"
    }
  ],

  executionModes: [
    {
      name: "BufferedTrajectory",
      status: "主合同",
      producer: "TrajectoryPipeline",
      executor: "EtherCAT 主站 / DigitalTwin",
      semantics: "完整轨迹一次提交，主站缓存并插值；适合当前规划执行。"
    },
    {
      name: "StreamingMotion",
      status: "未来可选",
      producer: "视觉伺服、力控、MPC 等在线控制 Module",
      executor: "与主站同机或具备实时缓冲的 Streaming Adapter",
      semantics: "短时域或连续 setpoint；独立 Interface、独立 watchdog，不复用批量轨迹语义。"
    }
  ],

  runtimePacks: [
    {
      id: "real",
      name: "RealRobotRuntimePack",
      status: "生产",
      backend: "EtherCAT 主站 + ros2_control/自定义执行入口",
      registers: ["IBufferedTrajectoryExecutor", "IRobotStateSource", "IRuntimeHealth", "ITelemetrySource", "可选 IToolIO"],
      guarantees: ["完整轨迹缓存", "确定性插值", "ROS 语义状态", "取消/停止/错误反馈", "硬件安全链"],
      mustNot: ["让任务知道从站编号", "把方向映射散落到算法", "用 topic 假装可靠 action result"]
    },
    {
      id: "twin",
      name: "DigitalTwinRuntimePack",
      status: "开发/验收",
      backend: "Kinematic Twin；未来可增加 Physics Adapter",
      registers: ["TwinBufferedExecutor", "TwinRobotStateSource", "TwinRuntimeHealth", "TwinTelemetrySource", "TwinFaultInjector", "TwinClock"],
      guarantees: ["同一轨迹字段合同", "可配置同一插值 profile", "确定性时间缩放", "取消和故障注入", "可回放 world state"],
      mustNot: ["直接成为 Observer", "绕开执行合同改 joint state", "把仿真特例写进 MotionEngine"]
    },
    {
      id: "fake",
      name: "FakeRuntimePack",
      status: "单元测试",
      backend: "进程内确定性 Fake + ManualClock",
      registers: ["FakeExecutor", "FakeStateSource", "FakeHealth", "InMemoryTelemetry"],
      guarantees: ["无 ROS", "即时或脚本化结果", "严格可重复", "可检查收到的 Command"],
      mustNot: ["声称验证动力学", "依赖 wall clock sleep", "隐藏未消费 Command"]
    },
    {
      id: "replay",
      name: "ReplayRuntimePack",
      status: "回归/诊断",
      backend: "记录的 Snapshot、Result、Event、Telemetry",
      registers: ["ReplayStateSource", "ReplayExecutionAdapter", "ReplayClock"],
      guarantees: ["复现同一输入序列", "校验 Engine 决策", "支持差分新旧架构"],
      mustNot: ["驱动真机", "把缺失数据默认为成功", "覆盖原始 provenance"]
    }
  ],

  twinModules: [
    ["DigitalTwinRuntimePack", "安装整个孪生运行能力，共享一个 TwinWorld backend，但对外注册多个准确 Interface。"],
    ["TwinWorld", "维护不可变/版本化机器人、工具、场景和执行状态；不直接渲染。"],
    ["TwinBufferedExecutor", "验证并缓存完整定时轨迹，按 ExecutionCapabilities 插值和产生 desired state。"],
    ["TwinRobotModel", "根据命令推进 joint state；第一阶段是运动学模型，动力学/接触为可替换 Adapter。"],
    ["TwinStateSource", "把实际/模拟状态写入 VersionedStore 和 TelemetryStream。"],
    ["TwinFaultInjector", "按脚本注入拒绝、延迟、tracking error、停机、掉反馈和工具故障。"],
    ["TwinClock", "manual/realtime/scaled 三种模式，测试不用 sleep，展示可倍速。"],
    ["Rerun/RViz Observer", "只订阅 Event、Telemetry 和 Snapshot，不参与 TwinWorld 状态推进。"]
  ],

  runtimeParity: [
    ["轨迹输入", "相同 TimedJointTrajectory 字段、维度和单调时间规则"],
    ["执行能力", "启动时都返回 ExecutionCapabilities；差异必须显式可见"],
    ["插值", "Twin 配置为真机 profile 或明确标记近似，不静默使用另一种语义"],
    ["状态", "都输出领域/ROS 正向关节语义、时间戳和 sequence/revision"],
    ["反馈", "accepted/started/progress/desired/actual/error/terminal 一致"],
    ["取消", "都有请求、确认、停止完成和最终状态；时间性能可以不同"],
    ["错误", "映射到同一领域错误分类，同时保留 backend diagnostics"],
    ["健康", "READY 前均可做无运动 capability/health probe"]
  ],

  runtimeManifestExample: `runtime:
  robot_profile: alfa_v1_0
  task_packs: [dual_grasp]
  runtime_pack: digital_twin       # real_robot | digital_twin | fake | replay

instances:
  ik.grasp:
    use: bioik.multi_seed
  ik.loaded_goal:
    use: analytic.v10
  planner.extract:
    use: extract.rrt
    bind:
      candidate_ik: ik.grasp
  planner.loaded:
    use: loaded.rrt_connect
    bind:
      goal_ik: ik.loaded_goal

tasks:
  dual_grasp:
    workflow: workflows/dual_grasp.yaml
    bind:
      extract: planner.extract
      loaded: planner.loaded
      execution: runtime.buffered_execution

observers: [journal.jsonl, rerun, metrics]`,

  testLevels: [
    {
      level: "L0",
      name: "领域与 Module 单测",
      ros: "否",
      runtime: "FakeRuntimePack + ManualClock",
      verifies: ["Workflow/Engine 状态", "Registry/RuntimeGraph", "Snapshot", "TrajectoryPipeline", "错误与恢复"],
      gate: "每次提交"
    },
    {
      level: "L1",
      name: "无 ROS 纵向任务链",
      ros: "否",
      runtime: "Fake IK/Planner/Tool/Execution",
      verifies: ["YAML → READY → Job Completed", "双 IK 分角色绑定", "Event journal", "取消/超时"],
      gate: "每次提交"
    },
    {
      level: "L2",
      name: "运动学数字孪生",
      ros: "可选",
      runtime: "DigitalTwinRuntimePack",
      verifies: ["完整定时轨迹", "速度字段", "插值与反馈", "状态/场景一致性", "Rerun"],
      gate: "PR / nightly"
    },
    {
      level: "L3",
      name: "ROS Adapter 集成",
      ros: "是",
      runtime: "ROS Action/topic Adapter + Twin",
      verifies: ["序列化合同", "命名/单位映射", "callback/取消", "launch 与进程失联"],
      gate: "PR / integration"
    },
    {
      level: "L4",
      name: "主站合同模拟 / SIL",
      ros: "按部署",
      runtime: "EtherCATMasterEmulator 或软件主站",
      verifies: ["完整缓存", "实际插值 profile", "周期、轴同步", "错误码、受控停止"],
      gate: "release candidate"
    },
    {
      level: "L5",
      name: "HIL / 真机小运动",
      ros: "真实部署",
      runtime: "RealRobotRuntimePack",
      verifies: ["方向/零位", "反馈语义", "跟随误差", "急停/取消", "最终到位"],
      gate: "人工安全审批"
    }
  ],

  testDoubles: [
    {
      target: "上游任务源",
      double: "TaskFixture / MockIngressAdapter",
      simulates: "合法/非法任务、重复 request_id、deadline、取消",
      doesNotProve: "真实感知精度和抓取选择质量"
    },
    {
      target: "机器人状态源",
      double: "FakeStateSource / TwinStateSource / ReplayStateSource",
      simulates: "关节状态、stale、time skew、状态跳变、控制器模式",
      doesNotProve: "编码器噪声和真实机械弹性，除非显式建模"
    },
    {
      target: "场景事实源",
      double: "SceneFixture / MutableSceneSource",
      simulates: "空场景、障碍更新、附着物、revision 改变、frame 错误",
      doesNotProve: "感知漏检概率，除非使用数据集"
    },
    {
      target: "IK/Planner",
      double: "ScriptedIK / ScriptedPlanner",
      simulates: "成功、多候选、不可达、碰撞、超时、异常和取消",
      doesNotProve: "实际算法成功率；用于验证 Workflow 和错误处理"
    },
    {
      target: "轨迹执行",
      double: "FakeExecutor / TwinBufferedExecutor / MasterEmulator",
      simulates: "接受、插值、反馈、tracking error、取消、主站故障",
      doesNotProve: "从 Fake 到 Twin 到 SIL 逐级增加真实性"
    },
    {
      target: "工具 IO",
      double: "FakeToolIO / TwinToolIO",
      simulates: "吸附成功、压力延迟、掉吸、阀故障、重复命令",
      doesNotProve: "真实气路动态，除非建立物理模型"
    },
    {
      target: "时间",
      double: "ManualClock / ScaledTwinClock",
      simulates: "超时、deadline、快进、时钟跳变和 deterministic replay",
      doesNotProve: "真实 CPU 调度延迟，另由压力测试验证"
    },
    {
      target: "Observer",
      double: "InMemoryJournal / SlowSink / BrokenSink",
      simulates: "记录、背压、序列化失败和 sink 崩溃",
      doesNotProve: "不允许 Observer 故障改变任务结果"
    }
  ],

  faultScenarios: [
    ["启动", "重复实现 ID、缺少绑定、IK 与机器人 DOF 不匹配、主站 profile 不支持速度字段"],
    ["快照", "joint state stale、scene stale、时间偏差、标定版本改变、frame 缺失"],
    ["算法", "无解、超时、异常、非线程安全并发、取消不响应、返回非法轨迹"],
    ["轨迹", "维度错误、速度缺失、NaN、时间不递增、段间不连续、超限、snapshot 过期"],
    ["执行", "goal rejected、启动超时、反馈中断、tracking error、final mismatch、取消确认超时"],
    ["主站", "buffer 不完整、插值 profile 不同、控制周期超时、EtherCAT 掉线、驱动器 fault"],
    ["工具", "吸附不确认、执行中掉吸、阀命令拒绝、状态反馈 stale"],
    ["观察", "JSONL 磁盘满、Rerun 断开、metrics 慢、Event sink 异常"],
    ["并发", "资源争用、queue full、结果乱序、迟到结果、同一 Job 重复取消"],
    ["恢复", "重试预算耗尽、恢复动作失败、停止后实际状态未知、重启后查询旧 Job"]
  ],

  acceptanceSlices: [
    ["A", "架构内核", "无 ROS：manifest → register → bind → READY → fake dual-grasp → completed；事件和错误可审计。"],
    ["B", "双 IK 绑定", "同一次启动注册两种 IK，extract/loaded planner 分别注入正确实例；错误组合在启动失败。"],
    ["C", "轨迹合同", "TrajectoryPipeline 产出 position + velocity + time；Fake Master 校验完整缓存和插值反馈。"],
    ["D", "数字孪生", "只替换 Runtime Pack，MotionEngine 零修改；支持取消、故障注入和 Rerun。"],
    ["E", "当前算法接入", "用 Adapter 包装现有 IK/抽离/负重 Implementation，新旧结果可 replay/diff。"],
    ["F", "主站 SIL", "软件主站使用真实插值与错误合同，验证轴同步、feedback 和 controlled stop。"],
    ["G", "真机 canary", "单段、小幅、低速，逐级验证方向、速度、取消和最终状态；仅一个执行权威。"]
  ],

  stackLayers: [
    {
      layer: "领域核心",
      choices: ["C++17", "标准库 value types", "std::variant/明确类型", "std::chrono", "Result<T, MotionError>"],
      rule: "不得依赖 rclcpp、MoveIt、trajectory_msgs、EtherCAT SDK 或 Python runtime。"
    },
    {
      layer: "运行核心",
      choices: ["C++17", "固定 worker pool", "mailbox", "immutable snapshots", "yaml-cpp 候选"],
      rule: "Workflow 运行时使用编译结果；不使用 detached thread；不执行任意配置脚本。"
    },
    {
      layer: "算法与规划 Adapter",
      choices: ["MoveIt 2", "OMPL", "BioIK/解析 IK", "Eigen", "FCL/PlanningScene"],
      rule: "外部类型在 Adapter Seam 内转换；线程上下文按 Implementation 实际安全性隔离。"
    },
    {
      layer: "ROS Adapter",
      choices: ["ROS 2 Humble", "rclcpp/rclpy", "Action/Topic/TF2", "robot_motion_interfaces"],
      rule: "ROS 用于跨进程合同和部署，不作为 MotionEngine 的内部消息总线。"
    },
    {
      layer: "执行与主站",
      choices: ["ExecuteTrajectory/FollowJointTrajectory", "EtherCAT 主站", "确定性插值", "desired/actual/error feedback"],
      rule: "完整轨迹先缓存；速度字段显式传输；硬实时周期不写日志、不等待 ROS。"
    },
    {
      layer: "数字孪生",
      choices: ["C++17 kinematic execution core 候选", "Python 3 配置/工具", "Manual/Scaled clock", "可选 physics Adapter"],
      rule: "先保证执行合同和时间语义一致，再按需求增加动力学，不把可视化当孪生核心。"
    },
    {
      layer: "观察",
      choices: ["JSONL", "Rerun SDK", "RViz", "metrics", "structured console"],
      rule: "Event 和 Telemetry 分流；Observer 失败不取得控制权。"
    },
    {
      layer: "测试与构建",
      choices: ["CMake/ament_cmake/colcon", "ament_cmake_gtest", "pytest", "launch_testing", "sanitizer/静态检查候选"],
      rule: "Interface 是测试面；先无 ROS，再 ROS 集成，再 SIL/HIL。"
    }
  ],

  targetPackages: [
    {
      name: "robot_motion_core",
      status: "建议新增",
      contents: ["领域 ID/类型", "MotionError/Result", "Command/Event/Snapshot", "能力家族 Interface", "TimedJointTrajectory"],
      dependencies: "C++ 标准库；尽量不依赖 ROS/MoveIt",
      note: "提供高 Leverage 的稳定 Interface，不成为杂物 common。"
    },
    {
      name: "robot_motion_runtime",
      status: "建议新增",
      contents: ["MotionApplication", "RegistryHub/RuntimeGraph", "WorkflowCompiler", "JobManager/Engine", "Scheduler/Supervisor/EventHub"],
      dependencies: "robot_motion_core；配置解析；不依赖具体算法",
      note: "运行内核可在无 ROS executable 中直接测试。"
    },
    {
      name: "robot_motion_task_dual_grasp",
      status: "稳定后新增",
      contents: ["DualGraspTaskPack", "Workflow YAML", "Primitive/Policy 组合", "任务 schema"],
      dependencies: "core + runtime extension Interface",
      note: "先在 runtime 内验证语义，任务稳定后再独立成 package，避免浅 Package。"
    },
    {
      name: "robot_motion_ik_service",
      status: "当前复用/逐步 Adapter 化",
      contents: ["现有 IK Implementation", "IIKSolver Adapter", "ROS ingress 可保留"],
      dependencies: "MoveIt/BioIK/robot model",
      note: "不同 IK 通过 typed family 注册；planner 依赖在 RuntimeGraph 注入。"
    },
    {
      name: "robot_motion_planning_service",
      status: "当前复用/逐步 Adapter 化",
      contents: ["现有规划 Implementation", "Extract/Loaded Adapter", "场景类型转换"],
      dependencies: "MoveIt/OMPL/IK Adapter",
      note: "先包装，不在首个架构提交里搬动成熟算法。"
    },
    {
      name: "robot_motion_digital_twin",
      status: "深化为 Runtime Pack",
      contents: ["TwinWorld", "Twin execution/state/health Adapter", "FaultInjector", "Rerun Observer"],
      dependencies: "core/runtime；ROS 仅外部接入；可选物理 backend",
      note: "当前 Python twin 可先作为 Adapter，插值语义随后与真机对齐。"
    },
    {
      name: "robot_motion_interfaces",
      status: "保留跨进程合同",
      contents: ["ROS msg/srv/action", "版本和稳定性说明"],
      dependencies: "ROS IDL",
      note: "不承载所有进程内领域类型；领域 core 与 ROS message 由 Adapter 转换。"
    },
    {
      name: "robot_motion_observer",
      status: "需求成熟后新增",
      contents: ["JSONL", "Rerun/RViz", "metrics", "replay tooling"],
      dependencies: "Event/Telemetry Interface",
      note: "一个 package 可包含多个 Observer Adapter，避免每种输出一个浅 package。"
    }
  ],

  dependencyRules: [
    ["robot_motion_core", "只向标准库；不得反向依赖 runtime、ROS、MoveIt 或具体任务。"],
    ["robot_motion_runtime", "依赖 core；只认识能力 Interface 和 TaskPack 扩展点。"],
    ["Task Pack", "依赖 core/runtime Interface；不能依赖某个具体 IK 类，除非明确注册为不可分割组合。"],
    ["Algorithm Implementation", "依赖 core Interface 和所需数学/规划库；不依赖 MotionEngine。"],
    ["ROS Adapter", "依赖 core/runtime + ROS；负责领域类型与 ROS 类型转换。"],
    ["Runtime Pack", "安装 execution/state/health/telemetry Adapter；真机与孪生不被上层特殊判断。"],
    ["Observer", "只消费 Event/Telemetry/Snapshot；不能依赖 Job 可变内部状态。"]
  ],

  configFiles: [
    ["runtime.yaml", "启动选择", "robot profile、Task Pack、实现实例、bindings、Runtime Pack、Observer、并发预算"],
    ["workflows/*.yaml", "任务流程", "stage、Command、分支、join、retry、timeout、barrier；不写任意代码"],
    ["algorithms/*.yaml", "Implementation 参数", "seed、timeout、规划预算等；由具体 Adapter schema 验证"],
    ["robots/*.yaml", "机器人运行合同", "profile id、工具、标定引用、执行轴组和安全限制引用"],
    ["execution_profiles/*.yaml", "执行能力镜像/期望", "字段、插值、限制、stop/feedback；启动时与 provider 实际能力比对"],
    ["tests/scenarios/*.yaml", "测试情景", "事实 fixture、Fake 结果、故障注入和预期 Event/Result"]
  ],

  migrationPhases: [
    {
      phase: "0",
      name: "冻结架构合同",
      changes: ["确认术语和责任", "建立本门户和决策记录", "定义 TimedJointTrajectory 与 ExecutionCapabilities 草案"],
      evidence: "评审通过；不改变现有运行"
    },
    {
      phase: "1",
      name: "薄运行内核",
      changes: ["新增 core/runtime package 骨架", "RegistryHub/RuntimeGraph", "Job/Engine/Scheduler 最小实现", "FakeRuntimePack"],
      evidence: "无 ROS 纵向任务完成；双 IK 绑定测试"
    },
    {
      phase: "2",
      name: "轨迹与执行骨架",
      changes: ["TrajectoryPipeline", "速度字段合同", "ExecutionSupervisor", "Fake Master interpolation/feedback"],
      evidence: "完整轨迹缓存、插值、取消和 final-state 测试"
    },
    {
      phase: "3",
      name: "数字孪生 Runtime Pack",
      changes: ["当前 twin 包装/深化", "同 profile 插值", "FaultInjector/clock", "Event + Telemetry Observer"],
      evidence: "只换 Runtime Pack，Engine 零修改；Rerun 可审计"
    },
    {
      phase: "4",
      name: "当前算法纵向接入",
      changes: ["包装现有 IK", "包装 extract/loaded planning", "场景 Snapshot", "DualGraspTaskPack"],
      evidence: "同一任务在旧链和新链 planning-only 对比"
    },
    {
      phase: "5",
      name: "ROS/上游接入",
      changes: ["ROS Ingress Adapter", "ROS state/scene Adapter", "兼容现有 action", "新 task executor 旁路运行"],
      evidence: "launch integration；不产生双执行权威"
    },
    {
      phase: "6",
      name: "主站 SIL 与真机 canary",
      changes: ["RealRobotRuntimePack", "实际 ExecutionCapabilities", "受控停止和错误映射", "逐段切换执行入口"],
      evidence: "SIL → HIL → 小幅真机；旧入口可回退"
    },
    {
      phase: "7",
      name: "收敛与删除旧路径",
      changes: ["迁移稳定 Implementation", "删除重复 glue/配置", "冻结正式合同", "更新 system_flow 当前状态"],
      evidence: "新链成为唯一权威；回归、文档、部署均通过"
    }
  ],

  nonGoals: [
    "首轮不重写 IK、抽离或负重算法数学细节。",
    "首轮不让 YAML 变成图灵完备脚本语言。",
    "首轮不把每个类拆成一个 ROS2 Package。",
    "首轮不把 MotionEngine 放进硬实时 EtherCAT 周期。",
    "首轮不在没有真实第二个 Adapter 时制造大量空 Interface。",
    "首轮不同时修改算法、文件位置、ROS 合同和真机执行全部层次。",
    "测试替身不能替代 SIL/HIL；每一级只对自己的证据负责。"
  ]
};
