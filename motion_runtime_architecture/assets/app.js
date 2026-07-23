(function () {
  "use strict";

  const DATA = window.MOTION_ARCH_DATA;
  if (!DATA) return;

  const $ = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function list(items, className = "plain-list") {
    return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function chips(items) {
    return `<div class="chip-row">${items.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>`;
  }

  function badge(text, tone = "") {
    return `<span class="badge ${escapeHtml(tone)}">${escapeHtml(text)}</span>`;
  }

  function renderNav() {
    const nav = $("site-nav");
    if (!nav) return;
    const current = document.body.dataset.page || "overview";
    nav.innerHTML = DATA.nav.map(([href, label, id]) => `
      <a href="${escapeHtml(href)}" class="${id === current ? "active" : ""}">${escapeHtml(label)}</a>
    `).join("");

    const title = $("site-title");
    if (title) title.textContent = DATA.meta.title;
    const meta = $("site-meta");
    if (meta) meta.textContent = `${DATA.meta.version} · ${DATA.meta.status} · ${DATA.meta.updated}。${DATA.meta.note}`;
  }

  function renderPrinciples() {
    const root = $("principle-grid");
    if (!root) return;
    root.innerHTML = DATA.principles.map((item, index) => `
      <article class="card principle-card reveal" style="--delay:${index * 45}ms">
        ${badge(item.tag, item.tag)}
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.text)}</p>
      </article>
    `).join("");
  }

  function renderLayers() {
    const root = $("architecture-layers");
    if (!root) return;
    root.innerHTML = DATA.layers.map((layer, index) => `
      <article class="architecture-layer ${escapeHtml(layer.tone)} reveal" style="--delay:${index * 55}ms">
        <header>
          <span class="layer-index">${String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3>${escapeHtml(layer.name)}</h3>
            <p>${escapeHtml(layer.purpose)}</p>
          </div>
        </header>
        <div class="layer-items">
          ${layer.items.map(([name, text]) => `
            <div class="layer-item">
              <strong>${escapeHtml(name)}</strong>
              <span>${escapeHtml(text)}</span>
            </div>
          `).join("")}
        </div>
      </article>
    `).join("");
  }

  function renderNumberedFlow(rootId, data) {
    const root = $(rootId);
    if (!root) return;
    root.innerHTML = data.map(([number, title, text], index) => `
      <article class="flow-card reveal" style="--delay:${index * 35}ms">
        <span class="flow-number">${escapeHtml(number)}</span>
        <div>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(text)}</p>
        </div>
      </article>
    `).join("");
  }

  function renderKeyConcepts() {
    const root = $("key-concepts");
    if (!root) return;
    root.innerHTML = DATA.keyConcepts.map((item) => `
      <article class="card concept-card">
        ${badge(item.lifetime, "muted")}
        <h3>${escapeHtml(item.name)}</h3>
        <strong>${escapeHtml(item.question)}</strong>
        <p>${escapeHtml(item.answer)}</p>
      </article>
    `).join("");
  }

  function renderPageLinks() {
    const root = $("page-links");
    if (!root) return;
    const descriptions = {
      flows: "从 SystemConfig 构建并冻结 ObjectGraph，再看 TaskGraph 如何驱动一次 MotionJob。",
      modules: "逐个查看主要对象、家族接口、依赖绑定、不变量、错误和测试面。",
      execution: "明确速度字段、轨迹拼接、时间参数化、主站实时插值和多轴协同。",
      runtime: "比较真机、数字孪生、Fake 与 Replay 运行对象的绑定和等价合同。",
      testing: "列出无 ROS、孪生、ROS 集成、主站 SIL 和 HIL，以及所有应模拟故障。",
      technology: "查看 C++/Python/ROS/MoveIt 的对象边界、单程序目录和迁移顺序。"
    };
    root.innerHTML = DATA.nav.filter(([, , id]) => id !== "overview").map(([href, label, id], index) => `
      <a class="card link-card reveal" style="--delay:${index * 45}ms" href="${escapeHtml(href)}">
        <span class="link-arrow">↗</span>
        <h3>${escapeHtml(label)}</h3>
        <p>${escapeHtml(descriptions[id])}</p>
      </a>
    `).join("");
  }

  function renderLifecycle() {
    const root = $("lifecycle-states");
    if (!root) return;
    root.innerHTML = DATA.lifecycleStates.map(([state, text, tone], index) => `
      <article class="state-node ${escapeHtml(tone)}">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <h3>${escapeHtml(state)}</h3>
        <p>${escapeHtml(text)}</p>
      </article>
    `).join("");
  }

  function renderTimeline(rootId, data) {
    const root = $(rootId);
    if (!root) return;
    root.innerHTML = data.map(([number, title, text, output], index) => `
      <article class="timeline-row">
        <div class="timeline-marker"><span>${escapeHtml(number)}</span></div>
        <div class="timeline-body">
          <div class="timeline-title">
            <h3>${escapeHtml(title)}</h3>
            ${badge(output, index === data.length - 1 ? "ready" : "muted")}
          </div>
          <p>${escapeHtml(text)}</p>
        </div>
      </article>
    `).join("");
  }

  function renderCommunication() {
    const root = $("communication-grid");
    if (!root) return;
    root.innerHTML = DATA.communicationTypes.map((item) => `
      <article class="card communication-card">
        <div class="card-heading">
          <h3>${escapeHtml(item.name)}</h3>
          ${badge(item.cardinality, "muted")}
        </div>
        <p><strong>例：</strong>${escapeHtml(item.example)}</p>
        <p>${escapeHtml(item.rule)}</p>
      </article>
    `).join("");
  }

  function renderPairList(rootId, data) {
    const root = $(rootId);
    if (!root) return;
    root.innerHTML = data.map(([name, text]) => `
      <div class="pair-row">
        <strong>${escapeHtml(name)}</strong>
        <span>${escapeHtml(text)}</span>
      </div>
    `).join("");
  }

  function renderSnapshots() {
    const root = $("snapshot-grid");
    if (!root) return;
    root.innerHTML = DATA.snapshotLayers.map((item) => `
      <article class="card snapshot-card">
        ${badge(item.lifetime, "muted")}
        <h3>${escapeHtml(item.name)}</h3>
        <p><strong>内容：</strong>${escapeHtml(item.data)}</p>
        <p><strong>失效规则：</strong>${escapeHtml(item.invalidation)}</p>
      </article>
    `).join("");
  }

  let moduleFilter = "all";

  function moduleMatches(item, query) {
    if (moduleFilter !== "all" && item.group !== moduleFilter) return false;
    const text = [
      item.name, item.group, item.lifetime, item.purpose, item.stack,
      ...item.inputs, ...item.outputs, ...item.owns, ...item.invariants, ...item.errors
    ].join(" ").toLowerCase();
    return text.includes(query.toLowerCase());
  }

  function renderModuleFilters() {
    const root = $("module-filters");
    if (!root) return;
    root.innerHTML = DATA.moduleGroups.map(([id, label]) => `
      <button class="filter-button ${id === moduleFilter ? "active" : ""}" data-filter="${escapeHtml(id)}">${escapeHtml(label)}</button>
    `).join("");
    root.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        moduleFilter = button.dataset.filter;
        renderModuleFilters();
        renderModules();
      });
    });
  }

  function renderModules() {
    const root = $("module-grid");
    if (!root) return;
    const query = ($("module-search")?.value || "").trim();
    const items = DATA.modules.filter((item) => moduleMatches(item, query));
    root.innerHTML = items.map((item) => `
      <details class="module-card" id="${escapeHtml(item.id)}">
        <summary>
          <div>
            <span class="eyebrow">${escapeHtml(item.group)} · ${escapeHtml(item.lifetime)}</span>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.purpose)}</p>
          </div>
          <span class="details-icon">＋</span>
        </summary>
        <div class="module-detail">
          <div class="module-column">
            <h4>Interface 输入</h4>${list(item.inputs)}
            <h4>Interface 输出</h4>${list(item.outputs)}
            <h4>拥有的责任</h4>${list(item.owns)}
          </div>
          <div class="module-column">
            <h4>不变量</h4>${list(item.invariants)}
            <h4>结构化错误</h4>${chips(item.errors)}
            <h4>技术栈</h4><p>${escapeHtml(item.stack)}</p>
            <h4>Interface 测试面</h4><p>${escapeHtml(item.tests)}</p>
          </div>
        </div>
      </details>
    `).join("");
    const count = $("module-count");
    if (count) count.textContent = `${items.length} / ${DATA.modules.length} 个模块`;
  }

  function bindModuleSearch() {
    const search = $("module-search");
    if (search) search.addEventListener("input", renderModules);
  }

  function renderInterfaceFamilies() {
    const root = $("interface-families");
    if (!root) return;
    root.innerHTML = DATA.interfaceFamilies.map((item) => `
      <article class="card family-card">
        <span class="eyebrow">${escapeHtml(item.registry)}</span>
        <h3>${escapeHtml(item.family)}</h3>
        <h4>准确 Interface</h4>${chips(item.interfaces)}
        <h4>可能实现</h4>${chips(item.adapters)}
        <h4>启动兼容检查</h4><p>${escapeHtml(item.compatibility)}</p>
      </article>
    `).join("");
  }

  function renderTable(rootId, rows, headers) {
    const root = $(rootId);
    if (!root) return;
    root.innerHTML = `
      <div class="table-row table-head">${headers.map((item) => `<strong>${escapeHtml(item)}</strong>`).join("")}</div>
      ${rows.map((row) => `<div class="table-row">${row.map((cell, index) => `<${index === 0 ? "strong" : "span"}>${escapeHtml(cell)}</${index === 0 ? "strong" : "span"}>`).join("")}</div>`).join("")}
    `;
    root.style.setProperty("--columns", headers.length);
  }

  function renderTrajectoryPipeline() {
    const root = $("trajectory-pipeline");
    if (!root) return;
    root.innerHTML = DATA.trajectoryPipeline.map(([name, text, tone], index) => `
      <article class="pipeline-step ${escapeHtml(tone)}">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <h3>${escapeHtml(name)}</h3>
        <p>${escapeHtml(text)}</p>
      </article>
    `).join("");
  }

  function renderResponsibilities() {
    const root = $("execution-responsibilities");
    if (!root) return;
    root.innerHTML = DATA.executionResponsibilities.map((item) => `
      <article class="responsibility-row">
        <div class="responsibility-name">
          <h3>${escapeHtml(item.layer)}</h3>
          ${badge(item.clock, "muted")}
        </div>
        <div><h4>负责</h4>${list(item.owns)}</div>
        <div><h4>不负责</h4>${list(item.rejects)}</div>
      </article>
    `).join("");
  }

  function renderMultiAxis() {
    const root = $("multi-axis-grid");
    if (!root) return;
    root.innerHTML = DATA.multiAxisPlan.map((item) => `
      <article class="card">
        <h3>${escapeHtml(item.name)}</h3>
        <p><strong>形式：</strong>${escapeHtml(item.form)}</p>
        <p><strong>同步：</strong>${escapeHtml(item.synchronization)}</p>
        <p><strong>责任：</strong>${escapeHtml(item.owner)}</p>
      </article>
    `).join("");
  }

  function renderExecutionModes() {
    const root = $("execution-modes");
    if (!root) return;
    root.innerHTML = DATA.executionModes.map((item) => `
      <article class="mode-card">
        ${badge(item.status, item.status === "主合同" ? "ready" : "muted")}
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.semantics)}</p>
        <div class="mode-meta"><span>产生者</span><strong>${escapeHtml(item.producer)}</strong></div>
        <div class="mode-meta"><span>执行者</span><strong>${escapeHtml(item.executor)}</strong></div>
      </article>
    `).join("");
  }

  function renderRuntimeOptions() {
    const root = $("runtime-packs");
    if (!root) return;
    root.innerHTML = DATA.runtimeOptions.map((item) => `
      <article class="runtime-pack ${escapeHtml(item.id)}">
        <div class="card-heading">
          <div><span class="eyebrow">${escapeHtml(item.backend)}</span><h3>${escapeHtml(item.name)}</h3></div>
          ${badge(item.status, item.id === "real" ? "ready" : "muted")}
        </div>
        <h4>提供对象</h4>${chips(item.registers)}
        <h4>保证</h4>${list(item.guarantees)}
        <h4>禁止泄漏</h4>${list(item.mustNot)}
      </article>
    `).join("");
  }

  function renderTwinModules() {
    renderPairList("twin-modules", DATA.twinModules);
  }

  function renderCodeBlock() {
    const root = $("manifest-code");
    if (root) root.textContent = DATA.runtimeManifestExample;
  }

  function renderTestLevels() {
    const root = $("test-levels");
    if (!root) return;
    root.innerHTML = DATA.testLevels.map((item) => `
      <article class="test-level">
        <div class="test-level-id">${escapeHtml(item.level)}</div>
        <div>
          <div class="card-heading"><h3>${escapeHtml(item.name)}</h3>${badge(`ROS: ${item.ros}`, item.ros === "否" ? "ready" : "muted")}</div>
          <p><strong>Runtime：</strong>${escapeHtml(item.runtime)}</p>
          ${chips(item.verifies)}
        </div>
        <div class="test-gate"><span>建议门禁</span><strong>${escapeHtml(item.gate)}</strong></div>
      </article>
    `).join("");
  }

  function renderTestDoubles() {
    const root = $("test-doubles");
    if (!root) return;
    root.innerHTML = DATA.testDoubles.map((item) => `
      <article class="card double-card">
        <span class="eyebrow">模拟 ${escapeHtml(item.target)}</span>
        <h3>${escapeHtml(item.double)}</h3>
        <p><strong>可以验证：</strong>${escapeHtml(item.simulates)}</p>
        <p class="caution"><strong>不能证明：</strong>${escapeHtml(item.doesNotProve)}</p>
      </article>
    `).join("");
  }

  function renderFaults() {
    const root = $("fault-grid");
    if (!root) return;
    root.innerHTML = DATA.faultScenarios.map(([area, cases]) => `
      <article class="fault-card">
        <h3>${escapeHtml(area)}</h3>
        <p>${escapeHtml(cases)}</p>
      </article>
    `).join("");
  }

  function renderAcceptanceSlices() {
    const root = $("acceptance-slices");
    if (!root) return;
    root.innerHTML = DATA.acceptanceSlices.map(([id, name, evidence]) => `
      <article class="slice-row">
        <span>${escapeHtml(id)}</span>
        <h3>${escapeHtml(name)}</h3>
        <p>${escapeHtml(evidence)}</p>
      </article>
    `).join("");
  }

  function renderStackLayers() {
    const root = $("stack-layers");
    if (!root) return;
    root.innerHTML = DATA.stackLayers.map((item, index) => `
      <article class="stack-row">
        <span class="stack-index">${String(index + 1).padStart(2, "0")}</span>
        <div><h3>${escapeHtml(item.layer)}</h3>${chips(item.choices)}</div>
        <p>${escapeHtml(item.rule)}</p>
      </article>
    `).join("");
  }

  function renderTargetLayout() {
    const root = $("target-layout");
    if (!root) return;
    root.innerHTML = DATA.targetLayout.map((item) => `
      <article class="card layout-card">
        <div class="card-heading"><h3>${escapeHtml(item.name)}</h3>${badge(item.status, "muted")}</div>
        ${chips(item.contents)}
        <p><strong>依赖：</strong>${escapeHtml(item.dependencies)}</p>
        <p>${escapeHtml(item.note)}</p>
      </article>
    `).join("");
  }

  function renderConfigFiles() {
    renderTable("config-files", DATA.configFiles, ["文件", "责任", "内容"]);
  }

  function renderMigration() {
    const root = $("migration-phases");
    if (!root) return;
    root.innerHTML = DATA.migrationPhases.map((item) => `
      <article class="migration-card">
        <span class="migration-phase">Phase ${escapeHtml(item.phase)}</span>
        <h3>${escapeHtml(item.name)}</h3>
        ${list(item.changes)}
        <p class="evidence"><strong>验收：</strong>${escapeHtml(item.evidence)}</p>
      </article>
    `).join("");
  }

  function renderNonGoals() {
    const root = $("non-goals");
    if (root) root.innerHTML = list(DATA.nonGoals, "check-list");
  }

  renderNav();
  renderPrinciples();
  renderLayers();
  renderNumberedFlow("overall-flow", DATA.overallFlow);
  renderKeyConcepts();
  renderPageLinks();

  renderLifecycle();
  renderTimeline("startup-timeline", DATA.startupSteps);
  renderTimeline("job-timeline", DATA.jobSteps);
  renderCommunication();
  renderPairList("concurrency-rules", DATA.concurrencyRules);
  renderSnapshots();

  renderModuleFilters();
  renderModules();
  bindModuleSearch();
  renderInterfaceFamilies();

  renderTable("trajectory-fields", DATA.trajectoryFields, ["字段", "要求", "语义"]);
  renderTrajectoryPipeline();
  renderResponsibilities();
  renderTable("execution-capabilities", DATA.executionCapabilities, ["能力", "值/选项", "约束"]);
  renderMultiAxis();
  renderExecutionModes();

  renderRuntimeOptions();
  renderTwinModules();
  renderTable("runtime-parity", DATA.runtimeParity, ["合同项", "真机与孪生共同要求"]);
  renderCodeBlock();

  renderTestLevels();
  renderTestDoubles();
  renderFaults();
  renderAcceptanceSlices();

  renderStackLayers();
  renderTargetLayout();
  renderPairList("dependency-rules", DATA.dependencyRules);
  renderConfigFiles();
  renderMigration();
  renderNonGoals();
})();
