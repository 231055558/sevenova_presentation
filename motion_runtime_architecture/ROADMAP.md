# 对象系统重构路线图（进度唯一事实源）

总控 issue：MOTION-78。执行手册：`.ai_teamwork/engineers/motion_runtime_refactor.md`。
架构事实源：本目录 `DECISIONS.md`（HTML 门户只是投影）。

## 总形态

```
M0 决策收口 → M1 全 Fake 端到端骨架（内核合同冻结） → M2 算法填充 ⇄ M3 轨迹执行 → M4 孪生 → M5 ROS 边界 → M6 真机收敛
```

核心原则：

1. **骨架先行**：M1 结束时，内存强类型 `SystemConfig → READY → submit → gate → completed` 在纯 CMake
   核心中全 Fake 跑通；开发机可以安装 ROS，但核心不得依赖 ROS。S1.7 只冻结 D-018 定义的内核合同。
2. **换件填充**：此后每个 PR 只做一件事——拔掉一个 Fake、插上一个真实现、跑同一套端到端测试。不存在"最后串联"阶段。
3. **小步推进**：一个切片 = 一个子 issue = 一个分支 = 一个 PR（squash），diff 目标 300–800 行。
4. **端到端守门**：S1.7 之后，任何 PR 合并前 S1.7 场景测试必须仍然全绿。

## 切片状态表

维护规则：本表是代码推进状态的唯一事实源，Linear 只保存任务合同、讨论和状态镜像。切片开工时先把状态
改为 `进行中` 并填分支，随即推送并建立 Draft PR；进行中以该唯一切片 PR 的本表为当前投影，合并后以
main 中的本表为准。准备合并时改为 `✅ 完成` 并填 PR 号，使合入 main 的版本直接反映最终状态。

### M0 决策收口与工程底座

| 切片 | Issue | 内容 | 状态 | 分支 / PR |
|---|---|---|---|---|
| S0.1 | MOTION-79 | DECISIONS.md 增补 D-012~D-018，并统一推进、ROS 隔离与分阶段冻结合同 | ✅ 完成 | [PR #16](https://github.com/SevenovaHangzhou/robot_motion_control/pull/16) |
| S0.2 | MOTION-80 | `alfa_motion/` 纯 CMake 骨架 + gtest 与核心 ROS 依赖检查底座 | ✅ 完成 | [PR #17](https://github.com/SevenovaHangzhou/robot_motion_control/pull/17) |

### M1 全 Fake 端到端骨架（严格串行）

| 切片 | Issue | 内容 | 状态 | 分支 / PR |
|---|---|---|---|---|
| S1.1 | MOTION-81 | 领域值对象（含版本化 MotionSnapshot）+ MotionError 目录 + Result\<T\> | ✅ 完成 | [PR #18](https://github.com/SevenovaHangzhou/robot_motion_control/pull/18) |
| S1.2 | MOTION-82 | MotionObject 元协议 + M1 首批候选 Interface/Fake + SnapshotProvider + ManualClock | ✅ 完成 | [PR #19](https://github.com/SevenovaHangzhou/robot_motion_control/pull/19) |
| S1.3 | MOTION-83 | ObjectCatalog + SystemBuilder + 冻结 ObjectGraph | ✅ 完成 | [PR #21](https://github.com/SevenovaHangzhou/robot_motion_control/pull/21) |
| S1.4 | MOTION-84 | TaskStage/Fragment 组合 + typed TaskGraph builder + 纯函数 MotionEngine + human-gate | ✅ 完成 | [PR #23](https://github.com/SevenovaHangzhou/robot_motion_control/pull/23) |
| S1.5 | MOTION-85 | JobManager + MotionSystem 门面 + Snapshot 准入固定 + DirectCommunication | ✅ 完成 | [PR #24](https://github.com/SevenovaHangzhou/robot_motion_control/pull/24) |
| S1.6 | MOTION-86 | ObjectInvoker + EventHub + 可追溯 per-Job journal（引入 spdlog） | ✅ 完成 | [PR #25](https://github.com/SevenovaHangzhou/robot_motion_control/pull/25) |
| S1.7 | MOTION-87 | 验收切片 A：全 Fake 端到端 dual_grasp + **内核合同冻结** | 代码已合并，待用户冻结确认 | [PR #26](https://github.com/SevenovaHangzhou/robot_motion_control/pull/26) |

### M2 算法填充（绞杀者；S1.7 后建 issue，可与 M3 并行）

| 切片 | 内容概要 | 状态 |
|---|---|---|
| S2.1 | 解析 IK + 多 seed 从 `robot_motion_ik_service` 抽为纯 C++ 库，原节点改薄壳（行为不变） | 未建 issue |
| S2.2 | 负重 shortcut+RRT 从 `robot_motion_planning_service` 抽为纯库（保持自包含关节空间实现） | 未建 issue |
| S2.3 | 抽离规划抽为纯库 | 未建 issue |
| S2.4 | 抽出的库实现候选 Interface 接入 ObjectGraph；新旧链 planning-only replay/diff；冻结 IK/规划合同 | 未建 issue |

### M3 轨迹与执行（S1.7 后建 issue，可与 M2 并行）

| 切片 | 内容概要 | 状态 |
|---|---|---|
| S3.1 | TimedJointTrajectory 合同验证器（维度/时间递增/限位/速度字段） | 未建 issue |
| S3.2 | TOTG 包装为 TimeParameterizer + 段拼接（MoveIt 类型止于实现层） | 未建 issue |
| S3.3 | ExecutionSupervisor + 脚本化 FakeExecutor 全故障剧本；冻结轨迹/执行合同 | 未建 issue |

### M4 数字孪生

| 切片 | 内容概要 | 状态 |
|---|---|---|
| S4.1 | TwinWorld + TwinBufferedExecutor + TwinClock | 未建 issue |
| S4.2 | 验收切片 D：只换 runtime binding，Engine 零修改；接 Rerun observer | 未建 issue |

### M5 ROS 边界

| 切片 | 内容概要 | 状态 |
|---|---|---|
| S5.1 | Ros2Communication：任务入口 + ExecuteTrajectory action seam | 未建 issue |
| S5.2 | Direct 与 ROS2 同 scenario 等价性测试；与现有 digital_twin 对跑；冻结 Communication 合同 | 未建 issue |
| S5.3 | yaml-cpp SystemConfig 解析（若 M1 未做） | 未建 issue |

### M6 真机收敛（节奏由硬件与安全审批决定）

| 切片 | 内容概要 | 状态 |
|---|---|---|
| S6.x | 主站 SIL → 真机单段小幅低速 canary → 冻结 RobotRuntime 合同 → 新链唯一执行权威 → 旧入口按门禁下线 | 未建 issue |

## 防膨胀红线（每个切片都适用）

- 单线程 Engine 先行：不写 worker pool、不写 mailbox 线程、不写 detached thread。
- M1 的 config 是内存强类型 `SystemConfig`；不写 YAML 任务图编译器（TaskGraph 用 C++ builder）。
- TaskDefinition 通过可复用 Stage/Fragment 组织，运行前展开为扁平 TaskGraph；Stage 不等于原子 Operation，
  候选集合到单值必须显式选择。
- 不实现 ResourceScheduler/OperationScheduler（接口位置留着，需求上桌再建）。
- 采购白名单之外不新增第三方依赖；新增框架类依赖必须先 spike + DECISIONS.md。
- 切片做大了就拆，不做"顺手把 X 也实现了"。
