/* 无演示数据依赖的浏览器验收。所有测试只操作当前验收页的 fixture。 */
(() => {
  const root = document.querySelector("#uiFixture");
  let ui = BatteryGuardianUI.create(root);
  const dialog = root.querySelector("dialog");
  const body = root.querySelector("[data-bg-sheet-body]");
  const button = document.querySelector("#runChecks");
  const results = document.querySelector("#testResults");
  const summary = document.querySelector("#testSummary");
  const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const assert = (value, message) => { if (!value) throw new Error(message); };
  function content() {
    const fragment = document.createDocumentFragment();
    for (let i = 1; i <= 16; i++) {
      const paragraph = document.createElement("p");
      paragraph.textContent = `第 ${i} 段验收内容：上下滑动这里，确认抽屉能滚动而底层页面保持不动。`;
      fragment.append(paragraph);
    }
    return fragment;
  }
  document.querySelector("#openFixtureSheet").addEventListener("click", () => ui.openSheet({ title: "交互验收", content: content(), kind: "evidence", showConfirm: true }));
  root.addEventListener("bg:tabchange", event => { document.querySelector("#fixtureChartText").textContent = `${event.detail.key === "current" ? "电流" : "电压"}曲线：由前端挂载图表。`; });
  button.addEventListener("click", async () => {
    button.disabled = true;
    results.replaceChildren();
    summary.textContent = "检查中…";
    let passed = 0, failed = 0;
    const test = async (name, run) => {
      const li = document.createElement("li");
      try { await run(); li.textContent = `通过 · ${name}`; li.dataset.pass = "true"; passed++; }
      catch (error) { li.textContent = `失败 · ${name}：${error.message}`; li.dataset.pass = "false"; failed++; await ui.closeSheet(); }
      results.append(li);
    };
    await test("UI 独立加载，未引入演示脚本", () => {
      assert(![...document.scripts].some(script => /\/demo\//.test(script.src)), "存在 demo 脚本");
      assert(BatteryGuardianUI.create(root) === ui, "重复挂载产生了不同实例");
    });
    await test("字体文件加载成功且命名明确", async () => {
      const fonts = await document.fonts.load('600 20px "BatteryGuardianDIN"', "0123456789.%VAh");
      assert(fonts.length > 0 && fonts.every(font => font.status === "loaded"), "D-DIN 字体未加载");
      assert(getComputedStyle(document.querySelector("#fontSample")).fontFamily.includes("BatteryGuardianDIN"), "数字未引用专用字体");
    });
    await test("宿主按钮未被报告样式覆盖", () => {
      const style = getComputedStyle(document.querySelector("#hostButton"));
      assert(style.borderTopStyle === "dashed" && style.fontWeight === "400" && style.color === "rgb(88, 65, 140)", "样式越界");
      for (const sheet of [...document.styleSheets].filter(sheet => /\/css\//.test(sheet.href || ""))) {
        const inspect = rules => [...rules].forEach(rule => {
          if (rule.type === CSSRule.STYLE_RULE) assert(rule.selectorText.includes("[data-battery-report]"), `未限定作用域：${rule.selectorText}`);
          else if (rule.type === CSSRule.MEDIA_RULE || rule.type === CSSRule.SUPPORTS_RULE) inspect(rule.cssRules);
        });
        inspect(sheet.cssRules);
      }
    });
    await test("图表坐标使用系统 10px 字体，颜色与主题一致", () => {
      const axis = getComputedStyle(root.querySelector(".curve-axis"));
      assert(axis.fontSize === `${BatteryGuardianChartTheme.axis.fontSize}px` && axis.fontWeight === "400" && !axis.fontFamily.includes("BatteryGuardianDIN"), "坐标轴字体不符");
      assert(getComputedStyle(root.querySelector(".curve-line--actual")).stroke === "rgb(0, 189, 161)", "曲线颜色不符");
    });
    await test("抽屉动画、遮罩、圆角及焦点外圈", async () => {
      ui.openSheet({ title: "自动验收", content: content(), kind: "evidence", showConfirm: true });
      const style = getComputedStyle(dialog), mask = getComputedStyle(dialog, "::backdrop");
      assert(style.borderTopLeftRadius === "20px" && style.paddingTop === "16px", "圆角或内边距不符");
      assert(mask.backgroundColor === "rgba(0, 0, 0, 0.6)" && mask.backdropFilter === "none", "遮罩不符");
      assert(getComputedStyle(root.querySelector(".sheet-close")).outlineStyle === "none", "出现焦点外圈");
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) assert(style.animationName === "bg-sheet-enter" && style.animationDuration === "0.28s", "打开动画不符");
      await ui.closeSheet();
    });
    await test("锁住底层、内部可滚动、关闭恢复位置", async () => {
      const savedY = window.scrollY;
      const savedPosition = document.body.style.getPropertyValue("position");
      ui.openSheet({ content: content(), kind: "evidence", showConfirm: true });
      await frame();
      assert(getComputedStyle(document.body).position === "fixed", "底层未固定");
      const pageTop = root.getBoundingClientRect().top;
      window.scrollBy(0, 200);
      body.scrollTop = 90;
      await frame();
      assert(Math.abs(root.getBoundingClientRect().top - pageTop) < 1, "底层发生位移");
      assert(body.scrollTop > 0, "抽屉内容无法滚动");
      await ui.closeSheet();
      assert(Math.abs(window.scrollY - savedY) < 1 && document.body.style.getPropertyValue("position") === savedPosition, "页面位置或宿主样式未恢复");
    });
    await test("关闭等待动画完成，时长随 CSS 配置变化", async () => {
      root.style.setProperty("--bg-sheet-exit-duration", "360ms");
      try {
        ui.openSheet({ content: "关闭时长检查" });
        const closing = ui.closeSheet();
        if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
          assert(dialog.open, "关闭动画尚未播放就移除了弹窗");
          assert(getComputedStyle(dialog).animationDuration === "0.36s", "未读取 CSS 时长");
          await delay(150);
          assert(dialog.open, "动画未结束就关闭了抽屉");
        }
        await closing;
        assert(!dialog.open, "动画后未关闭");
      } finally { root.style.removeProperty("--bg-sheet-exit-duration"); }
    });
    await test("确认按钮、关闭按钮及取消均正常释放锁", async () => {
      for (const method of ["confirm", "close", "cancel"]) {
        ui.openSheet({ content: "关闭方式检查", showConfirm: true });
        if (method === "cancel") dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
        else root.querySelector(`[data-bg-sheet-${method}]`).click();
        await ui.closeSheet();
        assert(!dialog.open && getComputedStyle(document.body).position !== "fixed", `${method} 未释放`);
      }
    });
    await test("快速关闭后重开，不被旧回调关闭", async () => {
      ui.openSheet({ content: "旧内容" });
      const previous = ui.closeSheet();
      ui.openSheet({ title: "新抽屉", content: "新内容" });
      await previous;
      await delay(400);
      assert(dialog.open && body.textContent === "新内容", "旧关闭回调影响新抽屉");
      await ui.closeSheet();
    });
    await test("折叠、Tab 切换独立可用", async () => {
      const toggle = root.querySelector("#fixtureToggle"), panel = root.querySelector("#fixturePanel");
      toggle.click();
      assert(toggle.getAttribute("aria-expanded") === "true" && !panel.inert, "展开失败");
      toggle.click();
      assert(panel.inert, "收起失败");
      root.querySelector("#fixtureVoltage").click();
      assert(root.querySelector("#fixtureVoltage").getAttribute("aria-selected") === "true" && root.querySelector("#fixtureChartText").textContent.startsWith("电压"), "Tab 或通知失败");
      root.querySelector("#fixtureCurrent").click();
    });
    await test("卸载组件释放滚动锁，重新挂载不重复监听", () => {
      const y = window.scrollY;
      ui.openSheet({ content: "卸载检查" });
      ui.destroy();
      assert(!dialog.open && getComputedStyle(document.body).position !== "fixed" && Math.abs(window.scrollY - y) < 1, "卸载后残留锁");
      ui = BatteryGuardianUI.create(root);
      const toggle = root.querySelector("#fixtureToggle");
      toggle.click();
      assert(toggle.getAttribute("aria-expanded") === "true", "发生重复监听");
      toggle.click();
    });
    summary.textContent = `${passed} 项通过，${failed} 项失败。真机触摸检查仍需按下方说明完成。`;
    summary.dataset.result = failed ? "failed" : "passed";
    button.disabled = false;
  });
})();
