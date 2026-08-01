# S1.7 内核合同冻结评审单

状态：**PR #26 已合入 main，代码与证据已准备；等待用户确认，尚未宣布冻结。**

对应 issue：MOTION-87。进度唯一事实源仍是 `ROADMAP.md`。

## 1. 本切片跑通了什么

```text
SystemConfig
  → SystemBuilder / frozen ObjectGraph
  → MotionSystem READY
  → JobManager 固定一次 MotionSnapshot
  → MotionEngine 产生 Command
  → JobRunner / per-Job TaskExecution
  → ObjectInvoker 调用准确对象
  → 规划（内部显式绑定 IK）
  → 时间参数化（positions + velocities + accelerations + time_from_start）
  → 轨迹校验
  → Gate 等待 / 确认
  → FakeRobotRuntime
  → Job completed / failed / cancelled
  → InMemoryJournal + JSONL Observer
```

这里的 dual_grasp 是永久验收夹具，不是生产算法合同。规划器通过构造参数绑定准确 `IKSolver`，因此一次规划
attempt 只调用一次 IK；不会为了画出单独节点而重复调用 IK。

## 2. 冻结候选与证据

| D-018 冻结范围 | 代码证据 | 测试证据 |
|---|---|---|
| `Result<T>/Result<void>` 与 `MotionError` 包络 | `domain/result.hpp`、集中错误 catalog | 成功/失败互斥、错误号段与唯一性、异常归一化 |
| Job 生命周期 | `JobContext/JobState`、`JobManager`、纯函数 `MotionEngine` | READY、运行、Gate、完成、失败、取消、deadline、迟到/重复输入 |
| TaskGraph 节点结果语义 | Compute/Gate/Branch/Retry/Terminal 与 `TaskNodeOutcome` | typed port、控制边完整性、有界重试、非重试错误 |
| ObjectGraph 冻结与 typed handle | `ObjectCatalog/SystemBuilder/ObjectGraph` | 依赖类型、环、重复 ID、构建失败回滚、准确 IK 绑定 |
| ObjectInvoker 关联字段 | `InvocationContext/InvocationTrace/MotionEvent` | job/task/snapshot/stage/node/object/operation/attempt/duration 全字段 |
| Snapshot 准入固定与全链追溯 | `JobContext` 只持有一份不可替换 Snapshot | 重复 request 不重采；成功、重试、Gate、执行失败与 journal 均为同一 ID |

## 3. 永久 S1.7 场景

`tests/dual_grasp_e2e_test.cpp` 固定验证：

1. `SystemConfig → READY → submit → Gate confirm → completed`。
2. IK 无解按稳定 retryable 语义重试，达到预算后保留原始错误。
3. ManualClock 推进 Gate timeout，全程无 sleep。
4. Gate 确认前取消后，迟到确认不能重开流程。
5. 重复确认不能重复执行轨迹。
6. FakeRuntime 失败经 Engine 回到 Job failed。
7. 重复 request_id 返回原 Job、原 Snapshot、原时间线。
8. 缺少任务对象 role 在 `MotionSystem::from_config` 阶段失败，不能进入 BUILT/READY。
9. 仅凭 journal 可读出每次 attempt、失败节点/对象/Operation、错误码、Gate 裁决和 Snapshot。

## 4. 明确不冻结

- `IKSolver`、`MotionPlanner`：S2.4 接真实实现并 replay/diff 后冻结。
- 轨迹拼接、时间参数化、校验、执行反馈：S3.3 后冻结。
- `Communication`：S5.2 Direct/ROS2 等价验证后冻结。
- `RobotRuntime`：数字孪生、主站 SIL 与真机 canary 后冻结。
- worker、mailbox、并行 join、资源调度和实时线程模型：M1 没有证据，不在本切片引入或冻结。
- 生产 dual_grasp 请求字段、候选集合与任务参数来源：等真实生产者/消费者进入同一切片再定。

## 5. 合并后架构复核

PR #26 合入后重新构建 Debug/严格警告与 ASan+UBSan 两套配置，均为 90/90 CTest 通过，CoreIsolation
正反向检查通过。沿 `MotionSystem → JobManager → JobRunner → TaskExecution → ObjectInvoker` 复核后，
没有发现需要阻塞 M1 汇报或回滚合并的正确性缺陷。

以下三项是后续深化，不属于本次微调：

1. M1 同步执行期间 `JobManager` 使用单锁串行化准入和状态修改；接入长耗时真实规划、执行反馈或 Job
   并发前，必须缩小锁作用域并让 mailbox/scheduler 承担有序推进，不能在锁内长期调用外部对象。
2. `testing/` Fake 和 JSONL/Direct 等具体 Adapter 当前与内核共用一个构建目标；真实实现进入前应明确
   `runtime / objects / tasks / config / apps / resources / integrations / tests` 的物理职责，并把测试支持
   收敛为独立目标，但不为目录整齐进行一次大搬家。
3. 当前 config 是内存强类型 `SystemConfig`；配置文件编译层与 ROS 无关，应在一到两个真实 Adapter 的
   schema 得到证据后独立推进，不必机械等待 ROS 集成阶段。

## 6. 冻结后的变更规则

用户确认后，以上冻结范围的类型、语义、不变量、错误模式或调用顺序若需改变，必须先在 `DECISIONS.md`
增加决策条目并再次由用户确认。普通实现扩展、候选 Interface 演进和新增 Fake 不自动触发内核解冻，但必须保持
S1.7 永久场景全绿。

## 7. 用户闸口

待确认问题只有一个：是否同意按第 2 节范围冻结，并接受第 4、5 节继续保持候选/后续深化状态？确认后才更新
`DECISIONS.md`、`MAIN_LOG.md`、`ROADMAP.md` 和 Linear 完成状态。
