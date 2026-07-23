window.MOTION_ARCH_DATA = {
  meta: {
    title: "robot_motion_control 目标运行时架构",
    version: "v1",
    updated: "2026-07-23",
    status: "对象系统设计基线",
    note: "描述统一程序与对象图目标，不表示当前代码已经完成。算法细节不在此冻结。"
  },

  nav: [
    ["index.html", "整体架构", "overview"],
    ["flows.html", "启动与任务流", "flows"],
    ["modules.html", "对象与接口", "modules"],
    ["execution.html", "轨迹与执行", "execution"],
    ["runtime.html", "真机与孪生", "runtime"],
    ["testing.html", "测试与模拟", "testing"],
    ["technology.html", "技术栈与迁移", "technology"]
  ],

  principles: [
    {
      title: "一个系统，一套领域对象",
      text: "MotionSystem 是统一门面；RobotDefinition、算法、运行环境和通信都是对象，不再被目标 ROS 包结构切碎。",
      tag: "testable"
    },
    {
      title: "发现不等于绑定",
      text: "ObjectCatalog 发现可用工厂；SystemBuilder 在启动时注入依赖并冻结 ObjectGraph，任务运行中不猜类型。",
      tag: "typed"
    },
    {
      title: "两个图解决两类变化",
      text: "ObjectGraph 固定本次启动使用谁；TaskGraph 描述一种任务怎么走；JobContext 只保存单次请求事实。",
      tag: "coherent"
    },
    {
      title: "准确接口与有界并发",
      text: "IK、规划、轨迹、通信各用自己的家族接口；注册对象不创建线程，活跃 Operation 才共享有界执行资源。",
      tag: "concurrent"
    },
    {
      title: "主站拥有实时插值",
      text: "运控生成完整定时轨迹并携带速度信息；主站缓存后按确定性周期插值和同步下发，Supervisor 监督生命周期。",
      tag: "realtime"
    },
    {
      title: "外部框架只是实现",
      text: "Direct/ROS2 是 Communication 实现，MoveIt 是算法实现依赖，真机/孪生/Fake 是 RobotRuntime 实现。",
      tag: "replaceable"
    }
  ],

  layers: [
    {
      id: "evidence",
      name: "系统门面与领域值",
      tone: "cyan",
      purpose: "对外只暴露一个运控系统，对内先建立与框架无关的领域语言。",
      items: [
        ["MotionSystem", "from_config / start / submit / stop 的唯一公共门面"],
        ["RobotDefinition", "运动学、关节、限位、碰撞、工具与执行合同"],
        ["Motion Value Objects", "请求、状态、场景、轨迹、快照、错误和结果"],
        ["ResourceResolver", "解析 asset:// 资源，不向领域泄漏工作空间路径"]
      ]
    },
    {
      id: "composition",
      name: "启动组合",
      tone: "blue",
      purpose: "任务入口开放前发现工厂、创建对象、注入依赖、校验并冻结应用对象图。",
      items: [
        ["SystemConfig", "选择 RobotDefinition、对象实现、绑定、通信和预算"],
        ["ObjectCatalog", "按准确家族保存类型安全工厂"],
        ["SystemBuilder", "构造对象、注入依赖、执行兼容性与环检查"],
        ["ObjectGraph", "本次启动对象实例与 typed handle 的冻结图"],
        ["TaskDefinitionCatalog", "任务 schema、TaskGraph 来源和资源声明"]
      ]
    },
    {
      id: "orchestration",
      name: "任务运行核心",
      tone: "violet",
      purpose: "解释已编译 TaskGraph，管理 JobContext、快照、资源和 Operation，不直接调用外部框架。",
      items: [
        ["JobManager", "准入、幂等、查询、取消和结果"],
        ["MotionEngine", "TaskGraph + state + result → new state + commands"],
        ["JobContext", "冻结图引用、快照、租约、取消、deadline 和关联信息"],
        ["SnapshotManager", "版本化事实的一致快照"],
        ["OperationScheduler", "资源租约、有界 worker、超时和协作取消"]
      ]
    },
    {
      id: "capability",
      name: "运动对象家族",
      tone: "amber",
      purpose: "共同继承 MotionObject 元协议，调用时只使用输入、不变量和错误一致的准确家族接口。",
      items: [
        ["IKSolver", "解析、多种子、约束 IK 和确定性 Fake"],
        ["MotionPlanner", "抽离、负重、通用规划及其显式 IK 依赖"],
        ["TrajectoryProcessor", "拼接、平滑、时间参数化与验证"],
        ["TaskNode / Guard", "计算、动作、检查、分支和 join 节点"],
        ["Policy", "候选选择、重试、恢复、超时和资源策略"]
      ]
    },
    {
      id: "runtime",
      name: "运行环境与通信对象",
      tone: "green",
      purpose: "把领域 Command 交给外部环境，并允许同一核心在直接调用、ROS、回放和测试边界间切换。",
      items: [
        ["RobotRuntime", "真机 buffered trajectory / twin / fake / replay"],
        ["Communication", "Direct / ROS2 / Replay / Test 的类型化通道"],
        ["StateSource", "机器人、场景、工具的版本化事实流"],
        ["ToolRuntime", "真空、电磁阀与工具动作/状态"],
        ["RuntimeHealth", "能力、时钟、控制器和外部依赖健康"]
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
        ["Observer", "JSONL、Rerun、RViz、metrics 和边界 feedback"],
        ["LifecycleListener", "只观察对象 start/stop/health"],
        ["FaultInjector", "测试环境故障与时序注入"],
        ["Replay", "按配置、对象图、快照和结果复现实验"]
      ]
    }
  ],

  overallFlow: [
    ["1", "读取系统配置", "SystemConfig 选择机器人定义源、对象实现、显式依赖绑定、通信环境和并发预算。"],
    ["2", "发现对象工厂", "ObjectCatalog 按家族安装类型安全工厂；注册只说明系统能创建什么。"],
    ["3", "构建对象图", "SystemBuilder 创建实例并注入依赖，例如两个 planner 分别绑定两个 IK 对象。"],
    ["4", "编译任务图", "声明式任务配置经 schema、类型、资源、分支和退出条件检查，生成 TaskGraph。"],
    ["5", "验证并启动", "冻结 ObjectGraph，按拓扑顺序启动 ActiveObject；健康、合同和预热通过后进入 READY。"],
    ["6", "任务准入", "JobManager 校验请求、幂等键、系统状态和资源，创建 MotionJob。"],
    ["7", "建立 JobContext", "固定 ObjectGraph/TaskGraph 版本，并捕获机器人、场景、工具和标定快照。"],
    ["8", "解释任务图", "MotionEngine 根据 JobState 与 Result 推进 TaskGraph，产生一个或多个领域 Command。"],
    ["9", "调用对象", "Invoker 统一关联、计时和错误归一化；Scheduler 让算法与 I/O 在预算内并发。"],
    ["10", "结果回流", "Result 进入 Job mailbox；EventHub 向 Observer 广播已发生事实。"],
    ["11", "轨迹执行", "ExecutionSupervisor 验证、提交完整定时轨迹并监督真机或孪生。"],
    ["12", "收口", "确认最终状态、持久化结果、释放资源；成功、失败和取消都形成可审计终态。"]
  ],

  keyConcepts: [
    {
      name: "MotionSystem",
      question: "调用者如何使用整个运控？",
      answer: "只通过构建、启动、submit、查询/取消和停止门面；内部对象和通信实现不泄漏给业务调用者。",
      lifetime: "程序级"
    },
    {
      name: "ObjectGraph",
      question: "这次启动实际用了谁？",
      answer: "记录对象实例与 typed dependency：机器人定义、算法、运行环境、通信和观察对象在 READY 前固定。",
      lifetime: "启动级"
    },
    {
      name: "TaskGraph",
      question: "一种任务怎样运行？",
      answer: "把配置编译为类型化节点、分支、重试和 join；节点只引用 ObjectGraph 中已绑定的命名角色。",
      lifetime: "任务类型级"
    },
    {
      name: "JobContext",
      question: "这一次任务正在做什么？",
      answer: "保存请求、图版本、快照引用、资源租约、Operation、取消令牌、deadline、事件链和最终结果。",
      lifetime: "单次请求"
    }
  ],

  lifecycleStates: [
    ["CREATED", "进程对象已创建，尚未接受注册。", "next"],
    ["DISCOVERING", "按对象家族安装类型安全工厂和 TaskDefinition。", "next"],
    ["BUILDING", "创建对象、注入 typed dependency、构建 ObjectGraph 和 TaskGraph。", "next"],
    ["VALIDATING", "检查依赖环、能力、机器人兼容性、资源和执行合同。", "next"],
    ["STARTING", "按拓扑顺序启动 ActiveObject，加载资源并完成无运动预热。", "next"],
    ["READY", "入口开放，可接收任务。", "ready"],
    ["RUNNING", "存在活跃 Job；应用仍可接收符合资源策略的请求。", "active"],
    ["DRAINING", "停止接受新 Job，等待或取消现有 Job。", "stop"],
    ["STOPPED", "资源释放完毕。", "stop"],
    ["STARTUP_FAILED", "任一启动验证失败，入口保持关闭并输出结构化错误。", "error"]
  ],

  startupSteps: [
    ["01", "读取 SystemConfig", "解析对象选择、绑定、任务、通信和预算；不创建 Job。", "Typed SystemConfig"],
    ["02", "解析机器人资源", "RobotDefinitionSource + ResourceResolver 构建运动学、关节、限制、碰撞、工具与执行合同。", "RobotDefinition"],
    ["03", "安装对象工厂", "按 IKSolver、Planner、Trajectory、Runtime、Communication、Observer 家族登记。", "ObjectCatalog OPEN"],
    ["04", "安装任务定义", "登记请求/结果 schema、TaskGraph 来源、命名角色、策略和资源声明。", "TaskDefinitionCatalog"],
    ["05", "创建对象实例", "SystemBuilder 按配置创建普通对象和 ActiveObject，但暂不开放外部入口。", "Object instances"],
    ["06", "注入对象依赖", "为 planner 注入指定 IK，为 runtime 注入定义/时钟，为通信注入系统门面。", "Mutable ObjectGraph"],
    ["07", "编译 TaskGraph", "校验节点类型、分支、循环预算、join、角色和资源。", "Compiled TaskGraph"],
    ["08", "冻结 ObjectGraph", "完成重复 ID、依赖环、家族类型和组合能力检查，拒绝运行期隐式换绑。", "Frozen ObjectGraph"],
    ["09", "启动 ActiveObject", "按依赖拓扑启动通信之外的 runtime、state source、telemetry 和 observer。", "Started objects"],
    ["10", "验证与预热", "检查线程安全、执行能力、状态新鲜度、模型加载、健康和无运动探测。", "ReadinessReport"],
    ["11", "启动任务核心", "JobManager、Engine、Scheduler、SnapshotManager、Supervisor 与 EventHub 就绪。", "MotionSystem ready"],
    ["12", "开放 Communication", "最后开放 Direct/ROS2/IPC 任务入口；此前任何请求均返回 NOT_READY。", "READY"]
  ],

  jobSteps: [
    ["01", "请求进入", "Communication 把 Direct/ROS2/IPC 输入转换为领域 TaskRequest，保留 request_id 和 deadline。", "command"],
    ["02", "准入", "JobManager 检查 READY、schema、幂等、资源和任务类型。", "decision"],
    ["03", "创建 JobContext", "固定 ObjectGraph/TaskGraph/RobotDefinition 版本并创建 mailbox、journal、cancel token。", "state"],
    ["04", "捕获快照", "按阶段获取一致 RobotState、Scene、Tool、Calibration 快照。", "snapshot"],
    ["05", "推进 TaskGraph", "MotionEngine 纯计算下一状态和 Command，不直接调用 ROS/MoveIt。", "decision"],
    ["06", "调度 Operation", "Scheduler 根据资源、并发预算和对象线程安全声明执行一个或多个 Command。", "parallel"],
    ["07", "Invoker 调用对象", "统一添加关联、计时、deadline、取消和异常归一化；对象返回 typed Result。", "object"],
    ["08", "回到 mailbox", "Result 按 Job 内顺序处理；迟到、重复和已取消结果有明确规则。", "result"],
    ["09", "监督执行", "轨迹由 ExecutionSupervisor 提交并监控，反馈作为 Result/Event 回流。", "feedback"],
    ["10", "结束或恢复", "Engine 根据事实和 RecoveryPolicy 完成、重试、重规划或安全终止。", "decision"],
    ["11", "最终确认", "确认最终机器人/工具状态，写入 JobResult 和完整事件链。", "state"],
    ["12", "释放", "释放资源租约、Operation 和 JobContext；保留可查询摘要与审计记录。", "result"]
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
    ["ActiveObject async I/O", "ROS2、真机反馈和定时器通过 completion 返回 Result，不阻塞 Engine。"],
    ["并行 join", "Engine 可发出左右臂或候选并行 Command，并以 operation group + join policy 收口。"],
    ["线程安全声明", "MotionObject 声明 thread_safe、internal_parallelism、max_concurrency 和所需上下文。"],
    ["资源租约", "ResourceScheduler 防止多个 Job 同时控制相同机器人、轴组、工具或场景写权限。"],
    ["协作取消", "取消令牌传播给尚未开始和正在运行的 Operation；结果迟到时不得复活已终止 Job。"],
    ["不可变快照", "并行规划共享只读 Snapshot；存在内部缓存的 MoveIt/FCL 上下文应按 worker 隔离。"]
  ],

  snapshotLayers: [
    {
      name: "启动固定事实",
      lifetime: "Application / Job",
      data: "RobotDefinition、ObjectGraph、TaskGraph、执行能力合同",
      invalidation: "运行期间不热改；版本变化需要新 ObjectGraph 或重启"
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
      name: "MotionSystem",
      group: "startup",
      lifetime: "Application",
      purpose: "统一运控门面、composition root 和生命周期根；对外只暴露构建、启动、提交、查询/取消与停止。",
      inputs: ["SystemConfig", "TaskRequest", "停止请求"],
      outputs: ["READY/FAILED 状态", "JobHandle / JobResult", "ReadinessReport"],
      owns: ["ObjectGraph", "任务核心", "ActiveObject 的拓扑生命周期"],
      invariants: ["Ingress 最后开放", "任一关键启动失败都 fail closed", "停止顺序与启动顺序相反"],
      errors: ["CONFIG_INVALID", "STARTUP_DEPENDENCY_FAILED", "WARMUP_FAILED"],
      stack: "C++20 候选；纯 composition 层；ROS main 只是可选 integration executable",
      tests: "DirectCommunication + 全 Fake 对象验证生命周期、任务门面、启动失败和安全关闭"
    },
    {
      id: "runtime-manifest",
      name: "SystemConfig",
      group: "startup",
      lifetime: "Application",
      purpose: "描述本次启动选择的机器人定义源、对象实例、显式依赖绑定、任务定义、通信和并发预算。",
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
      name: "TaskDefinition",
      group: "startup",
      lifetime: "Task type",
      purpose: "一种任务类型的静态定义，声明 TaskGraph、命名对象角色、策略、资源和请求/结果类型。",
      inputs: ["TaskDefinitionBuilder", "Task YAML"],
      outputs: ["TaskGraph source", "RoleSpec", "Task schema"],
      owns: ["任务语义", "不拥有算法实例或 Job 状态"],
      invariants: ["任务角色引用 ObjectGraph 命名对象", "定义期不启动线程", "配置节点不可直接调用硬件"],
      errors: ["TASK_SCHEMA_INVALID", "MISSING_ROLE", "UNSUPPORTED_ROBOT_DEFINITION"],
      stack: "C++20 类型注册入口 + 声明式 TaskGraph YAML",
      tests: "编译 TaskGraph、缺角色、资源冲突和分支完整性"
    },
    {
      id: "registry-hub",
      name: "ObjectCatalog",
      group: "startup",
      lifetime: "Application",
      purpose: "按对象家族保存类型安全工厂，只负责实现发现，不保存本次启动的依赖绑定。",
      inputs: ["ObjectDescriptor", "Typed Factory"],
      outputs: ["按 Interface 类型查询的 factory handle"],
      owns: ["ID 唯一性", "实现元数据", "工厂生命周期"],
      invariants: ["不提供 Registry<ISkill>", "系统构建完成后不可写", "任务运行时不查目录或 dynamic_cast"],
      errors: ["DUPLICATE_ID", "CATALOG_FROZEN", "WRONG_FAMILY"],
      stack: "C++ 模板 ObjectCatalog::add<T>/create<T>；concept/trait 约束候选",
      tests: "重复 ID、错误 family、冻结、工厂异常和 descriptor 校验"
    },
    {
      id: "system-builder",
      name: "SystemBuilder",
      group: "startup",
      lifetime: "Build phase",
      purpose: "把 SystemConfig 和 ObjectCatalog 变成可启动、可审计的 ObjectGraph，是唯一允许创建和注入系统对象的地方。",
      inputs: ["SystemConfig", "ObjectCatalog", "RobotDefinition", "TaskDefinitionCatalog"],
      outputs: ["Frozen ObjectGraph", "Compiled TaskGraph[]", "BuildDiagnostics"],
      owns: ["对象构造顺序", "typed dependency 注入", "依赖环/能力校验", "共享与独占策略"],
      invariants: ["构建失败不产生半可用 MotionSystem", "对象 ID 唯一", "ActiveObject 在图冻结后才 start"],
      errors: ["OBJECT_CREATE_FAILED", "BINDING_NOT_FOUND", "DEPENDENCY_CYCLE", "CAPABILITY_MISMATCH"],
      stack: "C++20 composition root；显式 builder API；不引入通用 service locator",
      tests: "双 planner/双 IK 绑定、依赖环、构造失败回滚、共享实例和拓扑启动顺序"
    },
    {
      id: "workflow-compiler",
      name: "WorkflowCompiler",
      group: "startup",
      lifetime: "Application / Task type",
      purpose: "把声明式任务配置编译为不可变、类型化且已验证的 TaskGraph。",
      inputs: ["TaskGraph YAML", "Task schema", "Object descriptors"],
      outputs: ["Compiled TaskGraph", "诊断列表"],
      owns: ["语法、类型、分支、重试、超时、资源和可达终态检查"],
      invariants: ["运行时不再解析 YAML", "所有 node 输入输出均有类型", "循环必须有退出/预算"],
      errors: ["UNKNOWN_NODE", "INVALID_BRANCH", "UNBOUNDED_RETRY", "RESOURCE_DEADLOCK"],
      stack: "C++17 编译器；YAML 输入；稳定内部 AST",
      tests: "golden TaskGraph、非法图、类型错配、循环预算、schema 迁移"
    },
    {
      id: "runtime-graph",
      name: "ObjectGraph",
      group: "startup",
      lifetime: "Application，版本固定到 Job",
      purpose: "保存本次启动的 MotionObject 实例和 typed dependency，解决不同 planner 绑定不同 IK 的问题。",
      inputs: ["SystemConfig bindings", "ObjectCatalog factories", "RobotDefinition"],
      outputs: ["不可变 typed handles", "绑定审计图"],
      owns: ["对象身份", "依赖边", "共享与独占实例策略", "拓扑启动/停止顺序"],
      invariants: ["所有必需依赖在 READY 前绑定", "Job 运行中不热切换", "组合兼容性已验证"],
      errors: ["BINDING_NOT_FOUND", "CAPABILITY_MISMATCH", "DEPENDENCY_CYCLE"],
      stack: "C++20 shared/unique typed handle；SystemBuilder；JSON 审计输出候选",
      tests: "双 IK 分角色绑定、组合错误、实例共享和构造失败"
    },
    {
      id: "robot-definition",
      name: "RobotDefinition + ResourceResolver",
      group: "startup",
      lifetime: "Application / immutable shared value",
      purpose: "把 URDF、SRDF、mesh、标定和执行轴配置解析为统一机器人领域对象，并隔离资源寻址方式。",
      inputs: ["RobotDefinitionSource config", "asset:// logical URI", "deployment resources"],
      outputs: ["RobotDefinition", "ResolvedResource", "provenance"],
      owns: ["运动学/关节/限位/碰撞/工具/Frame/执行合同", "资源校验与版本"],
      invariants: ["领域对象不保存 ROS package 路径", "关节语义只有一个权威", "缺失资源启动失败"],
      errors: ["RESOURCE_NOT_FOUND", "ROBOT_DEFINITION_INVALID", "JOINT_CONTRACT_MISMATCH"],
      stack: "urdfdom/SRDF/FCL loader 可选；filesystem/ament/memory/bundle resolver",
      tests: "同一 RobotDefinition 从文件、内存和 bundle 加载后语义等价；坏 mesh/关节映射失败"
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
      name: "MotionJob + JobContext",
      group: "runtime",
      lifetime: "Single request",
      purpose: "一项任务的全部可恢复状态和关联身份，是事件、Operation、快照和错误的聚合根。",
      inputs: ["Compiled TaskGraph", "TaskRequest", "ObjectGraph version"],
      outputs: ["JobState", "JobResult", "Journal records"],
      owns: ["mailbox", "取消令牌", "当前 stage", "资源租约", "Operation 索引"],
      invariants: ["状态只由 mailbox 消费者修改", "终态不可逆", "每个外部结果按 operation_id 去重"],
      errors: ["INVALID_TRANSITION", "LATE_RESULT", "JOB_DEADLINE_EXCEEDED"],
      stack: "C++20 value state + mailbox；JobContext 使用只读图 handle；持久化格式独立",
      tests: "状态机属性测试、重复/乱序结果、取消与终态竞争"
    },
    {
      id: "motion-engine",
      name: "MotionEngine",
      group: "runtime",
      lifetime: "Application，处理多个 Job",
      purpose: "解释 TaskGraph 的纯领域决策：JobState + Result → NewState + Commands。",
      inputs: ["JobState", "类型化 Result", "Compiled TaskGraph", "JobContext view"],
      outputs: ["NewState", "Command list", "领域 Event"],
      owns: ["阶段切换", "join 条件", "重试/恢复策略应用", "任务取消语义"],
      invariants: ["不调用 ROS/MoveIt/主站", "相同输入得到相同决策", "不阻塞等待 Operation"],
      errors: ["UNHANDLED_RESULT", "POLICY_EXHAUSTED", "WORKFLOW_INVARIANT_BROKEN"],
      stack: "C++20 reducer/state machine；std::variant 或明确结果层次",
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
      purpose: "把 Command 交给 ObjectGraph 中已绑定对象，并管理 worker、并发预算、deadline 和协作取消。",
      inputs: ["Command", "ObjectGraph typed handle", "ResourceLease"],
      outputs: ["OperationHandle", "Result envelope"],
      owns: ["固定 worker pool", "per-family concurrency", "OperationId 和取消传播"],
      invariants: ["注册对象不创建线程", "队列有界", "非线程安全对象不得并发调用"],
      errors: ["QUEUE_FULL", "OPERATION_TIMEOUT", "OBJECT_EXCEPTION", "CANCELED"],
      stack: "C++17 固定线程池 + async I/O completion；不使用 detached thread",
      tests: "并发上限、超时、异常归一化、取消和 worker 饥饿"
    },
    {
      id: "object-invoker",
      name: "ObjectInvoker",
      group: "runtime",
      lifetime: "Application",
      purpose: "所有 TaskNode 和 MotionObject 的统一调用 seam，保证错误、关联、计时、取消和日志字段不会散落。",
      inputs: ["InvocationContext", "typed object handle", "typed input"],
      outputs: ["typed Result<Output, MotionError>", "DomainEvent", "duration metrics"],
      owns: ["job/node/object/snapshot/attempt 关联", "deadline/cancel 前后检查", "异常归一化"],
      invariants: ["Observer 不包围并改变返回值", "未知异常不逃逸 worker", "原始诊断保留但领域错误稳定"],
      errors: ["PRECONDITION_FAILED", "DEADLINE_EXCEEDED", "OBJECT_EXCEPTION", "POSTCONDITION_FAILED"],
      stack: "C++20 template invoke + std::expected 候选；OpenTelemetry 仅 Observer adapter",
      tests: "所有错误路径都带完整关联字段；observer/metrics 故障不改变对象结果"
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
      stack: "C++20；TrajectoryProcessor 家族；可包装 MoveIt 时间参数化实现",
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
      id: "communication",
      name: "Communication",
      group: "execution",
      lifetime: "Application / ActiveObject when needed",
      purpose: "把 MotionSystem 的 typed task/state/execution/event 边界映射到同进程、ROS2、回放或测试环境。",
      inputs: ["领域请求/结果", "System public facade", "channel config"],
      outputs: ["Direct/ROS2/Replay/Test channels", "boundary diagnostics"],
      owns: ["跨边界序列化", "request_id/deadline/cancel 映射", "连接健康与背压"],
      invariants: ["不成为 Engine 内部总线", "ROS 类型止于 seam", "通信故障映射为稳定领域错误"],
      errors: ["CHANNEL_UNAVAILABLE", "SCHEMA_MISMATCH", "BACKPRESSURE", "PEER_DISCONNECTED"],
      stack: "Direct C++ call；rclcpp Action/Topic/TF2；record/replay codec；in-memory test channel",
      tests: "同一 scenario 在 Direct 与 ROS2 下结果等价；断线、重复、取消和 schema 版本测试"
    },
    {
      id: "telemetry-stream",
      name: "TelemetryStream",
      group: "observe",
      lifetime: "RobotRuntime / Application",
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
    ["capability", "运动对象"],
    ["execution", "执行与边界"],
    ["observe", "观察与遥测"]
  ],

  interfaceFamilies: [
    {
      family: "机器人定义源",
      registry: "MotionObject → RobotDefinitionSource",
      interfaces: ["RobotDefinitionSource", "ResourceResolver"],
      adapters: ["URDF/SRDF", "Serialized", "ROS Parameter", "InMemory", "Generated"],
      compatibility: "资源版本、关节语义、Frame、工具、碰撞模型、执行轴合同和来源 provenance"
    },
    {
      family: "逆运动学",
      registry: "MotionObject → IKSolver",
      interfaces: ["IKSolver", "IKCandidateGenerator", "ConstrainedIKSolver"],
      adapters: ["解析 IK", "BioIK / multi-seed", "MoveIt IK", "Fake IK"],
      compatibility: "RobotDefinition、DOF、joint group、frame、单/双臂、候选能力和线程安全"
    },
    {
      family: "运动规划",
      registry: "MotionObject → MotionPlanner",
      interfaces: ["ExtractPlanner", "LoadedPlanner", "JointPathPlanner"],
      adapters: ["MoveIt/OMPL", "自研规划", "Planner+IK 组合对象", "Fake Planner"],
      compatibility: "显式 IKSolver typed dependency、场景语义、附着物、约束类型和 worker context"
    },
    {
      family: "轨迹处理",
      registry: "MotionObject → TrajectoryProcessor",
      interfaces: ["TrajectoryComposer", "TrajectorySmoother", "TimeParameterizer", "TrajectoryValidator"],
      adapters: ["MoveIt 时间参数化", "自研拼接/平滑", "领域验证器", "Deterministic Fake"],
      compatibility: "关节集合、速度/加速度字段、插值 profile、同步轴组"
    },
    {
      family: "机器人运行环境",
      registry: "ActiveObject → RobotRuntime",
      interfaces: ["BufferedTrajectoryExecutor", "RobotStateSource", "RuntimeHealth", "TelemetrySource"],
      adapters: ["RealRobot", "DigitalTwin", "Fake", "Replay"],
      compatibility: "轴合同、插值方式、必需轨迹字段、控制周期、取消/停止/反馈能力"
    },
    {
      family: "工具与元动作",
      registry: "MotionObject → ToolRuntime / TaskNode",
      interfaces: ["AttachPayload", "ReleasePayload", "ToolIO", "MotionPrimitive"],
      adapters: ["真空/电磁阀", "Twin Tool", "Fake Tool", "Approach/Retreat 节点"],
      compatibility: "工具型号、确认反馈、超时、幂等、安全状态"
    },
    {
      family: "边界通信",
      registry: "ActiveObject → Communication",
      interfaces: ["TaskChannel", "StateChannel", "ExecutionChannel", "EventChannel"],
      adapters: ["Direct", "ROS2", "Replay", "Test"],
      compatibility: "schema 版本、可靠性、取消、deadline、背压、序列化和部署拓扑"
    },
    {
      family: "观察与生命周期",
      registry: "MotionObject → Observer / LifecycleListener",
      interfaces: ["EventObserver", "TelemetryObserver", "LifecycleListener"],
      adapters: ["JSONL", "Rerun", "RViz", "metrics", "boundary feedback"],
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

  runtimeOptions: [
    {
      id: "real",
      name: "RealRobotRuntime",
      status: "生产",
      backend: "Execution/State 对象 + EtherCAT 主站",
      registers: ["BufferedTrajectoryExecutor", "RobotStateSource", "RuntimeHealth", "TelemetrySource", "可选 ToolRuntime"],
      guarantees: ["完整轨迹缓存", "确定性插值", "领域正向关节语义", "取消/停止/错误反馈", "硬件安全链"],
      mustNot: ["让任务知道从站编号", "把方向映射散落到算法", "用 topic 假装可靠 action result"]
    },
    {
      id: "twin",
      name: "DigitalTwinRuntime",
      status: "开发/验收",
      backend: "共享 TwinWorld 的一组准确 ActiveObject",
      registers: ["TwinBufferedExecutor", "TwinRobotStateSource", "TwinRuntimeHealth", "TwinTelemetrySource", "TwinFaultInjector", "TwinClock"],
      guarantees: ["同一轨迹字段合同", "可配置同一插值 profile", "确定性时间缩放", "取消和故障注入", "可回放 world state"],
      mustNot: ["直接成为 Observer", "绕开执行合同改 joint state", "把仿真特例写进 MotionEngine"]
    },
    {
      id: "fake",
      name: "FakeRobotRuntime",
      status: "单元测试",
      backend: "进程内确定性 Fake + ManualClock",
      registers: ["FakeExecutor", "FakeStateSource", "FakeHealth", "InMemoryTelemetry"],
      guarantees: ["无 ROS", "即时或脚本化结果", "严格可重复", "可检查收到的 Command"],
      mustNot: ["声称验证动力学", "依赖 wall clock sleep", "隐藏未消费 Command"]
    },
    {
      id: "replay",
      name: "ReplayRobotRuntime",
      status: "回归/诊断",
      backend: "记录的 Snapshot、Result、Event、Telemetry",
      registers: ["ReplayStateSource", "ReplayExecutionAdapter", "ReplayClock"],
      guarantees: ["复现同一输入序列", "校验 Engine 决策", "支持差分新旧架构"],
      mustNot: ["驱动真机", "把缺失数据默认为成功", "覆盖原始 provenance"]
    }
  ],

  twinModules: [
    ["DigitalTwinRuntime", "由 ObjectGraph 组合的孪生对象集合，共享一个 TwinWorld backend，但对外提供多个准确接口。"],
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

  runtimeManifestExample: `system:
  robot_definition:
    source: urdf_srdf
    model: asset://robots/alfa_v10/model.urdf
  communication: direct            # direct | ros2 | replay | test

objects:
  ik.extract:
    type: bioik.multi_seed
  ik.loaded:
    type: analytic.alfa_v10
  planner.extract:
    type: extract.rrt
    dependencies:
      candidate_ik: ik.extract
  planner.loaded:
    type: loaded.rrt_connect
    dependencies:
      goal_ik: ik.loaded
  robot.runtime:
    type: digital_twin              # real_robot | digital_twin | fake | replay

tasks:
  dual_grasp:
    graph: tasks/dual_grasp.yaml
    roles:
      extract_planner: planner.extract
      loaded_planner: planner.loaded
      execution: robot.runtime

observers: [journal.jsonl, rerun, metrics]`,

  testLevels: [
    {
      level: "L0",
      name: "领域值与对象单测",
      ros: "否",
      runtime: "InMemory ObjectGraph + ManualClock",
      verifies: ["TaskGraph/Engine 状态", "ObjectCatalog/ObjectGraph", "Snapshot", "TrajectoryPipeline", "错误与恢复"],
      gate: "每次提交"
    },
    {
      level: "L1",
      name: "无 ROS 纵向任务链",
      ros: "否",
      runtime: "DirectCommunication + Fake IK/Planner/Tool/Execution",
      verifies: ["YAML → READY → Job Completed", "双 IK 分角色绑定", "Event journal", "取消/超时"],
      gate: "每次提交"
    },
    {
      level: "L2",
      name: "运动学数字孪生",
      ros: "可选",
      runtime: "DigitalTwinRuntime objects",
      verifies: ["完整定时轨迹", "速度字段", "插值与反馈", "状态/场景一致性", "Rerun"],
      gate: "PR / nightly"
    },
    {
      level: "L3",
      name: "ROS Communication 集成",
      ros: "是",
      runtime: "Ros2Communication + DigitalTwinRuntime",
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
      runtime: "Ros2/DirectCommunication + RealRobotRuntime",
      verifies: ["方向/零位", "反馈语义", "跟随误差", "急停/取消", "最终到位"],
      gate: "人工安全审批"
    }
  ],

  testDoubles: [
    {
      target: "上游任务源",
      double: "TaskFixture / TestCommunication",
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
    ["A", "对象系统内核", "无 ROS：SystemConfig → ObjectGraph → READY → TaskGraph → completed；事件和错误可审计。"],
    ["B", "双 IK 绑定", "同一次启动注册两种 IK，extract/loaded planner 分别注入正确实例；错误组合在启动失败。"],
    ["C", "轨迹合同", "TrajectoryPipeline 产出 position + velocity + time；Fake Master 校验完整缓存和插值反馈。"],
    ["D", "数字孪生", "只替换 RobotRuntime 对象绑定，MotionEngine 零修改；支持取消、故障注入和 Rerun。"],
    ["E", "当前算法接入", "让现有 IK/抽离/负重 Implementation 实现准确家族接口，新旧结果可 replay/diff。"],
    ["F", "主站 SIL", "软件主站使用真实插值与错误合同，验证轴同步、feedback 和 controlled stop。"],
    ["G", "真机 canary", "单段、小幅、低速，逐级验证方向、速度、取消和最终状态；仅一个执行权威。"]
  ],

  stackLayers: [
    {
      layer: "领域核心",
      choices: ["C++20 候选", "标准库 value types", "std::variant/明确类型", "std::chrono", "Result<T, MotionError>"],
      rule: "不得依赖 rclcpp、MoveIt、trajectory_msgs、EtherCAT SDK 或 Python runtime。"
    },
    {
      layer: "运行核心",
      choices: ["C++20 候选", "ObjectGraph", "固定 worker pool", "mailbox", "immutable snapshots", "yaml-cpp 候选"],
      rule: "TaskGraph 运行时只使用编译结果；不使用 detached thread；不执行任意配置脚本。"
    },
    {
      layer: "算法对象实现",
      choices: ["MoveIt 2", "OMPL", "BioIK/解析 IK", "Eigen", "FCL/PlanningScene"],
      rule: "实现准确对象家族接口；MoveIt 类型不越过接口 seam；上下文按实际线程安全性隔离。"
    },
    {
      layer: "通信对象",
      choices: ["ROS 2 Humble", "rclcpp/rclpy", "Action/Topic/TF2", "robot_motion_interfaces"],
      rule: "Direct/ROS2/Replay/Test 实现同族边界合同；ROS 不作为 MotionEngine 内部消息总线。"
    },
    {
      layer: "执行与主站",
      choices: ["ExecuteTrajectory/FollowJointTrajectory", "EtherCAT 主站", "确定性插值", "desired/actual/error feedback"],
      rule: "完整轨迹先缓存；速度字段显式传输；硬实时周期不写日志、不等待 ROS。"
    },
    {
      layer: "数字孪生",
      choices: ["C++20 kinematic execution core 候选", "Python 3 配置/工具", "Manual/Scaled clock", "可选 physics backend"],
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

  targetLayout: [
    {
      name: "include/alfa_motion/",
      status: "公共对象合同",
      contents: ["MotionSystem", "Value Object", "MotionObject families", "Result/MotionError", "TimedJointTrajectory"],
      dependencies: "C++ 标准库；不暴露 ROS、MoveIt、EtherCAT 或部署路径类型",
      note: "公共面保持小；实现细节不因为放在同一仓库就变成公共 API。"
    },
    {
      name: "src/system/ + src/context/",
      status: "启动与请求上下文",
      contents: ["SystemBuilder", "ObjectCatalog/ObjectGraph", "SystemConfig", "JobContext", "ObjectInvoker"],
      dependencies: "只依赖公共对象合同和配置解析",
      note: "负责组合，不承载 IK、规划或设备协议业务。"
    },
    {
      name: "src/robot/ + src/scene/",
      status: "机器人事实",
      contents: ["RobotDefinition", "RobotDefinitionSource", "ResourceResolver", "VersionedStore", "SnapshotManager"],
      dependencies: "loader 可以依赖 urdfdom/FCL；领域值不依赖 ROS package 寻址",
      note: "原 description 资产成为 resources，原配置节点成为 source/resolver 实现。"
    },
    {
      name: "src/task/",
      status: "任务定义与运行",
      contents: ["TaskDefinition", "TaskGraph/Compiler", "JobManager", "MotionEngine", "Guard/Primitive/Policy"],
      dependencies: "依赖对象家族接口；通过命名角色引用 ObjectGraph typed handle",
      note: "任务类型先留在同一程序；只有独立发布产生真实价值时才考虑拆制品。"
    },
    {
      name: "src/algorithm/",
      status: "算法对象实现",
      contents: ["ik/", "planning/", "trajectory/", "组合 planner", "algorithm config schema"],
      dependencies: "Eigen、MoveIt、OMPL、BioIK 等只停留在具体实现侧",
      note: "IK/抽离/负重分别实现准确家族接口；planner 的 IK 依赖由构造绑定。"
    },
    {
      name: "src/execution/ + src/runtime/",
      status: "执行与运行环境",
      contents: ["ExecutionSupervisor", "RealRobot", "DigitalTwin", "Fake", "Replay", "ToolRuntime"],
      dependencies: "领域执行合同；具体 backend 可依赖 EtherCAT SDK 或孪生引擎",
      note: "真机与孪生可以由多个对象共享 backend，不需要包装成一个巨大 RuntimePack 类。"
    },
    {
      name: "src/communication/ + src/observer/",
      status: "边界与旁路",
      contents: ["Direct", "ROS2", "Replay", "Test", "EventHub", "JSONL/Rerun/RViz/metrics"],
      dependencies: "ROS 依赖只出现在 ros2 实现；Observer 只消费 Event/Telemetry/Snapshot",
      note: "通信决定如何跨系统边界，不改变 MotionEngine 内部的 Command/Result 语义。"
    },
    {
      name: "resources/ + config/ + apps/ + tests/ + integrations/",
      status: "资产、入口与验证",
      contents: ["robots/alfa_v10", "systems/objects/tasks", "CLI/ROS app", "unit/component/scenario", "ROS2 package.xml/IDL"],
      dependencies: "apps 选择 Communication；integrations/ros2 是部署壳，不是领域架构根",
      note: "整个目标仍是一个程序仓库；是否生成多个二进制由部署决定。"
    }
  ],

  dependencyRules: [
    ["Value Object", "只依赖标准库和基础数学类型；不得持有 ROS、MoveIt、EtherCAT 或文件路径语义。"],
    ["MotionSystem / Task runtime", "只依赖对象家族接口和领域值，不依赖某个具体 IK、通信或运行环境类。"],
    ["Algorithm object", "依赖准确家族接口、RobotDefinition 和所需数学/规划库；不反向依赖 MotionEngine。"],
    ["Planner → IK", "通过构造参数或命名 typed role 显式依赖；不可在方法内部按字符串查全局注册表。"],
    ["Communication", "依赖系统公共门面和领域合同；ROS2 类型在 seam 转换，不进入 JobContext。"],
    ["RobotRuntime", "实现 execution/state/health/telemetry 合同；真机与孪生不被上层特殊判断。"],
    ["Observer", "只消费 Event/Telemetry/Snapshot；不能读取或修改 Job 的可变内部状态。"]
  ],

  configFiles: [
    ["systems/*.yaml", "启动选择", "RobotDefinitionSource、对象实例、typed bindings、Communication、Observer、并发预算"],
    ["tasks/*.yaml", "任务流程", "node、typed port、分支、join、retry、timeout、guard、barrier；不写任意代码"],
    ["objects/*.yaml", "对象参数", "seed、timeout、规划预算、backend 等；由具体 MotionObject schema 验证"],
    ["robots/*.yaml", "机器人运行合同", "资源 URI、工具、标定、执行轴组和安全限制引用"],
    ["execution_profiles/*.yaml", "执行能力镜像/期望", "字段、插值、限制、stop/feedback；启动时与 provider 实际能力比对"],
    ["tests/scenarios/*.yaml", "测试情景", "事实 fixture、Fake 结果、故障注入和预期 Event/Result"]
  ],

  migrationPhases: [
    {
      phase: "0",
      name: "冻结对象语言",
      changes: ["确认 MotionSystem/ObjectGraph/TaskGraph/JobContext", "建立本门户和决策记录", "定义 TimedJointTrajectory 与 ExecutionCapabilities 草案"],
      evidence: "评审通过；不改变现有运行"
    },
    {
      phase: "1",
      name: "单程序薄对象骨架",
      changes: ["建立 include/src/config/tests 目录", "MotionObject/ObjectCatalog/ObjectGraph", "MotionSystem 生命周期", "InMemory ResourceResolver"],
      evidence: "无 ROS 启动成功/失败测试；对象依赖图可审计"
    },
    {
      phase: "2",
      name: "第一条任务纵向链",
      changes: ["TaskDefinition/TaskGraph", "JobContext/Engine/Invoker", "DirectCommunication", "Fake IK/Planner/Execution"],
      evidence: "无 ROS config → READY → submit → completed；双 IK typed binding 测试"
    },
    {
      phase: "3",
      name: "轨迹与执行对象",
      changes: ["TrajectoryProcessor", "速度字段合同", "ExecutionSupervisor", "Fake Master interpolation/feedback"],
      evidence: "完整轨迹缓存、插值、取消和 final-state 测试"
    },
    {
      phase: "4",
      name: "当前算法对象化",
      changes: ["现有 IK 实现家族接口", "extract/loaded planner + 显式 IK 依赖", "场景 Snapshot", "DualGrasp TaskDefinition"],
      evidence: "同一任务在旧链和新链 planning-only 对比"
    },
    {
      phase: "5",
      name: "数字孪生对象接入",
      changes: ["TwinWorld 共享 backend", "同 profile 插值", "FaultInjector/clock", "Event + Telemetry Observer"],
      evidence: "只换 RobotRuntime binding，Engine 零修改；Rerun 可审计"
    },
    {
      phase: "6",
      name: "ROS2 Communication 边界",
      changes: ["Ros2Communication", "领域/ROS 类型转换", "兼容现有 action/topic", "新 MotionSystem 旁路运行"],
      evidence: "Direct 与 ROS2 对同一 scenario 结果等价；不产生双执行权威"
    },
    {
      phase: "7",
      name: "主站 SIL、真机 canary 与收敛",
      changes: ["RealRobotRuntime", "实际 ExecutionCapabilities", "受控停止和错误映射", "删除重复 ROS glue/配置"],
      evidence: "SIL → HIL → 小幅真机；新链成为唯一权威且旧入口可按门禁回退"
    }
  ],

  nonGoals: [
    "首轮不重写 IK、抽离或负重算法数学细节。",
    "首轮不让 YAML 变成图灵完备脚本语言。",
    "目标不按类或能力家族拆 ROS2 package；只有独立部署/发布证据才能新增制品。",
    "首轮不把 MotionEngine 放进硬实时 EtherCAT 周期。",
    "首轮不在输入、不变量和错误模式尚未分化时制造大量空 Interface。",
    "首轮不同时修改算法、文件位置、ROS 合同和真机执行全部层次。",
    "测试替身不能替代 SIL/HIL；每一级只对自己的证据负责。"
  ]
};
