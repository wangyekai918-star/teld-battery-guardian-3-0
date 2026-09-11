# 前端接入说明

交付版本：`ui-v1.1.13`。介绍样式、资源和交互的接入方式，演示数据与图表实现由前端替换。

## 1. 需要一起带走的文件

- `css/styles.css`：统一包含全部报告样式、字体引用及动画，内部通过注释区分板块。
- `assets/`：字体、图片、SVG 保留相对路径，不要只复制图片而遗漏 `.woff2` 和 `.svg`。
- `js/ui.js`：保留抽屉、滚动锁、动画结束时机、折叠与 Tab 交互。
- `js/chart-theme.js`：图表视觉参考，不包含任何测量数据，也不依赖 ECharts。

`demo/` 里的示例数据、报告渲染、评分映射和曲线绘制都可以替换。复用层不读取它们。

## 2. 样式范围与 DOM 结构

所有报告区域都要包在一个带 `data-battery-report` 的容器中。宿主页面样式不会被报告的 `body`、按钮或焦点规则全局覆盖；报告内的结构类名、状态属性仍是样式契约。

```html
<link rel="stylesheet" href="css/styles.css">
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
| 普通中文 | 系统字体 |
| 数字字体 | D-DIN PRO SemiBold 600；CSS 家族名 `BatteryGuardianDIN`，避免与宿主 DIN 冲突 |
| 字体文件 | `assets/din-semibold.woff2`；CSS 相对路径 `../assets/…`，搬移目录后由构建工具解析或同步修正 |
| 抽屉打开 | 280ms，`cubic-bezier(0.22, 1, 0.36, 1)` |
| 抽屉关闭 | 200ms，`cubic-bezier(0.4, 0, 1, 1)`；JS 按实际 CSS 动画时长兜底 |
| 遮罩 | 纯黑 60%，200ms 淡入/淡出，无背景模糊 |
| 抽屉形状 | 顶部圆角20px，内边距16px，无手柄；关闭图标16px，按钮28px及外扩热区 |
| 专业分析展开 | 高度240ms，箭头220ms；保留 grid 结构和状态属性 |

动画 CSS 变量集中在报告根节点：`--bg-sheet-enter-duration`、`--bg-sheet-exit-duration`、`--bg-sheet-mask-duration` 及对应 easing。修改参数时，不必同步猜测 JS 超时值。

基础样式沿用：最大宽550px、页面边距8px、卡片间距8px、白卡圆角16px、默认文字内边距12px/嵌套8px；具体模块后续指定的10px等值已在 CSS 中落实。

容量健康度和预计续航卡片：标题与数值左对齐；图标16×16px，位于卡片右上角，距顶部、右侧均10px；整张卡片可点击。

## 6. 业务数据边界

UI 层不计算安全评分、不判断诊断、不制造图表数据。前端/后端负责返回分值、状态、结论、排名和图表序列。

- `risk` / `watch` 类名，以及结论的 `data-level="good|attention|severe"` 等，按现有模板设置以获得对应视觉。
- 右上角按当前结论标签分别统计：关注显示“X项需关注”，严重显示“Y项严重”，两者并存时显示“X项需关注、Y项严重”，分别使用黄色和红色文字；良好不计入，数量为0的类别不显示，两类均为0时隐藏整个汇总。
- 车辆0/1/多条、体检单0/1/多条由业务决定入口和空态；只有多条时才展示可切换入口。
- 演示里的缺失值、评分与图表不是正式接口定义。特别是专业分析 `trace/own` 是截图像素坐标，不能当测量数据。

### 页面背景与健康概览

- 页面背景统一为 `#EAF2F7`。报告根节点及内容区使用同一颜色，宿主的 html/body 也应设置该色值，避免超出550px最大宽度时两侧出现色差。
- 健康概览左侧圆环绑定 `reports.score`，与顶部总分共用数据。数值节点 `healthSafetyValue`、单位节点 `healthSafetyUnit`（分）、圆环节点 `healthSafetyProgress`、容器 `healthSafetyGauge`。容器 `data-state="safe|watch|risk"` 按总分规则设置，数字、进度和状态颜色同步。
- 整组内容最大416px并居中，包含左右12px内边距、圆环最大168px、间距24px、右侧列表最大200px。窄屏按比例收缩，右侧列表至少154px；六项分数右对齐，行间距4px。每项分数后显示“分”，单位使用系统字体12px/600，与14px数字基线对齐，间距2px；缺失值不显示单位。

### 车辆电池静态数据

模块结构为 `#batteryBasics`，样式在 `css/styles.css` 的“车辆电池静态数据”部分；标题下先展示电池类型、标称能量和标称续航，下方展示标称容量及三项允许值。

- 白卡圆角16px，标题16px/600；内容四周8px，两行间距12px。
- 351px白卡：左卡120×196px、连接线38×196px、右侧三卡各60px高/间距8px；窄屏时左卡可缩小，右侧至少136px，长标签完整展示。
- 左卡展示标称容量：数字28px、单位14px、绿色 `#00c86b`，标签14px/600，电池插画放在下部。
- 顶部三等列，高44px，列间16px，居中20px分割线；数字20px、单位12px、说明12px。普通文字使用系统字体，数值和英文单位继续使用随包 D-DIN。
- 右侧文案为“单体最高允许充电电压”“电池最高允许温度”“最高允许充电总电压”。

| DOM 绑定 | 演示字段 | 单位 |
| --- | --- | --- |
| `basicNominalCapacity` | `nominalCapacity` | Ah |
| `basicCellVoltage` | `cellVoltage` | V |
| `basicMaxTemperature` | `maxTemperature` | °C |
| `basicTotalVoltage` | `totalVoltage` | V |
| `basicBatteryType` | `type` | 无 |
| `basicNominalEnergy` | `nominalEnergy` | kWh |
| `basicNominalRange` | `nominalRange` | km |

数值对应的单位节点为同名 ID 加 `Unit`。缺失值显示 `-` 并隐藏单位。前端应提供独立的标称续航字段，**不要绑定报告顶部的 AI 预计续航 `reports.range`**。标称续航示例：normal/risk为400km，watch沿用设计稿的468km。示例容量沿用旧原型容量值，不构成后端字段语义定义；正式接入按标称容量字段映射。
