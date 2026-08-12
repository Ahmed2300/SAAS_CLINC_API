/* ==========================================================================
   Swagger UI Interactive Client Application (DEVesters)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const data = window.API_DATA;
  if (!data) {
    console.error("API_DATA structure is missing.");
    return;
  }

  // Application State
  const state = {
    selectedMethod: "ALL",
    searchQuery: "",
    authToken: "",
    clinicId: data.info.defaultClinicId,
    expandedEndpoints: new Set()
  };

  // DOM Elements
  const infoSection = document.getElementById("info-section");
  const endpointsList = document.getElementById("swagger-endpoints-list");
  const searchInput = document.getElementById("search-input");
  const schemeSelector = document.getElementById("scheme-selector");
  const btnAuthorize = document.getElementById("btn-authorize");
  const authModal = document.getElementById("auth-modal");
  const btnCloseModal = document.getElementById("btn-close-modal");
  const btnCloseAuthModal = document.getElementById("btn-close-auth-modal");
  const btnSaveAuth = document.getElementById("btn-save-auth");
  const inputAuthToken = document.getElementById("input-auth-token");
  const inputClinicId = document.getElementById("input-clinic-id");
  const filterPills = document.querySelectorAll(".swagger-filter-pill");

  // Initial Render
  renderInfoSection();
  renderEndpoints();

  // Event Listeners — Search
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
      state.selectedMethod = pill.getAttribute("data-method");
      renderEndpoints();
    });
  });

  // Modal Listeners
  if (btnAuthorize) {
    btnAuthorize.addEventListener("click", () => {
      authModal.classList.add("active");
    });
  }

  const closeModal = () => authModal.classList.remove("active");
  if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
  if (btnCloseAuthModal) btnCloseAuthModal.addEventListener("click", closeModal);

  if (btnSaveAuth) {
    btnSaveAuth.addEventListener("click", () => {
      state.authToken = inputAuthToken.value.trim();
      state.clinicId = inputClinicId.value.trim() || data.info.defaultClinicId;
      
      if (state.authToken) {
        btnAuthorize.classList.add("authorized");
        btnAuthorize.innerHTML = `Authorized <i class="fas fa-lock-open"></i>`;
      } else {
        btnAuthorize.classList.remove("authorized");
        btnAuthorize.innerHTML = `Authorize <i class="fas fa-lock"></i>`;
      }
      closeModal();
    });
  }

  // ==========================================================================
  // Info Section Render with DEVesters Signature & RBAC Matrix
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

      <!-- Interactive RBAC Permission Matrix Card -->
      <div style="margin-top: 20px;">
        <button id="btn-toggle-rbac-matrix" style="background: #ffffff; border: 1px solid var(--swagger-border); padding: 8px 18px; border-radius: var(--radius-md); font-weight: 700; color: #0f172a; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: var(--shadow-sm); font-size: 13.5px;">
          <i class="fas fa-user-shield" style="color: var(--devesters-red);"></i> View RBAC Permission Matrix <i class="fas fa-chevron-down" id="rbac-matrix-chevron"></i>
        </button>
        
        <div id="rbac-matrix-card" style="display: none; margin-top: 14px; background: #ffffff; border: 1px solid var(--swagger-border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-glass); overflow-x: auto;">
          <h4 style="font-size: 16px; font-weight: 800; margin-bottom: 6px; color: #0f172a;">Detailed RBAC Permission Matrix Across Modules</h4>
          <p style="font-size: 13px; color: var(--swagger-text-muted); margin-bottom: 16px;">System-wide role permissions breakdown mapping super_admin, support_admin, clinic managers, medical practitioners, and patients.</p>

          <table class="parameters-table" style="min-width: 900px;">
            <thead>
              <tr>
                <th style="width: 22%;">Module / Feature</th>
                <th style="text-align:center;">super_admin</th>
                <th style="text-align:center;">support_admin</th>
                <th style="text-align:center;">clinic_manager</th>
                <th style="text-align:center;">doctor</th>
                <th style="text-align:center;">receptionist</th>
                <th style="text-align:center;">nurse</th>
                <th style="text-align:center;">accountant</th>
                <th style="text-align:center;">patient</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Platform Settings & DB</strong></td><td align="center">✅ Full</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td></tr>
              <tr><td><strong>Manage Clinics & Branches</strong></td><td align="center">✅ Full</td><td align="center">✅ Onboard</td><td align="center">⚠️ Branch</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td></tr>
              <tr><td><strong>Manage Users & Staff</strong></td><td align="center">✅ Full</td><td align="center">✅ Setup</td><td align="center">✅ Staff</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td></tr>
              <tr><td><strong>Roles & Permissions</strong></td><td align="center">✅ Full</td><td align="center">👁️ Read</td><td align="center">👁️ Read</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td></tr>
              <tr><td><strong>Patient Profiles</strong></td><td align="center">✅ Full</td><td align="center">✅ Support</td><td align="center">✅ Full</td><td align="center">👁️ Read/Edit</td><td align="center">✅ Full</td><td align="center">👁️ Read</td><td align="center">❌</td><td align="center">👁️ Self</td></tr>
              <tr><td><strong>Doctors & Schedules</strong></td><td align="center">✅ Full</td><td align="center">✅ Setup</td><td align="center">✅ Full</td><td align="center">✏️ Schedule</td><td align="center">👁️ Read</td><td align="center">👁️ Read</td><td align="center">❌</td><td align="center">👁️ Read</td></tr>
              <tr><td><strong>Appointments & Booking</strong></td><td align="center">✅ Full</td><td align="center">✅ Support</td><td align="center">✅ Full</td><td align="center">👁️ Own</td><td align="center">✅ Full</td><td align="center">✅ Check-in</td><td align="center">❌</td><td align="center">✏️ Book</td></tr>
              <tr><td><strong>QR Code Check-in</strong></td><td align="center">✅ Full</td><td align="center">✅ Support</td><td align="center">✅ Full</td><td align="center">👁️ Read</td><td align="center">✅ Scan/Check-in</td><td align="center">✅ Scan/Check-in</td><td align="center">❌</td><td align="center">👁️ Self QR</td></tr>
              <tr><td><strong>Consultations & Vitals</strong></td><td align="center">✅ Full</td><td align="center">❌</td><td align="center">👁️ Read</td><td align="center">✍️ Author</td><td align="center">❌</td><td align="center">✏️ Vitals</td><td align="center">❌</td><td align="center">👁️ Self</td></tr>
              <tr><td><strong>Prescriptions</strong></td><td align="center">✅ Full</td><td align="center">❌</td><td align="center">👁️ Read</td><td align="center">✍️ Author</td><td align="center">❌</td><td align="center">👁️ Read</td><td align="center">❌</td><td align="center">👁️ Self</td></tr>
              <tr><td><strong>Invoices & Payments</strong></td><td align="center">✅ Full</td><td align="center">❌</td><td align="center">✅ Full</td><td align="center">❌</td><td align="center">✅ Collect</td><td align="center">❌</td><td align="center">✅ Full</td><td align="center">👁️ Self Pay</td></tr>
              <tr><td><strong>Inventory & Stock</strong></td><td align="center">✅ Full</td><td align="center">❌</td><td align="center">✅ Full</td><td align="center">👁️ Read</td><td align="center">❌</td><td align="center">✏️ Adjust</td><td align="center">❌</td><td align="center">❌</td></tr>
              <tr><td><strong>Reports & Analytics</strong></td><td align="center">✅ Full</td><td align="center">❌</td><td align="center">✅ Branch</td><td align="center">👁️ Self</td><td align="center">❌</td><td align="center">❌</td><td align="center">💵 Financial</td><td align="center">❌</td></tr>
              <tr><td><strong>Audit Logs</strong></td><td align="center">✅ Full</td><td align="center">👁️ Read</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td><td align="center">❌</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Attach Toggle for RBAC Card
    const btnToggle = document.getElementById("btn-toggle-rbac-matrix");
    const matrixCard = document.getElementById("rbac-matrix-card");
    const chevron = document.getElementById("rbac-matrix-chevron");

    if (btnToggle && matrixCard) {
      btnToggle.addEventListener("click", () => {
        const isHidden = matrixCard.style.display === "none";
        matrixCard.style.display = isHidden ? "block" : "none";
        if (chevron) chevron.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
      });
    }
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
    const isOpen = state.expandedEndpoints.has(ep.id);
    const lockIcon = ep.roles && !ep.roles.includes("public") ? '<i class="fas fa-lock opblock-lock-icon" title="Protected Route"></i>' : '';

    const rolesBadges = ep.roles ? ep.roles.map(r => `<span style="font-size:11px; background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:10px; font-weight:600; margin-left:6px;">${r}</span>`).join('') : '';

    return `
      <div class="opblock opblock-${methodLower} ${isOpen ? 'is-open' : ''}" id="opblock-${ep.id}">
        <div class="opblock-summary" onclick="window.toggleOpblock('${ep.id}')">
          <span class="opblock-summary-method">${ep.method}</span>
          <span class="opblock-summary-path">${lockIcon} ${ep.path}</span>
          <span class="opblock-summary-description">${ep.title} — ${ep.description} ${rolesBadges}</span>
        </div>

        <div class="opblock-body">
          <div class="opblock-section-header">
            <span class="opblock-title">Parameters & Request Details</span>
            <button class="btn-try-out" onclick="window.toggleTryItOut('${ep.id}')">Try it out</button>
          </div>

          <!-- Roles Info -->
          <div style="margin-bottom: 15px; font-size: 13px;">
            <strong>Permitted Roles:</strong> ${rolesBadges || '<span style="color:#777;">Public</span>'}
          </div>

          ${renderParametersTable(ep)}
          ${renderRequestBodySection(ep)}
          ${renderResponsesSection(ep)}

          <!-- Interactive Console Box -->
          <div id="try-console-${ep.id}" style="display: none; margin-top: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
            <h5 style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
              <i class="fas fa-terminal" style="color: #3b82f6; margin-right: 6px;"></i> Interactive Console
            </h5>
            
            ${renderTryItOutForm(ep)}
            
            <button class="btn-execute-swagger" onclick="window.executeSwaggerCall('${ep.id}')">Execute</button>

            <div id="curl-output-${ep.id}" style="margin-top: 15px; display: none;">
              <strong style="font-size: 12px; color: #64748b;">Generated cURL Command:</strong>
              <pre class="microlight" id="curl-text-${ep.id}"></pre>
            </div>

            <div id="response-output-${ep.id}" style="margin-top: 15px; display: none;">
              <strong style="font-size: 12px; color: #64748b;">Server Response (Simulated):</strong>
              <pre class="microlight" id="response-text-${ep.id}"></pre>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderParametersTable(ep) {
    if (!ep.parameters || ep.parameters.length === 0) {
      return `<p style="font-size: 13px; color: #777; margin-bottom: 15px;">No query or path parameters required.</p>`;
    }

    let rows = ep.parameters.map((p) => `
      <tr>
        <td>
          <span class="param-name">${p.name}</span>
          ${p.required ? '<span class="param-required">* required</span>' : ''}
        </td>
        <td>
          <span class="param-type">${p.dataType} (${p.type})</span>
        </td>
        <td style="color: #475569;">
          ${p.description}
          ${p.default ? `<br><small style="color:#64748b;">Default: <code>${p.default}</code></small>` : ''}
        </td>
      </tr>
    `).join('');

    return `
      <table class="parameters-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  function renderRequestBodySection(ep) {
    if (!ep.requestBody) return "";

    return `
      <div style="margin-bottom: 20px;">
        <h5 style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Request Body (JSON)</h5>
        <pre class="microlight">${JSON.stringify(ep.requestBody, null, 2)}</pre>
      </div>
    `;
  }

  function renderResponsesSection(ep) {
    if (!ep.responses || ep.responses.length === 0) return "";

    let html = `<h5 style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">Responses</h5>`;

    ep.responses.forEach((res) => {
      const statusColor = res.status < 300 ? '#10b981' : '#ef4444';
      html += `
        <div style="margin-bottom: 12px;">
          <div style="font-size: 13px; font-weight: 700; color: ${statusColor}; margin-bottom: 4px;">
            ${res.description}
          </div>
          <pre class="microlight">${JSON.stringify(res.body, null, 2)}</pre>
        </div>
      `;
    });

    return html;
  }

  function renderTryItOutForm(ep) {
    let html = "";

    if (ep.parameters && ep.parameters.length > 0) {
      html += `<div style="margin-bottom: 12px;"><strong style="font-size: 13px; color: #334155;">Parameters Input:</strong></div>`;
      ep.parameters.forEach((p) => {
        html += `
          <div style="margin-bottom: 10px;">
            <label style="font-size: 12px; font-weight: 700; color: #475569;">${p.name} (${p.type}):</label>
            <input type="text" class="swagger-input try-param-input" data-ep="${ep.id}" data-param="${p.name}" data-type="${p.type}" value="${p.default || ''}" placeholder="${p.description}" />
          </div>
        `;
      });
    }

    if (ep.requestBody) {
      html += `
        <div style="margin-bottom: 10px;">
          <label style="font-size: 12px; font-weight: 700; color: #475569;">Body Payload (JSON):</label>
          <textarea class="swagger-input try-body-input" data-ep="${ep.id}" rows="5" style="font-family: var(--font-mono);">${JSON.stringify(ep.requestBody, null, 2)}</textarea>
        </div>
      `;
    }

    return html;
  }

  // Global Handlers
  window.toggleOpblock = (epId) => {
    if (state.expandedEndpoints.has(epId)) {
      state.expandedEndpoints.delete(epId);
    } else {
      state.expandedEndpoints.add(epId);
    }
    renderEndpoints();
  };

  window.toggleTryItOut = (epId) => {
    const tryConsole = document.getElementById(`try-console-${epId}`);
    if (tryConsole) {
      const isHidden = tryConsole.style.display === "none";
      tryConsole.style.display = isHidden ? "block" : "none";
    }
  };

  window.executeSwaggerCall = (epId) => {
    // Find endpoint definition
    let targetEp = null;
    data.modules.forEach((mod) => {
      const found = mod.endpoints.find((e) => e.id === epId);
      if (found) targetEp = found;
    });

    if (!targetEp) return;

    // Gather params
    const paramInputs = document.querySelectorAll(`.try-param-input[data-ep="${epId}"]`);
    let finalPath = targetEp.path;
    let queryParams = [];

    paramInputs.forEach((inp) => {
      const name = inp.getAttribute("data-param");
      const type = inp.getAttribute("data-type");
      const val = inp.value.trim();

      if (val) {
        if (type === "path") {
          finalPath = finalPath.replace(`{${name}}`, val);
        } else if (type === "query") {
          queryParams.push(`${name}=${encodeURIComponent(val)}`);
        }
      }
    });

    if (queryParams.length > 0) {
      finalPath += `?${queryParams.join('&')}`;
    }

    // Gather Body
    const bodyInput = document.querySelector(`.try-body-input[data-ep="${epId}"]`);
    let bodyText = bodyInput ? bodyInput.value.trim() : "";

    // Build cURL
    let curl = `curl -X ${targetEp.method} "${data.info.baseUrl}${finalPath}" \\\n  -H "Accept: application/json" \\\n  -H "Content-Type: application/json"`;
    
    if (state.authToken) {
      curl += ` \\\n  -H "Authorization: ${state.authToken}"`;
    } else {
      curl += ` \\\n  -H "Authorization: Bearer sample_access_token_xyz"`;
    }

    curl += ` \\\n  -H "X-Clinic-Id: ${state.clinicId}"`;

    if (bodyText && (targetEp.method === "POST" || targetEp.method === "PUT" || targetEp.method === "PATCH")) {
      curl += ` \\\n  -d '${bodyText.replace(/\n/g, '')}'`;
    }

    // Render Outputs
    const curlOutput = document.getElementById(`curl-output-${epId}`);
    const curlText = document.getElementById(`curl-text-${epId}`);
    const responseOutput = document.getElementById(`response-output-${epId}`);
    const responseText = document.getElementById(`response-text-${epId}`);

    if (curlOutput && curlText) {
      curlText.textContent = curl;
      curlOutput.style.display = "block";
    }

    if (responseOutput && responseText) {
      const primaryResponse = targetEp.responses ? targetEp.responses[0].body : { success: true };
      responseText.textContent = JSON.stringify(primaryResponse, null, 2);
      responseOutput.style.display = "block";
    }
  };

  function attachOpblockAccordion() {
    // Accordion tags
    const tagHeaders = document.querySelectorAll(".tag-header");
    tagHeaders.forEach((hdr) => {
      hdr.addEventListener("click", () => {
        const container = hdr.nextElementSibling;
        const chevron = hdr.querySelector(".tag-chevron");
        if (container) {
          const isHidden = container.style.display === "none";
          container.style.display = isHidden ? "block" : "none";
          if (chevron) chevron.style.transform = isHidden ? "rotate(0deg)" : "rotate(-90deg)";
        }
      });
    });
  }

  function attachTryOutExecutors() {
    // Attached globally via window handlers
  }
});
