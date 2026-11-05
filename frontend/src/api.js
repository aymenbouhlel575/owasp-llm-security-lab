const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


async function handleResponse(response) {
  if (response.ok) {
    return response.json();
  }

  let message =
    `HTTP error ${response.status}`;

  try {
    const data =
      await response.json();

    if (data.detail) {
      message =
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail);
    }
  } catch {
    // Ignore JSON parsing errors.
  }

  throw new Error(message);
}


// ============================================================
// HEALTH
// ============================================================

export async function getHealth() {
  const response = await fetch(
    `${API_URL}/health`
  );

  return handleResponse(response);
}


// ============================================================
// OLD SECURITY HISTORY
// ============================================================

export async function getResults() {
  const response = await fetch(
    `${API_URL}/api/results`
  );

  return handleResponse(response);
}


// ============================================================
// PROMPT INJECTION SCENARIOS
// ============================================================

export async function getPromptInjectionScenarios() {
  const response = await fetch(
    `${API_URL}/api/attacks/prompt-injection/scenarios`
  );

  return handleResponse(response);
}


// ============================================================
// CREATE CAMPAIGN
// ============================================================

export async function createPromptInjectionCampaign(
  mode = "baseline"
) {
  const normalizedMode =
    mode === "protected"
      ? "protected"
      : "baseline";

  const response = await fetch(
    `${API_URL}/api/attacks/prompt-injection/campaigns?mode=${encodeURIComponent(
      normalizedMode
    )}`,
    {
      method: "POST",
    }
  );

  return handleResponse(
    response
  );
}


// ============================================================
// RUN ONE SCENARIO
// ============================================================

export async function runPromptInjectionScenario(
  scenarioIndex,
  campaignId,
  options = {}
) {
  const adaptive =
    Boolean(
      options.adaptive
    );

  const requestedRounds =
    Number(
      options.maxRounds ??
      3
    );

  const maxRounds =
    Math.max(
      1,
      Math.min(
        Number.isFinite(
          requestedRounds
        )
          ? requestedRounds
          : 3,
        5
      )
    );

  const response = await fetch(
    `${API_URL}/api/attacks/prompt-injection/run-single`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        scenario_index:
          scenarioIndex,

        campaign_id:
          campaignId,

        adaptive:
          adaptive,

        max_rounds:
          maxRounds,
      }),
    }
  );

  return handleResponse(
    response
  );
}


// ============================================================
// CAMPAIGNS
// ============================================================

export async function getPromptInjectionCampaigns() {
  const response = await fetch(
    `${API_URL}/api/attacks/prompt-injection/campaigns`
  );

  return handleResponse(response);
}


export async function getPromptInjectionCampaign(
  campaignId
) {
  const response = await fetch(
    `${API_URL}/api/attacks/prompt-injection/campaigns/${campaignId}`
  );

  return handleResponse(response);
}


// ============================================================
// TRACE
// ============================================================

export async function getAttackTrace(
  traceId
) {
  const response = await fetch(
    `${API_URL}/api/attacks/traces/${traceId}`
  );

  return handleResponse(response);
}


// ============================================================
// DIRECT LLM TEST
// ============================================================

export async function testGroqLLM(
  prompt
) {
  const response = await fetch(
    `${API_URL}/api/llm/groq`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        prompt,
      }),
    }
  );

  return handleResponse(response);
}


export {
  API_URL,
};


// ============================================================
// LLM02 SENSITIVE INFORMATION API
// ============================================================

const SENSITIVE_INFORMATION_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


async function sensitiveInformationRequest(
  path,
  options = {}
) {
  const response = await fetch(
    `${SENSITIVE_INFORMATION_API_URL}${path}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.message ||
      `HTTP ${response.status}`
    );
  }

  return data;
}


export async function getSensitiveInformationScenarios() {
  return sensitiveInformationRequest(
    "/api/attacks/sensitive-information/scenarios"
  );
}


export async function createSensitiveInformationCampaign(
  mode = "baseline"
) {
  const normalizedMode =
    mode === "protected"
      ? "protected"
      : "baseline";

  const response = await fetch(
    `${API_URL}/api/attacks/sensitive-information/campaigns?mode=${encodeURIComponent(
      normalizedMode
    )}`,
    {
      method: "POST",
    }
  );

  return handleResponse(
    response
  );
}


export async function runSensitiveInformationScenario(
  scenarioIndex,
  campaignId,
  options = {}
) {
  const adaptive =
    Boolean(
      options.adaptive
    );

  const requestedRounds =
    Number(
      options.maxRounds ??
      3
    );

  const maxRounds =
    Math.max(
      1,
      Math.min(
        Number.isFinite(
          requestedRounds
        )
          ? requestedRounds
          : 3,
        5
      )
    );

  const response = await fetch(
    `${API_URL}/api/attacks/sensitive-information/run-single`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        scenario_index:
          scenarioIndex,

        campaign_id:
          campaignId,

        adaptive:
          adaptive,

        max_rounds:
          maxRounds,
      }),
    }
  );

  return handleResponse(
    response
  );
}


export async function getSensitiveInformationCampaign(
  campaignId
) {
  return sensitiveInformationRequest(
    `/api/attacks/sensitive-information/campaigns/${campaignId}`
  );
}


export async function getSecurityTrace(
  traceId
) {
  return sensitiveInformationRequest(
    `/api/attacks/traces/${traceId}`
  );
}


// ============================================================
// LLM03 SUPPLY CHAIN
// ============================================================

export async function getSupplyChainScenarios() {
  const response = await fetch(
    `${API_URL}/api/attacks/supply-chain/scenarios`
  );

  return handleResponse(response);
}


export async function createSupplyChainCampaign(
  mode = "baseline"
) {
  const normalizedMode =
    mode === "protected"
      ? "protected"
      : "baseline";

  const response = await fetch(
    `${API_URL}/api/attacks/supply-chain/campaigns?mode=${encodeURIComponent(
      normalizedMode
    )}`,
    {
      method: "POST",
    }
  );

  return handleResponse(
    response
  );
}


export async function runSupplyChainScenario(
  scenarioIndex,
  campaignId,
  options = {}
) {
  const adaptive =
    Boolean(
      options.adaptive
    );

  const requestedRounds =
    Number(
      options.maxRounds ??
      3
    );

  const maxRounds =
    Math.max(
      1,
      Math.min(
        Number.isFinite(
          requestedRounds
        )
          ? requestedRounds
          : 3,
        5
      )
    );

  const response = await fetch(
    `${API_URL}/api/attacks/supply-chain/run-single`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        scenario_index:
          scenarioIndex,

        campaign_id:
          campaignId,

        adaptive:
          adaptive,

        max_rounds:
          maxRounds,
      }),
    }
  );

  return handleResponse(
    response
  );
}


export async function getSupplyChainCampaign(
  campaignId
) {
  const response = await fetch(
    `${API_URL}/api/attacks/supply-chain/campaigns/${campaignId}`
  );

  return handleResponse(response);
}


// ============================================================
// LLM04 DATA AND MODEL POISONING
// ============================================================

export async function getDataModelPoisoningScenarios() {
  const response = await fetch(
    `${API_URL}/api/attacks/data-model-poisoning/scenarios`
  );

  return handleResponse(response);
}


export async function createDataModelPoisoningCampaign(
  mode = "baseline"
) {
  const normalizedMode =
    mode === "protected"
      ? "protected"
      : "baseline";

  const response = await fetch(
    `${API_URL}/api/attacks/data-model-poisoning/campaigns?mode=${encodeURIComponent(
      normalizedMode
    )}`,
    {
      method: "POST",
    }
  );

  return handleResponse(
    response
  );
}


export async function runDataModelPoisoningScenario(
  scenarioIndex,
  campaignId,
  options = {}
) {
  const adaptive =
    Boolean(
      options.adaptive
    );

  const requestedRounds =
    Number(
      options.maxRounds ??
      3
    );

  const maxRounds =
    Math.max(
      1,
      Math.min(
        Number.isFinite(
          requestedRounds
        )
          ? requestedRounds
          : 3,
        5
      )
    );

  const response = await fetch(
    `${API_URL}/api/attacks/data-model-poisoning/run-single`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        scenario_index:
          scenarioIndex,

        campaign_id:
          campaignId,

        adaptive:
          adaptive,

        max_rounds:
          maxRounds,
      }),
    }
  );

  const data =
    await handleResponse(
      response
    );

  if (
    !data ||
    typeof data !==
      "object"
  ) {
    throw new Error(
      "Réponse backend invalide."
    );
  }

  if (
    !data.verdict
  ) {
    throw new Error(
      "Champ verdict absent."
    );
  }

  return data;
}


export async function getDataModelPoisoningCampaign(
  campaignId
) {
  const response = await fetch(
    `${API_URL}/api/attacks/data-model-poisoning/campaigns/${campaignId}`
  );

  return handleResponse(response);
}


// ============================================================
// LLM05 IMPROPER OUTPUT HANDLING
// ============================================================

export async function getImproperOutputScenarios() {
  const response = await fetch(
    `${API_URL}/api/attacks/improper-output-handling/scenarios`
  );

  return handleResponse(response);
}


export async function createImproperOutputCampaign(
  mode = "baseline"
) {
  const normalizedMode =
    mode === "protected"
      ? "protected"
      : "baseline";

  const response = await fetch(
    `${API_URL}/api/attacks/improper-output-handling/campaigns?mode=${encodeURIComponent(
      normalizedMode
    )}`,
    {
      method: "POST",
    }
  );

  return handleResponse(
    response
  );
}


export async function runImproperOutputScenario(
  scenarioIndex,
  campaignId,
  options = {}
) {
  const adaptive =
    Boolean(
      options.adaptive
    );

  const requestedRounds =
    Number(
      options.maxRounds ??
      3
    );

  const maxRounds =
    Math.max(
      1,
      Math.min(
        Number.isFinite(
          requestedRounds
        )
          ? requestedRounds
          : 3,
        5
      )
    );

  const response = await fetch(
    `${API_URL}/api/attacks/improper-output-handling/run-single`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        scenario_index:
          scenarioIndex,

        campaign_id:
          campaignId,

        adaptive:
          adaptive,

        max_rounds:
          maxRounds,
      }),
    }
  );

  const data =
    await handleResponse(
      response
    );

  if (
    !data ||
    typeof data !==
      "object"
  ) {
    throw new Error(
      "Réponse backend invalide."
    );
  }

  if (
    !data.verdict
  ) {
    throw new Error(
      "Champ verdict absent."
    );
  }

  return data;
}


export async function getImproperOutputCampaign(
  campaignId
) {
  const response = await fetch(
    `${API_URL}/api/attacks/improper-output-handling/campaigns/${campaignId}`
  );

  return handleResponse(response);
}



// ============================================================
// LLM06 GET SCENARIOS
// ============================================================

export async function getExcessiveAgencyScenarios() {
  const response = await fetch(
    `${API_URL}/api/attacks/excessive-agency/scenarios`
  );

  return handleResponse(
    response
  );
}


export async function createExcessiveAgencyCampaign(
  mode = "baseline"
) {
  const normalizedMode =
    mode === "protected"
      ? "protected"
      : "baseline";

  const response = await fetch(
    `${API_URL}/api/attacks/excessive-agency/campaigns?mode=${encodeURIComponent(
      normalizedMode
    )}`,
    {
      method: "POST",
    }
  );

  return handleResponse(
    response
  );
}


export async function runExcessiveAgencyScenario(
  scenarioIndex,
  campaignId,
  options = {}
) {
  const adaptive =
    Boolean(
      options.adaptive
    );

  const requestedRounds =
    Number(
      options.maxRounds ??
      3
    );

  const maxRounds =
    Math.max(
      1,
      Math.min(
        Number.isFinite(
          requestedRounds
        )
          ? requestedRounds
          : 3,
        5
      )
    );

  const response = await fetch(
    `${API_URL}/api/attacks/excessive-agency/run-single`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        scenario_index:
          scenarioIndex,

        campaign_id:
          campaignId,

        adaptive:
          adaptive,

        max_rounds:
          maxRounds,
      }),
    }
  );

  const data =
    await handleResponse(
      response
    );

  if (
    !data ||
    typeof data !==
      "object"
  ) {
    throw new Error(
      "Réponse backend invalide."
    );
  }

  if (
    !data.verdict
  ) {
    throw new Error(
      "Champ verdict absent."
    );
  }

  return data;
}


export async function getExcessiveAgencyCampaign(
  campaignId
) {
  const response = await fetch(
    `${API_URL}/api/attacks/excessive-agency/campaigns/${campaignId}`
  );

  return handleResponse(
    response
  );
}


// ============================================================
// LLM07 GET SCENARIOS
// ============================================================

export async function getSystemPromptLeakageScenarios() {
  const response = await fetch(
    `${API_URL}/api/attacks/system-prompt-leakage/scenarios`
  );

  return handleResponse(
    response
  );
}


export async function createSystemPromptLeakageCampaign(
  mode = "baseline"
) {
  const normalizedMode =
    mode === "protected"
      ? "protected"
      : "baseline";

  const response = await fetch(
    `${API_URL}/api/attacks/system-prompt-leakage/campaigns?mode=${encodeURIComponent(
      normalizedMode
    )}`,
    {
      method: "POST",
    }
  );

  return handleResponse(
    response
  );
}


export async function runSystemPromptLeakageScenario(
  scenarioIndex,
  campaignId,
  options = {}
) {
  const adaptive =
    Boolean(
      options.adaptive
    );

  const requestedRounds =
    Number(
      options.maxRounds ??
      3
    );

  const maxRounds =
    Math.max(
      1,
      Math.min(
        Number.isFinite(
          requestedRounds
        )
          ? requestedRounds
          : 3,
        5
      )
    );

  const response = await fetch(
    `${API_URL}/api/attacks/system-prompt-leakage/run-single`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        scenario_index:
          scenarioIndex,

        campaign_id:
          campaignId,

        adaptive:
          adaptive,

        max_rounds:
          maxRounds,
      }),
    }
  );

  const data =
    await handleResponse(
      response
    );

  if (
    !data ||
    typeof data !==
      "object"
  ) {
    throw new Error(
      "Réponse backend invalide."
    );
  }

  if (
    !data.verdict
  ) {
    throw new Error(
      "Champ verdict absent."
    );
  }

  return data;
}


export async function getSystemPromptLeakageCampaign(
  campaignId
) {
  const response = await fetch(
    `${API_URL}/api/attacks/system-prompt-leakage/campaigns/${campaignId}`
  );

  return handleResponse(
    response
  );
}


// ============================================================
// LLM08 GET SCENARIOS
// ============================================================

export async function getVectorEmbeddingScenarios() {
  const response = await fetch(
    `${API_URL}/api/attacks/vector-embedding-weaknesses/scenarios`
  );

  return handleResponse(
    response
  );
}


export async function createVectorEmbeddingCampaign(
  mode = "baseline"
) {
  const normalizedMode =
    mode === "protected"
      ? "protected"
      : "baseline";

  const response = await fetch(
    `${API_URL}/api/attacks/vector-embedding-weaknesses/campaigns?mode=${encodeURIComponent(
      normalizedMode
    )}`,
    {
      method: "POST",
    }
  );

  return handleResponse(
    response
  );
}


export async function runVectorEmbeddingScenario(
  scenarioIndex,
  campaignId,
  options = {}
) {
  const adaptive =
    Boolean(
      options.adaptive
    );

  const requestedRounds =
    Number(
      options.maxRounds ??
      3
    );

  const maxRounds =
    Math.max(
      1,
      Math.min(
        Number.isFinite(
          requestedRounds
        )
          ? requestedRounds
          : 3,
        5
      )
    );

  const response = await fetch(
    `${API_URL}/api/attacks/vector-embedding-weaknesses/run-single`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        scenario_index:
          scenarioIndex,

        campaign_id:
          campaignId,

        adaptive:
          adaptive,

        max_rounds:
          maxRounds,
      }),
    }
  );

  const data =
    await handleResponse(
      response
    );

  if (
    !data ||
    typeof data !==
      "object"
  ) {
    throw new Error(
      "Réponse backend invalide."
    );
  }

  if (
    !data.verdict
  ) {
    throw new Error(
      "Champ verdict absent."
    );
  }

  return data;
}


export async function getVectorEmbeddingCampaign(
  campaignId
) {
  const response = await fetch(
    `${API_URL}/api/attacks/vector-embedding-weaknesses/campaigns/${campaignId}`
  );

  return handleResponse(
    response
  );
}


// ============================================================
// LLM09 GET SCENARIOS
// ============================================================

export async function getMisinformationScenarios() {
  const response = await fetch(
    `${API_URL}/api/attacks/misinformation/scenarios`
  );

  return handleResponse(
    response
  );
}


export async function createMisinformationCampaign(
  mode = "baseline"
) {
  const normalizedMode =
    mode === "protected"
      ? "protected"
      : "baseline";

  const response = await fetch(
    `${API_URL}/api/attacks/misinformation/campaigns?mode=${encodeURIComponent(
      normalizedMode
    )}`,
    {
      method: "POST",
    }
  );

  return handleResponse(
    response
  );
}


export async function runMisinformationScenario(
  scenarioIndex,
  campaignId,
  options = {}
) {
  const adaptive =
    Boolean(
      options.adaptive
    );

  const requestedRounds =
    Number(
      options.maxRounds ??
      3
    );

  const maxRounds =
    Math.max(
      1,
      Math.min(
        Number.isFinite(
          requestedRounds
        )
          ? requestedRounds
          : 3,
        5
      )
    );

  const response = await fetch(
    `${API_URL}/api/attacks/misinformation/run-single`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        scenario_index:
          scenarioIndex,

        campaign_id:
          campaignId,

        adaptive:
          adaptive,

        max_rounds:
          maxRounds,
      }),
    }
  );

  const data =
    await handleResponse(
      response
    );

  if (
    !data ||
    typeof data !==
      "object"
  ) {
    throw new Error(
      "Réponse backend invalide."
    );
  }

  if (
    !data.verdict
  ) {
    throw new Error(
      "Champ verdict absent."
    );
  }

  return data;
}


export async function getMisinformationCampaign(
  campaignId
) {
  const response = await fetch(
    `${API_URL}/api/attacks/misinformation/campaigns/${campaignId}`
  );

  return handleResponse(
    response
  );
}


// ============================================================
// LLM10 GET SCENARIOS
// ============================================================

export async function getUnboundedConsumptionScenarios() {
  const response = await fetch(
    `${API_URL}/api/attacks/unbounded-consumption/scenarios`
  );

  return handleResponse(
    response
  );
}


export async function createUnboundedConsumptionCampaign(
  mode = "baseline"
) {
  const normalizedMode =
    mode === "protected"
      ? "protected"
      : "baseline";

  const response = await fetch(
    `${API_URL}/api/attacks/unbounded-consumption/campaigns?mode=${encodeURIComponent(
      normalizedMode
    )}`,
    {
      method: "POST",
    }
  );

  return handleResponse(
    response
  );
}


export async function runUnboundedConsumptionScenario(
  scenarioIndex,
  campaignId,
  options = {}
) {
  const adaptive =
    Boolean(
      options.adaptive
    );

  const requestedRounds =
    Number(
      options.maxRounds ??
      3
    );

  const maxRounds =
    Math.max(
      1,
      Math.min(
        Number.isFinite(
          requestedRounds
        )
          ? requestedRounds
          : 3,
        5
      )
    );

  const response = await fetch(
    `${API_URL}/api/attacks/unbounded-consumption/run-single`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        scenario_index:
          scenarioIndex,

        campaign_id:
          campaignId,

        adaptive:
          adaptive,

        max_rounds:
          maxRounds,
      }),
    }
  );

  const data =
    await handleResponse(
      response
    );

  if (
    !data ||
    typeof data !==
      "object"
  ) {
    throw new Error(
      "Réponse backend invalide."
    );
  }

  if (
    !data.verdict
  ) {
    throw new Error(
      "Champ verdict absent."
    );
  }

  return data;
}


export async function getUnboundedConsumptionCampaign(
  campaignId
) {
  const response = await fetch(
    `${API_URL}/api/attacks/unbounded-consumption/campaigns/${campaignId}`
  );

  return handleResponse(
    response
  );
}


// ============================================================
// AI SECURITY ANALYTICS
// ============================================================

export async function getSecurityAnalytics() {
  const response = await fetch(
    `${API_URL}/api/security/analytics`
  );

  return handleResponse(
    response
  );
}


// ============================================================
// AI SECURITY AUDIT REPORT
// ============================================================

export async function getSecurityAuditReport() {
  const response = await fetch(
    `${API_URL}/api/security/audit-report`
  );

  return handleResponse(
    response
  );
}


export function getSecurityAuditCsvUrl() {
  return (
    `${API_URL}/api/security/audit-report.csv`
  );
}
