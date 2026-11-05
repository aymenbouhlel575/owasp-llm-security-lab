import "./SecurityLibrary.css";

import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Lightbulb,
  Loader2,
  Search,
  ShieldCheck,
  TriangleAlert,
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

import {
  securityLibrary,
} from "../data/securityLibrary";


function textPair(
  value
) {
  const text =
    String(
      value || ""
    );

  return {
    fr: text,
    en: text,
  };
}


function normalizeScenario(
  scenario,
  risk,
  index
) {
  return {
    id:
      scenario.id ||
      `${risk.id}-${String(
        index + 1
      ).padStart(
        2,
        "0"
      )}`,

    name:
      textPair(
        scenario.name ||
        `Scenario ${index + 1}`
      ),

    technique:
      textPair(
        scenario.technique ||
        ""
      ),

    goal:
      textPair(
        scenario.objective ||
        ""
      ),

    example:
      scenario.payload ||
      "",

    defense:
      risk.defense,
  };
}


export default function SecurityLibrary() {
  const {
    i18n,
  } = useTranslation();


  const isFrench =
    i18n.resolvedLanguage
      ?.toLowerCase()
      .startsWith(
        "fr"
      );


  const language =
    isFrench
      ? "fr"
      : "en";


  const [
    catalog,
    setCatalog,
  ] = useState(
    securityLibrary.map(
      risk => ({
        ...risk,
        scenarios: [],
        scenarioLoadError: false,
      })
    )
  );


  const [
    selectedRiskId,
    setSelectedRiskId,
  ] = useState(
    "LLM01"
  );


  const [
    search,
    setSearch,
  ] = useState(
    ""
  );


  const [
    openedScenario,
    setOpenedScenario,
  ] = useState(
    null
  );


  const [
    loadingScenarios,
    setLoadingScenarios,
  ] = useState(
    true
  );


  // ============================================================
  // LOAD THE REAL ATTACK-LAB SCENARIOS
  // ============================================================

  useEffect(
    () => {

      let cancelled =
        false;


      async function loadLibraryScenarios() {

        setLoadingScenarios(
          true
        );


        const loaded =
          await Promise.all(
            securityLibrary.map(
              async risk => {

                try {

                  const response =
                    await fetch(
                      `${API_URL}${risk.scenarioEndpoint}`
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


                  const scenarios =
                    Array.isArray(
                      data.scenarios
                    )
                      ? data.scenarios
                      : [];


                  return {
                    ...risk,

                    scenarios:
                      scenarios.map(
                        (
                          scenario,
                          index
                        ) =>
                          normalizeScenario(
                            scenario,
                            risk,
                            index
                          )
                      ),

                    scenarioLoadError:
                      false,

                    backendCategory:
                      data.category ||
                      "",

                    provider:
                      data.provider ||
                      "",

                    model:
                      data.model ||
                      "",

                    mode:
                      data.mode ||
                      "",

                    models:
                      data.models ||
                      null,
                  };

                } catch (
                  error
                ) {

                  console.error(
                    `Security Library ${risk.id}:`,
                    error
                  );


                  return {
                    ...risk,

                    scenarios: [],

                    scenarioLoadError:
                      true,
                  };
                }
              }
            )
          );


        if (
          !cancelled
        ) {

          setCatalog(
            loaded
          );

          setLoadingScenarios(
            false
          );
        }
      }


      loadLibraryScenarios();


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

  const filteredRisks =
    useMemo(
      () => {

        const value =
          search
            .trim()
            .toLowerCase();


        if (
          !value
        ) {
          return catalog;
        }


        return catalog.filter(
          risk => {

            const scenariosText =
              risk.scenarios
                .map(
                  scenario =>
                    [
                      scenario.name[
                        language
                      ],
                      scenario.technique[
                        language
                      ],
                      scenario.goal[
                        language
                      ],
                    ]
                    .join(
                      " "
                    )
                )
                .join(
                  " "
                )
                .toLowerCase();


            return (
              risk.id
                .toLowerCase()
                .includes(
                  value
                )
              ||
              risk.title[
                language
              ]
                .toLowerCase()
                .includes(
                  value
                )
              ||
              risk.summary[
                language
              ]
                .toLowerCase()
                .includes(
                  value
                )
              ||
              scenariosText.includes(
                value
              )
            );
          }
        );

      },
      [
        catalog,
        search,
        language,
      ]
    );


  const selectedRisk =
    useMemo(
      () =>
        catalog.find(
          risk =>
            risk.id ===
            selectedRiskId
        )
        ||
        catalog[0]
        ||
        null,
      [
        catalog,
        selectedRiskId,
      ]
    );


  return (
    <div className="security-library">

      {/* =======================================================
          HERO
          ======================================================= */}

      <div className="library-hero">

        <div>

          <span className="eyebrow">
            {
              isFrench
                ? "CENTRE DE CONNAISSANCES"
                : "KNOWLEDGE CENTER"
            }
          </span>


          <h1>
            {
              isFrench
                ? "Bibliothèque Sécurité IA"
                : "AI Security Library"
            }
          </h1>


          <p>
            {
              isFrench
                ? (
                    "Référentiel des 10 risques OWASP LLM testés "
                    + "par la plateforme, avec scénarios réels, "
                    + "risques et recommandations défensives."
                  )
                : (
                    "Knowledge base for the 10 OWASP LLM risks "
                    + "tested by the platform, including live "
                    + "scenarios, risks and defensive guidance."
                  )
            }
          </p>

        </div>


        <div className="library-hero-status">

          <BookOpen
            size={30}
          />


          <div>

            <strong>
              10 / 10
            </strong>

            <span>
              {
                isFrench
                  ? "risques implémentés"
                  : "risks implemented"
              }
            </span>

          </div>

        </div>

      </div>


      {/* =======================================================
          SEARCH
          ======================================================= */}

      <div className="library-search">

        <Search
          size={17}
        />


        <input
          type="text"
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
              ? "Rechercher une attaque, un risque ou un scénario..."
              : "Search an attack, risk or scenario..."
          }
        />


        {
          loadingScenarios &&
          (
            <Loader2
              className="spin"
              size={17}
            />
          )
        }

      </div>


      <div className="library-layout">

        {/* =====================================================
            LEFT LIST
            ===================================================== */}

        <aside className="library-risk-list">

          {
            filteredRisks.map(
              risk => (

                <button
                  type="button"
                  key={
                    risk.id
                  }
                  className={
                    selectedRisk?.id ===
                    risk.id
                      ? "library-risk-button active"
                      : "library-risk-button"
                  }
                  onClick={() => {

                    setSelectedRiskId(
                      risk.id
                    );

                    setOpenedScenario(
                      null
                    );
                  }}
                >

                  <div>

                    <strong>
                      {
                        risk.id
                      }
                    </strong>


                    <span>
                      {
                        risk.title[
                          language
                        ]
                      }
                    </span>

                  </div>


                  <div className="library-risk-status">

                    {
                      risk.scenarios.length >
                      0 &&
                      (
                        <span className="library-scenario-count">
                          {
                            risk.scenarios.length
                          }
                        </span>
                      )
                    }


                    {
                      risk.implemented &&
                      (
                        <CheckCircle2
                          size={16}
                        />
                      )
                    }

                  </div>

                </button>

              )
            )
          }

        </aside>


        {/* =====================================================
            CONTENT
            ===================================================== */}

        {
          selectedRisk &&
          (
            <main className="library-content">

              {/* TITLE */}

              <section className="library-title-card">

                <div>

                  <span className="library-risk-code">
                    {
                      selectedRisk.id
                    }
                  </span>


                  <h2>
                    {
                      selectedRisk
                        .title[
                          language
                        ]
                    }
                  </h2>


                  <p>
                    {
                      selectedRisk
                        .summary[
                          language
                        ]
                    }
                  </p>

                </div>


                <span className="library-severity">
                  {
                    selectedRisk.severity
                  }
                </span>

              </section>


              {/* LIVE ENGINE INFORMATION */}

              {
                (
                  selectedRisk.model ||
                  selectedRisk.models
                ) &&
                (
                  <section className="library-runtime-card">

                    <div>

                      <span>
                        {
                          isFrench
                            ? "MODÈLE CIBLE"
                            : "TARGET MODEL"
                        }
                      </span>

                      <strong>
                        {
                          selectedRisk
                            .models
                            ?.target
                            ?.model
                          ||
                          selectedRisk.model
                          ||
                          "—"
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        ATTACKER
                      </span>

                      <strong>
                        {
                          selectedRisk
                            .models
                            ?.attacker
                            ?.model
                          ||
                          (
                            isFrench
                              ? "Configuration historique"
                              : "Legacy configuration"
                          )
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        JUDGE
                      </span>

                      <strong>
                        {
                          selectedRisk
                            .models
                            ?.judge
                            ?.model
                          ||
                          (
                            isFrench
                              ? "Configuration historique"
                              : "Legacy configuration"
                          )
                        }
                      </strong>

                    </div>


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
                          selectedRisk
                            .scenarios
                            .length
                        }
                      </strong>

                    </div>

                  </section>
                )
              }


              {/* WHAT IS IT */}

              <section className="library-section">

                <div className="library-section-heading">

                  <Lightbulb
                    size={19}
                  />

                  <h3>
                    {
                      isFrench
                        ? "Qu'est-ce que c'est ?"
                        : "What is it?"
                    }
                  </h3>

                </div>


                <p className="library-paragraph">
                  {
                    selectedRisk
                      .explanation[
                        language
                      ]
                  }
                </p>

              </section>


              {/* RISKS */}

              <section className="library-section">

                <div className="library-section-heading">

                  <TriangleAlert
                    size={19}
                  />

                  <h3>
                    {
                      isFrench
                        ? "Risques possibles"
                        : "Potential risks"
                    }
                  </h3>

                </div>


                <div className="library-list">

                  {
                    selectedRisk
                      .risks[
                        language
                      ]
                      .map(
                        (
                          item,
                          index
                        ) => (

                          <div
                            key={
                              index
                            }
                          >

                            <TriangleAlert
                              size={15}
                            />

                            <span>
                              {
                                item
                              }
                            </span>

                          </div>

                        )
                      )
                  }

                </div>

              </section>


              {/* REAL SCENARIOS */}

              <section className="library-section">

                <div className="library-section-heading">

                  <Code2
                    size={19}
                  />

                  <h3>
                    {
                      isFrench
                        ? "Scénarios réels du laboratoire"
                        : "Live Attack Lab scenarios"
                    }
                  </h3>

                </div>


                <p className="library-section-description">
                  {
                    isFrench
                      ? (
                          "Cette liste est chargée directement depuis "
                          + "le backend du Laboratoire d'attaques. "
                          + "Elle reste donc synchronisée avec les tests exécutés."
                        )
                      : (
                          "This list is loaded directly from the Attack Lab backend "
                          + "and therefore stays synchronized with the executed tests."
                        )
                  }
                </p>


                {
                  selectedRisk.scenarioLoadError
                    ? (
                        <div className="library-load-error">

                          <TriangleAlert
                            size={17}
                          />

                          <span>
                            {
                              isFrench
                                ? "Impossible de charger les scénarios depuis le backend."
                                : "Unable to load scenarios from the backend."
                            }
                          </span>

                        </div>
                      )
                    : (
                        <div className="library-scenarios">

                          {
                            selectedRisk.scenarios.map(
                              (
                                scenario,
                                index
                              ) => {

                                const opened =
                                  openedScenario ===
                                  scenario.id;


                                return (
                                  <div
                                    className="library-scenario"
                                    key={
                                      scenario.id
                                    }
                                  >

                                    <button
                                      type="button"
                                      className="library-scenario-header"
                                      onClick={() =>
                                        setOpenedScenario(
                                          opened
                                            ? null
                                            : scenario.id
                                        )
                                      }
                                    >

                                      <div>

                                        <span>
                                          {
                                            `SCENARIO ${String(
                                              index + 1
                                            ).padStart(
                                              2,
                                              "0"
                                            )}`
                                          }
                                        </span>


                                        <strong>
                                          {
                                            scenario
                                              .name[
                                                language
                                              ]
                                          }
                                        </strong>

                                      </div>


                                      {
                                        opened
                                          ? (
                                              <ChevronDown
                                                size={18}
                                              />
                                            )
                                          : (
                                              <ChevronRight
                                                size={18}
                                              />
                                            )
                                      }

                                    </button>


                                    {
                                      opened &&
                                      (
                                        <div className="library-scenario-body">

                                          <div className="library-scenario-property">

                                            <span>
                                              TECHNIQUE
                                            </span>

                                            <p>
                                              {
                                                scenario
                                                  .technique[
                                                    language
                                                  ]
                                                ||
                                                "—"
                                              }
                                            </p>

                                          </div>


                                          <div className="library-scenario-property">

                                            <span>
                                              {
                                                isFrench
                                                  ? "OBJECTIF DU TEST"
                                                  : "TEST OBJECTIVE"
                                              }
                                            </span>

                                            <p>
                                              {
                                                scenario
                                                  .goal[
                                                    language
                                                  ]
                                                ||
                                                "—"
                                              }
                                            </p>

                                          </div>


                                          <div className="library-scenario-property">

                                            <span>
                                              {
                                                isFrench
                                                  ? "PAYLOAD SEED"
                                                  : "SEED PAYLOAD"
                                              }
                                            </span>

                                            <pre>
                                              {
                                                scenario.example ||
                                                "—"
                                              }
                                            </pre>

                                          </div>


                                          <div className="library-defense">

                                            <ShieldCheck
                                              size={17}
                                            />


                                            <div>

                                              <strong>
                                                {
                                                  isFrench
                                                    ? "Protection recommandée"
                                                    : "Recommended defense"
                                                }
                                              </strong>


                                              <p>
                                                {
                                                  scenario
                                                    .defense[
                                                      language
                                                    ]
                                                }
                                              </p>

                                            </div>

                                          </div>

                                        </div>
                                      )
                                    }

                                  </div>
                                );
                              }
                            )
                          }

                        </div>
                      )
                }

              </section>


              {/* PREVENTION */}

              <section className="library-section">

                <div className="library-section-heading">

                  <ShieldCheck
                    size={19}
                  />

                  <h3>
                    {
                      isFrench
                        ? "Comment réduire le risque ?"
                        : "How to reduce the risk"
                    }
                  </h3>

                </div>


                <div className="library-checklist">

                  {
                    selectedRisk
                      .prevention[
                        language
                      ]
                      .map(
                        (
                          item,
                          index
                        ) => (

                          <div
                            key={
                              index
                            }
                          >

                            <CheckCircle2
                              size={16}
                            />

                            <span>
                              {
                                item
                              }
                            </span>

                          </div>

                        )
                      )
                  }

                </div>

              </section>


              {/* DEVELOPER GUIDELINES */}

              <section className="library-section">

                <div className="library-section-heading">

                  <Code2
                    size={19}
                  />

                  <h3>
                    {
                      isFrench
                        ? "Consignes pour les développeurs IA"
                        : "Guidelines for AI developers"
                    }
                  </h3>

                </div>


                <div className="library-checklist">

                  {
                    selectedRisk
                      .developerGuidelines[
                        language
                      ]
                      .map(
                        (
                          item,
                          index
                        ) => (

                          <div
                            key={
                              index
                            }
                          >

                            <CheckCircle2
                              size={16}
                            />

                            <span>
                              {
                                item
                              }
                            </span>

                          </div>

                        )
                      )
                  }

                </div>

              </section>


              {/* ARCHITECTURE */}

              <section className="library-section">

                <div className="library-section-heading">

                  <ShieldCheck
                    size={19}
                  />

                  <h3>
                    {
                      isFrench
                        ? "Architecture défensive recommandée"
                        : "Recommended defensive architecture"
                    }
                  </h3>

                </div>


                <div className="library-architecture">

                  {
                    selectedRisk
                      .architecture
                      .map(
                        (
                          step,
                          index
                        ) => (

                          <div
                            key={
                              `${selectedRisk.id}-${step}`
                            }
                            className="library-architecture-step"
                          >

                            <span>
                              {
                                index + 1
                              }
                            </span>


                            <strong>
                              {
                                step
                              }
                            </strong>

                          </div>

                        )
                      )
                  }

                </div>

              </section>

            </main>
          )
        }

      </div>

    </div>
  );
}
