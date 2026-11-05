const fr = {
  translation: {
    app: {
      name: "LLM Guard",
      subtitle: "Plateforme de sécurité",
      target: "Cible",
      systemOperational: "Système opérationnel",
      backendOnline: "Backend en ligne",
      backendOffline: "Backend hors ligne",
    },

    navigation: {
      dashboard: "Tableau de bord",
      attackLab: "Laboratoire d'attaques",
      history: "Historique des tests",
      owasp: "Couverture OWASP",
    },

    dashboard: {
      eyebrow: "VUE D'ENSEMBLE SÉCURITÉ",
      title: "Tableau de bord de sécurité IA",
      description:
        "Surveillez les tests de sécurité des LLM, les résultats des attaques et la couverture OWASP.",

      securityTests: "Tests de sécurité",
      totalExecuted: "Nombre total de tests exécutés",

      attacksBlocked: "Attaques bloquées",
      protectedResponses: "Réponses protégées",

      successfulAttacks: "Attaques réussies",
      securityViolations: "Violations de sécurité",

      blockingRate: "Taux de blocage",
      observedBlockingRate:
        "Taux de blocage observé",

      attackOutcomes:
        "Résultats des attaques",

      blockedVsSuccessful:
        "Bloquées vs réussies",

      attackDistribution:
        "Répartition des attaques",

      testsByTechnique:
        "Tests par technique d'attaque",

      recentTests:
        "Tests de sécurité récents",

      storedInPostgres:
        "Derniers résultats enregistrés dans PostgreSQL",

      refresh: "Actualiser",
      viewAll: "Voir tout",

      blocked: "Bloquées",
      succeeded: "Réussies",
    },

    attackLab: {
      eyebrow: "LABORATOIRE RED TEAM",

      title: "Laboratoire d'attaques",

      description:
        "Exécutez les attaques une par une, observez le processus complet et analysez chaque réponse du modèle.",

      campaign:
        "Campagne Prompt Injection",

      campaignDescription:
        "Chaque scénario est exécuté séquentiellement contre le LLM cible.",

      runCampaign:
        "Lancer la campagne complète",

      runningAttack:
        "Attaque {{current}} / {{total}}",

      progress: "Progression",

      executed: "Exécutées",
      blocked: "Bloquées",
      compromised: "Compromises",
      blockingRate: "Taux de blocage",

      attack: "Attaque",
      llm: "LLM",
      evaluate: "Évaluation",
      store: "Stockage",

      payloadPrepared:
        "Payload préparé",

      sentThroughGroq:
        "Envoyé via Groq",

      responseAnalysed:
        "Réponse analysée",

      postgres:
        "PostgreSQL",

      waiting: "EN ATTENTE",
      running: "EN COURS",
      blockedStatus: "BLOQUÉE",
      compromisedStatus: "COMPROMISE",
      error: "ERREUR",

      sending:
        "Envoi du payload à GPT-OSS-20B et attente de la réponse du modèle...",

      viewDetails:
        "Voir les détails de l'attaque",

      objective: "Objectif",
      provider: "Fournisseur",
      model: "Modèle",
      verdict: "Verdict",

      attackPayload:
        "PAYLOAD D'ATTAQUE",

      llmResponse:
        "RÉPONSE DU LLM",

      whyResult:
        "Pourquoi ce résultat ?",

      secretDetected:
        "Secret synthétique détecté",

      yes: "OUI",
      no: "NON",

      evaluatorV1:
        "Évaluateur V1 : correspondance exacte du secret.",

      saved:
        "Résultat enregistré dans PostgreSQL",
    },

    history: {
      eyebrow:
        "HISTORIQUE POSTGRESQL",

      title:
        "Historique des tests de sécurité",

      description:
        "Consultez chaque évaluation de sécurité LLM enregistrée.",

      search:
        "Rechercher une attaque, un risque OWASP, un fournisseur ou un modèle...",

      results: "{{count}} résultats",
    },

    owasp: {
      eyebrow: "OWASP GENAI",

      title:
        "Couverture OWASP Top 10",

      description:
        "Feuille de route d'implémentation des risques de sécurité LLM 2025.",

      implemented:
        "{{implemented}} / {{total}} risques implémentés",

      automatedTesting:
        "Tests de sécurité automatisés implémentés.",

      planned:
        "PRÉVU",

      modulePlanned:
        "Module de sécurité à implémenter.",
    },

    result: {
      blocked: "BLOQUÉE",
      compromised: "COMPROMISE",
      partial: "PARTIELLE",
      high: "ÉLEVÉE",
      medium: "MOYENNE",
      low: "FAIBLE",
    },

    language: {
      french: "Français",
      english: "English",
      changeLanguage:
        "Changer la langue",
    },
  },
};

export default fr;
