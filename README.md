# 电池卫士 3.0 · UI 交付包

面向移动端 App WebView 的电池检测报告，包含完整页面样式、字体、图标，以及抽屉、折叠和 Tab 交互。使用原生 HTML / CSS / JavaScript，无运行时第三方依赖。

**在线演示：<https://wangyekai918-star.github.io/teld-battery-guardian-3-0/>**

- [前端接入说明](handoff/README.md)
- [图表视觉规范](handoff/CHARTS.md)

## 前端从哪里开始

复用 `css/styles.css`、`js/ui.js`、需要时的 `js/chart-theme.js` 和 `assets/`，参考 `index.html` 的结构。前端自己提供数据、业务规则和图表实现。`demo/` 仅用于演示，可整体替换。

| 路径 | 简介 |
| --- | --- |
| `assets/` | 页面使用的图片、SVG 图标和 D-DIN 字体 |
| `css/styles.css` | 全部报告样式，包含布局、颜色、字号、字体引用及动画 |
| `demo/` | 示例车辆数据、报告渲染及演示图表 |
| `handoff/` | 前端接入说明、图表规范和资源清单 |
| `js/` | 可复用的抽屉、滚动锁、折叠、Tab 交互及图表主题 |
| `scripts/` | 交付资源完整性、文件引用及脚本语法检查 |
| `index.html` | 完整报告页面入口与各模块结构参考 |
| `.gitignore` | 排除本地系统文件和环境配置 |
| `.nojekyll` | 让 GitHub Pages 直接发布静态文件 |

## 本地预览

```sh
python3 -m http.server 8080
# 打开 http://localhost:8080/
```

资源完整性检查：安装 Node.js 18 或以上版本后，在项目根目录运行 `node scripts/check-delivery.mjs`，无需安装其他依赖。

显示“通过”表示资源与清单一致、HTML/CSS 的本地引用存在、JS 语法检查通过，以及复用层的基础依赖检查通过；异常会报错并以非零状态退出。此脚本不会修改页面，也不能代替字体、动画和交互的浏览器验收。

只有在主动替换或新增资源并确认无误后，才运行 `node scripts/check-delivery.mjs --update-manifest` 更新资源清单。

## 版本与部署

UI 交付版本：`ui-v1.1.9`。GitHub Pages 从 `main` 根目录发布，无需构建。

演示内容包含原型数据、示例指标和根据截图绘制的曲线。正式接入时替换为业务数据，并保留资源内的来源与许可注释。
