/* 电池卫士可复用交互层：无车辆数据、评分规则、图表实现或第三方依赖。 */
(() => {
  "use strict";
  const instances = new WeakMap();
  const scrollLocks = new Map();

  function overrideStyles(element, values) {
    const previous = Object.keys(values).map(key => [key, element.style.getPropertyValue(key), element.style.getPropertyPriority(key)]);
    Object.entries(values).forEach(([key, value]) => element.style.setProperty(key, value, "important"));
    return () => previous.forEach(([key, value, priority]) => {
      if (value) element.style.setProperty(key, value, priority);
      else element.style.removeProperty(key);
    });
  }

  // 固定 body 兼容 iOS；只恢复本组件改过的属性，避免覆盖宿主的其他内联样式。
  function lockScroll(owner, doc) {
    const existing = scrollLocks.get(doc);
    if (existing) { existing.owners.add(owner); return; }
    const win = doc.defaultView, x = win.scrollX, y = win.scrollY;
    const restoreBody = overrideStyles(doc.body, {
      position: "fixed", top: `${-y}px`, left: `${-x}px`, width: "100%", overflow: "hidden",
    });
    const restoreRoot = overrideStyles(doc.documentElement, { overflow: "hidden", "overscroll-behavior": "none" });
    scrollLocks.set(doc, { owners: new Set([owner]), x, y, restoreBody, restoreRoot });
  }
  function unlockScroll(owner, doc) {
    const lock = scrollLocks.get(doc);
    if (!lock) return;
    lock.owners.delete(owner);
    if (lock.owners.size) return;
    scrollLocks.delete(doc);
    lock.restoreRoot();
    lock.restoreBody();
    const restoreBehavior = overrideStyles(doc.documentElement, { "scroll-behavior": "auto" });
    doc.defaultView.scrollTo(lock.x, lock.y);
    restoreBehavior();
  }

  function animationTime(element) {
    const style = element.ownerDocument.defaultView.getComputedStyle(element);
    const milliseconds = value => parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1000) || 0;
    const durations = style.animationDuration.split(",").map(milliseconds);
    const delays = style.animationDelay.split(",").map(milliseconds);
    return Math.max(0, ...durations.map((duration, i) => duration + delays[i % delays.length]));
  }

  function create(root) {
    if (!root?.matches("[data-battery-report]")) throw new Error("UI 根节点需要 data-battery-report 属性。");
    if (instances.has(root)) return instances.get(root);
    const doc = root.ownerDocument;
    const dialog = root.querySelector("[data-bg-sheet]");
    const removers = [];
    let destroyed = false, timer, pendingClose, resolveClose, closeReason;
    const emit = (name, detail) => root.dispatchEvent(new CustomEvent(`bg:${name}`, { detail, bubbles: true }));
    const listen = (target, type, handler, options) => {
      target.addEventListener(type, handler, options);
      removers.push(() => target.removeEventListener(type, handler, options));
    };
    const findPanel = control => {
      const id = control.getAttribute("aria-controls");
      return id ? [...root.querySelectorAll("[id]")].find(node => node.id === id) : null;
    };

    function finishClose(reason = closeReason || "close") {
      clearTimeout(timer);
      const wasOpen = !!dialog?.open;
      if (wasOpen) dialog.close();
      dialog?.classList.remove("is-closing");
      unlockScroll(root, doc);
      const resolve = resolveClose;
      pendingClose = resolveClose = null;
      if (resolve) resolve();
      if (wasOpen) emit("sheetclose", { reason });
    }
    function closeSheet(reason = "close") {
      if (!dialog?.open) return Promise.resolve();
      if (pendingClose) return pendingClose;
      closeReason = reason;
      pendingClose = new Promise(resolve => { resolveClose = resolve; });
      const result = pendingClose;
      if (doc.defaultView.matchMedia("(prefers-reduced-motion: reduce)").matches) finishClose(reason);
      else {
        dialog.classList.add("is-closing");
        // 超时兜底跟随实际 CSS 时长，避免修改动画后 JS 提前移除弹窗。
        timer = setTimeout(() => finishClose(reason), animationTime(dialog) + 80);
      }
      return result;
    }
    function openSheet({ title = "", content, kind = "", showConfirm = false, confirmLabel = "我知道了" } = {}) {
      if (destroyed) throw new Error("该 UI 实例已经销毁。");
      if (!dialog) throw new Error("根节点中缺少 data-bg-sheet 抽屉。");
      if (pendingClose) finishClose("replace");
      dialog.dataset.kind = kind;
      root.querySelector("[data-bg-sheet-title]").textContent = title;
      const body = root.querySelector("[data-bg-sheet-body]");
      if (content !== undefined) body.replaceChildren(content); // 接收 DOM 节点或纯文本，不注入 HTML 字符串。
      const actions = root.querySelector("[data-bg-sheet-actions]");
      if (actions) actions.hidden = !showConfirm;
      const confirm = root.querySelector("[data-bg-sheet-confirm]");
      if (confirm) confirm.textContent = confirmLabel;
      dialog.scrollTop = body.scrollTop = 0;
      if (!dialog.open) {
        lockScroll(root, doc);
        try { dialog.showModal(); }
        catch (error) { unlockScroll(root, doc); throw error; }
      }
      emit("sheetopen", { kind });
    }

    function setExpanded(toggle, expanded, { notify = true } = {}) {
      const panel = findPanel(toggle);
      if (!panel) return;
      toggle.setAttribute("aria-expanded", String(expanded));
      panel.setAttribute("aria-hidden", String(!expanded));
      panel.inert = !expanded;
      if (toggle.dataset.bgDisclosure === "animated") {
        const item = toggle.closest("[data-bg-disclosure-item]");
        if (item) item.dataset.open = String(expanded);
      } else panel.hidden = !expanded;
      const label = toggle.querySelector("[data-bg-disclosure-label]");
      const text = expanded ? toggle.dataset.bgLabelExpanded : toggle.dataset.bgLabelCollapsed;
      if (label && text != null) label.textContent = text;
      if (notify) emit("disclosurechange", { toggle, panel, expanded });
    }
    function keepTabVisible(group) {
      const tab = group.querySelector('[data-bg-tab][aria-selected="true"]');
      if (!tab) return;
      const a = tab.getBoundingClientRect(), b = group.getBoundingClientRect();
      const inset = parseFloat(doc.defaultView.getComputedStyle(group).paddingLeft) || 0;
      if (a.left < b.left + inset) group.scrollLeft -= b.left + inset - a.left;
      else if (a.right > b.right - inset) group.scrollLeft += a.right - b.right + inset;
    }
    function selectTab(tab, { notify = true } = {}) {
      const group = tab.closest("[data-bg-tabs]");
      if (!group || !root.contains(group)) return;
      group.querySelectorAll("[data-bg-tab]").forEach(item => {
        item.setAttribute("aria-selected", String(item === tab));
        item.tabIndex = item === tab ? 0 : -1;
      });
      const panel = findPanel(tab);
      if (panel) panel.setAttribute("aria-labelledby", tab.id);
      keepTabVisible(group);
      if (notify) emit("tabchange", { key: tab.dataset.bgTab, tab, panel });
    }

    listen(root, "click", event => {
      const target = event.target.closest?.("button");
      if (!target || !root.contains(target)) return;
      if (target.matches("[data-bg-sheet-close]")) closeSheet("close-button");
      else if (target.matches("[data-bg-sheet-confirm]")) { emit("sheetconfirm", {}); closeSheet("confirm"); }
      else if (target.matches("[data-bg-disclosure]")) setExpanded(target, target.getAttribute("aria-expanded") !== "true");
      else if (target.matches("[data-bg-tab]")) selectTab(target);
    });
    if (dialog) {
      listen(dialog, "animationend", event => {
        if (event.target === dialog && event.animationName === "bg-sheet-exit" && pendingClose) finishClose();
      });
      listen(dialog, "cancel", event => { event.preventDefault(); closeSheet("cancel"); });
      listen(dialog, "close", () => { if (!dialog.open) finishClose("native-close"); });
      listen(dialog, "click", event => {
        if (event.target !== dialog) return;
        const box = dialog.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeSheet("backdrop");
      });
    }
    const api = Object.freeze({
      openSheet, closeSheet, setExpanded, selectTab, keepTabVisible,
      destroy() {
        if (destroyed) return;
        destroyed = true;
        removers.forEach(remove => remove());
        finishClose("destroy");
        instances.delete(root);
      },
    });
    instances.set(root, api);
    return api;
  }
  window.BatteryGuardianUI = Object.freeze({ create, version: "1.0.0" });
})();
