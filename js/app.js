// normal、risk 沿用用户提供的原型数据；watch 的车辆、标识和指标均为虚构演示数据。
const reports = {
  normal: {
    vehicle: "威马 EX5 400km",
    plate: "琼BD2733",
    date: "2026.08.03",
    completed: "2026-08-03 16:10",
    report: "202608030500516531",
    score: "92.8",
    soh: "78.0",
    sohGrade: "正常",
    range: "312",
  },
  watch: {
    vehicle: "比亚迪 元 PLUS 510km",
    plate: "鲁BD12345",
    date: "2026.08.18",
    completed: "2026-08-18 10:30",
    report: "DEMO202608180001",
    score: "72.0",
    soh: "86.0",
    sohGrade: "良好",
    range: "439",
    demo: true,
  },
  risk: {
    vehicle: "比亚迪 e5 450 400km",
    plate: "粤AD18715",
    date: "2026.08.17",
    completed: "2026-08-17 00:43",
    report: "202608170800012737",
    score: "44.4",
    soh: "94.8",
    sohGrade: "良好",
    range: "380",
  },
};
// 结论来源：正式需求 4.2.4 + 用户交付原型中的本车数据；短文案经过面向用户的整理。
// 安全总分的三档映射与单项指标严重程度独立。SOC / 电压指标均不足 60 分，按需求标为严重。
// 每条结论关联一条依据；最多 3 条结论，连同完整处置建议最多 4 条依据。
const diagnoses = {
  normal: {
    items: [
      {
        id: "voltage",
        dimension: "safety",
        level: "attention",
        title: "本次电压极差偏大",
        data: [
          { label: "本次压差", value: "0.58", unit: "V" },
          { label: "参考", value: "≤0.10", unit: "V" },
        ],
        advice: "安排电池均衡，重点检查单体电压偏低的模组。",
        evidenceTitle: "电压极差偏大的依据",
        evidence:
          "本次压差0.58V；近30天均值0.47V、最高0.58V，超过≤0.10V参考值。同城同车型均值0.44V，原报告列为关注项，需结合均衡后结果观察变化。",
      },
      {
        id: "safety",
        dimension: "safety",
        level: "good",
        title: "本次整体安全状况较好",
        data: [
          { label: "最高温度", value: "35.0", unit: "℃" },
          { label: "历史故障率", value: "0", unit: "%" },
        ],
        advice: "保持良好的充电习惯，继续关注电压极差变化。",
        evidenceTitle: "整体安全状况的依据",
        evidence:
          "安全评分92.8分，处于安全区间。本次最高温度35.0℃，低于54.0℃参考值；报告覆盖的10笔充电订单无故障记录。综合评分较好，本次压差关注项仍需处理。",
      },
      {
        id: "health",
        dimension: "health",
        level: "good",
        title: "电池容量保持正常",
        data: [
          { label: "容量健康度", value: "78.0", unit: "%" },
          { label: "同车型", value: "86.94", unit: "%" },
        ],
        advice: "持续观察容量和实际续航变化，留意后续衰减趋势。",
        evidenceTitle: "容量健康状态的依据",
        evidence:
          "本车SOH为78.0%，报告容量状态为正常；同城同车型均值86.94%，本车低8.94个百分点。未提供年衰减率，暂不能判断衰减速度；容量状态与安全状态分别评估。",
      },
    ],
    disposition:
      "安排一次电池均衡，由专业人员重点检查单体电压偏低的电池模组。均衡后继续观察电压极差、容量健康度和实际续航的变化，结合后续检测报告复查。日常保持良好的充电习惯。",
  },
  watch: {
    items: [
      {
        id: "safety",
        dimension: "safety",
        level: "attention",
        title: "电池安全状况需持续观察",
        data: [
          { label: "安全评分", value: "72.0", unit: "分" },
          { label: "安全区间", value: "≥80", unit: "分" },
        ],
        advice: "持续观察后续评分变化，结合具体异常提示检查。",
        evidenceTitle: "安全评分的依据",
        evidence:
          "演示安全评分为72.0分，按60分至不足80分的规则归为亚安全。当前没有单项检测、历史趋势及同车型对比数据，不能仅凭总分判断具体异常或维修项目。",
      },
      {
        id: "health",
        dimension: "health",
        level: "good",
        title: "电池容量保持良好",
        data: [
          { label: "容量健康度", value: "86.0", unit: "%" },
          { label: "预计续航", value: "439", unit: "km" },
        ],
        advice: "持续关注容量和实际续航，结合后续报告观察变化。",
        evidenceTitle: "容量健康状态的依据",
        evidence:
          "演示数据中，SOH为86.0%，容量状态为良好；预计续航439km为算法估算。暂无年衰减率、历史趋势及同车型对比数据，不能据此判断衰减速度或具体健康异常。",
      },
    ],
    disposition:
      "持续关注后续检测报告中的安全评分、容量健康度与实际续航变化。如出现具体异常提示，再结合对应指标和诊断依据进一步检查。当前为演示报告，未提供支持具体维修项目的检测数据。",
  },
  risk: {
    items: [
      {
        id: "soc",
        dimension: "safety",
        level: "severe",
        title: "SOC一致性异常",
        data: [
          { label: "一致性得分", value: "44.4", unit: "分" },
          { label: "安全评分", value: "44.4", unit: "分" },
        ],
        advice: "前往4S店全面检查，关注电量显示与实际续航变化。",
        evidenceTitle: "SOC一致性异常的依据",
        evidence:
          "SOC一致性得分44.4分，低于60分，按指标分级属于严重异常。原报告也判定该项异常，需检查电量显示与续航变化；趋势和同车型数值未注明单位，暂不作数值对比。",
      },
      {
        id: "voltage",
        dimension: "safety",
        level: "severe",
        title: "电压一致性异常",
        data: [
          { label: "本次压差", value: "0.34", unit: "V" },
          { label: "参考", value: "≤0.10", unit: "V" },
        ],
        advice: "进行电池均衡，重点检查单体电压偏低的模组。",
        evidenceTitle: "电压一致性异常的依据",
        evidence:
          "本次压差0.34V，近30天均值0.30V、最高0.38V，超过≤0.10V参考值；同城同车型均值0.05V。该项58.0分，属严重异常，可能影响电池组一致性。",
      },
      {
        id: "health",
        dimension: "health",
        level: "good",
        title: "电池容量保持良好",
        data: [
          { label: "容量健康度", value: "94.8", unit: "%" },
          { label: "同车型", value: "91.6", unit: "%" },
        ],
        advice: "持续观察容量和续航，优先处理本次安全异常。",
        evidenceTitle: "容量健康状态的依据",
        evidence:
          "本车SOH为94.8%，报告容量状态为良好；同城同车型均值91.6%。原报告未提供年衰减率，暂不能判断衰减速度。容量保持良好，仍需处理SOC与电压一致性异常。",
      },
    ],
    disposition:
      "前往4S店对电池进行全面检查，并由专业人员结合检测结果进行电池均衡，重点排查单体电压偏低的模组。处理后持续观察SOC显示、实际续航和电压极差的变化。容量健康度良好，仍应优先处理安全异常。",
  },
};
const conclusionLevels = {
  severe: { label: "严重", asset: "assets/status-severe.svg", order: 0 },
  attention: { label: "关注", asset: "assets/status-attention.svg", order: 1 },
  good: { label: "良好", asset: "assets/status-good.svg", order: 2 },
};
function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}
function getConclusions(state) {
  return [...diagnoses[state].items].sort(
    (a, b) =>
      conclusionLevels[a.level].order - conclusionLevels[b.level].order ||
      (a.dimension === "health") - (b.dimension === "health"),
  );
}
// 单位随数字使用 D-DIN；中文单位保留系统字体，℃ 使用字体自带的 °C 字形组合。
function renderConclusions(state) {
  const items = getConclusions(state);
  const severe = items.filter((item) => item.level === "severe").length,
    attention = items.filter((item) => item.level === "attention").length;
  const summary = $("conclusionsSummary");
  const attentionCount = severe + attention;
  summary.textContent = `${attentionCount}项需关注`;
  summary.hidden = attentionCount === 0;
  summary.dataset.level = severe ? "severe" : "attention";
  $("conclusionsDemo").hidden = !reports[state].demo;
  $("conclusionsList").innerHTML = items
    .map(
      (
        item,
      ) => `<article class="conclusion-item" data-dimension="${item.dimension}" data-level="${item.level}" aria-labelledby="conclusion-${item.id}">
    <div class="conclusion-title-row"><img class="conclusion-badge" src="${conclusionLevels[item.level].asset}" alt="${conclusionLevels[item.level].label}" width="30" height="17"><h3 class="conclusion-title" id="conclusion-${item.id}">${escapeHTML(item.title)}</h3></div>
    <p class="conclusion-data">${item.data.map((datum) => `<span class="conclusion-datum">${escapeHTML(datum.label)} <b class="conclusion-value">${escapeHTML(datum.value)}<span class="conclusion-unit${/\p{Script=Han}/u.test(datum.unit) ? " conclusion-unit--zh" : ""}">${escapeHTML(datum.unit.replaceAll("℃", "°C"))}</span></b></span>`).join("")}</p>
    <p class="conclusion-advice">建议：${escapeHTML(item.advice)}</p>
  </article>`,
    )
    .join("");
}
function renderEvidence(state) {
  const items = getConclusions(state),
    d = reports[state];
  return `${d.demo ? '<p class="evidence-context">演示报告 · 暂无具体异常指标数据</p>' : ""}
    <ol class="evidence-list">${items.map((item) => `<li class="evidence-item"><h3 class="evidence-title">${escapeHTML(item.evidenceTitle)}</h3><p class="evidence-copy">${escapeHTML(item.evidence)}</p></li>`).join("")}
      <li class="evidence-item evidence-item--advice"><h3 class="evidence-title">完整处置建议</h3><p class="evidence-copy">${escapeHTML(diagnoses[state].disposition)}</p></li>
    </ol>`;
}
const safetyLevels = {
  safe: { label: "安全", icon: "shield-check-bold" },
  watch: { label: "亚安全", icon: "shield-warning-watch" },
  risk: { label: "高危", icon: "shield-warning-bold" },
};
function getSafetyStatus(score) {
  const value = Number(score);
  if (
    score === null ||
    String(score).trim() === "" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  )
    throw new RangeError("电池安全评分应在 0 至 100 之间");
  // 已确认：低于 60 分高危，60 分至不足 80 分亚安全，80 分及以上安全。
  const key = value < 60 ? "risk" : value < 80 ? "watch" : "safe";
  return { key, ...safetyLevels[key] };
}
// normal 首条按用户要求使用虚拟充电数据：12% 充至 90%，跨度 78 个百分点；不据此重算报告评分。
// 日期使用体检结束时间。SOC 跨度由结束 SOC 减开始 SOC 得到，不作数据有效性分级。
// 体检单号均为原型展示编号，首条使用用户提供的示例格式。
// normal 首条虚拟充电量 40.2 度、时长 68 分钟，起止时间保持一致；risk 首条沿用交付报告。
const chargeChecks = {
  normal: [
    {
      id: "normal-20260803",
      startedAt: "2026-08-03 15:02:40",
      endedAt: "2026-08-03 16:10:40",
      energyKwh: "40.2",
      number: "202608030500516531",
      completed: "2026-08-03 16:10",
      socStart: 12,
      socEnd: 90,
      durationMin: 68,
      historyOrders: 10,
    },
    {
      id: "normal-demo-20260801",
      startedAt: "2026-08-01 17:56:00",
      endedAt: "2026-08-01 18:42:00",
      energyKwh: "30.5",
      number: "202608010500516532",
      completed: "2026-08-01 18:42",
      socStart: 20,
      socEnd: 82,
      durationMin: 46,
      historyOrders: 9,
      demo: true,
    },
  ],
  watch: [
    {
      id: "watch-demo-20260818",
      startedAt: "2026-08-18 09:49:00",
      endedAt: "2026-08-18 10:30:00",
      energyKwh: "33.6",
      number: "202608180500516533",
      completed: "2026-08-18 10:30",
      socStart: 28,
      socEnd: 84,
      durationMin: 41,
      historyOrders: 8,
      demo: true,
    },
    {
      id: "watch-demo-20260815",
      startedAt: "2026-08-15 19:39:00",
      endedAt: "2026-08-15 20:15:00",
      energyKwh: "33",
      number: "202608150500516534",
      completed: "2026-08-15 20:15",
      socStart: 35,
      socEnd: 90,
      durationMin: 36,
      historyOrders: 7,
      demo: true,
    },
  ],
  risk: [
    {
      id: "risk-20260817",
      startedAt: "2026-08-17 00:04:53",
      endedAt: "2026-08-17 00:43:26",
      energyKwh: "25.21",
      number: "202608170500516535",
      completed: "2026-08-17 00:43",
      socStart: 31,
      socEnd: 98,
      durationMin: 38,
      historyOrders: 9,
    },
    {
      id: "risk-demo-20260813",
      startedAt: "2026-08-13 18:44:00",
      endedAt: "2026-08-13 19:26:00",
      energyKwh: "24.8",
      number: "202608130500516536",
      completed: "2026-08-13 19:26",
      socStart: 24,
      socEnd: 86,
      durationMin: 42,
      historyOrders: 8,
      demo: true,
    },
  ],
};
const annualInspectionFields = [
  { key: "temperature", label: "最高温度" },
  { key: "maxVoltage", label: "最高电压" },
  { key: "minVoltage", label: "最低电压" },
  { key: "voltageDifference", label: "电压极差" },
];
// 数值、阈值和结果对应原型的本次体检记录；其他历史记录未提供的项目保持未评估。
const annualInspectionData = {
  "normal-20260803": {
    temperature: {
      value: "35.0",
      unit: "℃",
      threshold: "<54.0℃",
      result: "normal",
    },
    maxVoltage: {
      value: "4.19",
      unit: "V",
      threshold: "≤4.30V",
      result: "normal",
    },
    voltageDifference: {
      value: "0.58",
      unit: "V",
      threshold: "≤0.10V",
      result: "abnormal",
    },
  },
  "risk-20260817": {
    temperature: {
      value: "38.0",
      unit: "℃",
      threshold: "<60.0℃",
      result: "normal",
    },
    maxVoltage: {
      value: "4.14",
      unit: "V",
      threshold: "≤4.25V",
      result: "normal",
    },
    voltageDifference: {
      value: "0.34",
      unit: "V",
      threshold: "≤0.10V",
      result: "abnormal",
    },
  },
};
const deepInspectionFields = [
  { key: "temperatureDifference", label: "最大温差" },
  { key: "temperatureRiseRate", label: "最大温升速率" },
  { key: "socChangeRate", label: "SOC变化速率" },
  { key: "totalVoltage", label: "总电压" },
  { key: "stopReason", label: "停充原因", type: "text", mergeReference: true },
];
// 深度项目沿用两份原型的本次体检数据；缺少检测值时保留参考阈值，不推断结果。
const deepInspectionData = {
  "normal-20260803": {
    temperatureDifference: {
      value: "2.0",
      unit: "℃",
      threshold: "<15.0℃",
      result: "normal",
    },
    temperatureRiseRate: { threshold: "<7.0℃/min" },
    socChangeRate: {
      value: "0.01",
      unit: "%/min",
      threshold: "<0.05%/min",
      result: "normal",
    },
    stopReason: { value: "APP或小程序终止", result: "normal" },
  },
  "risk-20260817": {
    temperatureDifference: {
      value: "4.0",
      unit: "℃",
      threshold: "<15.0℃",
      result: "normal",
    },
    temperatureRiseRate: {
      value: "1.0",
      unit: "℃/min",
      threshold: "<7.0℃/min",
      result: "normal",
    },
    socChangeRate: {
      value: "0.03",
      unit: "%/min",
      threshold: "<0.05%/min",
      result: "normal",
    },
    totalVoltage: { threshold: "≤705.6V" },
    stopReason: { value: "SOC达到限制值停止", result: "normal" },
  },
};
// 检测值与参考阈值统一使用系统字体，摄氏度沿用 °C 的展示形式。
function renderInspectionMeasure(text) {
  return escapeHTML(String(text).replaceAll("℃", "°C"));
}
function renderInspectionRows(targetId, fields, values) {
  const results = { normal: "正常", abnormal: "异常", missing: "-" };
  $(targetId).innerHTML = fields
    .map((field, index) => {
      const item = values[field.key],
        result = item?.value != null ? item.result || "missing" : "missing",
        isText = field.type === "text";
      const reading =
        item?.value != null
          ? '<span class="inspection-reading' +
            (isText ? " inspection-text" : "") +
            '">' +
            (isText
              ? escapeHTML(String(item.value))
              : renderInspectionMeasure(
                  String(item.value) + (item.unit ?? ""),
                )) +
            "</span>"
          : '<span class="inspection-missing">未上报</span>';
      const reference = item?.threshold
        ? isText
          ? escapeHTML(item.threshold)
          : renderInspectionMeasure(item.threshold)
        : '<span class="inspection-missing">—</span>';
      const measureCells = field.mergeReference
        ? '<td colspan="2">' + reading + "</td>"
        : "<td>" +
          reading +
          '</td><td class="inspection-reference' +
          (isText ? " inspection-text" : "") +
          '">' +
          reference +
          "</td>";
      return (
        '<tr data-result="' +
        result +
        (index % 2 ? '" class="inspection-row--shaded' : "") +
        '"><th scope="row">' +
        escapeHTML(field.label) +
        "</th>" +
        measureCells +
        '<td><span class="inspection-result inspection-result--' +
        result +
        '">' +
        results[result] +
        "</span></td></tr>"
      );
    })
    .join("");
}
function renderAnnualInspection(check) {
  renderInspectionRows(
    "annualInspectionRows",
    annualInspectionFields,
    annualInspectionData[check?.id] || {},
  );
}
function renderDeepInspection(check) {
  renderInspectionRows(
    "deepInspectionRows",
    deepInspectionFields,
    deepInspectionData[check?.id] || {},
  );
}
const curveTypes = {
  current: { label: "电流曲线", unit: "A" },
  voltage: { label: "电压曲线", unit: "V" },
  temperature: { label: "温度曲线", unit: "°C" },
  soc: { label: "SOC", unit: "%" },
  power: { label: "功率", unit: "kW" },
  cellVoltage: { label: "单体最高电压", unit: "V" },
};
// 仅用于高保真预览：按用户截图模拟电流走势，时间归一到当前体检单的起止时间。
// 其余五类曲线没有原始序列，保留空图，不推算数值。
const currentCurveSamples = [
  [20, 19],
  [20, 19],
  [130, 127],
  [130, 127],
  [130, 127],
  [130, 127],
  [130, 127],
  [130, 127],
  [130, 127],
  [130, 127],
  [130, 127],
  [130, 127],
  [130, 127],
  [130, 127],
  [116, 115],
  [116, 115],
  [116, 115],
  [116, 115],
  [116, 115],
  [116, 115],
  [116, 115],
  [102, 101],
  [93, 92],
  [91, 90],
  [76, 75],
  [70, 69],
  [61, 60],
  [61, 60],
  [61, 60],
  [61, 60],
  [49, 46],
  [43, 42],
  [45, 44],
  [31, 30],
  [37, 34],
  [32, 34],
  [29, 28],
  [29, 28],
  [29, 28],
];
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
function keepActiveCurveVisible() {
  const scroller = $("curveTabs"),
    selected = $("curveTab-" + activeCurve);
  const tabBounds = selected.getBoundingClientRect(),
    scrollBounds = scroller.getBoundingClientRect(),
    inset = parseFloat(getComputedStyle(scroller).paddingLeft) || 0;
  if (tabBounds.left < scrollBounds.left + inset)
    scroller.scrollLeft -= scrollBounds.left + inset - tabBounds.left;
  else if (tabBounds.right > scrollBounds.right - inset)
    scroller.scrollLeft += tabBounds.right - scrollBounds.right + inset;
}
function selectCurve(key, focus = false) {
  if (!curveTypes[key]) return;
  activeCurve = key;
  for (const tab of $("curveTabs").querySelectorAll("[data-curve]")) {
    const selected = tab.dataset.curve === key;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  $("curvePanel").setAttribute("aria-labelledby", "curveTab-" + key);
  const selected = $("curveTab-" + key);
  keepActiveCurveVisible();
  if (focus) selected.focus({ preventScroll: true });
  renderChargeCurve();
}
const selectedChargeChecks = {};
function getChargeChecks(state = activeState) {
  return [...(chargeChecks[state] || [])].sort((a, b) =>
    b.completed.localeCompare(a.completed),
  );
}
function getChargeCheck() {
  const checks = getChargeChecks();
  return (
    checks.find((check) => check.id === selectedChargeChecks[activeState]) ||
    checks[0]
  );
}
function renderChargeBasics(check) {
  const energy =
    check?.energyKwh != null ? String(check.energyKwh).split(".") : null;
  const values = {
    chargeInitialSoc: check?.socStart ?? "—",
    chargeFinalSoc: check?.socEnd ?? "—",
    chargeInitialUnit: check ? "%" : "",
    chargeFinalUnit: check ? "%" : "",
    chargeEnergyInteger: energy ? energy[0] : "—",
    chargeEnergyFraction: energy?.[1] ? "." + energy[1] : "",
    chargeEnergyUnit: energy ? "度" : "",
  };
  for (const [id, value] of Object.entries(values)) $(id).textContent = value;
  for (const [id, value] of [
    ["chargeStartedAt", check?.startedAt],
    ["chargeEndedAt", check?.endedAt],
  ]) {
    $(id).textContent = value ? value.slice(5) : "—";
    if (value) $(id).setAttribute("datetime", value.replace(" ", "T"));
    else $(id).removeAttribute("datetime");
  }
  const minutes = check?.durationMin;
  const hours = minutes == null ? 0 : Math.floor(minutes / 60),
    remainder = minutes == null ? 0 : minutes % 60;
  $("chargeElapsed").textContent =
    minutes == null
      ? "—"
      : (hours ? hours + "小时" : "") +
        (remainder || !hours ? remainder + "分钟" : "");
  const start = check ? Math.min(100, Math.max(0, Number(check.socStart))) : 0,
    end = check ? Math.min(100, Math.max(0, Number(check.socEnd))) : 0;
  $("chargeSocTrack").style.setProperty("--soc-start", start);
  $("chargeSocTrack").style.setProperty("--soc-end", end);
  $("chargeSocTrack").setAttribute(
    "aria-label",
    check
      ? "初始电量 " + start + "%，结束电量 " + end + "%"
      : "暂无充电电量数据",
  );
  $("chargeSocStartFill").hidden = !check || start === 0;
  $("chargeSocEndFill").hidden = !check || end <= start;
}
function renderChargeCheck() {
  const checks = getChargeChecks(),
    check = getChargeCheck(),
    date = $("chargeDate"),
    trigger = $("chargeDateSwitch");
  if (check) selectedChargeChecks[activeState] = check.id;
  date.textContent = check
    ? check.completed.replaceAll("-", ".")
    : "暂无体检单";
  if (check) date.setAttribute("datetime", check.completed.replace(" ", "T"));
  else date.removeAttribute("datetime");
  trigger.disabled = checks.length < 2;
  trigger.setAttribute(
    "aria-label",
    checks.length > 1 ? "切换充电体检单" : "体检时间",
  );
  $("chargeDateArrow").hidden = checks.length < 2;
  const values = {
    chargeSocSpan: check
      ? Number((check.socEnd - check.socStart).toFixed(1))
      : "—",
    chargeDuration: check ? check.durationMin : "—",
    chargeOrders: check ? check.historyOrders : "—",
    chargeSocUnit: check ? "%" : "",
    chargeDurationUnit: check ? "分钟" : "",
    chargeOrdersUnit: check ? "笔" : "",
  };
  for (const [id, value] of Object.entries(values)) $(id).textContent = value;
  renderChargeBasics(check);
  renderAnnualInspection(check);
  renderDeepInspection(check);
  renderChargeCurve();
}
function renderChargeOptions() {
  const selected = getChargeCheck();
  return getChargeChecks()
    .map(
      (check) =>
        `<button class="vehicle-option check-option" type="button" data-charge-check="${escapeHTML(check.id)}" aria-pressed="${check.id === selected?.id}"><span class="vehicle-copy"><strong><time datetime="${check.completed.split(" ")[0]}">${check.completed.split(" ")[0].replaceAll("-", ".")}</time></strong><small>体检单号：${escapeHTML(check.number)}</small></span>${check.id === selected?.id ? '<img class="icon" src="assets/check-circle-filled.svg" alt="" aria-hidden="true" />' : ""}</button>`,
    )
    .join("");
}
function selectChargeCheck(id) {
  if (!getChargeChecks().some((check) => check.id === id)) return;
  selectedChargeChecks[activeState] = id;
  renderChargeCheck();
  const check = getChargeCheck();
  $("stateAnnouncement").textContent =
    "已切换至" +
    check.completed +
    "体检单，SOC跨度" +
    (check.socEnd - check.socStart) +
    "个百分点，检测时长" +
    check.durationMin +
    "分钟，历史订单" +
    check.historyOrders +
    "笔" +
    (check.demo ? "，演示数据" : "");
  closeSheet();
}
// 字段与数值沿用最终正常 / 高危 HTML 的同车型对比表。
// “电池健康评分”保留原型字段名；不能据安全总分为缺失报告推算此项。
const modelComparisonFields = [
  { key: "healthScore", label: "电池健康评分" },
  { key: "capacity", label: "电池容量" },
  { key: "age", label: "车龄" },
  { key: "monthlyCharges", label: "月平均充电次数" },
  { key: "startSoc", label: "充电开始SOC" },
  { key: "endSoc", label: "充电结束SOC" },
  { key: "chargeDepth", label: "充电深度" },
  { key: "averagePower", label: "平均充电功率" },
  { key: "maxTemperature", label: "最高温度" },
  { key: "voltageSpread", label: "单体电压极差" },
  { key: "maxTemperatureSpread", label: "最大温差" },
];
const modelComparisons = {
  normal: {
    city: "葫芦岛市",
    percentile: 61,
    values: {
      healthScore: ["94.89分", "92.8分"],
      capacity: ["86.94%", "78%"],
      age: ["7年", "6年"],
      monthlyCharges: ["2次", "9次"],
      startSoc: ["34.1%", "49.4%"],
      endSoc: ["78.9%", "75%"],
      chargeDepth: ["44.8%", "25.6%"],
      averagePower: ["29.27kW", "21.35kW"],
      maxTemperature: ["36.2°C", "34.6°C"],
      voltageSpread: ["0.44V", "0.47V"],
      maxTemperatureSpread: ["3.3°C", "2.9°C"],
    },
  },
  watch: {
    // 亚安全演示车只有已知容量数据，同车型均值及其余字段留空。
    values: { capacity: [null, reports.watch.soh + "%"] },
  },
  risk: {
    city: "广州市",
    percentile: 60,
    values: {
      healthScore: ["97.87分", "44.4分"],
      capacity: ["91.6%", "94.8%"],
      age: [null, null],
      monthlyCharges: ["5次", "8次"],
      startSoc: ["40.7%", "26.9%"],
      endSoc: ["84.8%", "99.5%"],
      chargeDepth: ["44.1%", "72.6%"],
      averagePower: ["46.54kW", "42.42kW"],
      maxTemperature: ["36.4°C", "36.6°C"],
      voltageSpread: ["0.05V", "0.30V"],
      maxTemperatureSpread: ["3.9°C", "4.6°C"],
    },
    // 只沿用原型明确标红的本车数据，不按与均值的高低关系推导异常。
    abnormal: ["healthScore", "voltageSpread"],
  },
};
function setModelComparisonExpanded(expanded) {
  $("modelComparisonMore").hidden = !expanded;
  $("modelComparisonToggle").setAttribute("aria-expanded", String(expanded));
  $("modelComparisonToggleText").textContent = expanded
    ? "收起"
    : `查看全部${modelComparisonFields.length}项`;
}
function renderModelComparison(state) {
  const comparison = modelComparisons[state];
  $("modelComparisonCity").textContent = comparison.city || "暂无对比数据";
  $("modelComparisonLocationIcon").hidden = !comparison.city;
  // 排名直接沿用原型；独立于折叠行，不由安全评分或表格均值推算。
  const benchmark = $("modelComparisonBenchmark");
  benchmark.dataset.empty = String(comparison.percentile == null);
  benchmark.style.setProperty("--rank-percent", `${Math.min(100, Math.max(0, comparison.percentile ?? 0))}%`);
  benchmark.innerHTML = comparison.percentile == null
    ? "暂无同车型排名数据"
    : `<img class="benchmark-emblem" src="assets/ranking-trophy.webp" alt="" aria-hidden="true" />
       <div class="benchmark-details">
         <p class="benchmark-copy"><span>已打败同车型</span><strong>${escapeHTML(comparison.percentile)}%</strong><span>的用户</span></p>
         <div class="benchmark-scale" aria-hidden="true"><span class="benchmark-track"><span class="benchmark-fill"></span></span><span class="benchmark-marker"></span></div>
       </div>`;
  $("modelComparisonScope").textContent = comparison.city
    ? `对比口径：${comparison.city} · ${reports[state].vehicle}同车型车辆`
    : "暂无同车型对比数据，仅展示已知本车数据。";
  const rows = modelComparisonFields.map(({ key, label }, index) => {
    const [average, own] = comparison.values[key] || [];
    const ownClass = own == null
      ? "inspection-missing"
      : comparison.abnormal?.includes(key) ? "comparison-value--abnormal" : "";
    return `<tr${index % 2 ? ' class="inspection-row--shaded"' : ""}><th scope="row">${escapeHTML(label)}</th><td${average == null ? ' class="inspection-missing"' : ""}>${escapeHTML(average ?? "-")}</td><td class="${ownClass}">${escapeHTML(own ?? "-")}</td></tr>`;
  });
  $("modelComparisonPreview").innerHTML = rows.slice(0, 3).join("");
  $("modelComparisonMore").innerHTML = rows.slice(3).join("");
  setModelComparisonExpanded(false);
}

// 沿用最终正常 / 高危原型的历史故障统计，不以安全评分或单次检测异常推算故障订单。
const batteryFaultStatistics = {
  normal: { rate: 0, faultOrders: 0, chargeOrders: 10 },
  watch: null,
  risk: { rate: 0, faultOrders: 0, chargeOrders: 9 },
};
function renderBatteryFaults(state) {
  const data = batteryFaultStatistics[state];
  const status = !data ? "missing" : data.faultOrders > 0 ? "fault" : "normal";
  $("batteryFaults").dataset.status = status;
  $("batteryFaultsStatus").textContent = {
    missing: "暂无故障统计",
    fault: "存在历史故障",
    normal: "未发现历史故障",
  }[status];
  const values = {
    batteryFaultRate: data?.rate ?? "-",
    batteryFaultRateUnit: data?.rate != null ? "%" : "",
    batteryFaultOrders: data?.faultOrders ?? "-",
    batteryFaultOrdersUnit: data?.faultOrders != null ? "笔" : "",
    batteryChargeOrders: data?.chargeOrders ?? "-",
    batteryChargeOrdersUnit: data?.chargeOrders != null ? "笔" : "",
  };
  for (const [id, value] of Object.entries(values)) $(id).textContent = value;
}

// SOH 沿用最终原型的容量保持百分比，与右侧各项评分分别展示。
// annualDecay 是年化衰减率原始值；scores.annualDecay 才是对应评分，不得相互代用。
const healthDimensionFields = [
  { key: "annualDecay", label: "电池衰减速率得分" },
  { key: "faultControl", label: "故障率控制得分" },
  { key: "temperatureConsistency", label: "温度一致性得分" },
  { key: "maxTemperature", label: "最高温度控制得分" },
  { key: "socConsistency", label: "SOC 一致性得分" },
  { key: "voltageConsistency", label: "电压一致性得分" },
];
// 本模块使用展示示例，每辆车五项正常、一项偏低；不作为检测事实或诊断依据。
const batteryHealthOverviews = {
  normal: {
    demo: true,
    annualDecay: null,
    scores: {
      annualDecay: 97.6,
      faultControl: 96.2,
      temperatureConsistency: 91.4,
      maxTemperature: 92.8,
      socConsistency: 72.6,
      voltageConsistency: 94.3,
    },
  },
  watch: {
    demo: true,
    annualDecay: null,
    scores: {
      annualDecay: 98.4,
      faultControl: 93.6,
      temperatureConsistency: 95.2,
      maxTemperature: 90.8,
      socConsistency: 54.6,
      voltageConsistency: 92.4,
    },
  },
  risk: {
    demo: true,
    annualDecay: null,
    scores: {
      annualDecay: 98.7,
      faultControl: 92.4,
      temperatureConsistency: 91.6,
      maxTemperature: 93.2,
      socConsistency: 44.4,
      voltageConsistency: 95.0,
    },
  },
};
// 需求 4.2.4 的四档分项规则，独立于顶部安全总分的三档规则。
// 原文 60、80 的端点重叠，此处暂按 60 归轻微异常、80 归需要关注；90 仍为需要关注。
function getHealthScoreLevel(score) {
  if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100) return "missing";
  if (score > 90) return "normal";
  if (score >= 80) return "attention";
  if (score >= 60) return "mild";
  return "severe";
}
function renderBatteryHealth(state) {
  const report = reports[state], overview = batteryHealthOverviews[state];
  const capacity = report.soh == null || report.soh === "" ? NaN : Number(report.soh);
  const capacityMissing = !Number.isFinite(capacity) || capacity < 0 || capacity > 100;
  $("healthCapacityValue").textContent = capacityMissing ? "-" : capacity.toFixed(1);
  $("healthCapacityUnit").textContent = capacityMissing ? "" : "%";
  $("healthCapacityGauge").dataset.missing = String(capacityMissing);
  $("healthCapacityGauge").setAttribute("aria-label", capacityMissing ? "容量健康度 SOH，暂无数据" : `容量健康度 SOH ${capacity.toFixed(1)}%`);
  $("healthCapacityProgress").setAttribute("stroke-dasharray", `${capacityMissing ? 0 : capacity} 100`);
  $("healthDimensionsList").innerHTML = healthDimensionFields.map(({ key, label }) => {
    const score = overview.scores[key], level = getHealthScoreLevel(score);
    const missing = level === "missing";
    return `<div class="health-dimension" data-level="${level}">
      <dt>${escapeHTML(label)}</dt>
      <dd class="health-score-reading"><strong>${missing ? "-" : score.toFixed(1)}</strong>${missing ? "" : '<span class="screenreader-only">分</span>'}</dd>
    </div>`;
  }).join("");
}

// 正常车来自最终原型末尾补充资料；高危车来自其报告的基本信息。
// watch 为虚构展示车辆，参数沿用 Figma 330:2813 的示例；续航仍与报告顶部一致。
// 按最新展示要求，电池类型统一使用“磷酸铁锂”或“三元锂”。
const batteryBasicInformation = {
  normal: {
    estimate: 12758, type: "三元锂", ratedCapacity: "153.0", nominalEnergy: "52.6",
    cellVoltage: "4.3", maxTemperature: "54.0", totalVoltage: "410.0",
  },
  watch: {
    demo: true,
    estimate: 62758, type: "磷酸铁锂", ratedCapacity: "161.2", nominalEnergy: "55",
    cellVoltage: "3.95", maxTemperature: "60", totalVoltage: "422.8",
  },
  risk: {
    estimate: 17174, type: "三元锂", ratedCapacity: "100.0", nominalEnergy: "60.0",
    cellVoltage: "4.25", maxTemperature: "60.0", totalVoltage: "705.6",
  },
};
function renderBatteryBasics(state) {
  const data = batteryBasicInformation[state] ?? {}, report = reports[state];
  const rate = batteryFaultStatistics[state]?.rate;
  $("basicFaultRate").textContent = rate == null ? "-" : `${rate}%`;
  const estimate = data.estimate == null ? null : new Intl.NumberFormat("en-US").format(data.estimate);
  const readings = [
    ["basicEstimate", estimate, "元"],
    ["basicCellVoltage", data.cellVoltage, "V"],
    ["basicMaxTemperature", data.maxTemperature, "°C"],
    ["basicTotalVoltage", data.totalVoltage, "V"],
    ["basicRatedCapacity", data.ratedCapacity, "Ah"],
    ["basicNominalEnergy", data.nominalEnergy, "kWh"],
    ["basicRange", report?.range, "km"],
  ];
  readings.forEach(([id, value, unit]) => {
    $(id).textContent = value ?? "-";
    $(id).dataset.missing = String(value == null);
    $(id + "Unit").textContent = value == null ? "" : unit;
  });
  $("basicBatteryType").textContent = data.type ?? "-";
  $("basicBatteryType").setAttribute("aria-label", data.type ?? "暂无电池类型");
  $("basicBatteryType").dataset.missing = String(data.type == null);
}

let activeState = "normal";
const $ = (id) => document.getElementById(id),
  dialog = $("detailSheet");
function formatPlate(plate) {
  const characters = Array.from(String(plate).replace(/[·•\s]/g, ""));
  return characters.length > 2
    ? characters.slice(0, 2).join("") + "·" + characters.slice(2).join("")
    : characters.join("");
}
function syncVehicleAvailability() {
  const canSwitch = Object.keys(reports).length > 1,
    trigger = $("vehicleSwitch");
  trigger.disabled = !canSwitch;
  $("vehicleSwitchAffordance").hidden = !canSwitch;
  trigger.setAttribute("aria-label", canSwitch ? "切换车辆" : "本次报告车辆");
  if (canSwitch) {
    trigger.dataset.sheet = "vehicles";
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", "detailSheet");
  } else {
    delete trigger.dataset.sheet;
    trigger.removeAttribute("aria-haspopup");
    trigger.removeAttribute("aria-controls");
  }
}
function setState(state) {
  if (!reports[state]) return;
  activeState = state;
  const d = reports[state],
    safety = getSafetyStatus(d.score);
  const values = {
    vehicleName: d.vehicle,
    vehiclePlate: formatPlate(d.plate),
    reportId: d.report,
    updateDate: d.completed.replaceAll("-", "."),
    score: d.score,
    safetyState: safety.label,
    soh: d.soh,
    range: d.range,
  };
  for (const [id, value] of Object.entries(values)) $(id).textContent = value;
  $("updateDate").setAttribute("datetime", d.completed.replace(" ", "T"));
  syncVehicleAvailability();
  renderConclusions(state);
  renderChargeCheck();
  renderModelComparison(state);
  renderBatteryFaults(state);
  renderBatteryHealth(state);
  BatteryProfessionalAnalysis.render(state, getHealthScoreLevel);
  renderBatteryBasics(state);
  $("app").classList.toggle("risk", safety.key === "risk");
  $("app").classList.toggle("watch", safety.key === "watch");
  $("safetyIcon").src = "assets/" + safety.icon + ".svg";
  $("scoreMeter").setAttribute("aria-valuenow", d.score);
  $("scoreMeter").setAttribute(
    "aria-valuetext",
    d.score + " 分，" + safety.label,
  );
  $("stateAnnouncement").textContent =
    formatPlate(d.plate) +
    "，" +
    d.vehicle +
    "，安全评分" +
    d.score +
    "分，安全状态" +
    safety.label;
}
let closeTimer;
let sheetScrollPosition = null;
function lockPageScroll() {
  if (sheetScrollPosition) return;
  sheetScrollPosition = { x: window.scrollX, y: window.scrollY };
  document.body.style.setProperty("--sheet-scroll-top", `${-sheetScrollPosition.y}px`);
  document.documentElement.classList.add("sheet-open");
  document.body.classList.add("sheet-open");
}
function unlockPageScroll() {
  if (!sheetScrollPosition) return;
  const { x, y } = sheetScrollPosition;
  sheetScrollPosition = null;
  document.documentElement.classList.remove("sheet-open");
  document.body.classList.remove("sheet-open");
  document.body.style.removeProperty("--sheet-scroll-top");
  window.scrollTo(x, y);
}
function finishSheetClose() {
  clearTimeout(closeTimer);
  dialog.close();
  dialog.classList.remove("is-closing");
  unlockPageScroll();
}
function closeSheet() {
  if (!dialog.open || dialog.classList.contains("is-closing")) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishSheetClose();
    return;
  }
  dialog.classList.add("is-closing");
  closeTimer = setTimeout(finishSheetClose, 240);
}
dialog.addEventListener("animationend", (event) => {
  if (event.target === dialog && event.animationName === "sheet-exit")
    finishSheetClose();
});
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeSheet();
});
dialog.addEventListener("close", () => {
  if (!dialog.open) unlockPageScroll();
});
function openSheet(type) {
  if (type === "vehicles" && Object.keys(reports).length < 2) return;
  if (type === "charge-records" && getChargeChecks().length < 2) return;
  if (dialog.classList.contains("is-closing")) finishSheetClose();
  const d = reports[activeState],
    safety = getSafetyStatus(d.score);
  let title = "",
    body = "";
  if (type === "score") {
    title = "电池安全评分";
    body =
      '<p>结合本次充电过程、历史充电记录等数据，对电池安全状况进行综合评估，满分 100 分。</p><p><strong>80 分及以上：安全</strong><br>60 分至不足 80 分：亚安全<br>低于 60 分：高危</p><p><strong>安全评分与容量健康度分别反映不同维度。</strong> 容量保持良好，也可能存在需要关注的安全问题。</p><p class="note">本报告用于辅助理解电池状态，不替代整车厂诊断或维修检测。</p>';
  }
  if (type === "soh") {
    title = "容量健康度 SOH";
    body =
      "<p>SOH 反映电池容量的保持水平。本次报告的容量健康度为 <strong>" +
      d.soh +
      "%</strong>，状态为<strong>" +
      d.sohGrade +
      "</strong>。</p><p>它与安全评分分别展示，不能单独用来判断电池是否存在安全隐患。</p>";
  }
  if (type === "range") {
    title = "预计续航";
    body =
      "<p>本次预计续航为 <strong>" +
      d.range +
      ' km</strong>，由 AI 算法估算。</p><p>实际续航会受到气温、路况、驾驶习惯和车辆负载等因素影响。</p><p class="note">这是算法估算结果，并非车辆或 BMS 直接上报。</p>';
  }
  if (type === "evidence") {
    title = "诊断依据";
    body = renderEvidence(activeState);
  }
  if (type === "charge-info") {
    title = "充电体检单";
    const check = getChargeCheck();
    const socExample = check
      ? "本次从" +
        check.socStart +
        "%充至" +
        check.socEnd +
        "%，增加" +
        Number((check.socEnd - check.socStart).toFixed(1)) +
        "个百分点，页面简写为" +
        Number((check.socEnd - check.socStart).toFixed(1)) +
        "%。"
      : "";
    body =
      "<p>每张体检单记录一次充电过程，右侧日期为体检结束时间，可切换查看其他记录。</p><p><strong>SOC 跨度</strong><br>表示本次充电起止电量的差值。" +
      socExample +
      "</p><p><strong>检测时长</strong><br>本次体检覆盖的充电过程时长，以分钟展示。</p><p><strong>历史订单</strong><br>当前体检单所覆盖的历史充电订单数量，数量本身不代表检测数据已达标。</p>" +
      (check?.demo
        ? '<p class="note">当前体检单为演示数据，用于展示日期切换和指标联动。</p>'
        : "");
  }
  if (type === "health-info") {
    title = "电池健康概览";
    // 根据需求 4.2.4 的得分分级及原型字段整理，非原文逐字摘录。
    body = `<p><strong>容量健康度 SOH</strong><br>以百分比表示电池容量的保持水平。SOH 是容量指标，不是评分，与右侧六项评分分别展示。</p><p><strong>六项评分</strong><br>${healthDimensionFields.map(({ label }) => escapeHTML(label)).join("、")}，满分100分。这里展示评分，实际温度、电压等检测值请查看充电体检单。</p><p><strong>分项状态</strong><br>大于90分：正常<br>80–90分：需要关注<br>60分至不足80分：轻微异常<br>0分至不足60分：严重</p><p><strong>电池衰减速率得分</strong><br>该项展示评分，年化衰减率的实际值以 %/年 表示，两者分别提供，不由 SOH 推算。</p>` +
      (batteryHealthOverviews[activeState].demo ? '<p class="note">当前车辆的分项得分为演示数据，用于展示不同状态，不作为实际诊断依据。</p>' : "");
  }
  if (type === "professional-info") {
    title = "电池健康专业分析";
    body = `<p>结合近30天的本车记录与同城同车型数据，查看温度一致性、最高温度、SOC一致性及电压一致性的变化。</p><p><strong>如何查看</strong><br>点击任一项目展开详情，可同时展开多项。红色圆点代表本车记录，绿色曲线代表同城同车型走势。横轴沿用原报告的检测记录顺序。</p><p><strong>数据口径</strong><br>本模块的得分、均值、最高值来自原报告，与上方健康概览的展示示例分别呈现。评分颜色按当前分项分级规则展示。SOC一致性原报告未标明单位，沿用原数值。</p><p class="note">曲线根据原报告截图还原，未提供精确的逐点读数；精确数值以原始记录为准。</p>`;
    if (activeState === "risk") body += '<p class="note">该车SOC一致性原报告的文字均值为0.09，图中均值线标为0.08，此处分别保留原值，需结合原始记录核对。</p>';
    if (activeState === "watch") body = '<p>当前车辆尚未提供专业分析原始数据。各项暂以“-”展示，详情在数据齐全后提供。</p>';
  }
  if (type === "fault-info") {
    title = "电池故障情况";
    const data = batteryFaultStatistics[activeState];
    // 根据原型的字段与统计范围整理，非需求文档中的逐字定义。
    body = data
      ? `<p>统计范围：本报告已覆盖的 <strong>${data.chargeOrders} 笔</strong>历史充电订单。</p><p>其中故障订单 <strong>${data.faultOrders} 笔</strong>，原报告记录的故障率为 <strong>${data.rate}%</strong>。</p><p class="note">此处展示历史订单的故障记录，与电池安全评分、单项检测结果分别展示。</p>`
      : "<p>当前车辆暂无历史故障统计数据，故障率、故障订单数和充电订单数以“-”展示。</p>";
  }
  if (type === "charge-records") {
    title = "切换体检单";
    body = renderChargeOptions();
  }
  if (type === "vehicles") {
    title = "切换车辆";
    body = Object.entries(reports)
      .map(
        ([key, v]) =>
          '<button class="vehicle-option" data-vehicle="' +
          key +
          '" aria-pressed="' +
          (key === activeState) +
          '"><span class="vehicle-preview"><img src="assets/vehicle-preview.png" alt="" width="70" height="36"></span><span class="vehicle-copy"><strong>' +
          formatPlate(v.plate) +
          "</strong><small>" +
          v.vehicle +
          "</small></span>" +
          (key === activeState
            ? '<img class="icon" src="assets/check-circle-filled.svg" alt="" aria-hidden="true" />'
            : "") +
          "</button>",
      )
      .join("");
  }
  dialog.dataset.kind = type;
  $("sheetTitle").textContent = title;
  $("sheetBody").innerHTML = body;
  $("sheetActions").hidden = type !== "evidence";
  dialog.scrollTop = 0;
  if (!dialog.open) {
    lockPageScroll();
    dialog.showModal();
  }
  $("sheetBody").scrollTop = 0;
}
document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-sheet]");
  if (trigger) openSheet(trigger.dataset.sheet);
  const vehicle = event.target.closest("[data-vehicle]");
  if (vehicle) {
    setState(vehicle.dataset.vehicle);
    closeSheet();
  }
  const chargeCheck = event.target.closest("[data-charge-check]");
  if (chargeCheck) selectChargeCheck(chargeCheck.dataset.chargeCheck);
});
document.querySelector(".sheet-close").addEventListener("click", closeSheet);
$("modelComparisonToggle").addEventListener("click", () => {
  setModelComparisonExpanded($("modelComparisonMore").hidden);
});
$("curveTabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-curve]");
  if (tab) selectCurve(tab.dataset.curve);
});
$("curveTabs").addEventListener("keydown", (event) => {
  const keys = Object.keys(curveTypes),
    index = keys.indexOf(activeCurve);
  let next;
  if (event.key === "ArrowRight") next = (index + 1) % keys.length;
  else if (event.key === "ArrowLeft")
    next = (index + keys.length - 1) % keys.length;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = keys.length - 1;
  if (next != null) {
    event.preventDefault();
    selectCurve(keys[next], true);
  }
});
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
document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest("#curvePlot")) clearCurveSample();
});
let curveWidth = 0;
new ResizeObserver((entries) => {
  const width = entries[0].contentRect.width;
  if (Math.abs(width - curveWidth) > 0.5) {
    curveWidth = width;
    keepActiveCurveVisible();
    renderChargeCurve();
  }
}).observe($("curvePlot"));
document
  .querySelector(".evidence-confirm")
  .addEventListener("click", closeSheet);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      closeSheet();
  }
});
setState(Object.keys(reports)[0]);
