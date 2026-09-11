/* 图表视觉参数，无数据、无绘图库依赖。Canvas/ECharts 需将这些参数映射到对应配置。 */
(() => {
  const systemFont = '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
  const theme = {
    fonts: { system: systemFont, number: "BatteryGuardianDIN", numberWeight: 600 },
    axis: { fontFamily: systemFont, fontSize: 10, fontWeight: 400 },
    charge: {
      height: 212, plot: { left: 30, right: 16, top: 18, bottom: 34 },
      frame: { color: "#eff5f7", width: 1, radius: 10 },
      axisColor: "#8b9a9f", axisLineColor: "#dce6e9", axisLineWidth: 0.5,
      gridColor: "#e2eaed", gridWidth: 0.5, gridDash: [3, 4],
      requestedColor: "#f27d78", actualColor: "#00bda1", lineWidth: 2, lineCap: "round",
      legend: { fontFamily: systemFont, fontSize: 11, fontWeight: 400, color: "#60747c", gap: 12 },
      xAxisLabelCount: 5, xAxisLabelAlign: "center", emptyText: "暂无曲线数据",
    },
    professional: {
      height: 168, plot: { left: 35, right: 13, top: 14, bottom: 26 },
      axisColor: "#94a1a6", axisLineColor: "#e6edef",
      gridColor: "#eff3f5", gridWidth: 1, gridDash: [3, 3],
      ownColor: "#f27d86", peerColor: "#00bda1", peerLineWidth: 1.8,
      ownPointRadius: 2.6, peerPointRadius: 1.7, peerPointBorderWidth: 1.2,
      meanLine: { width: 1, dash: [4, 3], ownOpacity: 0.7, peerOpacity: 0.5 },
      legend: { fontFamily: systemFont, fontSize: 11, fontWeight: 400, meanSampleWidth: 24 },
    },
  };
  const freeze = value => { Object.values(value).forEach(item => { if (item && typeof item === "object") freeze(item); }); return Object.freeze(value); };
  window.BatteryGuardianChartTheme = freeze(theme);
})();
