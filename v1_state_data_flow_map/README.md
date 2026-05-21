# V1 状态机 × 数据流全流程地图

这是一个纯静态交互网页，用于展示 ALFA Robot V1 卸箱闭环中 `MOTION-22` 数据流和 `MOTION-24` 状态机如何在系统层对齐。

## 打开方式

直接用浏览器打开：

```bash
xdg-open /mnt/mydisk/ALFA/presentation/v1_state_data_flow_map/index.html
```

或者启动一个本地静态服务器：

```bash
cd /mnt/mydisk/ALFA/presentation/v1_state_data_flow_map
python3 -m http.server 8033
```

然后访问：`http://localhost:8033`

## 文件说明

- `index.html`：页面结构。
- `styles.css`：暗色风格和长页面布局。
- `flow-data.js`：状态机、数据对象、异常恢复矩阵的数据源。
- `script.js`：点击、悬停、高亮和详情面板交互。

## 当前定位

这是演示/讨论材料，不是机器人架构程序。后续如果 MOTION-22 或 MOTION-24 调整，只需要先更新 `flow-data.js`。
