const en = {
  translation: {
    app: {
      name: "LLM Guard",
      subtitle: "Security Platform",
      target: "Target",
      systemOperational: "System operational",
      backendOnline: "Backend Online",
      backendOffline: "Backend Offline",
    },

    navigation: {
      dashboard: "Dashboard",
      attackLab: "Attack Lab",
      history: "Test History",
      owasp: "OWASP Coverage",
    },

    dashboard: {
      eyebrow: "SECURITY OVERVIEW",
      title: "AI Security Dashboard",
      description:
        "Monitor LLM security tests, attack outcomes and OWASP coverage.",

      securityTests: "Security Tests",
      totalExecuted: "Total executed test cases",

      attacksBlocked: "Attacks Blocked",
      protectedResponses: "Protected responses",

      successfulAttacks: "Successful Attacks",
      securityViolations: "Security violations",

      blockingRate: "Blocking Rate",
      observedBlockingRate:
        "Observed test blocking rate",

      attackOutcomes: "Attack Outcomes",
      blockedVsSuccessful:
        "Blocked vs successful attacks",

      attackDistribution:
        "Attack Distribution",

      testsByTechnique:
        "Tests by attack technique",

      recentTests:
        "Recent Security Tests",

      storedInPostgres:
        "Latest evaluation results stored in PostgreSQL",

      refresh: "Refresh",
      viewAll: "View all",

      blocked: "Blocked",
      succeeded: "Succeeded",
    },

    attackLab: {
      eyebrow: "RED TEAM LAB",

      title: "Attack Laboratory",

      description:
        "Execute attacks one by one, observe the complete process and inspect every model response.",

      campaign:
        "Prompt Injection Campaign",

      campaignDescription:
        "Each scenario is executed sequentially against the target LLM.",

      runCampaign:
        "Run Full Campaign",

      runningAttack:
        "Attack {{current}} / {{total}}",

      progress: "Progress",

      executed: "Executed",
      blocked: "Blocked",
      compromised: "Compromised",
      blockingRate: "Blocking rate",

      attack: "Attack",
      llm: "LLM",
      evaluate: "Evaluate",
      store: "Store",

      payloadPrepared:
        "Payload prepared",

      sentThroughGroq:
        "Sent through Groq",

      responseAnalysed:
        "Response analysed",

      postgres: "PostgreSQL",

      waiting: "WAITING",
      running: "RUNNING",
      blockedStatus: "BLOCKED",
      compromisedStatus: "COMPROMISED",
      error: "ERROR",

      sending:
        "Sending payload to GPT-OSS-20B and waiting for model response...",

      viewDetails:
        "View attack details",

      objective: "Objective",
      provider: "Provider",
      model: "Model",
      verdict: "Verdict",

      attackPayload:
        "ATTACK PAYLOAD",

      llmResponse:
        "LLM RESPONSE",

      whyResult:
        "Why this result?",

      secretDetected:
        "Synthetic secret detected",

      yes: "YES",
      no: "NO",

      evaluatorV1:
        "Evaluator V1: exact secret matching.",

      saved:
        "Result saved in PostgreSQL",
    },

    history: {
      eyebrow: "POSTGRESQL HISTORY",

      title: "Security Test History",

      description:
        "Inspect every recorded LLM security evaluation.",

      search:
        "Search attacks, OWASP risk, provider or model...",

      results: "{{count}} results",
    },

    owasp: {
      eyebrow: "OWASP GENAI",

      title:
        "OWASP Top 10 Coverage",

      description:
        "Implementation roadmap for the 2025 LLM security risks.",

      implemented:
        "{{implemented}} / {{total}} risks implemented",

      automatedTesting:
        "Automated security testing implemented.",

      planned: "PLANNED",

      modulePlanned:
        "Security module to be implemented.",
    },

    result: {
      blocked: "BLOCKED",
      compromised: "COMPROMISED",
      partial: "PARTIAL",
      high: "HIGH",
      medium: "MEDIUM",
      low: "LOW",
    },

    language: {
      french: "Français",
      english: "English",
      changeLanguage:
        "Change language",
    },
  },
};

export default en;
