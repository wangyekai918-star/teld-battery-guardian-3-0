/* 专业分析独立于健康概览的演示评分。
 * score / mean / peak / peerMean 为原报告明确标注的数值。
 * trace / own 为原报告截图上的像素坐标，仅用于复绘走势，不是原始逐点测量数据。
 * 正常来源：battery-guardian-normal-20260821-professional-curves.png
 * 高危来源：battery-guardian-ad18715-professional-curves.png
 */
(() => {
  const { professionalFields: fields, professionalReports: reports } = BatteryGuardianDemoData;
  const labels = { normal: "正常", attention: "关注", mild: "轻微异常", severe: "严重", missing: "" };
  const escape = (value) => String(value).replace(/[&<>"']/g, (s) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[s]);
  let reportRoot, activeReport, initialized = false, lastWidth = 0;

  function statistics(data, unit) {
    return `<dl class="professional-statistics">${[["近30天均值", data.mean], ["最高值", data.peak], ["同城同车型均值", data.peerMean]].map(([label,value]) => `<div><dt>${label}</dt><dd>${value}${unit ? `<span>${unit}</span>` : ""}</dd></div>`).join("")}</dl>`;
  }

  function smoothPath(points) {
    return points.map(([x,y], i) => {
      if (!i) return `M${x},${y}`;
      const [px,py] = points[i - 1], middle = (px + x) / 2;
      return `C${middle},${py} ${middle},${y} ${x},${y}`;
    }).join(" ");
  }

  function drawChart(svg, field, data) {
    const width = svg.clientWidth;
    if (!width) return;
    const height = 168, left = 35, right = width - 13, top = 14, bottom = 142;
    const [sx,sy,ex,ey] = data.bounds;
    const x = (value) => left + (value - sx) / (ex - sx) * (right - left);
    const y = (value) => top + Math.min(1, Math.max(0, (value - sy) / (ey - sy))) * (bottom - top);
    const scale = (value) => bottom - value / data.max * (bottom - top);
    const unit = field.unit;
    const grid = data.ticks.map(value => `<line x1="${left}" y1="${scale(value)}" x2="${right}" y2="${scale(value)}" stroke="#eff3f5" stroke-dasharray="3 3"/><text x="${left - 7}" y="${scale(value) + 3}" text-anchor="end">${value}</text>`).join("");
    const dates = data.dates.map(([px,date],index) => `<text x="${x(px)}" y="160" text-anchor="${index === 0 ? "start" : index === data.dates.length - 1 ? "end" : "middle"}">${date}</text>`).join("");
    const points = data.trace.map(([px,py]) => [x(px),y(py)]);
    const ownMean = scale(data.meanLineOwn ?? Number(data.mean)), peerMean = scale(Number(data.peerMean));
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.innerHTML = `<title>${escape(field.name)}：本车与同城同车型走势，依据原报告截图还原</title>${unit ? `<text x="${left}" y="10">${unit}</text>` : ""}${grid}
      <line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" stroke="#e6edef"/>
      <line x1="${left}" y1="${ownMean}" x2="${right}" y2="${ownMean}" stroke="#f27d86" stroke-width="1" stroke-dasharray="4 3" opacity=".7"/>
      <line x1="${left}" y1="${peerMean}" x2="${right}" y2="${peerMean}" stroke="#00bda1" stroke-width="1" stroke-dasharray="4 3" opacity=".5"/>
      ${data.own.map(([px,py]) => `<circle cx="${x(px)}" cy="${y(py)}" r="2.6" fill="#f27d86"/>`).join("")}
      <path d="${smoothPath(points)}" fill="none" stroke="#00bda1" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
      ${points.map(([px,py]) => `<circle cx="${px}" cy="${py}" r="1.7" fill="#fff" stroke="#00bda1" stroke-width="1.2"/>`).join("")}${dates}`;
  }

  function redraw() {
    if (!activeReport) return;
    fields.forEach(field => {
      const svg = reportRoot.querySelector(`#professional-chart-${field.key}`);
      if (svg && activeReport[field.key]) drawChart(svg, field, activeReport[field.key]);
    });
  }

  function render(state, getLevel, scope) {
    reportRoot = scope;
    const root = reportRoot.querySelector("#professionalAnalysis"), list = reportRoot.querySelector("#professionalAnalysisList");
    activeReport = reports[state];
    list.innerHTML = fields.map(field => {
      const data = activeReport?.[field.key], level = getLevel(data?.score);
      const buttonId = `professional-toggle-${field.key}`, panelId = `professional-panel-${field.key}`;
      return `<article class="professional-item" data-bg-disclosure-item data-level="${level}" data-open="false">
        <h3 class="professional-item-heading"><button class="professional-toggle" data-bg-disclosure="animated" id="${buttonId}" type="button" aria-expanded="false" aria-controls="${panelId}">
          <span class="professional-item-name"><img class="professional-item-icon" src="assets/${field.icon}" width="22" height="22" alt="" aria-hidden="true"/><span>${field.name}</span></span><span class="professional-score">${labels[level]}<strong>${data ? data.score.toFixed(1) : "-"}</strong></span><img class="professional-chevron" src="assets/vehicle-switch-arrow.svg" alt="" aria-hidden="true"/>
        </button></h3>
        <div class="professional-panel" id="${panelId}" role="region" aria-labelledby="${buttonId}" aria-hidden="true" inert><div class="professional-panel-content"><div class="professional-panel-body">${data ? `${statistics(data, field.unit)}<figure class="professional-chart"><figcaption class="professional-legend"><span><i class="professional-legend-own" aria-hidden="true"></i>本车</span><span><i class="professional-legend-peer" aria-hidden="true"></i>同城同车型</span><span><i class="professional-legend-mean" aria-hidden="true"></i>各自均值</span></figcaption><svg id="professional-chart-${field.key}" role="img" aria-label="${field.name}趋势，依据原报告截图还原"></svg></figure>` : '<p class="professional-empty">暂无该项专业分析数据</p>'}</div></div></div>
      </article>`;
    }).join("");
    if (!initialized) {
      new ResizeObserver(entries => {
        const width = entries[0].contentRect.width;
        if (Math.abs(width - lastWidth) > .5) { lastWidth = width; redraw(); }
      }).observe(root);
      initialized = true;
    }
    redraw();
  }
  window.BatteryGuardianDemoProfessionalAnalysis = { render };
})();
