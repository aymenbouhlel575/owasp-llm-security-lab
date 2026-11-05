const bi = (
  fr,
  en
) => ({
  fr,
  en,
});


export const securityLibrary = [

  // ============================================================
  // LLM01
  // ============================================================

  {
    id: "LLM01",

    implemented: true,

    severity: "HIGH",

    scenarioEndpoint:
      "/api/attacks/prompt-injection/scenarios",

    title: bi(
      "Injection de prompt",
      "Prompt Injection"
    ),

    summary: bi(
      "Manipulation des instructions d'un modèle afin de modifier ou contourner son comportement attendu.",
      "Manipulation of model instructions to modify or bypass its intended behavior."
    ),

    explanation: bi(
      "Une injection de prompt tente de faire considérer des instructions contrôlées par l'utilisateur comme prioritaires par rapport aux règles système. Elle peut chercher à contourner une politique, modifier le rôle du modèle ou obtenir des informations protégées.",
      "Prompt injection attempts to make user-controlled instructions override system rules. It may try to bypass policies, modify the model role or obtain protected information."
    ),

    risks: bi(
      [
        "Divulgation d'informations confidentielles",
        "Contournement des instructions système",
        "Modification du comportement du modèle",
        "Abus d'outils ou d'agents",
        "Exécution d'actions non prévues",
      ],
      [
        "Disclosure of confidential information",
        "System instruction bypass",
        "Model behavior manipulation",
        "Tool or agent abuse",
        "Execution of unintended actions",
      ]
    ),

    prevention: bi(
      [
        "Séparer strictement les instructions système des données utilisateur",
        "Valider et filtrer les entrées à risque",
        "Limiter les permissions des agents",
        "Contrôler les sorties avant exécution",
        "Utiliser un juge de sécurité indépendant",
      ],
      [
        "Strictly separate system instructions from user data",
        "Validate and filter risky inputs",
        "Limit agent permissions",
        "Inspect outputs before execution",
        "Use an independent security judge",
      ]
    ),

    developerGuidelines: bi(
      [
        "Ne jamais considérer le texte utilisateur comme une instruction privilégiée",
        "Appliquer le principe du moindre privilège",
        "Tracer les prompts, réponses et décisions de sécurité",
        "Tester régulièrement avec des variantes adversariales",
      ],
      [
        "Never treat user text as privileged instruction",
        "Apply least privilege",
        "Trace prompts, responses and security decisions",
        "Regularly test adversarial variants",
      ]
    ),

    defense: bi(
      "Le système doit détecter les tentatives de modification des règles et empêcher qu'elles remplacent les instructions de confiance.",
      "The system should detect attempts to modify trusted rules and prevent them from overriding system instructions."
    ),

    architecture: [
      "Attack Generator",
      "Input Guard",
      "Target LLM",
      "Output Guard",
      "Independent Judge",
      "Audit Trace",
    ],
  },


  // ============================================================
  // LLM02
  // ============================================================

  {
    id: "LLM02",

    implemented: true,

    severity: "HIGH",

    scenarioEndpoint:
      "/api/attacks/sensitive-information/scenarios",

    title: bi(
      "Divulgation d'informations sensibles",
      "Sensitive Information Disclosure"
    ),

    summary: bi(
      "Exposition involontaire de secrets, données personnelles ou informations confidentielles par un système IA.",
      "Unintended exposure of secrets, personal data or confidential information by an AI system."
    ),

    explanation: bi(
      "Un modèle peut révéler des informations présentes dans son contexte, son historique, une base documentaire ou des données appartenant à un autre utilisateur. Les informations sensibles doivent être contrôlées avant et après l'inférence.",
      "A model may reveal information contained in its context, history, knowledge base or data belonging to another user. Sensitive data should be controlled before and after inference."
    ),

    risks: bi(
      [
        "Fuite de secrets",
        "Exposition de données personnelles",
        "Divulgation inter-utilisateurs",
        "Exposition d'informations métier confidentielles",
        "Fuite après transformation ou encodage",
      ],
      [
        "Secret leakage",
        "Personal data exposure",
        "Cross-user disclosure",
        "Confidential business information exposure",
        "Leakage after transformation or encoding",
      ]
    ),

    prevention: bi(
      [
        "Minimiser les données sensibles présentes dans le contexte",
        "Appliquer des contrôles d'accès avant le retrieval",
        "Détecter les secrets dans les sorties",
        "Masquer ou rédiger les informations confidentielles",
        "Isoler strictement les données des utilisateurs",
      ],
      [
        "Minimize sensitive information in context",
        "Apply access controls before retrieval",
        "Detect secrets in outputs",
        "Mask or redact confidential information",
        "Strictly isolate user data",
      ]
    ),

    developerGuidelines: bi(
      [
        "Utiliser uniquement des secrets synthétiques pendant les tests",
        "Ne jamais journaliser des secrets réels en clair",
        "Tester les transformations Base64 et autres encodages",
        "Vérifier les frontières entre utilisateurs et tenants",
      ],
      [
        "Use synthetic secrets during security tests",
        "Never log real secrets in plaintext",
        "Test Base64 and other transformations",
        "Verify user and tenant boundaries",
      ]
    ),

    defense: bi(
      "La réponse doit être inspectée afin de détecter les données sensibles exactes ou transformées avant d'être retournée.",
      "The response should be inspected for exact or transformed sensitive data before being released."
    ),

    architecture: [
      "Data Classification",
      "Access Control",
      "Target LLM",
      "Sensitive Data Detector",
      "Output Redaction",
      "Audit Trace",
    ],
  },


  // ============================================================
  // LLM03
  // ============================================================

  {
    id: "LLM03",

    implemented: true,

    severity: "HIGH",

    scenarioEndpoint:
      "/api/attacks/supply-chain/scenarios",

    title: bi(
      "Chaîne d'approvisionnement",
      "Supply Chain"
    ),

    summary: bi(
      "Risques introduits par les modèles, dépendances, adaptateurs, datasets ou artefacts provenant de sources non fiables.",
      "Risks introduced by models, dependencies, adapters, datasets or artifacts from untrusted sources."
    ),

    explanation: bi(
      "Une application IA dépend de nombreux composants externes. Une provenance non vérifiée, une dépendance vulnérable, un modèle altéré ou un artefact non signé peut compromettre l'ensemble du système.",
      "An AI application depends on many external components. Unverified provenance, vulnerable dependencies, tampered models or unsigned artifacts may compromise the entire system."
    ),

    risks: bi(
      [
        "Modèle provenant d'une source non vérifiée",
        "Dépendance typosquattée",
        "Adaptateur ou plugin non signé",
        "Dépendance avec vulnérabilité critique",
        "Altération d'un artefact ou checksum incorrect",
      ],
      [
        "Model from an unverified source",
        "Typosquatted dependency",
        "Unsigned adapter or plugin",
        "Dependency with critical vulnerability",
        "Artifact tampering or checksum mismatch",
      ]
    ),

    prevention: bi(
      [
        "Vérifier l'origine des modèles et artefacts",
        "Utiliser des signatures et checksums",
        "Scanner les dépendances",
        "Épingler les versions critiques",
        "Maintenir une SBOM",
      ],
      [
        "Verify model and artifact provenance",
        "Use signatures and checksums",
        "Scan dependencies",
        "Pin critical versions",
        "Maintain an SBOM",
      ]
    ),

    developerGuidelines: bi(
      [
        "Ne charger que des composants approuvés",
        "Conserver l'identité et le hash de chaque artefact",
        "Automatiser les contrôles de vulnérabilité",
        "Bloquer les packages similaires à des dépendances légitimes",
      ],
      [
        "Load approved components only",
        "Store identity and hash for each artifact",
        "Automate vulnerability checks",
        "Block packages impersonating legitimate dependencies",
      ]
    ),

    defense: bi(
      "Tout composant externe doit passer une validation de provenance, d'intégrité et de vulnérabilité avant son utilisation.",
      "Every external component should pass provenance, integrity and vulnerability validation before use."
    ),

    architecture: [
      "Trusted Registry",
      "SBOM",
      "Signature Verification",
      "Vulnerability Scanner",
      "Artifact Integrity Check",
      "Deployment Gate",
    ],
  },


  // ============================================================
  // LLM04
  // ============================================================

  {
    id: "LLM04",

    implemented: true,

    severity: "HIGH",

    scenarioEndpoint:
      "/api/attacks/data-model-poisoning/scenarios",

    title: bi(
      "Empoisonnement des données et du modèle",
      "Data and Model Poisoning"
    ),

    summary: bi(
      "Altération malveillante des données, connaissances ou paramètres utilisés par un système IA.",
      "Malicious modification of data, knowledge or model parameters used by an AI system."
    ),

    explanation: bi(
      "L'empoisonnement cherche à influencer le comportement futur du modèle en manipulant les données d'entraînement, les documents RAG, les labels, les benchmarks ou les mises à jour du modèle.",
      "Poisoning attempts to influence future model behavior by manipulating training data, RAG documents, labels, benchmarks or model updates."
    ),

    risks: bi(
      [
        "Documents RAG malveillants",
        "Instructions adversariales injectées dans les connaissances",
        "Altération de labels",
        "Backdoors dans les données de fine-tuning",
        "Contamination des évaluations",
      ],
      [
        "Malicious RAG documents",
        "Adversarial instructions inside knowledge",
        "Label corruption",
        "Fine-tuning data backdoors",
        "Evaluation contamination",
      ]
    ),

    prevention: bi(
      [
        "Contrôler la provenance des données",
        "Valider les documents avant ingestion",
        "Détecter les anomalies dans les datasets",
        "Versionner les données et modèles",
        "Séparer les données d'entraînement et d'évaluation",
      ],
      [
        "Control data provenance",
        "Validate documents before ingestion",
        "Detect dataset anomalies",
        "Version data and models",
        "Separate training and evaluation data",
      ]
    ),

    developerGuidelines: bi(
      [
        "Tracer l'origine de chaque source",
        "Rejeter les documents non vérifiés",
        "Comparer les performances avant et après mise à jour",
        "Déployer progressivement les nouveaux modèles",
      ],
      [
        "Trace the origin of every source",
        "Reject unverified documents",
        "Compare performance before and after updates",
        "Roll out new models gradually",
      ]
    ),

    defense: bi(
      "Les nouvelles connaissances ou mises à jour doivent être validées avant d'être utilisées par le modèle ou le pipeline RAG.",
      "New knowledge or model updates must be validated before use by the model or RAG pipeline."
    ),

    architecture: [
      "Trusted Data Sources",
      "Data Validation",
      "Poisoning Detector",
      "RAG Ingestion Gate",
      "Model Evaluation",
      "Independent Judge",
    ],
  },


  // ============================================================
  // LLM05
  // ============================================================

  {
    id: "LLM05",

    implemented: true,

    severity: "HIGH",

    scenarioEndpoint:
      "/api/attacks/improper-output-handling/scenarios",

    title: bi(
      "Mauvaise gestion des sorties",
      "Improper Output Handling"
    ),

    summary: bi(
      "Utilisation directe d'une sortie générée par un LLM sans validation ou neutralisation adaptée.",
      "Direct use of LLM-generated output without appropriate validation or sanitization."
    ),

    explanation: bi(
      "Une réponse LLM est une donnée non fiable. Si elle est injectée directement dans HTML, SQL, shell, fichiers, URLs ou outils externes, elle peut produire des effets indésirables.",
      "LLM output is untrusted data. If directly passed into HTML, SQL, shell commands, files, URLs or external tools, it may create unintended effects."
    ),

    risks: bi(
      [
        "Injection de commandes",
        "Contenu HTML ou script dangereux",
        "Requêtes SQL non fiables",
        "Liens externes dangereux",
        "Exécution automatique d'une sortie générée",
      ],
      [
        "Command injection",
        "Unsafe HTML or script content",
        "Untrusted SQL queries",
        "Dangerous external links",
        "Automatic execution of generated output",
      ]
    ),

    prevention: bi(
      [
        "Traiter toute sortie LLM comme non fiable",
        "Valider le format attendu",
        "Échapper ou neutraliser le contenu",
        "Utiliser des allowlists",
        "Exiger une confirmation pour les actions critiques",
      ],
      [
        "Treat every LLM output as untrusted",
        "Validate expected formats",
        "Escape or sanitize content",
        "Use allowlists",
        "Require confirmation for critical actions",
      ]
    ),

    developerGuidelines: bi(
      [
        "Ne jamais utiliser directement une réponse dans eval, exec ou shell",
        "Utiliser des requêtes SQL paramétrées",
        "Filtrer les URLs",
        "Valider les paramètres envoyés aux outils",
      ],
      [
        "Never pass model output directly to eval, exec or shell",
        "Use parameterized SQL queries",
        "Filter URLs",
        "Validate parameters passed to tools",
      ]
    ),

    defense: bi(
      "La sortie du modèle doit passer par un validateur spécifique à la destination avant toute utilisation.",
      "Model output should pass through a destination-specific validator before use."
    ),

    architecture: [
      "Target LLM",
      "Output Parser",
      "Schema Validation",
      "Sanitization",
      "Action Authorization",
      "Safe Sink",
    ],
  },


  // ============================================================
  // LLM06
  // ============================================================

  {
    id: "LLM06",

    implemented: true,

    severity: "CRITICAL",

    scenarioEndpoint:
      "/api/attacks/excessive-agency/scenarios",

    title: bi(
      "Autonomie excessive",
      "Excessive Agency"
    ),

    summary: bi(
      "Attribution à un agent IA de capacités ou permissions supérieures à ce qui est nécessaire.",
      "Giving an AI agent more capabilities or permissions than necessary."
    ),

    explanation: bi(
      "Un agent capable d'utiliser des outils, modifier des données ou déclencher des opérations réelles peut produire des impacts importants si ses permissions et son autonomie ne sont pas limitées.",
      "An agent capable of using tools, modifying data or triggering real operations can have significant impact when its permissions and autonomy are not constrained."
    ),

    risks: bi(
      [
        "Envoi massif non autorisé",
        "Suppression de données",
        "Transaction financière non autorisée",
        "Élévation de privilèges",
        "Transfert de données vers un service externe",
      ],
      [
        "Unauthorized bulk communication",
        "Data deletion",
        "Unauthorized financial transaction",
        "Privilege escalation",
        "Transfer of data to external services",
      ]
    ),

    prevention: bi(
      [
        "Appliquer le moindre privilège",
        "Exiger une validation humaine pour les actions critiques",
        "Limiter les outils accessibles",
        "Définir des quotas et limites d'action",
        "Tracer toutes les actions de l'agent",
      ],
      [
        "Apply least privilege",
        "Require human approval for critical actions",
        "Restrict accessible tools",
        "Define quotas and action limits",
        "Trace every agent action",
      ]
    ),

    developerGuidelines: bi(
      [
        "Séparer raisonnement et autorisation d'action",
        "Ne jamais laisser un agent augmenter ses propres privilèges",
        "Utiliser des permissions explicites par outil",
        "Prévoir des mécanismes d'arrêt",
      ],
      [
        "Separate reasoning from action authorization",
        "Never allow an agent to increase its own privileges",
        "Use explicit per-tool permissions",
        "Implement emergency stop mechanisms",
      ]
    ),

    defense: bi(
      "Toute action à impact réel doit être autorisée indépendamment du raisonnement produit par le modèle.",
      "Every real-world action should be authorized independently from the model's reasoning."
    ),

    architecture: [
      "Agent Planner",
      "Policy Engine",
      "Permission Check",
      "Human Approval",
      "Tool Gateway",
      "Audit Log",
    ],
  },


  // ============================================================
  // LLM07
  // ============================================================

  {
    id: "LLM07",

    implemented: true,

    severity: "HIGH",

    scenarioEndpoint:
      "/api/attacks/system-prompt-leakage/scenarios",

    title: bi(
      "Fuite du prompt système",
      "System Prompt Leakage"
    ),

    summary: bi(
      "Divulgation des instructions internes, politiques ou secrets contenus dans le contexte système.",
      "Disclosure of internal instructions, policies or secrets contained in the system context."
    ),

    explanation: bi(
      "Le prompt système peut contenir des politiques, informations d'architecture ou valeurs de test qui ne doivent pas être exposées. Les attaques peuvent demander une copie directe, une traduction, un encodage ou simuler un mode debug.",
      "The system prompt may contain policies, architectural information or test values that should remain hidden. Attacks may request direct disclosure, translation, encoding or fake debug access."
    ),

    risks: bi(
      [
        "Exposition des règles internes",
        "Révélation de secrets présents dans le contexte",
        "Découverte des mécanismes de défense",
        "Facilitation de nouvelles injections de prompt",
        "Fuite par transformation ou encodage",
      ],
      [
        "Exposure of internal rules",
        "Disclosure of secrets contained in context",
        "Discovery of defensive mechanisms",
        "Enabling further prompt injection",
        "Leakage through transformation or encoding",
      ]
    ),

    prevention: bi(
      [
        "Ne pas stocker de secrets réels dans le prompt système",
        "Détecter les demandes d'extraction",
        "Utiliser des canaries synthétiques pendant les tests",
        "Inspecter les transformations et encodages",
        "Limiter les détails des messages d'erreur",
      ],
      [
        "Do not store real secrets in the system prompt",
        "Detect extraction requests",
        "Use synthetic canaries during testing",
        "Inspect transformations and encodings",
        "Limit error-message detail",
      ]
    ),

    developerGuidelines: bi(
      [
        "Séparer secrets et instructions",
        "Tester traduction, Base64 et reformulation",
        "Ne pas faire confiance aux modes debug déclarés par l'utilisateur",
        "Vérifier la réponse avec un détecteur déterministe",
      ],
      [
        "Separate secrets from instructions",
        "Test translation, Base64 and paraphrasing",
        "Do not trust user-declared debug modes",
        "Verify responses using deterministic detection",
      ]
    ),

    defense: bi(
      "Le système doit détecter la présence réelle d'informations protégées dans la réponse plutôt que de se fier uniquement à une déclaration du modèle.",
      "The system should detect actual protected information in the response instead of relying only on the model's declaration."
    ),

    architecture: [
      "System Prompt Isolation",
      "Input Guard",
      "Target LLM",
      "Canary Detector",
      "Output Guard",
      "Independent Judge",
    ],
  },


  // ============================================================
  // LLM08
  // ============================================================

  {
    id: "LLM08",

    implemented: true,

    severity: "HIGH",

    scenarioEndpoint:
      "/api/attacks/vector-embedding-weaknesses/scenarios",

    title: bi(
      "Faiblesses des vecteurs et embeddings",
      "Vector and Embedding Weaknesses"
    ),

    summary: bi(
      "Faiblesses de sécurité dans le stockage vectoriel, les embeddings et les mécanismes de retrieval.",
      "Security weaknesses in vector stores, embeddings and retrieval mechanisms."
    ),

    explanation: bi(
      "Les systèmes RAG utilisent des vecteurs pour retrouver du contexte. Une mauvaise isolation des tenants, des métadonnées insuffisantes ou des documents adversariaux peuvent faire remonter des informations incorrectes ou non autorisées.",
      "RAG systems use vectors to retrieve context. Weak tenant isolation, insufficient metadata controls or adversarial documents may retrieve incorrect or unauthorized information."
    ),

    risks: bi(
      [
        "Retrieval inter-tenant",
        "Document empoisonné à forte similarité",
        "Contournement des filtres metadata",
        "Flooding de chunks adversariaux",
        "Embeddings provenant d'une source non fiable",
      ],
      [
        "Cross-tenant retrieval",
        "High-similarity poisoned document",
        "Metadata filter bypass",
        "Adversarial chunk flooding",
        "Embeddings from untrusted sources",
      ]
    ),

    prevention: bi(
      [
        "Appliquer les contrôles d'accès avant la recherche vectorielle",
        "Filtrer les résultats par tenant",
        "Valider la provenance des documents",
        "Détecter les doublons adversariaux",
        "Contrôler l'identité du modèle d'embedding",
      ],
      [
        "Apply authorization before vector retrieval",
        "Filter results by tenant",
        "Validate document provenance",
        "Detect adversarial duplicates",
        "Control embedding-model identity",
      ]
    ),

    developerGuidelines: bi(
      [
        "Ne jamais utiliser le score de similarité comme contrôle de sécurité",
        "Associer les vecteurs à des métadonnées d'autorisation",
        "Tester les recherches cross-tenant",
        "Tracer la provenance de chaque chunk",
      ],
      [
        "Never use similarity score as a security control",
        "Associate vectors with authorization metadata",
        "Test cross-tenant retrieval",
        "Trace the provenance of every chunk",
      ]
    ),

    defense: bi(
      "Chaque résultat vectoriel doit être réautorisé et validé avant son injection dans le contexte du LLM.",
      "Every vector retrieval result should be re-authorized and validated before entering the LLM context."
    ),

    architecture: [
      "Identity",
      "Authorization Filter",
      "Vector Store",
      "Retrieval Validation",
      "Context Builder",
      "Target LLM",
    ],
  },


  // ============================================================
  // LLM09
  // ============================================================

  {
    id: "LLM09",

    implemented: true,

    severity: "MEDIUM",

    scenarioEndpoint:
      "/api/attacks/misinformation/scenarios",

    title: bi(
      "Désinformation",
      "Misinformation"
    ),

    summary: bi(
      "Production d'affirmations incorrectes, non vérifiées ou présentées avec une confiance injustifiée.",
      "Production of incorrect, unverified or unjustifiably confident claims."
    ),

    explanation: bi(
      "Un LLM peut générer des chiffres, certifications, citations ou conclusions qui ne sont pas soutenus par les données disponibles. Dans un contexte entreprise, ces erreurs peuvent influencer des décisions importantes.",
      "An LLM may generate numbers, certifications, citations or conclusions unsupported by available evidence. In enterprise environments these errors can influence important decisions."
    ),

    risks: bi(
      [
        "Métriques inventées",
        "Citations fictives",
        "Fausses certifications",
        "Fausse certitude",
        "Contradiction des sources",
      ],
      [
        "Fabricated metrics",
        "Fake citations",
        "False certifications",
        "False certainty",
        "Conflicting evidence",
      ]
    ),

    prevention: bi(
      [
        "Grounder les réponses sur des sources vérifiées",
        "Fournir des citations traçables",
        "Détecter l'absence de preuve",
        "Exprimer explicitement l'incertitude",
        "Utiliser une vérification indépendante",
      ],
      [
        "Ground responses in verified sources",
        "Provide traceable citations",
        "Detect missing evidence",
        "Explicitly express uncertainty",
        "Use independent verification",
      ]
    ),

    developerGuidelines: bi(
      [
        "Distinguer faits et inférences",
        "Ne pas inventer une valeur manquante",
        "Associer chaque affirmation importante à une source",
        "Vérifier les informations critiques avant action",
      ],
      [
        "Distinguish facts from inference",
        "Do not invent missing values",
        "Associate important claims with evidence",
        "Verify critical information before action",
      ]
    ),

    defense: bi(
      "Une affirmation ne doit être considérée comme vérifiée que si les éléments de preuve fournis la soutiennent effectivement.",
      "A claim should only be considered verified when supplied evidence actually supports it."
    ),

    architecture: [
      "Trusted Sources",
      "Retrieval",
      "Target LLM",
      "Claim Extraction",
      "Evidence Verification",
      "Independent Judge",
    ],
  },


  // ============================================================
  // LLM10
  // ============================================================

  {
    id: "LLM10",

    implemented: true,

    severity: "HIGH",

    scenarioEndpoint:
      "/api/attacks/unbounded-consumption/scenarios",

    title: bi(
      "Consommation non limitée",
      "Unbounded Consumption"
    ),

    summary: bi(
      "Utilisation excessive ou incontrôlée des tokens, requêtes, outils, ressources ou appels de modèles.",
      "Excessive or uncontrolled consumption of tokens, requests, tools, resources or model calls."
    ),

    explanation: bi(
      "Un système IA sans limites de ressources peut être amené à générer des volumes énormes de tokens, lancer des boucles récursives, multiplier les appels d'outils ou exécuter un très grand nombre de requêtes parallèles.",
      "An AI system without resource limits may generate huge token volumes, enter recursive loops, amplify tool calls or execute extremely large numbers of parallel requests."
    ),

    risks: bi(
      [
        "Explosion des coûts",
        "Épuisement des ressources",
        "Boucles d'agents infinies",
        "Amplification des appels outils",
        "Saturation par concurrence excessive",
      ],
      [
        "Cost explosion",
        "Resource exhaustion",
        "Infinite agent loops",
        "Tool-call amplification",
        "Excessive concurrency saturation",
      ]
    ),

    prevention: bi(
      [
        "Définir des limites de tokens",
        "Limiter le nombre d'itérations",
        "Appliquer des quotas utilisateurs",
        "Limiter la concurrence",
        "Imposer des budgets de coût et des timeouts",
      ],
      [
        "Define token limits",
        "Limit iteration counts",
        "Apply per-user quotas",
        "Limit concurrency",
        "Enforce cost budgets and timeouts",
      ]
    ),

    developerGuidelines: bi(
      [
        "Toute boucle agentique doit avoir une condition d'arrêt",
        "Définir un nombre maximum d'appels outils",
        "Mettre en place du rate limiting",
        "Surveiller consommation et coût en temps réel",
      ],
      [
        "Every agent loop must have a termination condition",
        "Define a maximum number of tool calls",
        "Implement rate limiting",
        "Monitor consumption and cost in real time",
      ]
    ),

    defense: bi(
      "Les limites doivent être imposées par l'infrastructure et non uniquement demandées au modèle.",
      "Limits should be enforced by infrastructure rather than merely requested from the model."
    ),

    architecture: [
      "API Gateway",
      "Rate Limiter",
      "Budget Manager",
      "Target LLM",
      "Tool Quotas",
      "Usage Monitoring",
    ],
  },

];
