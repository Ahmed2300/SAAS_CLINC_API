/**
 * Clinic CRM API Documentation Portal — Standard Swagger UI Application Logic
 * Branded for DEVesters
 */

document.addEventListener("DOMContentLoaded", () => {
  const data = window.API_DATA;
  if (!data) {
    console.error("API_DATA not loaded.");
    return;
  }

  // App State
  const state = {
    searchQuery: "",
    selectedMethod: "ALL",
    authToken: localStorage.getItem("clinic_crm_token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample_jwt",
    clinicId: localStorage.getItem("clinic_crm_clinic_id") || "cli_a1b2c3",
    baseUrl: data.info.baseUrl
  };

  // Element References
  const infoSection = document.getElementById("info-section");
  const endpointsList = document.getElementById("swagger-endpoints-list");
  const searchInput = document.getElementById("search-input");
  const filterPills = document.querySelectorAll(".swagger-filter-pill");
  const authBtn = document.getElementById("btn-authorize");
  const authModal = document.getElementById("auth-modal");
  const closeModalBtn = document.getElementById("btn-close-modal");
  const closeAuthModalBtn = document.getElementById("btn-close-auth-modal");
  const saveAuthBtn = document.getElementById("btn-save-auth");
  const authTokenInput = document.getElementById("input-auth-token");
  const authClinicIdInput = document.getElementById("input-clinic-id");

  // Populate Auth Modal Inputs
  authTokenInput.value = state.authToken;
  authClinicIdInput.value = state.clinicId;
  updateAuthButtonState();

  // Initialize Render
  renderInfoSection();
  renderEndpoints();

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  // Search Input Filter
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderEndpoints();
    });
  }

  // Method Filter Pills
  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      state.selectedMethod = pill.getAttribute("data-method") || "ALL";
      renderEndpoints();
    });
  });

  // Authorize Modal Handlers
  if (authBtn) {
    authBtn.addEventListener("click", () => {
      authModal.classList.add("active");
    });
  }

  const closeAuthModal = () => authModal.classList.remove("active");
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeAuthModal);
  if (closeAuthModalBtn) closeAuthModalBtn.addEventListener("click", closeAuthModal);

  if (saveAuthBtn) {
    saveAuthBtn.addEventListener("click", () => {
      state.authToken = authTokenInput.value.trim();
      state.clinicId = authClinicIdInput.value.trim();
      localStorage.setItem("clinic_crm_token", state.authToken);
      localStorage.setItem("clinic_crm_clinic_id", state.clinicId);
      updateAuthButtonState();
      closeAuthModal();
      renderEndpoints();
    });
  }

  function updateAuthButtonState() {
    if (state.authToken) {
      authBtn.classList.add("authorized");
      authBtn.innerHTML = 'Authorized <i class="fas fa-lock"></i>';
    } else {
      authBtn.classList.remove("authorized");
      authBtn.innerHTML = 'Authorize <i class="fas fa-lock-open"></i>';
    }
  }

  // ==========================================================================
  // Info Section Render with DEVesters Signature
  // ==========================================================================
  function renderInfoSection() {
    if (!infoSection) return;

    infoSection.innerHTML = `
      <h1 class="info-title">
        ${data.info.title}
        <span class="info-version">${data.info.version}</span>
      </h1>
      <p class="info-description">${data.info.description}</p>
      
      <div class="created-by-banner">
        <span>Created & Maintained by</span>
        <div class="devesters-logo-brand" style="scale: 0.85;">
          <img src="devesters_icon.webp" alt="D" class="devesters-d-icon" />
          <span class="devesters-text" style="color: #0f172a;">EVesters</span>
        </div>
      </div>

      <div class="base-url-bar">
        <strong>Base URL:</strong> <span>${data.info.baseUrl}</span>
      </div>
    `;
  }

  // ==========================================================================
  // Endpoints List Render (Official Swagger UI Opblocks)
  // ==========================================================================
  function renderEndpoints() {
    if (!endpointsList) return;

    let html = "";

    data.modules.forEach((mod) => {
      // Filter endpoints by method & search query
      const filteredEndpoints = mod.endpoints.filter((ep) => {
        const matchesMethod = state.selectedMethod === "ALL" || ep.method === state.selectedMethod;
        const query = state.searchQuery;
        const matchesQuery = !query ||
          ep.path.toLowerCase().includes(query) ||
          ep.title.toLowerCase().includes(query) ||
          ep.description.toLowerCase().includes(query) ||
          mod.id.toLowerCase().includes(query);

        return matchesMethod && matchesQuery;
      });

      if (filteredEndpoints.length === 0 && state.searchQuery) return;

      html += `
        <div class="tag-section" id="tag-${mod.id}">
          <div class="tag-header">
            <div class="tag-title-group">
              <span class="tag-name">${mod.id}</span>
              <span class="tag-description">${mod.description}</span>
            </div>
            <i class="fas fa-chevron-down tag-chevron"></i>
          </div>

          <div class="tag-endpoints-container">
      `;

      filteredEndpoints.forEach((ep) => {
        html += renderSwaggerOpblock(ep);
      });

      html += `
          </div>
        </div>
      `;
    });

    endpointsList.innerHTML = html;

    // Attach Interactivity
    attachOpblockAccordion();
    attachTryOutExecutors();
  }

  function renderSwaggerOpblock(ep) {
    const methodLower = ep.method.toLowerCase();
    const curlSnippet = generateCurlSnippet(ep);

    return `
      <div class="opblock opblock-${methodLower}" id="opblock-${ep.id}">
        <!-- Summary Bar -->
        <div class="opblock-summary">
          <span class="opblock-summary-method">${ep.method}</span>
          <span class="opblock-summary-path">
            <span>${ep.path}</span>
          </span>
          <span class="opblock-summary-description">${ep.title}</span>
          <i class="fas fa-lock opblock-lock-icon" title="Requires JWT Bearer Token"></i>
        </div>

        <!-- Expanded Body Pane -->
        <div class="opblock-body">
          <p style="font-size: 14px; color: #3b4151; margin-bottom: 15px;">${ep.description}</p>
          <p style="font-size: 12px; color: #777; margin-bottom: 15px;"><strong>Permitted Roles:</strong> ${ep.roles.join(', ')}</p>

          <!-- Parameters Header -->
          <div class="opblock-section-header">
            <span class="opblock-title">Parameters</span>
            <button class="btn-try-out" data-try-id="${ep.id}">Try it out</button>
          </div>

          ${ep.parameters && ep.parameters.length > 0 ? `
            <table class="parameters-table">
              <thead>
                <tr>
                  <th style="width: 25%;">Name</th>
                  <th style="width: 75%;">Description</th>
                </tr>
              </thead>
              <tbody>
                ${ep.parameters.map(p => `
                  <tr>
                    <td>
                      <div class="param-name">${p.name}</div>
                      <div class="param-type">${p.dataType} (${p.type})</div>
                      ${p.required ? '<div class="param-required">required</div>' : ''}
                    </td>
                    <td>
                      <div>${p.description}</div>
                      <div style="margin-top: 6px;">
                        <input type="text" class="swagger-input try-param-input" data-param="${p.name}" placeholder="${p.default || p.name}" style="display:none; max-width: 300px;" />
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `<p style="font-size: 13px; color: #777; margin-bottom: 15px;">No parameters</p>`}

          ${ep.requestBody ? `
            <div class="opblock-section-header">
              <span class="opblock-title">Request body</span>
            </div>
            <div style="margin-bottom: 15px;">
              <textarea class="swagger-input try-body-input" style="display:none; min-height: 120px; font-family: var(--font-mono);">${JSON.stringify(ep.requestBody, null, 2)}</textarea>
              <div class="microlight"><code>${syntaxHighlight(JSON.stringify(ep.requestBody, null, 2))}</code></div>
            </div>
          ` : ''}

          <!-- Execute Button Container (Hidden by default until Try It Out clicked) -->
          <div class="try-execute-container" style="display: none; margin-bottom: 20px;">
            <button class="btn-execute-swagger" data-exec-id="${ep.id}">Execute</button>
          </div>

          <!-- cURL Snippet -->
          <div class="opblock-section-header">
            <span class="opblock-title">cURL</span>
          </div>
          <div class="microlight" style="margin-bottom: 20px;">
            <code>${escapeHtml(curlSnippet)}</code>
          </div>

          <!-- Responses Header -->
          <div class="opblock-section-header">
            <span class="opblock-title">Responses</span>
          </div>

          <table class="parameters-table">
            <thead>
              <tr>
                <th style="width: 15%;">Code</th>
                <th style="width: 85%;">Description</th>
              </tr>
            </thead>
            <tbody>
              ${ep.responses.map(res => `
                <tr>
                  <td style="font-family: var(--font-mono); font-weight: 700; color: ${res.status < 300 ? '#49cc90' : '#f93e3e'};">${res.status}</td>
                  <td>
                    <div>${res.description}</div>
                    ${res.body ? `
                      <div class="microlight" style="margin-top: 8px;">
                        <code>${syntaxHighlight(JSON.stringify(res.body, null, 2))}</code>
                      </div>
                    ` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Try Response Output Container -->
          <div class="try-response-output" id="try-res-${ep.id}" style="display: none; margin-top: 20px;">
            <div class="opblock-section-header">
              <span class="opblock-title" style="color: #4990e2;">Server Response</span>
            </div>
            <div class="microlight">
              <div style="color: #49cc90; font-weight: 700; margin-bottom: 8px;">Response Code: 200 OK (Simulated)</div>
              <code><pre class="try-code-output"></pre></code>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  // ==========================================================================
  // Interactivity Handlers
  // ==========================================================================

  function attachOpblockAccordion() {
    document.querySelectorAll(".opblock-summary").forEach((summary) => {
      summary.addEventListener("click", () => {
        const opblock = summary.closest(".opblock");
        opblock.classList.toggle("is-open");
      });
    });

    document.querySelectorAll(".tag-header").forEach((header) => {
      header.addEventListener("click", () => {
        const section = header.closest(".tag-section");
        const container = section.querySelector(".tag-endpoints-container");
        if (container) {
          const isHidden = container.style.display === "none";
          container.style.display = isHidden ? "block" : "none";
          header.querySelector(".tag-chevron").style.transform = isHidden ? "rotate(0deg)" : "rotate(-90deg)";
        }
      });
    });
  }

  function attachTryOutExecutors() {
    // Toggle Try It Out inputs visibility
    document.querySelectorAll(".btn-try-out").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const tryId = btn.getAttribute("data-try-id");
        const opblock = document.getElementById(`opblock-${tryId}`);
        if (!opblock) return;

        const isCancel = btn.classList.contains("cancel");
        if (isCancel) {
          btn.classList.remove("cancel");
          btn.innerText = "Try it out";
          btn.style.borderColor = "#4990e2";
          btn.style.color = "#4990e2";

          opblock.querySelectorAll(".try-param-input").forEach(i => i.style.display = "none");
          opblock.querySelectorAll(".try-body-input").forEach(i => i.style.display = "none");
          opblock.querySelectorAll(".try-execute-container").forEach(c => c.style.display = "none");
        } else {
          btn.classList.add("cancel");
          btn.innerText = "Cancel";
          btn.style.borderColor = "#f93e3e";
          btn.style.color = "#f93e3e";

          opblock.querySelectorAll(".try-param-input").forEach(i => i.style.display = "block");
          opblock.querySelectorAll(".try-body-input").forEach(i => i.style.display = "block");
          opblock.querySelectorAll(".try-execute-container").forEach(c => c.style.display = "block");
        }
      });
    });

    // Execute Request Simulation
    document.querySelectorAll(".btn-execute-swagger").forEach((btn) => {
      btn.addEventListener("click", () => {
        const execId = btn.getAttribute("data-exec-id");
        const opblock = document.getElementById(`opblock-${execId}`);
        if (!opblock) return;

        let foundEp = null;
        for (const mod of data.modules) {
          const match = mod.endpoints.find(e => e.id === execId);
          if (match) {
            foundEp = match;
            break;
          }
        }

        if (!foundEp) return;

        const resPane = opblock.querySelector(`#try-res-${execId}`);
        const codeOutput = resPane.querySelector(".try-code-output");

        resPane.style.display = "block";
        const mockResponse = foundEp.responses && foundEp.responses[0] ? foundEp.responses[0].body : { success: true };
        codeOutput.innerHTML = syntaxHighlight(JSON.stringify(mockResponse, null, 2));
      });
    });
  }

  // ==========================================================================
  // Helper Functions
  // ==========================================================================

  function generateCurlSnippet(ep) {
    let url = `${state.baseUrl}${ep.path}`;
    let headers = [
      `-H "Authorization: Bearer ${state.authToken || '[ACCESS_TOKEN]'}"`,
      `-H "Content-Type: application/json"`,
      `-H "X-Clinic-Id: ${state.clinicId || 'cli_a1b2c3'}"`
    ];

    let curl = `curl -X ${ep.method} "${url}" \\\n  ` + headers.join(" \\\n  ");

    if (ep.requestBody) {
      curl += ` \\\n  -d '${JSON.stringify(ep.requestBody)}'`;
    }

    return curl;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function syntaxHighlight(jsonStr) {
    if (!jsonStr) return "";
    jsonStr = escapeHtml(jsonStr);
    return jsonStr.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        let cls = "color: #905;"; // string/key default
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "color: #31708f; font-weight: 700;"; // key
          } else {
            cls = "color: #036a00;"; // string
          }
        } else if (/true|false/.test(match)) {
          cls = "color: #b05a00;"; // boolean
        } else if (/null/.test(match)) {
          cls = "color: #808080;"; // null
        }
        return `<span style="${cls}">${match}</span>`;
      }
    );
  }
});
