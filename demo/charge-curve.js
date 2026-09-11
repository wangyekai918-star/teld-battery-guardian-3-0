/* 仅供演示的 SVG 曲线与取点，正式项目可完整替换；保留外层曲线容器和图例样式。 */
(() => {
function create({ root, ui, getChargeCheck, curveTypes }) {
const $ = id => root.querySelector(`#${id}`);
const { currentCurveSamples } = BatteryGuardianDemoData;
let activeCurve = "current",
  curveGeometry = null,
  curveSampleIndex = -1;
function curveTime(ratio, includeSeconds = false) {
  const check = getChargeCheck();
  if (!check?.startedAt || !check?.endedAt) return "";
  const start = new Date(check.startedAt.replace(" ", "T")).getTime(),
    end = new Date(check.endedAt.replace(" ", "T")).getTime();
  const date = new Date(start + (end - start) * ratio),
    pad = (value) => String(value).padStart(2, "0");
  return (
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    (includeSeconds ? ":" + pad(date.getSeconds()) : "")
  );
}
function clearCurveSample() {
  curveSampleIndex = -1;
  $("curveTooltip").hidden = true;
  const marker = $("curveMarker");
  if (marker) marker.innerHTML = "";
}
function renderChargeCurve() {
  const type = curveTypes[activeCurve],
    svg = $("curveSvg"),
    width = $("curvePlot").getBoundingClientRect().width;
  if (width <= 0) return;
  // X 轴标签统一居中；右侧预留半个时间标签的宽度，避免首尾挤压或裁切。
  const left = 30,
    right = width - 16,
    top = 18,
    bottom = 178,
    hasData = activeCurve === "current" && !!getChargeCheck();
  curveGeometry = { left, right, top, bottom, width, hasData };
  clearCurveSample();
  svg.setAttribute("viewBox", "0 0 " + width + " 212");
  svg.setAttribute(
    "aria-label",
    type.label +
      (hasData
        ? "，模拟数据。需求电流和实际电流随充电时间变化，可点选或使用左右方向键查看数值。"
        : "，暂无曲线数据。"),
  );
  if (hasData) svg.setAttribute("tabindex", "0");
  else svg.removeAttribute("tabindex");
  $("curveMeta").dataset.empty = String(!hasData);
  let drawing = '<text class="curve-axis" x="3" y="9">' + type.unit + "</text>";
  for (let i = 0; i <= 5; i++) {
    const y = top + ((bottom - top) * i) / 5;
    drawing +=
      '<line class="curve-grid" x1="' +
      left +
      '" y1="' +
      y +
      '" x2="' +
      right +
      '" y2="' +
      y +
      '"/>';
    if (hasData)
      drawing +=
        '<text class="curve-axis" text-anchor="end" x="' +
        (left - 6) +
        '" y="' +
        (y + 4) +
        '">' +
        (150 - i * 30) +
        "</text>";
  }
  drawing +=
    '<line x1="' +
    left +
    '" y1="' +
    bottom +
    '" x2="' +
    right +
    '" y2="' +
    bottom +
    '" stroke="#dce6e9" stroke-width=".5"/>';
  for (let i = 0; i <= 4; i++)
    drawing +=
      '<text class="curve-axis" text-anchor="middle" x="' +
      (left + ((right - left) * i) / 4) +
      '" y="201">' +
      curveTime(i / 4) +
      "</text>";
  if (hasData) {
    for (const [series, className] of [
      [0, "requested"],
      [1, "actual"],
    ]) {
      const points = currentCurveSamples
        .map(
          (sample, i) =>
            (
              left +
              ((right - left) * i) / (currentCurveSamples.length - 1)
            ).toFixed(2) +
            "," +
            (bottom - (sample[series] / 150) * (bottom - top)).toFixed(2),
        )
        .join(" ");
      drawing +=
        '<polyline class="curve-line curve-line--' +
        className +
        '" points="' +
        points +
        '"/>';
    }
  } else
    drawing +=
      '<text class="curve-empty" text-anchor="middle" x="' +
      (left + right) / 2 +
      '" y="102">暂无曲线数据</text>';
  svg.innerHTML =
    drawing +
    '<g id="curveMarker" aria-hidden="true" pointer-events="none"></g>';
}
function showCurveSample(index) {
  if (!curveGeometry?.hasData) return;
  curveSampleIndex = Math.max(
    0,
    Math.min(currentCurveSamples.length - 1, index),
  );
  const { left, right, top, bottom, width } = curveGeometry,
    sample = currentCurveSamples[curveSampleIndex];
  const ratio = curveSampleIndex / (currentCurveSamples.length - 1),
    x = left + (right - left) * ratio;
  $("curveMarker").innerHTML =
    '<line x1="' +
    x +
    '" y1="' +
    top +
    '" x2="' +
    x +
    '" y2="' +
    bottom +
    '" stroke="#b0c5cb" stroke-width=".75" stroke-dasharray="3 3"/>' +
    sample
      .map(
        (value, i) =>
          '<circle cx="' +
          x +
          '" cy="' +
          (bottom - (value / 150) * (bottom - top)) +
          '" r="3" fill="' +
          (i ? "#00bda1" : "#f27d78") +
          '" stroke="#fff" stroke-width="1.5"/>',
      )
      .join("");
  const tooltip = $("curveTooltip");
  tooltip.style.left =
    Math.max(0, Math.min(width - 140, x > width / 2 ? x - 150 : x + 10)) + "px";
  tooltip.innerHTML =
    "<time>" +
    curveTime(ratio, true) +
    "</time><div>需求电流<strong>" +
    sample[0] +
    "A</strong></div><div>实际电流<strong>" +
    sample[1] +
    "A</strong></div>";
  tooltip.hidden = false;
  $("curveSvg").setAttribute(
    "aria-label",
    "模拟数据，" +
      curveTime(ratio, true) +
      "，需求电流" +
      sample[0] +
      "A，实际电流" +
      sample[1] +
      "A。",
  );
}
function inspectCurvePointer(event) {
  if (!curveGeometry?.hasData) return;
  const { left, right } = curveGeometry,
    x = event.clientX - $("curveSvg").getBoundingClientRect().left;
  showCurveSample(
    Math.round(
      ((x - left) / (right - left)) * (currentCurveSamples.length - 1),
    ),
  );
}
$("curveSvg").addEventListener("pointerdown", inspectCurvePointer);
$("curveSvg").addEventListener("pointermove", (event) => {
  if (event.pointerType === "mouse" || event.buttons)
    inspectCurvePointer(event);
});
$("curveSvg").addEventListener("pointerleave", (event) => {
  if (event.pointerType === "mouse") clearCurveSample();
});
$("curveSvg").addEventListener("pointercancel", clearCurveSample);
$("curveSvg").addEventListener("blur", clearCurveSample);
$("curveSvg").addEventListener("keydown", (event) => {
  if (!curveGeometry?.hasData) return;
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    showCurveSample(
      curveSampleIndex < 0
        ? 0
        : curveSampleIndex + (event.key === "ArrowRight" ? 1 : -1),
    );
  } else if (event.key === "Escape") clearCurveSample();
});
root.addEventListener("pointerdown", (event) => {
  if (!event.target.closest("#curvePlot")) clearCurveSample();
});
let curveWidth = 0;
new ResizeObserver((entries) => {
  const width = entries[0].contentRect.width;
  if (Math.abs(width - curveWidth) > 0.5) {
    curveWidth = width;
    ui.keepTabVisible($("curveTabs"));
    renderChargeCurve();
  }
}).observe($("curvePlot"));

root.addEventListener("bg:tabchange", event => {
  if (!curveTypes[event.detail.key]) return;
  activeCurve = event.detail.key;
  renderChargeCurve();
});
return { render: renderChargeCurve };
}
window.BatteryGuardianDemoChargeCurve = { create };
})();
