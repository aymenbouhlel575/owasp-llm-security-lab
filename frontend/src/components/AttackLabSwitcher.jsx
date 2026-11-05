import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  ChevronRight,
  FlaskConical,
  Loader2,
  Search,
  ShieldCheck,
  ShieldOff,
  Target,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useTranslation,
} from "react-i18next";

import {
  API_URL,
} from "../api";

import AttackProcess
  from "./AttackProcess";

import SensitiveInformationProcess
  from "./SensitiveInformationProcess";

import SupplyChainProcess
  from "./SupplyChainProcess";

import DataModelPoisoningProcess
  from "./DataModelPoisoningProcess";

import ImproperOutputHandlingProcess
  from "./ImproperOutputHandlingProcess";

import ExcessiveAgencyProcess
  from "./ExcessiveAgencyProcess";

import SystemPromptLeakageProcess
  from "./SystemPromptLeakageProcess";

import VectorEmbeddingProcess
  from "./VectorEmbeddingProcess";

import MisinformationProcess
  from "./MisinformationProcess";

import UnboundedConsumptionProcess
  from "./UnboundedConsumptionProcess";

import "./AttackLabSwitcher.css";


const ATTACK_FAMILIES = [
  {
    id: "llm01",
    code: "LLM01",

    fr: "Injection de prompt",
    en: "Prompt Injection",

    descriptionFr:
      "Manipulation des instructions afin de contourner les règles du modèle.",

    descriptionEn:
      "Manipulation of instructions to bypass the model security rules.",

    severity: "HIGH",

    endpoint:
      "/api/attacks/prompt-injection/scenarios",

    icon: AlertTriangle,

    component:
      AttackProcess,
  },

  {
    id: "llm02",
    code: "LLM02",

    fr:
      "Divulgation d'informations sensibles",

    en:
      "Sensitive Information Disclosure",

    descriptionFr:
      "Tentatives d'extraction de secrets, données privées ou informations confidentielles.",

    descriptionEn:
      "Attempts to extract secrets, private data or confidential information.",

    severity: "HIGH",

    endpoint:
      "/api/attacks/sensitive-information/scenarios",

    icon: ShieldOff,

    component:
      SensitiveInformationProcess,
  },

  {
    id: "llm03",
    code: "LLM03",

    fr:
      "Chaîne d'approvisionnement",

    en:
      "Supply Chain",

    descriptionFr:
      "Validation de la provenance et de l'intégrité des composants IA.",

    descriptionEn:
      "Validation of AI component provenance and integrity.",

    severity: "HIGH",

    endpoint:
      "/api/attacks/supply-chain/scenarios",

    icon: AlertTriangle,

    component:
      SupplyChainProcess,
  },

  {
    id: "llm04",
    code: "LLM04",

    fr:
      "Empoisonnement données/modèle",

    en:
      "Data and Model Poisoning",

    descriptionFr:
      "Détection de données ou connaissances malveillantes capables d'altérer le modèle.",

    descriptionEn:
      "Detection of malicious data or knowledge capable of altering model behavior.",

    severity: "HIGH",

    endpoint:
      "/api/attacks/data-model-poisoning/scenarios",

    icon: ShieldOff,

    component:
      DataModelPoisoningProcess,
  },

  {
    id: "llm05",
    code: "LLM05",

    fr:
      "Mauvaise gestion des sorties",

    en:
      "Improper Output Handling",

    descriptionFr:
      "Analyse des sorties dangereuses avant leur utilisation par une application.",

    descriptionEn:
      "Analysis of dangerous model output before downstream application use.",

    severity: "HIGH",

    endpoint:
      "/api/attacks/improper-output-handling/scenarios",

    icon: AlertTriangle,

    component:
      ImproperOutputHandlingProcess,
  },

  {
    id: "llm06",
    code: "LLM06",

    fr:
      "Autonomie excessive",

    en:
      "Excessive Agency",

    descriptionFr:
      "Contrôle des actions autonomes et des permissions accordées aux agents IA.",

    descriptionEn:
      "Control of autonomous actions and permissions granted to AI agents.",

    severity: "CRITICAL",

    endpoint:
      "/api/attacks/excessive-agency/scenarios",

    icon: ShieldOff,

    component:
      ExcessiveAgencyProcess,
  },

  {
    id: "llm07",
    code: "LLM07",

    fr:
      "Fuite du prompt système",

    en:
      "System Prompt Leakage",

    descriptionFr:
      "Détection de divulgation des instructions internes ou secrets du contexte système.",

    descriptionEn:
      "Detection of internal system instructions or system-context secret disclosure.",

    severity: "HIGH",

    endpoint:
      "/api/attacks/system-prompt-leakage/scenarios",

    icon: AlertTriangle,

    component:
      SystemPromptLeakageProcess,
  },

  {
    id: "llm08",
    code: "LLM08",

    fr:
      "Faiblesses vecteurs/embeddings",

    en:
      "Vector and Embedding Weaknesses",

    descriptionFr:
      "Tests de sécurité des embeddings, métadonnées et mécanismes de retrieval RAG.",

    descriptionEn:
      "Security testing of embeddings, metadata and RAG retrieval mechanisms.",

    severity: "HIGH",

    endpoint:
      "/api/attacks/vector-embedding-weaknesses/scenarios",

    icon: ShieldOff,

    component:
      VectorEmbeddingProcess,
  },

  {
    id: "llm09",
    code: "LLM09",

    fr:
      "Désinformation",

    en:
      "Misinformation",

    descriptionFr:
      "Détection d'affirmations non vérifiées, inventées ou insuffisamment sourcées.",

    descriptionEn:
      "Detection of unverified, fabricated or insufficiently grounded claims.",

    severity: "MEDIUM",

    endpoint:
      "/api/attacks/misinformation/scenarios",

    icon: AlertTriangle,

    component:
      MisinformationProcess,
  },

  {
    id: "llm10",
    code: "LLM10",

    fr:
      "Consommation non limitée",

    en:
      "Unbounded Consumption",

    descriptionFr:
      "Protection contre les coûts, boucles, appels outils et consommations non contrôlés.",

    descriptionEn:
      "Protection against uncontrolled costs, loops, tool calls and resource consumption.",

    severity: "HIGH",

    endpoint:
      "/api/attacks/unbounded-consumption/scenarios",

    icon: ShieldOff,

    component:
      UnboundedConsumptionProcess,
  },
];


function getScenarioCount(
  metadata
) {
  if (
    metadata?.total !==
    undefined
  ) {
    return metadata.total;
  }

  if (
    Array.isArray(
      metadata?.scenarios
    )
  ) {
    return metadata
      .scenarios
      .length;
  }

  return null;
}


function getTargetModel(
  metadata
) {
  return (
    metadata
      ?.models
      ?.target
      ?.model
    ||
    metadata?.model
    ||
    "—"
  );
}


function getAttackerModel(
  metadata
) {
  return (
    metadata
      ?.models
      ?.attacker
      ?.model
    ||
    "—"
  );
}


function getJudgeModel(
  metadata
) {
  return (
    metadata
      ?.models
      ?.judge
      ?.model
    ||
    "—"
  );
}


export default function AttackLabSwitcher({
  onCompleted,
}) {
  const {
    i18n,
  } = useTranslation();


  const isFrench =
    i18n.resolvedLanguage
      ?.toLowerCase()
      .startsWith(
        "fr"
      );


  const [
    activeFamily,
    setActiveFamily,
  ] = useState(
    "llm01"
  );


  const [
    search,
    setSearch,
  ] = useState(
    ""
  );


  const [
    metadata,
    setMetadata,
  ] = useState(
    {}
  );


  const [
    loadingMetadata,
    setLoadingMetadata,
  ] = useState(
    true
  );


  // ============================================================
  // LOAD METADATA FOR THE 10 REAL BACKEND ATTACKS
  // ============================================================

  useEffect(
    () => {

      let cancelled =
        false;


      async function loadMetadata() {

        setLoadingMetadata(
          true
        );


        const entries =
          await Promise.all(
            ATTACK_FAMILIES.map(
              async family => {

                try {

                  const response =
                    await fetch(
                      `${API_URL}${family.endpoint}`
                    );


                  if (
                    !response.ok
                  ) {
                    throw new Error(
                      `HTTP ${response.status}`
                    );
                  }


                  const data =
                    await response.json();


                  return [
                    family.id,

                    {
                      status:
                        "ready",

                      ...data,
                    },
                  ];

                } catch (
                  error
                ) {

                  console.error(
                    `${family.code} metadata`,
                    error
                  );


                  return [
                    family.id,

                    {
                      status:
                        "error",
                    },
                  ];
                }
              }
            )
          );


        if (
          !cancelled
        ) {

          setMetadata(
            Object.fromEntries(
              entries
            )
          );


          setLoadingMetadata(
            false
          );
        }
      }


      loadMetadata();


      return () => {
        cancelled =
          true;
      };

    },
    []
  );


  // ============================================================
  // SEARCH
  // ============================================================

  const visibleFamilies =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLowerCase();


        if (
          !query
        ) {
          return ATTACK_FAMILIES;
        }


        return ATTACK_FAMILIES.filter(
          family => {

            return (
              family.code
                .toLowerCase()
                .includes(
                  query
                )
              ||
              family.fr
                .toLowerCase()
                .includes(
                  query
                )
              ||
              family.en
                .toLowerCase()
                .includes(
                  query
                )
              ||
              family
                .descriptionFr
                .toLowerCase()
                .includes(
                  query
                )
              ||
              family
                .descriptionEn
                .toLowerCase()
                .includes(
                  query
                )
            );
          }
        );

      },
      [
        search,
      ]
    );


  const selected =
    ATTACK_FAMILIES.find(
      family =>
        family.id ===
        activeFamily
    )
    ||
    ATTACK_FAMILIES[
      0
    ];


  const selectedMetadata =
    metadata[
      selected.id
    ]
    ||
    {};


  const ActiveComponent =
    selected.component;


  const readyCount =
    Object.values(
      metadata
    ).filter(
      item =>
        item.status ===
        "ready"
    ).length;


  const scenarioCount =
    getScenarioCount(
      selectedMetadata
    );


  const multiLLM =
    Boolean(
      selectedMetadata
        ?.models
        ?.attacker
      &&
      selectedMetadata
        ?.models
        ?.judge
    );


  return (
    <div className="attack-lab-switcher">

      {/* =====================================================
          CONTROL BAR
          ===================================================== */}

      <section className="attack-control-bar">

        <div className="attack-control-summary">

          <div className="attack-control-icon">

            <FlaskConical
              size={20}
            />

          </div>


          <div>

            <strong>
              {
                isFrench
                  ? "Sélection du test"
                  : "Security test selection"
              }
            </strong>


            <span>
              {
                isFrench
                  ? (
                      `${readyCount}/10 familles disponibles`
                    )
                  : (
                      `${readyCount}/10 families available`
                    )
              }
            </span>

          </div>

        </div>


        <div className="attack-search">

          <Search
            size={16}
          />


          <input
            value={
              search
            }
            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }
            placeholder={
              isFrench
                ? "Rechercher LLM01, fuite, agent..."
                : "Search LLM01, leakage, agent..."
            }
          />


          {
            loadingMetadata &&
            (
              <Loader2
                className="spin"
                size={16}
              />
            )
          }

        </div>

      </section>


      {/* =====================================================
          ATTACK FAMILY SELECTOR
          ===================================================== */}

      <section className="attack-selector-grid">

        {
          visibleFamilies.map(
            family => {

              const Icon =
                family.icon;


              const active =
                family.id ===
                activeFamily;


              const info =
                metadata[
                  family.id
                ]
                ||
                {};


              const count =
                getScenarioCount(
                  info
                );


              const ready =
                info.status ===
                "ready";


              return (
                <button
                  type="button"
                  key={
                    family.id
                  }
                  className={
                    [
                      "attack-selector-card",

                      active
                        ? "active"
                        : "",

                      ready
                        ? "ready"
                        : "",
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        " "
                      )
                  }
                  onClick={() =>
                    setActiveFamily(
                      family.id
                    )
                  }
                >

                  <div className="attack-selector-card-top">

                    <div className="attack-selector-icon">

                      <Icon
                        size={18}
                      />

                    </div>


                    <span
                      className={
                        `attack-severity-pill ${
                          family
                            .severity
                            .toLowerCase()
                        }`
                      }
                    >
                      {
                        family.severity
                      }
                    </span>

                  </div>


                  <div className="attack-selector-card-body">

                    <span className="attack-selector-code">
                      {
                        family.code
                      }
                    </span>


                    <strong>
                      {
                        isFrench
                          ? family.fr
                          : family.en
                      }
                    </strong>


                    <p>
                      {
                        isFrench
                          ? family
                              .descriptionFr
                          : family
                              .descriptionEn
                      }
                    </p>

                  </div>


                  <div className="attack-selector-card-footer">

                    <div className="attack-endpoint-state">

                      <span
                        className={
                          ready
                            ? "online"
                            : "offline"
                        }
                      />


                      {
                        ready
                          ? (
                              isFrench
                                ? "Prêt"
                                : "Ready"
                            )
                          : (
                              isFrench
                                ? "Non synchronisé"
                                : "Not synchronized"
                            )
                      }

                    </div>


                    <div className="attack-card-scenarios">

                      {
                        count !== null
                          ? (
                              <>
                                {
                                  count
                                }

                                <span>
                                  {
                                    isFrench
                                      ? "scénarios"
                                      : "scenarios"
                                  }
                                </span>
                              </>
                            )
                          : "—"
                      }

                    </div>


                    <ChevronRight
                      size={16}
                      className="attack-card-arrow"
                    />

                  </div>

                </button>
              );
            }
          )
        }

      </section>


      {/* =====================================================
          ACTIVE ATTACK CONTEXT
          ===================================================== */}

      <section className="attack-active-overview">

        <div className="attack-active-main">

          <div className="attack-active-code">

            <Activity
              size={17}
            />

            {
              selected.code
            }

          </div>


          <div>

            <div className="attack-active-title-row">

              <h2>
                {
                  isFrench
                    ? selected.fr
                    : selected.en
                }
              </h2>


              <span
                className={
                  `attack-severity-pill ${
                    selected
                      .severity
                      .toLowerCase()
                  }`
                }
              >
                {
                  selected.severity
                }
              </span>

            </div>


            <p>
              {
                isFrench
                  ? selected
                      .descriptionFr
                  : selected
                      .descriptionEn
              }
            </p>

          </div>

        </div>


        <div className="attack-active-stats">

          <div>

            <span>
              {
                isFrench
                  ? "SCÉNARIOS"
                  : "SCENARIOS"
              }
            </span>

            <strong>
              {
                scenarioCount ??
                "—"
              }
            </strong>

          </div>


          <div>

            <span>
              ENGINE
            </span>

            <strong
              className={
                multiLLM
                  ? "engine-multi"
                  : ""
              }
            >
              {
                multiLLM
                  ? "MULTI-LLM"
                  : "STANDARD"
              }
            </strong>

          </div>


          <div>

            <span>
              STATUS
            </span>

            <strong
              className={
                selectedMetadata
                  .status ===
                "ready"
                  ? "status-ready"
                  : ""
              }
            >
              {
                selectedMetadata
                  .status ===
                "ready"
                  ? (
                      isFrench
                        ? "PRÊT"
                        : "READY"
                    )
                  : "—"
              }
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          MULTI LLM PIPELINE
          ===================================================== */}

      {
        multiLLM &&
        (
          <section className="attack-model-pipeline">

            <div className="attack-model-node attacker">

              <div>
                <BrainCircuit
                  size={18}
                />
              </div>


              <span>
                ATTACKER
              </span>


              <strong>
                {
                  getAttackerModel(
                    selectedMetadata
                  )
                }
              </strong>

            </div>


            <ChevronRight
              className="attack-model-arrow"
              size={18}
            />


            <div className="attack-model-node target">

              <div>
                <Target
                  size={18}
                />
              </div>


              <span>
                TARGET
              </span>


              <strong>
                {
                  getTargetModel(
                    selectedMetadata
                  )
                }
              </strong>

            </div>


            <ChevronRight
              className="attack-model-arrow"
              size={18}
            />


            <div className="attack-model-node judge">

              <div>
                <ShieldCheck
                  size={18}
                />
              </div>


              <span>
                JUDGE
              </span>


              <strong>
                {
                  getJudgeModel(
                    selectedMetadata
                  )
                }
              </strong>

            </div>

          </section>
        )
      }


      {/* =====================================================
          ACTIVE ATTACK INTERFACE
          ===================================================== */}

      <section
        className="attack-interface-container"
        key={
          selected.id
        }
      >

        <div className="attack-interface-heading">

          <div>

            <span>
              {
                isFrench
                  ? "INTERFACE ACTIVE"
                  : "ACTIVE INTERFACE"
              }
            </span>


            <strong>
              {
                selected.code
              }
              {" · "}
              {
                isFrench
                  ? selected.fr
                  : selected.en
              }
            </strong>

          </div>


          <div className="attack-interface-live">

            <span />

            {
              isFrench
                ? "Laboratoire prêt"
                : "Lab ready"
            }

          </div>

        </div>


        <div className="attack-interface-body">

          <ActiveComponent
            onCompleted={
              onCompleted
            }
          />

        </div>

      </section>

    </div>
  );
}
