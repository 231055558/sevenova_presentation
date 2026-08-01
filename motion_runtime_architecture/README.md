# robot_motion_control 目标运行时架构

本目录是 `robot_motion_control` 下一阶段重构的目标架构门户。入口：[`index.html`](index.html)。

- `docs/system_flow/` 描述当前仓库已有 ROS2 package、合同和缺口。
- 本目录描述目标对象系统、启动与任务流程、执行责任、通信切换、数字孪生和测试体系。

## v1 的核心修正

目标不再是一组新的 ROS2 package，而是一个由 `MotionSystem` 管理的对象系统：

1. `ObjectCatalog` 发现可用实现，`SystemBuilder` 在启动期构建并冻结 `ObjectGraph`。
2. `TaskDefinition` 由可复用 `TaskStage/TaskFragment` 组合并展开为扁平 `TaskGraph`；单次请求创建
   `JobContext + TaskExecution`，准确中间值留在该 Job，Stage 不等于原子执行单元。
3. IK、规划、轨迹、执行、通信和观察各自形成准确对象家族，不共享巨大算法基类。
4. ROS 是 `Communication` 的一种实现，MoveIt 是算法对象的实现依赖，EtherCAT 与孪生是
   `RobotRuntime` 的实现。
5. URDF、SRDF、mesh、标定和 MoveIt 参数由 `RobotDefinitionSource`、`ResourceResolver` 和算法配置
   对象加载，不作为架构顶层包。
6. 目标代码收敛在一个程序目录中；仅当独立发布或部署确有价值时才增加物理制品。

轨迹合同保持不变：运控产生带 `positions`、`velocities`、`time_from_start` 和按能力可选
`accelerations` 的完整定时轨迹，主站缓存后在确定性周期内插值。

## 门户内容

1. `MotionSystem` 边界、对象分类与整体依赖方向。
2. ObjectGraph 启动构建和 TaskGraph 单次任务运行时序。
3. 每个主要对象的责任、输入输出、不变量、错误和测试面。
4. 定时轨迹合同、拼接、时间参数化、主站实时插值和执行监督。
5. 真机、数字孪生、Fake、Replay 运行对象的等价合同。
6. Direct、ROS2、Replay、Test 通信实现与测试梯度。
7. 一个程序仓库的目标目录、技术栈和纵向迁移顺序。

## 状态说明

目标架构 `v1` 已完成 M1 全 Fake 纵向骨架：PR #26 在纯 CMake 核心中跑通配置、启动、任务、Gate、
执行与审计闭环。它仍不是“真实算法已经迁完”的清单；具体 IK、抽离、负重等数学算法通过各自家族
Interface、输入不变量和错误模式逐件接入。S1.7 的 D-018 内核合同等待用户最终冻结确认；其他候选
Interface 必须经过对应真实 Adapter 验证并按里程碑分阶段冻结。

## 维护约定

- 结构化内容集中在 `assets/data.js`，渲染逻辑在 `assets/app.js`，样式在 `assets/styles.css`。
- 页面主视图采用语义化 HTML 与 CSS 手工控制布局；`diagrams/` 只保留历史材料，不作为 v1 事实源。
- 已确认决策同步记录在 [`DECISIONS.md`](DECISIONS.md)。
- Task、Stage、候选传播和执行单元分工记录在 [`TASK_COMPOSITION.md`](TASK_COMPOSITION.md)。
- 领域值对象的语义、扩展条件和文件定位记录在 [`DOMAIN_MODEL.md`](DOMAIN_MODEL.md)。
- 外部架构参照、吸收点和明确不照搬的部分记录在 [`REFERENCES.md`](REFERENCES.md)。
- 若责任变化，应同时更新页面、数据和决策记录，避免图文漂移。

## 架构图表达规则

1. 一张图只回答一个问题，不混合系统边界、对象持有、部署、技术依赖和时序。
2. 中文是主标签，英文仅作为小号代码标识。
3. 优先用包含关系、泳道和编号表达结构；连线只保留不可替代的主关系。
4. 深凡戴克棕只强调当前主角，米色表达内部对象，灰橄榄表达外部系统，红色只表达失败或阻断。
5. 细节在同页清单下钻，不把所有类和边塞进总览。
6. 中小屏幕必须重排为纵向结构，不能依赖缩放或横向滚动。
