/* 演示报告：连接车辆数据、页面渲染和图表；正式项目由前端替换数据及业务逻辑。 */
(() => {
const { reports, diagnoses, chargeChecks, annualInspectionData, deepInspectionData, currentCurveSamples, modelComparisons, batteryFaultStatistics, batteryHealthOverviews, batteryBasicInformation } = BatteryGuardianDemoData;
// normal、risk 沿用用户提供的原型数据；watch 的车辆、标识和指标均为虚构演示数据。
// 结论来源：正式需求 4.2.4 + 用户交付原型中的本车数据；短文案经过面向用户的整理。
// 安全总分的三档映射与单项指标严重程度独立。SOC / 电压指标均不足 60 分，按需求标为严重。
// 每条结论关联一条依据；最多 3 条结论，连同完整处置建议最多 4 条依据。
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
  const summaryItems = [
    { level: "attention", count: attention, label: "需关注" },
    { level: "severe", count: severe, label: "严重" },
  ].filter(({ count }) => count > 0);
  summary.innerHTML = summaryItems
    .map(({ level, count, label }) => `<span class="conclusions-summary-item" data-level="${level}">${count}项${label}</span>`)
    .join('<span class="conclusions-summary-separator">、</span>');
  summary.hidden = summaryItems.length === 0;
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
const annualInspectionFields = [
  { key: "temperature", label: "最高温度" },
  { key: "maxVoltage", label: "最高电压" },
  { key: "minVoltage", label: "最低电压" },
  { key: "voltageDifference", label: "电压极差" },
];
// 数值、阈值和结果对应原型的本次体检记录；其他历史记录未提供的项目保持未评估。
const deepInspectionFields = [
  { key: "temperatureDifference", label: "最大温差" },
  { key: "temperatureRiseRate", label: "最大温升速率" },
  { key: "socChangeRate", label: "SOC变化速率" },
  { key: "totalVoltage", label: "总电压" },
  { key: "stopReason", label: "停充原因", type: "text", mergeReference: true },
];
// 深度项目沿用两份原型的本次体检数据；缺少检测值时保留参考阈值，不推断结果。
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
  chargeCurve.render();
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
function setModelComparisonExpanded(expanded) {
  const toggle = $("modelComparisonToggle");
  toggle.dataset.bgLabelCollapsed = `查看全部${modelComparisonFields.length}项`;
  ui.setExpanded(toggle, expanded, { notify: false });
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

// 左侧安全评分直接读取报告总分，与页面顶部共用数据和安全状态规则。
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
  const score = report.score == null || report.score === "" ? NaN : Number(report.score);
  const scoreMissing = !Number.isFinite(score) || score < 0 || score > 100;
  const safety = scoreMissing ? null : getSafetyStatus(report.score);
  $("healthSafetyValue").textContent = scoreMissing ? "-" : report.score;
  $("healthSafetyUnit").textContent = scoreMissing ? "" : "分";
  $("healthSafetyGauge").dataset.missing = String(scoreMissing);
  $("healthSafetyGauge").dataset.state = safety?.key ?? "missing";
  $("healthSafetyGauge").setAttribute("aria-label", scoreMissing ? "电池安全评分，暂无数据" : `电池安全评分 ${report.score}分，${safety.label}`);
  $("healthSafetyProgress").setAttribute("stroke-dasharray", `${scoreMissing ? 0 : score} 100`);
  $("healthDimensionsList").innerHTML = healthDimensionFields.map(({ key, label }) => {
    const score = overview.scores[key], level = getHealthScoreLevel(score);
    const missing = level === "missing";
    return `<div class="health-dimension" data-level="${level}">
      <dt>${escapeHTML(label)}</dt>
      <dd class="health-score-reading"><strong>${missing ? "-" : score.toFixed(1)}</strong>${missing ? "" : '<span class="health-score-unit">分</span>'}</dd>
    </div>`;
  }).join("");
}

// 静态参数按 Figma 334:533 展示。标称续航使用独立字段，不读取 reports.range。
function renderBatteryBasics(state) {
  const data = batteryBasicInformation[state] ?? {};
  const readings = [
    ["basicNominalCapacity", data.nominalCapacity, "Ah"],
    ["basicCellVoltage", data.cellVoltage, "V"],
    ["basicMaxTemperature", data.maxTemperature, "°C"],
    ["basicTotalVoltage", data.totalVoltage, "V"],
    ["basicNominalEnergy", data.nominalEnergy, "kWh"],
    ["basicNominalRange", data.nominalRange, "km"],
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
const root = document.querySelector("[data-battery-report]");
const $ = id => root.querySelector(`#${id}`);
const ui = BatteryGuardianUI.create(root);
const chargeCurve = BatteryGuardianDemoChargeCurve.create({ root, ui, getChargeCheck, curveTypes });
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
  BatteryGuardianDemoProfessionalAnalysis.render(state, getHealthScoreLevel, root);
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
const closeSheet = () => ui.closeSheet();
function openSheet(type) {
  if (type === "vehicles" && Object.keys(reports).length < 2) return;
  if (type === "charge-records" && getChargeChecks().length < 2) return;
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
    body = `<p><strong>电池安全评分</strong><br>圆环展示本车的电池安全评分，与报告顶部的总分一致，满分100分。80分及以上为安全，60分至不足80分为亚安全，低于60分为高危。</p><p><strong>六项评分</strong><br>${healthDimensionFields.map(({ label }) => escapeHTML(label)).join("、")}，满分100分。这里展示评分，实际温度、电压等检测值请查看充电体检单。</p><p><strong>分项状态</strong><br>大于90分：正常<br>80–90分：需要关注<br>60分至不足80分：轻微异常<br>0分至不足60分：严重</p><p><strong>电池衰减速率得分</strong><br>该项展示评分，年化衰减率的实际值以 %/年 表示，两者分别提供。</p>` +
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
  const template = document.createElement("template");
  template.innerHTML = body; // 本文件中的模板只用于演示；接口文本需转义后渲染。
  ui.openSheet({ title, content: template.content, kind: type, showConfirm: type === "evidence" });
}
root.addEventListener("click", (event) => {
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
setState(Object.keys(reports)[0]);
})();
