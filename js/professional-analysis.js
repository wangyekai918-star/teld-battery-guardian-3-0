/* 专业分析独立于健康概览的演示评分。
 * score / mean / peak / peerMean 为原报告明确标注的数值。
 * trace / own 为原报告截图上的像素坐标，仅用于复绘走势，不是原始逐点测量数据。
 * 正常来源：battery-guardian-normal-20260821-professional-curves.png
 * 高危来源：battery-guardian-ad18715-professional-curves.png
 */
(() => {
  const fields = [
    { key: "temperature", name: "温度一致性", icon: "professional-temperature.png", unit: "°C" },
    { key: "maximum", name: "最高温度", icon: "professional-maximum-temperature.png", unit: "°C" },
    { key: "soc", name: "SOC 一致性", icon: "professional-soc.png", unit: "" },
    { key: "voltage", name: "电压一致性", icon: "professional-voltage.png", unit: "V" },
  ];
  const reports = {
    normal: {
      temperature: {
        score: 100, mean: "2.9", peak: "4", peerMean: "3.3", max: 8, ticks: [0, 2, 4, 6, 8],
        bounds: [55, 129, 598, 233],
        dates: [[55, "07.23"], [253, "07.26"], [400, "08.02"], [598, "08.17"]],
        trace: [[55,194],[104,194],[178,181],[227,201],[277,194],[327,129],[352,181],[376,181],[400,181],[425,194],[474,208],[499,221],[524,188],[548,194],[573,207],[598,194]],
        own: [[55,194],[104,194],[178,181],[227,207],[277,194],[425,207],[548,194]],
      },
      maximum: {
        score: 100, mean: "34.6", peak: "36", peerMean: "36.2", max: 40, ticks: [0, 10, 20, 30, 40],
        bounds: [59, 345, 598, 449],
        dates: [[59, "07.23"], [253, "07.26"], [400, "08.02"], [598, "08.17"]],
        trace: [[59,361],[108,364],[182,355],[231,357],[280,355],[329,361],[353,345],[378,355],[402,352],[427,355],[476,357],[501,361],[525,349],[550,350],[574,350],[598,348]],
        own: [[59,360],[108,363],[182,354],[231,359],[280,355],[427,359],[550,350]],
      },
      soc: {
        score: 80, mean: "0.11", peak: "0.35", peerMean: "0.05", max: 0.35, ticks: [0, 0.1, 0.2, 0.3, 0.35],
        bounds: [59, 560, 598, 665],
        dates: [[59, "07.23"], [253, "07.26"], [400, "08.02"], [598, "08.17"]],
        trace: [[59,659],[107,611],[181,659],[230,608],[279,608],[328,659],[352,659],[377,656],[402,659],[426,656],[476,662],[500,662],[525,659],[550,659],[574,659],[598,659]],
        own: [[106.5,659.1],[106.6,566.4],[229.3,560.8],[278.4,659.1],[425.6,662.3]],
      },
      voltage: {
        score: 98.6, mean: "0.47", peak: "0.58", peerMean: "0.44", max: 0.6, ticks: [0, 0.2, 0.4, 0.6],
        bounds: [59, 776, 598, 880],
        dates: [[59, "07.24"], [255, "07.26"], [402, "07.27"], [598, "08.04"]],
        trace: [[59,797],[157,794],[255,795],[304,811],[450,876],[500,780],[598,777]],
        own: [[59,797],[157,794],[255,795],[303.4,804.3],[303.5,818.2]],
      },
    },
    risk: {
      temperature: {
        score: 100, mean: "4.6", peak: "6", peerMean: "3.9", max: 6, ticks: [0, 2, 4, 6],
        bounds: [59, 108, 599, 213],
        dates: [[59,"07.22"],[254,"08.01"],[436,"08.08"],[599,"08.20"]],
        trace: [[59,150],[73,144],[92,144],[127,151],[145,141],[164,154],[200,150],[218,149],[236,154],[254,152],[291,146],[309,149],[345,139],[363,140],[399,144],[436,149],[454,141],[490,135],[509,143],[527,142],[545,144],[563,146],[581,144],[599,140]],
        own: [[91.2,124.8],[181.8,107.5],[254,142],[308.5,124.8],[362.9,124.9],[399.2,124.9],[471.7,159.8],[545,142]],
      },
      maximum: {
        score: 95.9, mean: "36.6", peak: "38", peerMean: "36.4", max: 40, ticks: [0,10,20,30,40],
        bounds: [59,322,599,427],
        dates: [[59,"07.22"],[255,"08.01"],[434,"08.09"],[599,"08.20"]],
        trace: [[59,335],[75,332],[90,331],[120,334],[135,339],[165,334],[180,337],[210,340],[225,340],[255,340],[270,338],[300,335],[315,333],[345,334],[375,331],[390,332],[405,329],[435,332],[450,329],[480,329],[495,336],[510,337],[525,329],[540,326],[570,334],[585,330],[599,334]],
        own: [[90,327.4],[164.9,328.9],[224.7,343.1],[313.8,330.3],[344.5,328.1],[404.4,333.9],[539.1,330.3]],
      },
      soc: {
        score: 44.4, mean: "0.09", peak: "0.18", peerMean: "0.02", meanLineOwn: 0.08, max: 0.18, ticks: [0,0.06,0.12,0.18],
        bounds: [59,540,599,644],
        dates: [[59,"07.22"],[234,"08.01"],[409,"08.09"],[599,"08.19"]],
        trace: [[59,633],[88,633],[131,633],[146,633],[161,621],[190,633],[219,633],[234,627],[263,621],[278,627],[307,627],[351,627],[380,633],[409,633],[438,627],[453,633],[497,633],[511,627],[526,633],[555,633],[599,633]],
        own: [[160.8,551],[233.8,609.2],[277.5,586],[321.2,585.9],[350.5,540.4],[408.9,626.5],[540.2,626.5]],
      },
      voltage: {
        score: 58, mean: "0.3", peak: "0.38", peerMean: "0.05", max: 0.4, ticks: [0,0.1,0.2,0.3,0.4],
        bounds: [59,756,599,860],
        dates: [[59,"07.22"],[234,"08.01"],[409,"08.09"],[599,"08.19"]],
        trace: [[59,850],[74,853],[88,850],[118,850],[132,856],[147,851],[162,839],[190,850],[220,853],[234,845],[264,850],[278,845],[308,848],[351,848],[380,850],[395,850],[409,845],[438,850],[453,845],[482,850],[497,847],[511,845],[526,850],[540,837],[570,848],[585,847],[599,834]],
        own: [[161.5,760.8],[234.4,773.8],[278.1,771.2],[321.8,771.1],[350.8,773.7],[409.1,773.7],[540.3,771.1]],
      },
    },
  };
  const labels = { normal: "正常", attention: "关注", mild: "轻微异常", severe: "严重", missing: "" };
  const escape = (value) => String(value).replace(/[&<>"']/g, (s) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[s]);
  let activeReport, initialized = false, lastWidth = 0;

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
      const svg = document.getElementById(`professional-chart-${field.key}`);
      if (svg && activeReport[field.key]) drawChart(svg, field, activeReport[field.key]);
    });
  }

  function render(state, getLevel) {
    const root = document.getElementById("professionalAnalysis"), list = document.getElementById("professionalAnalysisList");
    activeReport = reports[state];
    list.innerHTML = fields.map(field => {
      const data = activeReport?.[field.key], level = getLevel(data?.score);
      const buttonId = `professional-toggle-${field.key}`, panelId = `professional-panel-${field.key}`;
      return `<article class="professional-item" data-level="${level}" data-open="false">
        <h3 class="professional-item-heading"><button class="professional-toggle" id="${buttonId}" type="button" aria-expanded="false" aria-controls="${panelId}">
          <span class="professional-item-name"><img class="professional-item-icon" src="assets/${field.icon}" width="22" height="22" alt="" aria-hidden="true"/><span>${field.name}</span></span><span class="professional-score">${labels[level]}<strong>${data ? data.score.toFixed(1) : "-"}</strong></span><img class="professional-chevron" src="assets/vehicle-switch-arrow.svg" alt="" aria-hidden="true"/>
        </button></h3>
        <div class="professional-panel" id="${panelId}" role="region" aria-labelledby="${buttonId}" aria-hidden="true" inert><div class="professional-panel-content"><div class="professional-panel-body">${data ? `${statistics(data, field.unit)}<figure class="professional-chart"><figcaption class="professional-legend"><span><i class="professional-legend-own" aria-hidden="true"></i>本车</span><span><i class="professional-legend-peer" aria-hidden="true"></i>同城同车型</span><span><i class="professional-legend-mean" aria-hidden="true"></i>各自均值</span></figcaption><svg id="professional-chart-${field.key}" role="img" aria-label="${field.name}趋势，依据原报告截图还原"></svg></figure>` : '<p class="professional-empty">暂无该项专业分析数据</p>'}</div></div></div>
      </article>`;
    }).join("");
    if (!initialized) {
      list.addEventListener("click", event => {
        const toggle = event.target.closest(".professional-toggle");
        if (!toggle) return;
        const open = toggle.getAttribute("aria-expanded") !== "true";
        const panel = document.getElementById(toggle.getAttribute("aria-controls"));
        toggle.setAttribute("aria-expanded", String(open));
        toggle.closest(".professional-item").dataset.open = String(open);
        panel.setAttribute("aria-hidden", String(!open));
        panel.inert = !open;
      });
      new ResizeObserver(entries => {
        const width = entries[0].contentRect.width;
        if (Math.abs(width - lastWidth) > .5) { lastWidth = width; redraw(); }
      }).observe(root);
      initialized = true;
    }
    redraw();
  }
  window.BatteryProfessionalAnalysis = { render };
})();
