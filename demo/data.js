/* 仅供在线演示：所有原型数据、虚构数据和截图曲线坐标均集中在此。
 * 不属于业务接口契约；正式接入时无需加载本文件。
 * normal/risk 含原报告摘录；watch 与概览分项评分为演示；曲线不代表原始测量序列。
 */
(() => {
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
const batteryFaultStatistics = {
  normal: { rate: 0, faultOrders: 0, chargeOrders: 10 },
  watch: null,
  risk: { rate: 0, faultOrders: 0, chargeOrders: 9 },
};
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
// 静态数据：正常/高危参数沿用原型，watch 参数来自 Figma 334:533。
// 标称续航为独立示例字段：normal/risk 为400km，watch 沿用设计稿的468km。
const batteryBasicInformation = {
  normal: {
    type: "三元锂", nominalCapacity: "153.0", nominalEnergy: "52.6", nominalRange: "400",
    cellVoltage: "4.3", maxTemperature: "54.0", totalVoltage: "410.0",
  },
  watch: {
    demo: true,
    type: "磷酸铁锂", nominalCapacity: "161.2", nominalEnergy: "55", nominalRange: "468",
    cellVoltage: "3.95", maxTemperature: "60", totalVoltage: "422.8",
  },
  risk: {
    type: "三元锂", nominalCapacity: "100.0", nominalEnergy: "60.0", nominalRange: "400",
    cellVoltage: "4.25", maxTemperature: "60.0", totalVoltage: "705.6",
  },
};
const professionalFields = [
    { key: "temperature", name: "温度一致性", icon: "professional-temperature.png", unit: "°C" },
    { key: "maximum", name: "最高温度", icon: "professional-maximum-temperature.png", unit: "°C" },
    { key: "soc", name: "SOC 一致性", icon: "professional-soc.png", unit: "" },
    { key: "voltage", name: "电压一致性", icon: "professional-voltage.png", unit: "V" },
  ];
const professionalReports = {
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
window.BatteryGuardianDemoData = Object.freeze({ reports, diagnoses, chargeChecks, annualInspectionData, deepInspectionData, currentCurveSamples, modelComparisons, batteryFaultStatistics, batteryHealthOverviews, batteryBasicInformation, professionalFields, professionalReports });
})();
