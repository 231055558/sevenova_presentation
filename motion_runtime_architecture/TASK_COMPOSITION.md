# Task、Stage、Node 与 Operation 组合合同

本文规定任务编写期与运行期的分层，避免 `TaskDefinition` 直接堆叠大量细粒度节点，也避免把业务复用层误当成
线程、事务或一次对象调用。架构决策以 `DECISIONS.md` 的 D-020 为准；本文件给出其实现约束。

## 1. 四层职责

```text
TaskDefinition                         完整业务任务类型
└── TaskStage                          可复用的业务语义阶段
    └── TaskFragment / TaskNode        可编译子图与最小控制节点
        └── Operation / MotionObject   一次运行调用与具体实现
```

| 层级 | 回答的问题 | 生命周期 | 是否拥有运行资源 |
|---|---|---|---|
| `TaskDefinition` | 外部提交的是哪种完整任务 | 任务类型级 | 否 |
| `TaskStage` | 哪段业务流程值得跨任务复用 | 定义/构建期 | 否 |
| `TaskFragment` | 一个 Stage 展开成哪些 typed port、节点和边 | 构建期，编译后消失 | 否 |
| `TaskNode` | 哪一步需要独立分支、重试、超时、取消或审计 | Job 运行期 | 否 |
| `Operation` | 某条 Command 被对象执行的哪一次 attempt | 单次调用 | 由被调用对象决定 |

`TaskStage` 和 `TaskFragment` 不是 `MotionObject`，不注册到 `ObjectCatalog`，也不拥有线程、连接或设备句柄。
它们只引用 `ObjectGraph` 已绑定的命名角色。真正的 IK、规划、轨迹和执行能力仍由准确对象家族提供。

## 2. 编写期分层，运行期扁平

任务作者可以用多个 Stage 组合完整任务，Stage 也可以在构建期复用更小的 Fragment。`TaskGraphBuilder` 最终把
这些定义展开为一张不可变、扁平的 `TaskGraph`，`MotionEngine` 不维护嵌套图解释器。

```text
DualGraspTask
├── PlanDualGraspStage
├── PickStage
├── TransferStage
└── PlaceStage
          │ build
          ▼
flat TaskGraph: Compute → Branch → Gate → Compute → Terminal
```

展开时必须保留稳定层级身份：

```text
task_id
stage_id
stage_path             例如 dual_grasp/pick_left
node_id                例如 confirm_attached
qualified_node_id      例如 dual_grasp/pick_left/confirm_attached
```

同一 Stage 在一个任务中复用多次时，由调用方提供不同实例前缀；Builder 必须在构建期拒绝完整限定 ID 冲突。
后续 Event、错误和 per-Job journal 记录 `stage_path + node_id`，既能定位小节点，也能恢复人可读的阶段结构。

## 3. Typed port 不假设结果唯一

`TaskPort<T>` 表示准确的数据合同，`T` 可以是单值，也可以是算法领域定义的候选集合。核心 Builder 不把所有
端口强制包装为万能 `Candidate`，也不假设每个 Stage 只能返回一个姿态。

```text
TaskPort<PickPlan>
TaskPort<PickPlanCandidateSet>
```

从候选集合变成单一结果必须存在显式选择节点或选择 Stage；不得隐式取第一项、最高分项或任意成功项：

```text
CandidateSet<PickPlan>
        ↓ SelectCandidateStage
PickPlan
```

具体候选值对象只在真实生产者和消费者进入同一算法切片时定义，遵守 `DOMAIN_MODEL.md`。一旦引入，至少需要明确：

- 稳定 `candidate_id` 与上游 `parent_candidate_id`，使最终结果能追溯完整候选链。
- 本候选的输入/输出边界状态，而不只是一个脱离上下文的机器人姿态。
- `snapshot_id`、机器人定义修订、关节组、工具/负载状态和必要 frame 语义。
- 硬约束结果与评分/代价；评分不能伪装成已经满足硬约束。
- 空集合表示合法无结果还是算法失败，并映射到哪个稳定 `MotionError`。

### 构建期与运行期检查分工

构建期检查静态 Interface：

- 上下游端口的准确 C++ 类型一致。
- 单值与候选集合不会隐式互转。
- 每个输入都有请求、Snapshot 或上游输出来源。
- Stage 引用的对象角色和任务能力声明完整。
- 分支、重试、退出和显式选择路径完整。

运行期检查具体值：

- 后一段起点与前一段终点连续。
- 全候选链使用同一 Job 固定的 `snapshot_id`。
- 关节名称、顺序、工具/负载状态和 frame 语义兼容。
- 下游 IK、碰撞、规划和执行前置条件真实满足。

后级可行性会影响前级选择时，Stage 可以传播候选集合并延迟决策，也可以用一个 `CompositePlanningStage` 在
内部执行有预算的联合搜索。候选循环和批量计算不展开成成百上千个 TaskNode；TaskGraph 只保留需要独立控制、
取消、超时和审计的粗粒度步骤。

## 4. Stage 不是原子执行边界

Stage 为复用、阅读和配置提供语义结构；Node 为控制流提供状态转换；Operation 才表示一次实际调度调用。
因此三者不要求一一对应：

- 一个 `PickStage` 可以展开为规划、Gate、轨迹执行、工具动作和状态确认等多个 Operation。
- 相邻纯计算 Stage 可以由明确的组合实现联合计算，但仍保留各自 `stage_path`、输入输出和审计结果。
- 经常需要独立调用的“半个 Stage”应被提炼为子 Stage；外部调用者不能绕过不变量跳到任意内部节点。

以下位置是不可静默跨越的执行边界：

- human-gate、Job 取消或 deadline 裁决。
- 真机/孪生执行和工具状态改变等外部副作用。
- Snapshot 或实时执行前置条件复验。
- 资源租约、显式重试预算和可恢复 checkpoint 变化。
- 会改变错误、幂等、审计或补偿语义的节点。

M1 不实现运行时节点融合、并行 join 或 OperationScheduler。未来只有在证明语义等价、错误和取消行为不变且
journal 仍可还原逻辑 Stage/Node 后，才允许优化物理执行单元。

## 5. S1.7 运行闭环

`TaskGraph` 只保存冻结结构，不能保存某次 Job 的 `JointPath`、候选集合或定时轨迹。S1.7 使用以下三层把
结构真正执行起来：

```text
TaskDefinition       冻结 TaskGraph + 每个 Job 的 TaskExecution 工厂
TaskExecution        单个 Job 独占的强类型中间值与节点到准确接口的映射
JobRunner            同步消费 EngineCommand，经 ObjectInvoker 调用并回送 EngineInput
```

- `MotionSystem::from_config` 在 READY 前创建一次空白 `TaskExecution`，逐个校验 Compute/Branch 节点能否解析
  到准确对象；准入后每个 Job 再创建自己的实例，实例之间不共享算法中间值。
- `TaskExecution` 不是 `MotionObject`，不注册工厂、不拥有设备或线程。具体实现可以继承并局部改写节点调用，
  但必须保留准确算法输入输出，不能引入万能 blackboard、`std::any` 或大一统结果 variant。
- `JobRunner` 不决定下一节点；它只执行 `MotionEngine` 已产生的 Command。M1 全程同步且无线程，Gate、取消和
  时间推进仍以显式 EngineInput 进入。
- EventHub 记录 Job、Invocation 和 Gate 低频事实。Gate 等待记录 deadline，确认记录 confirmation_id，超时
  与取消记录稳定错误；所有事件继续携带同一个 Job `snapshot_id`。配置中所有准确类型为 `EventObserver` 的
  system binding 会在 READY 前订阅，JSONL 只是 best-effort 投影，不替代关键内存 journal。

## 6. S1.4 实现合同

S1.4 / MOTION-84 只建立组合机制，不预先制造真实抓取/放置 Stage 库：

```text
alfa_motion/include/alfa_motion/task/
├── task_port.hpp
├── task_fragment.hpp
├── task_stage.hpp
├── task_graph.hpp
├── task_graph_builder.hpp
└── motion_engine.hpp
```

必须交付：

- `TaskStage`/`TaskFragment` 的最小 C++ 构建 Interface。
- typed input/output port 与构建期类型检查。
- Fragment 展开、节点命名空间和 `stage_path` 保留。
- Compute、Gate、Branch、Retry、Terminal 五类扁平节点。
- 不假设输出唯一；测试类型证明候选集合可跨 Stage 传递，集合到单值必须显式选择。
- 纯函数 `MotionEngine` 只解释编译后的扁平图，不了解 Stage 实现。

本切片不做：

- YAML 编译器、真实 Pick/Place 算法或通用生产 `CandidateSet` 值对象。
- worker pool、mailbox 线程、并行 join、节点融合或 OperationScheduler。
- 从任务入口执行任意 Stage 内部节点的调试后门。

核心验收：

1. 同一示例 Stage 在一个任务中复用两次，展开后 ID 唯一且层级审计可还原。
2. 一个 Stage 可展开为多个 Node，一个完整 Task 可由多个 Stage 组合。
3. typed port 错配、缺少生产者和候选集合隐式收缩在构建期失败。
4. Engine 表驱动测试只依赖扁平 TaskGraph，不创建 Fake MotionObject。
5. Gate、取消、deadline、重复确认和 Snapshot 固定不变量继续满足 MOTION-84 合同。
