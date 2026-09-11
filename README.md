# 电池卫士 3.0 · UI 交付包

面向移动端 App WebView 的电池检测报告，原生 HTML / CSS / JavaScript，无运行时第三方依赖。

**在线演示：<https://wangyekai918-star.github.io/teld-battery-guardian-3-0/>**

- [独立 UI 验收页](https://wangyekai918-star.github.io/teld-battery-guardian-3-0/handoff/)
- [前端接入说明](handoff/README.md)
- [视觉与交互验收清单](handoff/CHECKLIST.md)
- [图表视觉规范](handoff/CHARTS.md)

## 前端从哪里开始

复用 `css/`、`js/ui.js`、需要时的 `js/chart-theme.js` 和 `assets/`，参考 `index.html` 的结构。前端自己提供数据、业务规则和图表实现。不要将 `demo/` 接入正式业务。

| 路径 | 用途 | 正式项目 |
| --- | --- | --- |
| `css/` | 已限定作用域的报告样式，含字体引用及动画 | 复用 |
| `js/ui.js` | 抽屉、动画生命周期、滚动锁、折叠、Tab 切换 | 复用或按同一契约封装 |
| `js/chart-theme.js` | 与图表库无关的颜色、字号、线宽、留白参数 | 按所用绘图库映射 |
| `assets/` | 图片、SVG、D-DIN 字体，均直接位于本目录根部 | 完整保留引用资源 |
| `index.html` | 全部模块的 HTML 结构与可运行效果参考 | 按组件结构迁移 |
| `demo/` | 示例数据、渲染接线、两类演示曲线、独立页面样式 | 可整体替换 |
| `handoff/` | 接入说明、验收页、资源清单、基准截图 | 交付与验收使用 |
| `scripts/check-delivery.mjs` | 资源完整性和文件引用检查，使用 Node 内置模块 | 交付前执行 |

## 本地预览与检查

```sh
python3 -m http.server 8080
# 打开 http://localhost:8080/ 和 http://localhost:8080/handoff/
node scripts/check-delivery.mjs
```

验收页不加载演示数据和图表脚本，可独立验证基础交互。iOS / Android 实际 WebView 的触摸、回弹、宿主导航等仍需按清单检查。

## 版本与部署

UI 交付版本：`ui-v1.0.0`。GitHub Pages 从 `main` 根目录发布，无需构建；提交并推送后自动部署。交付时以版本标签和随包截图作为固定基准，在线 `main` 会随后续修改更新。

演示内容含原型数据、虚构指标和根据截图复绘的曲线，不是业务接口、诊断算法或原始测量序列。保留资源内的来源/许可注释。
