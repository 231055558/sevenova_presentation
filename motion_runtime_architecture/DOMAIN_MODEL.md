# alfa_motion 领域值对象与文件定位规范

本文件回答两个问题：领域值对象如何扩展，以及新代码应该放在哪里。它是
`docs/motion_runtime_architecture/DECISIONS.md` 的执行指南，不覆盖其中的架构决策；进度仍只看
`ROADMAP.md`，任务范围仍只看对应 Linear issue。

## 1. 当前领域层边界

`alfa_motion/domain` 只保存不依赖 ROS、MoveIt、EtherCAT、孪生或具体算法框架的稳定业务语言。

```text
外部 Adapter / 算法 Implementation
              ↓ 原始输入
       domain 值对象校验
              ↓
       合法值或 MotionError
```

领域值对象负责数据含义、单位、基本不变量和值语义，不负责读取设备、查询 TF、运行算法、调度线程或写日志。

## 2. 当前文件定位

| 公共头 / 实现 | 放置内容 | 不放置内容 |
|---|---|---|
| `motion_error.hpp/.cpp` | 稳定错误码、单一 catalog、一次错误实例 | Module 私有字符串码、原始 ROS 异常类型 |
| `result.hpp` | `Result<T>` / `Result<void>` 成功失败包络 | 业务状态机、日志副作用；模板不另建普通 cpp |
| `robot_values.hpp/.cpp` | `JointPositions`、最小 `RobotState`、纯数学 `Pose6d` | 导航假设、高频遥测、TF 查询、机器人模型 |
| `task_request.hpp/.cpp` | 所有任务共有的请求身份、类型和 deadline | 具体任务参数、注册查询、任务执行逻辑 |
| `trajectory.hpp/.cpp` | 定时关节轨迹结构和基础结构不变量 | 限位模型、时间参数化算法、执行器能力判断 |
| `motion_snapshot.hpp/.cpp` | 一次计算链固定使用的版本化事实 | live 状态读取、导航 Provider、执行前安全复验 |
| `tests/domain_values_test.cpp` | 上述公共 Interface 的值语义和不变量 | 复制 Implementation 流程的白盒测试 |

公共 Interface 放在 `alfa_motion/include/alfa_motion/domain/`，非模板 Implementation 放在
`alfa_motion/src/domain/`。Adapter 专属类型留在对应 integration；算法内部类型留在对应算法 Module，
不能因为“以后可能通用”提前放进 domain。

## 3. 什么情况下才能扩展 domain

新增类型或字段前，PR 必须能明确回答：

1. 哪个真实生产者提供它？
2. 哪个已在本切片范围内的消费者使用它？
3. 缺失时表示“不适用”“未知”“暂不可用”还是程序错误？
4. 单位、时间基准、顺序、frame 和所有权是什么？
5. 哪些值必须在构造时拒绝？对应哪个稳定 MotionError？
6. 它是否改变已录制数据的 replay/schema 语义？

不能回答生产者和消费者时，不增加占位字段、占位错误码、空 Interface 或假想能力。把需求记录到后续 Linear
issue，等真实 Adapter 或算法切片提供证据。

## 4. 值对象实现方式

- 有非法输入的对象使用 `static create(...) -> Result<T>` 和 private 构造函数；成功创建后调用者可以信任
  其不变量，不在每个算法中重复校验。
- 只是组合多个已经合法值、当前没有新增失败模式时，可以使用显式 public 构造函数，不制造永远成功的
  `Result<T>`。
- 对象拥有自己的数据，公开只读 getter，不返回可修改内部状态的引用，不增加 setter。
- 值对象默认 `final`，使用值语义和明确相等性；不为值对象设计继承树。
- `std::move` 只用于转移所有权和减少复制，不改变领域语义。
- 高频实时缓冲、锁、原子量和设备句柄属于 Runtime Implementation，不进入任务级值对象。

## 5. Pose6d 的准确语义

`Pose6d` 保存：

```text
Translation：x / y / z，单位米
Quaternion：x / y / z / w，单位四元数
```

名称中的 6 表示三维平移加三维旋转共 6 个独立自由度。四元数使用 4 个数表示旋转，但单位长度约束消除一个
自由度，因此对象实际保存 7 个数，独立自由度仍是 6。

四元数 `q` 与 `-q` 表示同一个物理旋转。当前 `operator==` 判断的是存储表示是否完全相同，不是带容差的
几何旋转等价；需要几何比较、符号规范化或插值时，应由第一个真实消费者定义准确误差合同并增加独立方法，
不能把近似比较悄悄塞进通用 `operator==`。

`Pose6d` 不保存：

```text
reference frame          被描述的是机器人、工具还是物体
采集时间 / 数据来源       协方差 / 定位置信度
父子 frame 变换方向       导航是否可用
```

所以它是可被更具体领域类型组合的纯数学值，不能靠变量名猜空间语义。第一个真实笛卡尔 Interface 出现时，
必须根据用途区分至少两种概念：

- **Pose in frame**：某对象的 pose 在指定 reference frame 中表达；对象身份通常由请求字段或强类型给出。
- **Frame transform**：两个 frame 之间有明确方向的刚体变换。

这两个概念不能由一个含糊类型兼任。S1.1 不预设导航会提供 `world -> base_link`，也不把 base pose 塞进
RobotState；依赖定位的任务以后通过准确 Provider 能力单独准入。

## 6. RobotState、Snapshot 和 Trajectory 的增长规则

### RobotState

当前只保存所有已知运控任务都需要的 `JointPositions`。速度、力矩、基座位置、工具状态等只有在真实
Provider 和任务消费者同时进入切片时才能增加。高频设备状态优先留在 Runtime Telemetry，不自动进入
任务 Snapshot。

### MotionSnapshot

只保存一次计算链必须冻结的事实。新增字段必须说明为何仅靠 revision 不能恢复、何时采集、如何保证与其他
字段时间一致，以及执行前实时复验为什么不能替代它。Snapshot 创建后不重新读取 live 状态覆盖历史事实。

### TimedJointTrajectory

当前 `create()` 只保证维度、有限数、加速度字段一致和时间严格递增。关节限位、速度/加速度上限、首点接入
和执行能力属于 S3 的轨迹合同验证器；不要不断把所有执行策略塞进值对象构造函数。

## 7. MotionError 扩展规则

- 错误码只在 `MotionErrorCode` 和单一 catalog 中增加，遵守 D-013 的编号段。
- 必须已有真实错误生产路径；不为未来 Module 预留具名占位错误。
- 同一改动增加 catalog 定义、`to_string`、唯一性/号段测试和调用方策略测试。
- `description` 是稳定语义，单次输入尺寸、对象名称和原始原因放在 `diagnostic`。

## 8. 测试与 replay 影响

测试面是公共 Interface：成功值、每条构造不变量、错误码和值语义必须覆盖。测试不依赖 ROS 环境，不为通过
测试添加生产代码后门。

S1.6 录制格式建立后，任何会改变 Event、Result、MotionError、Snapshot 或轨迹字段的修改都必须检查
`schema_version` 和历史读取测试；大数组和资产使用稳定引用，不反复复制进每行 JSONL。

## 9. AI 定位顺序

处理 domain 改动时按顺序读取：

1. 对应 Linear issue 的范围、不做和验收。
2. `ROADMAP.md` 当前切片状态。
3. `DECISIONS.md`，尤其 D-013、D-015、D-016、D-017、D-019。
4. 本文件的定位与扩展规则。
5. 目标公共头、同名 cpp 和 `tests/domain_values_test.cpp`。

优先使用以下检索确认影响面：

```bash
rg -n "类型名|方法名" alfa_motion docs/motion_runtime_architecture
rg -n "MotionErrorCode::" alfa_motion/include alfa_motion/src alfa_motion/tests
```

若新需求不属于上表任何文件，不要随便塞进“最接近”的类；先说明生产者、消费者和 Interface，再决定新增
一个有深度的 Module，还是留在算法/Adapter 内部。
