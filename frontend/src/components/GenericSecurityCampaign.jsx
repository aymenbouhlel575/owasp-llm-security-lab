import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Clock3,
  Eye,
  FlaskConical,
  Layers3,
  Loader2,
  Play,
  RotateCcw,
  ShieldCheck,
  ShieldOff,
  Target,
  Zap,
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
  getAttackTrace,
} from "../api";

import TraceViewer
  from "./TraceViewer";

import "./GenericSecurityCampaign.css";


function formatMs(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  const number =
    Number(
      value
    );

  if (
    Number.isNaN(
      number
    )
  ) {
    return "—";
  }

  if (
    number >=
    1000
  ) {
    return `${(
      number / 1000
    ).toFixed(
      2
    )} s`;
  }

  return `${number.toFixed(
    2
  )} ms`;
}


function normalizeStatus(
  value
) {
  return String(
    value ||
    "WAITING"
  ).toUpperCase();
}


function getRounds(
  result
) {
  const generated =
    result?.generated_attack ||
    {};

  return Array.isArray(
    generated.rounds
  )
    ? generated.rounds
    : [];
}


function getModel(
  metadata,
  role
) {
  return (
    metadata
      ?.models
      ?.[role]
      ?.model
    ||
    "—"
  );
}


export default function GenericSecurityCampaign({
  code,
  title,
  titleFr,
  description,
  descriptionFr,
  loadScenarios,
  createCampaign,
  runScenario,
  getCampaign,
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
    metadata,
    setMetadata,
  ] = useState(
    null
  );

  const [
    scenarios,
    setScenarios,
  ] = useState(
    []
  );

  const [
    statuses,
    setStatuses,
  ] = useState(
    {}
  );

  const [
    results,
    setResults,
  ] = useState(
    {}
  );

  const [
    campaign,
    setCampaign,
  ] = useState(
    null
  );

  const [
    campaignId,
    setCampaignId,
  ] = useState(
    ""
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  const [
    running,
    setRunning,
  ] = useState(
    false
  );

  const [
    error,
    setError,
  ] = useState(
    ""
  );

  const [
    selectedTrace,
    setSelectedTrace,
  ] = useState(
    null
  );

  const [
    traceLoading,
    setTraceLoading,
  ] = useState(
    false
  );

  const [
    securityMode,
    setSecurityMode,
  ] = useState(
    "baseline"
  );

  const [
    attackMode,
    setAttackMode,
  ] = useState(
    "standard"
  );

  const [
    maxRounds,
    setMaxRounds,
  ] = useState(
    3
  );

  const [
    openedRounds,
    setOpenedRounds,
  ] = useState(
    {}
  );


  // ============================================================
  // LOAD
  // ============================================================

  useEffect(
    () => {

      async function load() {

        setLoading(
          true
        );

        setError(
          ""
        );


        try {

          const data =
            await loadScenarios();


          setMetadata(
            data
          );


          setScenarios(
            data.scenarios ||
            []
          );


          if (
            data.mode ===
            "protected"
          ) {
            setSecurityMode(
              "protected"
            );
          }

        } catch (err) {

          setError(
            err.message ||
            `${code}: load failed`
          );

        } finally {

          setLoading(
            false
          );
        }
      }


      load();

    },
    [
      code,
      loadScenarios,
    ]
  );


  // ============================================================
  // CALCULATIONS
  // ============================================================

  const completedCount =
    useMemo(
      () =>
        Object.values(
          statuses
        ).filter(
          value =>
            [
              "BLOCKED",
              "PARTIAL",
              "COMPROMISED",
            ].includes(
              normalizeStatus(
                value
              )
            )
        ).length,
      [
        statuses,
      ]
    );


  const compromisedCount =
    useMemo(
      () =>
        Object.values(
          statuses
        ).filter(
          value =>
            normalizeStatus(
              value
            )
            ===
            "COMPROMISED"
        ).length,
      [
        statuses,
      ]
    );


  const partialCount =
    useMemo(
      () =>
        Object.values(
          statuses
        ).filter(
          value =>
            normalizeStatus(
              value
            )
            ===
            "PARTIAL"
        ).length,
      [
        statuses,
      ]
    );


  const blockedCount =
    useMemo(
      () =>
        Object.values(
          statuses
        ).filter(
          value =>
            normalizeStatus(
              value
            )
            ===
            "BLOCKED"
        ).length,
      [
        statuses,
      ]
    );


  const progress =
    scenarios.length === 0
      ? 0
      : (
          completedCount /
          scenarios.length
        ) * 100;


  const adaptive =
    attackMode ===
    "adaptive";


  // ============================================================
  // RUN CAMPAIGN
  // ============================================================

  async function launch() {

    if (
      running ||
      scenarios.length === 0
    ) {
      return;
    }


    setRunning(
      true
    );

    setError(
      ""
    );

    setStatuses(
      {}
    );

    setResults(
      {}
    );

    setCampaign(
      null
    );

    setCampaignId(
      ""
    );

    setOpenedRounds(
      {}
    );


    let currentCampaignId =
      "";

    let campaignFailed =
      false;


    try {

      const created =
        await createCampaign(
          securityMode
        );


      currentCampaignId =
        created.campaign_id ||
        created.id ||
        "";


      if (
        !currentCampaignId
      ) {
        throw new Error(
          `${code}: campaign_id absent`
        );
      }


      setCampaignId(
        currentCampaignId
      );


      setCampaign(
        created
      );


      for (
        let position = 0;
        position <
        scenarios.length;
        position += 1
      ) {

        const scenario =
          scenarios[
            position
          ];


        const index =
          Number.isInteger(
            scenario.index
          )
            ? scenario.index
            : position;


        setStatuses(
          previous => ({
            ...previous,

            [index]:
              "RUNNING",
          })
        );


        try {

          const result =
            await runScenario(
              index,
              currentCampaignId,
              {
                adaptive:
                  adaptive,

                maxRounds:
                  maxRounds,
              }
            );


          if (
            !result ||
            !result.verdict
          ) {
            throw new Error(
              `${code}: résultat invalide`
            );
          }


          setResults(
            previous => ({
              ...previous,

              [index]:
                result,
            })
          );


          setStatuses(
            previous => ({
              ...previous,

              [index]:
                normalizeStatus(
                  result.verdict
                ),
            })
          );


          if (
            getRounds(
              result
            ).length >
            0
          ) {

            setOpenedRounds(
              previous => ({
                ...previous,

                [index]:
                  true,
              })
            );
          }


          setCampaign(
            previous => ({
              ...(
                previous ||
                {}
              ),

              status:
                "RUNNING",

              completed_scenarios:
                position +
                1,

              total_scenarios:
                scenarios.length,
            })
          );

        } catch (
          scenarioError
        ) {

          campaignFailed =
            true;


          setStatuses(
            previous => ({
              ...previous,

              [index]:
                "ERROR",
            })
          );


          setError(
            `${scenario.name}: ${
              scenarioError.message
            }`
          );


          break;
        }
      }


      try {

        const finalData =
          await getCampaign(
            currentCampaignId
          );


        const finalCampaign =
          finalData.campaign ||
          finalData;


        if (
          campaignFailed &&
          finalCampaign.status ===
          "RUNNING"
        ) {

          setCampaign({
            ...finalCampaign,

            status:
              "ERROR",
          });

        } else {

          setCampaign(
            finalCampaign
          );
        }

      } catch (
        campaignError
      ) {

        console.error(
          `${code} campaign refresh failed`,
          campaignError
        );
      }


      if (
        onCompleted
      ) {

        try {

          await onCompleted();

        } catch (
          refreshError
        ) {

          console.error(
            "History refresh failed",
            refreshError
          );
        }
      }

    } catch (err) {

      setError(
        err.message ||
        `${code} campaign failed`
      );

    } finally {

      setRunning(
        false
      );
    }
  }


  // ============================================================
  // TRACE
  // ============================================================

  async function openTrace(
    traceId
  ) {

    if (
      !traceId
    ) {
      return;
    }


    setTraceLoading(
      true
    );

    setError(
      ""
    );


    try {

      const trace =
        await getAttackTrace(
          traceId
        );


      setSelectedTrace(
        trace
      );

    } catch (err) {

      setError(
        err.message ||
        "Unable to load trace"
      );

    } finally {

      setTraceLoading(
        false
      );
    }
  }


  // ============================================================
  // LOADING
  // ============================================================

  if (
    loading
  ) {

    return (
      <div className="loading-screen">

        <Loader2
          size={24}
          className="spin"
        />

        {
          isFrench
            ? `Chargement de ${code}...`
            : `Loading ${code}...`
        }

      </div>
    );
  }


  return (
    <div className="security-campaign-v2">

      {/* =======================================================
          HEADER
          ======================================================= */}

      <section className="scv2-header">

        <div className="scv2-title">

          <span className="scv2-code">
            {code}:2025
          </span>


          <h2>
            {
              isFrench
                ? (
                    titleFr ||
                    title
                  )
                : title
            }
          </h2>


          <p>
            {
              isFrench
                ? (
                    descriptionFr ||
                    description
                  )
                : description
            }
          </p>

        </div>


        <div className="scv2-provider-status">

          <span>
            PROVIDER
          </span>

          <strong>
            {
              metadata?.provider ||
              "—"
            }
          </strong>

        </div>

      </section>


      {/* =======================================================
          MULTI-LLM PIPELINE
          ======================================================= */}

      <section className="scv2-model-pipeline">

        <div className="scv2-model attacker">

          <div className="scv2-model-icon">

            <BrainCircuit
              size={19}
            />

          </div>


          <div>

            <span>
              ATTACKER
            </span>

            <strong>
              {
                getModel(
                  metadata,
                  "attacker"
                )
              }
            </strong>

            <small>
              {
                isFrench
                  ? "Génère et adapte les attaques"
                  : "Generates and adapts attacks"
              }
            </small>

          </div>

        </div>


        <ChevronRight
          className="scv2-pipeline-arrow"
          size={18}
        />


        <div className="scv2-model target">

          <div className="scv2-model-icon">

            <Target
              size={19}
            />

          </div>


          <div>

            <span>
              TARGET
            </span>

            <strong>
              {
                getModel(
                  metadata,
                  "target"
                )
                ||
                metadata?.model
              }
            </strong>

            <small>
              {
                isFrench
                  ? "Modèle évalué"
                  : "Model under evaluation"
              }
            </small>

          </div>

        </div>


        <ChevronRight
          className="scv2-pipeline-arrow"
          size={18}
        />


        <div className="scv2-model judge">

          <div className="scv2-model-icon">

            <ShieldCheck
              size={19}
            />

          </div>


          <div>

            <span>
              JUDGE
            </span>

            <strong>
              {
                getModel(
                  metadata,
                  "judge"
                )
              }
            </strong>

            <small>
              {
                isFrench
                  ? "Évaluation indépendante"
                  : "Independent evaluation"
              }
            </small>

          </div>

        </div>

      </section>


      {/* =======================================================
          CONTROL COCKPIT
          ======================================================= */}

      <section className="scv2-control-panel">

        <div className="scv2-control-heading">

          <div>

            <FlaskConical
              size={18}
            />


            <div>

              <strong>
                {
                  isFrench
                    ? "Configuration de campagne"
                    : "Campaign configuration"
                }
              </strong>

              <span>
                {
                  isFrench
                    ? "Choisissez la stratégie avant l'exécution."
                    : "Choose the security strategy before execution."
                }
              </span>

            </div>

          </div>


          {
            running &&
            (
              <div className="scv2-live">

                <span />

                {
                  isFrench
                    ? "Exécution en cours"
                    : "Campaign running"
                }

              </div>
            )
          }

        </div>


        <div className="scv2-controls">

          {/* SECURITY MODE */}

          <div className="scv2-control-group">

            <label>
              {
                isFrench
                  ? "PROTECTION"
                  : "PROTECTION"
              }
            </label>


            <div className="scv2-segmented">

              <button
                type="button"
                disabled={
                  running
                }
                className={
                  securityMode ===
                  "baseline"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setSecurityMode(
                    "baseline"
                  )
                }
              >

                <ShieldOff
                  size={15}
                />

                Baseline

              </button>


              <button
                type="button"
                disabled={
                  running
                }
                className={
                  securityMode ===
                  "protected"
                    ? "active protected"
                    : ""
                }
                onClick={() =>
                  setSecurityMode(
                    "protected"
                  )
                }
              >

                <ShieldCheck
                  size={15}
                />

                Protected

              </button>

            </div>


            <small>
              {
                securityMode ===
                "baseline"
                  ? (
                      isFrench
                        ? "Guardrails désactivés pour mesurer la vulnérabilité brute."
                        : "Guardrails disabled to measure raw vulnerability."
                    )
                  : (
                      isFrench
                        ? "Input Guard et Output Guard activés."
                        : "Input Guard and Output Guard enabled."
                    )
              }
            </small>

          </div>


          {/* ATTACK MODE */}

          <div className="scv2-control-group">

            <label>
              {
                isFrench
                  ? "STRATÉGIE"
                  : "STRATEGY"
              }
            </label>


            <div className="scv2-segmented">

              <button
                type="button"
                disabled={
                  running
                }
                className={
                  attackMode ===
                  "standard"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setAttackMode(
                    "standard"
                  )
                }
              >

                <Zap
                  size={15}
                />

                Standard

              </button>


              <button
                type="button"
                disabled={
                  running
                }
                className={
                  attackMode ===
                  "adaptive"
                    ? "active adaptive"
                    : ""
                }
                onClick={() =>
                  setAttackMode(
                    "adaptive"
                  )
                }
              >

                <RotateCcw
                  size={15}
                />

                Adaptive

              </button>

            </div>


            <small>
              {
                adaptive
                  ? (
                      isFrench
                        ? "L'Attacker analyse chaque échec puis génère une nouvelle mutation."
                        : "The Attacker analyzes each failure and generates a new mutation."
                    )
                  : (
                      isFrench
                        ? "Une génération d'attaque par scénario."
                        : "One generated attack per scenario."
                    )
              }
            </small>

          </div>


          {/* ROUNDS */}

          <div className="scv2-control-group">

            <label>
              MAX ROUNDS
            </label>


            <div className="scv2-round-selector">

              {
                [
                  1,
                  2,
                  3,
                  4,
                  5,
                ].map(
                  value => (

                    <button
                      type="button"
                      key={
                        value
                      }
                      disabled={
                        running ||
                        !adaptive
                      }
                      className={
                        maxRounds ===
                        value
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setMaxRounds(
                          value
                        )
                      }
                    >
                      {
                        value
                      }
                    </button>

                  )
                )
              }

            </div>


            <small>
              {
                adaptive
                  ? (
                      isFrench
                        ? `Maximum ${maxRounds} tentative(s) par scénario.`
                        : `Maximum ${maxRounds} attempt(s) per scenario.`
                    )
                  : (
                      isFrench
                        ? "Disponible en mode Adaptive."
                        : "Available in Adaptive mode."
                    )
              }
            </small>

          </div>

        </div>


        <div className="scv2-launch-row">

          <div className="scv2-run-summary">

            <div>

              <span>
                MODE
              </span>

              <strong>
                {
                  securityMode
                    .toUpperCase()
                }
              </strong>

            </div>


            <div>

              <span>
                STRATEGY
              </span>

              <strong>
                {
                  attackMode
                    .toUpperCase()
                }
              </strong>

            </div>


            <div>

              <span>
                SCENARIOS
              </span>

              <strong>
                {
                  scenarios.length
                }
              </strong>

            </div>


            <div>

              <span>
                MAX LLM ROUNDS
              </span>

              <strong>
                {
                  adaptive
                    ? maxRounds
                    : 1
                }
              </strong>

            </div>

          </div>


          <button
            type="button"
            className="scv2-launch-button"
            disabled={
              running
            }
            onClick={
              launch
            }
          >

            {
              running
                ? (
                    <Loader2
                      className="spin"
                      size={18}
                    />
                  )
                : (
                    <Play
                      size={18}
                    />
                  )
            }


            {
              running
                ? (
                    isFrench
                      ? "Campagne en cours..."
                      : "Campaign running..."
                  )
                : (
                    isFrench
                      ? "Lancer la campagne"
                      : "Run campaign"
                  )
            }

          </button>

        </div>

      </section>


      {/* =======================================================
          CAMPAIGN SUMMARY
          ======================================================= */}

      {
        campaignId &&
        (
          <section className="scv2-campaign">

            <div className="scv2-campaign-top">

              <div>

                <span>
                  CAMPAIGN ID
                </span>

                <strong className="scv2-campaign-id">
                  {
                    campaignId
                  }
                </strong>

              </div>


              <div>

                <span>
                  STATUS
                </span>

                <strong>
                  {
                    campaign?.status ||
                    (
                      running
                        ? "RUNNING"
                        : "UNKNOWN"
                    )
                  }
                </strong>

              </div>


              <div>

                <span>
                  PROGRESS
                </span>

                <strong>
                  {
                    completedCount
                  }
                  /
                  {
                    scenarios.length
                  }
                </strong>

              </div>


              <div>

                <span>
                  BLOCKED
                </span>

                <strong className="metric-blocked">
                  {
                    blockedCount
                  }
                </strong>

              </div>


              <div>

                <span>
                  PARTIAL
                </span>

                <strong className="metric-partial">
                  {
                    partialCount
                  }
                </strong>

              </div>


              <div>

                <span>
                  COMPROMISED
                </span>

                <strong className="metric-compromised">
                  {
                    compromisedCount
                  }
                </strong>

              </div>

            </div>


            <div className="scv2-progress-track">

              <div
                className="scv2-progress-fill"
                style={{
                  width:
                    `${progress}%`,
                }}
              />

            </div>

          </section>
        )
      }


      {/* =======================================================
          ERROR
          ======================================================= */}

      {
        error &&
        (
          <div className="error-banner">

            <AlertTriangle
              size={18}
            />

            {error}

          </div>
        )
      }


      {/* =======================================================
          SCENARIOS
          ======================================================= */}

      <section className="scv2-scenarios">

        <div className="scv2-scenarios-heading">

          <div>

            <Layers3
              size={18}
            />

            <strong>
              {
                isFrench
                  ? "Scénarios OWASP"
                  : "OWASP scenarios"
              }
            </strong>

          </div>


          <span>
            {
              scenarios.length
            }
            {" "}
            {
              isFrench
                ? "tests"
                : "tests"
            }
          </span>

        </div>


        {
          scenarios.map(
            (
              scenario,
              position
            ) => {

              const index =
                Number.isInteger(
                  scenario.index
                )
                  ? scenario.index
                  : position;


              const status =
                normalizeStatus(
                  statuses[
                    index
                  ]
                );


              const result =
                results[
                  index
                ];


              const evaluation =
                result?.evaluation ||
                {};


              const rounds =
                getRounds(
                  result
                );


              const roundsOpen =
                Boolean(
                  openedRounds[
                    index
                  ]
                );


              const scenarioType =
                scenario.artifact_type ||
                scenario.sink_type ||
                scenario.action_type ||
                "Security Scenario";


              return (
                <article
                  key={
                    scenario.id ||
                    index
                  }
                  className={
                    `scv2-scenario ${
                      status.toLowerCase()
                    }`
                  }
                >

                  <div className="scv2-scenario-main">

                    <div
                      className={
                        `scv2-status-icon ${
                          status.toLowerCase()
                        }`
                      }
                    >

                      {
                        status ===
                        "RUNNING"
                          ? (
                              <Loader2
                                className="spin"
                                size={18}
                              />
                            )
                          : (
                              <ShieldCheck
                                size={18}
                              />
                            )
                      }

                    </div>


                    <div className="scv2-scenario-content">

                      <span className="scv2-scenario-id">

                        {
                          scenario.id ||
                          `${code}-${
                            String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )
                          }`
                        }

                      </span>


                      <h3>
                        {
                          scenario.name
                        }
                      </h3>


                      <p>
                        {
                          scenario.description
                        }
                      </p>


                      <div className="scv2-tags">

                        <span>
                          {
                            scenarioType
                          }
                        </span>


                        {
                          (
                            scenario.risk_indicators ||
                            []
                          ).map(
                            risk => (

                              <span
                                key={
                                  risk
                                }
                              >
                                {
                                  risk
                                }
                              </span>

                            )
                          )
                        }

                      </div>

                    </div>


                    <div className="scv2-scenario-actions">

                      <span
                        className={
                          `scv2-status-badge ${
                            status.toLowerCase()
                          }`
                        }
                      >
                        {
                          status
                        }
                      </span>


                      {
                        result?.trace_id &&
                        (
                          <button
                            type="button"
                            className="scv2-secondary-button"
                            disabled={
                              traceLoading
                            }
                            onClick={() =>
                              openTrace(
                                result.trace_id
                              )
                            }
                          >

                            <Eye
                              size={14}
                            />

                            {
                              isFrench
                                ? "Trace"
                                : "Trace"
                            }

                          </button>
                        )
                      }

                    </div>

                  </div>


                  {/* RESULT SUMMARY */}

                  {
                    result &&
                    (
                      <div className="scv2-result-grid">

                        <div>

                          <span>
                            VERDICT
                          </span>

                          <strong>
                            {
                              result.verdict
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            MODE
                          </span>

                          <strong>
                            {
                              result.mode ||
                              securityMode
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            STRATEGY
                          </span>

                          <strong>
                            {
                              rounds.length >
                              0
                                ? "ADAPTIVE"
                                : "STANDARD"
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            ROUNDS
                          </span>

                          <strong>
                            {
                              rounds.length >
                              0
                                ? rounds.length
                                : 1
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            JUDGE CONFIDENCE
                          </span>

                          <strong>
                            {
                              result
                                ?.judge
                                ?.confidence
                              !==
                              undefined
                                ? `${
                                    (
                                      Number(
                                        result
                                          .judge
                                          .confidence
                                      )
                                      *
                                      100
                                    ).toFixed(
                                      0
                                    )
                                  }%`
                                : "—"
                            }
                          </strong>

                        </div>


                        <div>

                          <Clock3
                            size={14}
                          />

                          <strong>
                            {
                              formatMs(
                                result
                                  ?.timing
                                  ?.total_ms
                              )
                            }
                          </strong>

                        </div>

                      </div>
                    )
                  }


                  {/* ADAPTIVE ROUNDS */}

                  {
                    rounds.length >
                    0 &&
                    (
                      <div className="scv2-rounds">

                        <button
                          type="button"
                          className="scv2-rounds-toggle"
                          onClick={() =>
                            setOpenedRounds(
                              previous => ({
                                ...previous,

                                [index]:
                                  !previous[
                                    index
                                  ],
                              })
                            )
                          }
                        >

                          <div>

                            <RotateCcw
                              size={15}
                            />

                            <strong>
                              {
                                isFrench
                                  ? "Parcours adaptatif"
                                  : "Adaptive attack path"
                              }
                            </strong>


                            <span>
                              {
                                rounds.length
                              }
                              {" "}
                              {
                                rounds.length >
                                1
                                  ? "rounds"
                                  : "round"
                              }
                            </span>

                          </div>


                          {
                            roundsOpen
                              ? (
                                  <ChevronDown
                                    size={17}
                                  />
                                )
                              : (
                                  <ChevronRight
                                    size={17}
                                  />
                                )
                          }

                        </button>


                        {
                          roundsOpen &&
                          (
                            <div className="scv2-round-list">

                              {
                                rounds.map(
                                  round => {

                                    const generated =
                                      round.generated_attack ||
                                      {};


                                    const judge =
                                      round.judge ||
                                      {};


                                    return (
                                      <div
                                        key={
                                          round.round
                                        }
                                        className={
                                          `scv2-round ${
                                            String(
                                              round.verdict ||
                                              "partial"
                                            )
                                            .toLowerCase()
                                          }`
                                        }
                                      >

                                        <div className="scv2-round-index">

                                          <span>
                                            ROUND
                                          </span>

                                          <strong>
                                            {
                                              round.round
                                            }
                                          </strong>

                                        </div>


                                        <div className="scv2-round-content">

                                          <div className="scv2-round-top">

                                            <strong>
                                              {
                                                generated.strategy ||
                                                (
                                                  isFrench
                                                    ? "Stratégie générée"
                                                    : "Generated strategy"
                                                )
                                              }
                                            </strong>


                                            <span
                                              className={
                                                `scv2-status-badge ${
                                                  String(
                                                    round.verdict ||
                                                    ""
                                                  )
                                                  .toLowerCase()
                                                }`
                                              }
                                            >
                                              {
                                                round.verdict
                                              }
                                            </span>

                                          </div>


                                          {
                                            generated.mutation &&
                                            (
                                              <p>
                                                <b>
                                                  Mutation:
                                                </b>
                                                {" "}
                                                {
                                                  generated.mutation
                                                }
                                              </p>
                                            )
                                          }


                                          {
                                            generated
                                              .reason_for_mutation &&
                                            (
                                              <p>
                                                <b>
                                                  {
                                                    isFrench
                                                      ? "Pourquoi :"
                                                      : "Why:"
                                                  }
                                                </b>
                                                {" "}
                                                {
                                                  generated
                                                    .reason_for_mutation
                                                }
                                              </p>
                                            )
                                          }


                                          <div className="scv2-round-meta">

                                            <span>
                                              TARGET:
                                              {" "}
                                              {
                                                round.target_called
                                                  ? "CALLED"
                                                  : "SKIPPED"
                                              }
                                            </span>


                                            <span>
                                              JUDGE:
                                              {" "}
                                              {
                                                judge.confidence
                                                !==
                                                undefined
                                                  ? `${
                                                      (
                                                        Number(
                                                          judge.confidence
                                                        )
                                                        *
                                                        100
                                                      ).toFixed(
                                                        0
                                                      )
                                                    }%`
                                                  : "—"
                                              }
                                            </span>


                                            <span>
                                              {
                                                formatMs(
                                                  round
                                                    .target_duration_ms
                                                )
                                              }
                                            </span>

                                          </div>

                                        </div>

                                      </div>
                                    );
                                  }
                                )
                              }

                            </div>
                          )
                        }

                      </div>
                    )
                  }

                </article>
              );
            }
          )
        }

      </section>


      {
        selectedTrace &&
        (
          <TraceViewer
            trace={
              selectedTrace
            }
            onClose={() =>
              setSelectedTrace(
                null
              )
            }
          />
        )
      }

    </div>
  );
}
