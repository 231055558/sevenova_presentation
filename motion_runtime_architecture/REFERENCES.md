# 设计参照与取舍

本架构没有照搬任何单一框架。以下项目用于校准“统一门面、对象构建、任务图、上下文和可替换环境”
的实现方式；链接固定到本轮调研时的源码版本，便于后续复核。

## Ultralytics

- 参照：[`Model` 门面与 `task_map`](https://github.com/ultralytics/ultralytics/tree/89dbeb36beee4c0b9f2b686e4bfdcc63ac0076db)。
- 吸收：调用者面对稳定门面，具体任务选择映射到实现，不要求用户理解内部目录。
- 不照搬：运控对象有长期设备生命周期、实时执行合同和资源冲突，不能使用训练/推理对象的一套简单状态模型。

## MMEngine / MMCV

- 参照：[`Registry` 与 `Runner`](https://github.com/open-mmlab/mmengine/tree/f8a8b1b3b3051175a8babe5df9c753a981919087)。
- 吸收：配置驱动对象构建、分层 registry scope、统一运行入口和 hook 体系的工程经验。
- 修正：注册只用于启动期发现；运控在 READY 前构建 typed `ObjectGraph`，运行时不按字符串查 registry。
  Hook 也按权限拆为 Guard、Observer 与 LifecycleListener。

## Tesseract Planning

- 参照：[`Task Composer` 与 Context](https://github.com/tesseract-robotics/tesseract_planning/tree/ca691119fbfffeda6a13dca9f3fa12256a4934bd)。
- 吸收：把任务表达为显式图、节点、输入输出、条件边和上下文，而非藏在 ROS service 调用链中。
- 修正：`TaskGraph` 不负责对象发现；它只引用启动期 `ObjectGraph` 已经绑定的 typed role。

## Drake

- 参照：[`System`、`DiagramBuilder` 与 `Context`](https://github.com/RobotLocomotion/drake/tree/3d74a19213b18f83cc0287a05099b037e5be5b7c)。
- 吸收：构建期连接对象图，运行期把可变请求状态放在独立 Context，避免把一次任务状态写回共享对象。
- 修正：ALFA 的 TaskGraph 是业务流程图，不追求把所有机器人算法统一成连续时间系统抽象。

## Isaac Lab

- 参照：[`Manager-based` 与 `Direct` workflow](https://github.com/isaac-sim/IsaacLab/tree/858234d06e6845d75420d2558e236526282e5da6)。
- 吸收：同一能力既可通过配置化 manager 组合，也应保留直接代码调用路径；测试和研究不应被 ROS 部署绑定。
- 修正：生产运控默认使用受验证的 `SystemConfig + ObjectGraph`；Direct 模式是 Communication 实现，不绕过安全合同。
