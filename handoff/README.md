# 前端接入说明

交付版本：`ui-v1.0.0`。此包保证可复用部分与演示部分分开；接入完成后以完整演示和真机验收为准。

## 1. 需要一起带走的文件

- 全部 `css/*.css`：`styles.css` → `professional-analysis.css` → `battery-basics.css`，按此顺序加载。
- `assets/`：字体、图片、SVG 保留相对路径，不要只复制图片而遗漏 `.woff2` 和 `.svg`。
- `js/ui.js`：保留抽屉、滚动锁、动画结束时机、折叠与 Tab 交互。
- `js/chart-theme.js`：图表视觉参考，不包含任何测量数据，也不依赖 ECharts。

`demo/` 里的示例数据、报告渲染、评分映射和曲线绘制都可以替换。复用层不读取它们；`handoff/index.html` 是不加载 `demo/` 也能运行的例子。

## 2. 样式范围与 DOM 结构

所有报告区域都要包在一个带 `data-battery-report` 的容器中。宿主页面样式不会被报告的 `body`、按钮或焦点规则全局覆盖；报告内的结构类名、状态属性仍是样式契约。

```html
<link rel="stylesheet" href="css/styles.css">
<link rel="stylesheet" href="css/professional-analysis.css">
<link rel="stylesheet" href="css/battery-basics.css">
<script src="js/ui.js" defer></script>

<div data-battery-report id="batteryReport">
  <div class="page-shell"><!-- 按 index.html 迁移各模块 --></div>
  <dialog class="sheet" data-bg-sheet aria-labelledby="reportSheetTitle">
    <div class="sheet-head">
      <h2 id="reportSheetTitle" data-bg-sheet-title></h2>
      <button class="sheet-close" data-bg-sheet-close type="button" aria-label="关闭">
        <img class="icon" src="assets/close.svg" alt="">
      </button>
    </div>
    <div class="sheet-body" data-bg-sheet-body></div>
    <div class="sheet-actions" data-bg-sheet-actions hidden>
      <button class="evidence-confirm" data-bg-sheet-confirm type="button">我知道了</button>
    </div>
  </dialog>
</div>
```

`data-battery-report` 同时包住正文与抽屉。Teleport / Portal 到 body 时，也要把抽屉和它的 `data-battery-report` 包裹层一起挂载，并为该层创建 UI 实例。不要只移动裸 `dialog`。同页多个组件必须使用不同的 DOM ID。

不加载 `demo/page.css`：那是独立预览页的 body 背景与 margin reset；实际项目由宿主管理。

宿主 reset / 第三方组件通用样式建议先加载，本包后加载。作用域能避免本包影响外部，宿主的高优先级样式仍可能影响内部；不要用全局 `!important` 覆盖报告字体、按钮、动画。

## 3. 抽屉接入：样式与生命周期一起保留

DOM 挂载完成后创建实例，路由离开或组件卸载时必须调用 `destroy()`。

```js
const root = document.querySelector('#batteryReport');
const ui = BatteryGuardianUI.create(root);

const content = document.createElement('p');
content.textContent = '由前端提供的说明正文';
ui.openSheet({ title: '说明', content, kind: 'evidence', showConfirm: true });

// 例如切换成功后，等待退出动画和解锁完成。
await ui.closeSheet('selection');

// Vue onBeforeUnmount / React effect cleanup 等生命周期中调用。
ui.destroy();
```

| 方法 | 约定 |
| --- | --- |
| `BatteryGuardianUI.create(root)` | 每个 root 一个实例；重复调用返回同一个实例，不重复绑定 |
| `ui.openSheet(options)` | `title` 纯文本；`content` 为 DOM 节点、DocumentFragment 或纯文本；不把字符串当 HTML |
| `options.kind` | `evidence` 使用固定头部、底部按钮、内容独立滚动的布局；其他值使用普通抽屉 |
| `options.showConfirm` | 是否显示底部确认按钮，默认 false |
| `options.confirmLabel` | 默认“我知道了” |
| `ui.closeSheet(reason)` | 返回 Promise，退出动画和滚动恢复完成后 resolve；重复关闭复用同一 Promise |
| `ui.destroy()` | 移除监听、取消待完成动画、关闭抽屉、恢复滚动；销毁后可重新 create |

原生 `dialog` 的 `open` 状态由 UI 层管理。不要在开始关闭时就 `v-if=false` / 条件卸载 / `display:none`，否则关闭动画会消失。若要删除整个节点，先 `await ui.closeSheet()`；路由直接卸载时调用 `destroy()` 清理。

接口返回文本使用 `textContent` 或框架的默认文本转义。示例 `demo/app.js` 中 `template.innerHTML` 仅用于演示模板，不是推荐的接口 HTML 渲染方式。

## 4. 交互事件与可替换内容

事件从 root 发出并冒泡，业务通过 `root.addEventListener(...)` 监听；卸载时自行移除业务监听。

| 事件 | `event.detail` | 前端用途 |
| --- | --- | --- |
| `bg:sheetopen` | `{ kind }` | 内容挂载后按需初始化自己的组件 |
| `bg:sheetclose` | `{ reason }` | 关闭结束后的业务处理 |
| `bg:sheetconfirm` | `{}` | 底部“我知道了”点击通知，随后自动关闭；此按钮不承载提交业务 |
| `bg:disclosurechange` | `{ toggle, panel, expanded }` | 展开时按需加载内容或通知图表 resize |
| `bg:tabchange` | `{ key, tab, panel }` | 根据 Tab key 请求/更新自己的图表 |

关闭原因包括 `close-button`、`backdrop`、`confirm`、`cancel`、`replace`、`destroy`，也可以传入业务自定义字符串。

### 折叠

- 触发器使用 `data-bg-disclosure="hidden"`（直接显示/隐藏）或 `"animated"`（专业分析的高度动效）。
- `aria-controls` 指向本 root 内面板 ID，`aria-expanded` 表达状态。
- 动画版沿用 `.professional-panel > .professional-panel-content > .professional-panel-body` 三层结构；外层条目加 `data-bg-disclosure-item`。
- `ui.setExpanded(toggle, expanded, { notify: false })` 用于业务重新渲染后的状态同步，不触发事件。
- 动态节点通过事件委托自动可用，不需要重复初始化。

“查看全部11项”按钮的文本位于 `[data-bg-disclosure-label]`，通过 `data-bg-label-collapsed` 和 `data-bg-label-expanded` 控制。前端根据实际条数更新 collapsed 文案，折叠时仍保留前三行及独立排名容器。

### Tab

Tab 组加 `data-bg-tabs`，每个按钮加 `data-bg-tab="业务 key"`，保留 `role="tab"`、`aria-selected`、`aria-controls` 和唯一 ID。UI 层只切换高亮、关联标题及横向可见位置，不负责生成图表。

```js
root.addEventListener('bg:tabchange', ({ detail }) => {
  // detail.key：current / voltage / temperature / soc / power / cellVoltage
  // 前端加载数据并更新 detail.panel 中自己的图表。
});
```

## 5. 字体与动画规格

| 项目 | 交付规格 |
| --- | --- |
| 普通中文 | 系统字体，无 MiSans 字体包 |
| 数字字体 | D-DIN PRO SemiBold 600；CSS 家族名 `BatteryGuardianDIN`，避免与宿主 DIN 冲突 |
| 字体文件 | `assets/din-semibold.woff2`；CSS 相对路径 `../assets/…`，搬移目录后由构建工具解析或同步修正 |
| 大数字及非中文单位 | 按现有类名使用专用字体；中文单位保持系统字体，与数字颜色/字重对应 |
| 例外 | 检测表与对比表内容、图表坐标轴、专业分析标题右侧状态/评分使用系统字体 |
| 抽屉打开 | 280ms，`cubic-bezier(0.22, 1, 0.36, 1)` |
| 抽屉关闭 | 200ms，`cubic-bezier(0.4, 0, 1, 1)`；JS 按实际 CSS 动画时长兜底 |
| 遮罩 | 纯黑 60%，200ms 淡入/淡出，无背景模糊 |
| 抽屉形状 | 顶部圆角20px，内边距16px，无手柄；关闭图标16px，按钮28px及外扩热区 |
| 专业分析展开 | 高度240ms，箭头220ms；保留 grid 结构和状态属性 |
| 减少动态效果 | 系统偏好开启时按现有规则关闭动效，不能当作动画丢失 |

动画 CSS 变量集中在报告根节点：`--bg-sheet-enter-duration`、`--bg-sheet-exit-duration`、`--bg-sheet-mask-duration` 及对应 easing。修改参数时，不必同步猜测 JS 超时值。

基础样式沿用：最大宽550px、页面边距8px、卡片间距8px、白卡圆角16px、默认文字内边距12px/嵌套8px；具体模块后续指定的10px等值已在 CSS 中落实。

## 6. 业务数据边界

UI 层不计算安全评分、不判断诊断、不制造图表数据。前端/后端负责返回分值、状态、结论、排名和图表序列。

- `risk` / `watch` 类名，以及结论的 `data-level="good|attention|severe"` 等，按现有模板设置以获得对应视觉。
- “X项需关注”统计当前实际展示的关注和严重条目，良好不计入，零项隐藏。
- 车辆0/1/多条、体检单0/1/多条由业务决定入口和空态；只有多条时才展示可切换入口。
- 演示里的缺失值、评分与图表不是正式接口定义。特别是专业分析 `trace/own` 是截图像素坐标，不能当测量数据。

## 7. 交付验收

先运行 [独立验收页](index.html)，再按 [验收清单](CHECKLIST.md) 对照实际页面。样式依赖现代 WebView 的原生 `dialog`、CSS Grid、`inert` 等能力；实际最低版本和宿主导航适配由前端在项目环境验证。若更换组件库的弹窗壳，需完整复现本说明中的动画和滚动行为。

使用 Git 标签 `ui-v1.0.0` 固定本次交付，`baseline/` 截图用于核对视觉。在线 main 持续更新，不能代替固定版本基准。

| 393px 基准 | 截图 |
| --- | --- |
| 正常车辆完整报告 | [report-normal-393.png](baseline/report-normal-393.png) |
| 高危车辆完整报告 | [report-risk-393.png](baseline/report-risk-393.png) |
| 切换车辆抽屉 | [drawer-vehicles-393.png](baseline/drawer-vehicles-393.png) |
| 诊断依据抽屉 | [drawer-evidence-393.png](baseline/drawer-evidence-393.png) |
| 专业分析展开 | [professional-expanded-393.png](baseline/professional-expanded-393.png) |

每次交付前运行 `node scripts/check-delivery.mjs`。若有意替换了资源，先确认效果，再运行 `node scripts/check-delivery.mjs --update-manifest` 更新资源清单并提交。不要为绕过丢失资源的检查而直接更新清单。
