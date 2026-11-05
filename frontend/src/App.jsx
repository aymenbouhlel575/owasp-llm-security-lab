import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  Gauge,
  History,
  LayoutDashboard,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShieldOff,
  Target,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useTranslation,
} from "react-i18next";

import {
  getHealth,
  getResults,
} from "./api";

import StatCard from "./components/StatCard";
import ResultsTable from "./components/ResultsTable";
import ResultModal from "./components/ResultModal";
import AttackLabSwitcher from "./components/AttackLabSwitcher";
import LanguageSwitcher from "./components/LanguageSwitcher";
import SecurityLibrary from "./components/SecurityLibrary";
import SecurityDashboard from "./components/SecurityDashboard";
import Historic from "./components/Historic";
import DashboardInsightModal from "./components/DashboardInsightModal";

import "./App.css";


const OWASP_RISKS = [
  {
    code: "LLM01",
    en: "Prompt Injection",
    fr: "Injection de prompt",
    implemented: true,
  },
  {
    code: "LLM02",
    en: "Sensitive Information Disclosure",
    fr: "Divulgation d'informations sensibles",
    implemented: true,
  },
  {
    code: "LLM03",
    en: "Supply Chain",
    fr: "Chaîne d'approvisionnement",
    implemented: true,
  },
  {
    code: "LLM04",
    en: "Data and Model Poisoning",
    fr: "Empoisonnement des données et du modèle",
    implemented: true,
  },
  {
    code: "LLM05",
    en: "Improper Output Handling",
    fr: "Mauvaise gestion des sorties",
    implemented: true,
  },
  {
    code: "LLM06",
    en: "Excessive Agency",
    fr: "Autonomie excessive",
    implemented: true,
  },
  {
    code: "LLM07",
    en: "System Prompt Leakage",
    fr: "Fuite du prompt système",
    implemented: true,
  },
  {
    code: "LLM08",
    en: "Vector and Embedding Weaknesses",
    fr: "Faiblesses des vecteurs et embeddings",
    implemented: true,
  },
  {
    code: "LLM09",
    en: "Misinformation",
    fr: "Désinformation",
    implemented: true,
  },
  {
    code: "LLM10",
    en: "Unbounded Consumption",
    fr: "Consommation non limitée",
    implemented: true,
  },
];


function App() {
  const {
    t,
    i18n,
  } = useTranslation();

  const isFrench =
    i18n.resolvedLanguage
      ?.toLowerCase()
      .startsWith("fr");


  const [
    section,
    setSection,
  ] = useState(
    "dashboard"
  );

  const [
    results,
    setResults,
  ] = useState([]);

  const [
    backendOnline,
    setBackendOnline,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedResult,
    setSelectedResult,
  ] = useState(null);

  const [
    selectedInsight,
    setSelectedInsight,
  ] = useState(null);


// ============================================================
  // DATA LOADING
  //
  // silent = false:
  // Normal loading screen.
  //
  // silent = true:
  // Refresh dashboard/history WITHOUT unmounting AttackProcess.
  //
  // This is important for keeping campaign traces visible.
  // ============================================================

  async function loadData(
    silent = false
  ) {
    if (!silent) {
      setLoading(true);
    }

    setError("");

    try {
      await getHealth();

      setBackendOnline(
        true
      );

      const resultData =
        await getResults();

      setResults(
        resultData.results ||
        []
      );
    } catch (err) {
      setBackendOnline(
        false
      );

      setError(
        err.message ||
        (
          isFrench
            ? "Impossible de charger les données de sécurité."
            : "Unable to load security data."
        )
      );
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }


  useEffect(() => {
    loadData(false);
  }, []);


  // ============================================================
  // STATISTICS
  // ============================================================

  const stats =
    useMemo(
      () => {
        const total =
          results.length;

        const succeeded =
          results.filter(
            (result) =>
              result.attack_success
          ).length;

        const blocked =
          total - succeeded;

        const blockingRate =
          total === 0
            ? 0
            : (
                blocked /
                total
              ) * 100;

        return {
          total,
          succeeded,
          blocked,
          blockingRate,
        };
      },
      [results]
    );


  const pieData =
    useMemo(
      () => [
        {
          name:
            t(
              "dashboard.blocked"
            ),

          value:
            stats.blocked,

          color:
            "#21c98b",
        },

        {
          name:
            t(
              "dashboard.succeeded"
            ),

          value:
            stats.succeeded,

          color:
            "#ff5d73",
        },
      ],
      [
        stats.blocked,
        stats.succeeded,
        t,
      ]
    );


  const attackDistribution =
    useMemo(
      () => {
        const counter = {};

        results.forEach(
          (result) => {
            const name =
              result.attack_name ||
              "Unknown";

            counter[name] =
              (
                counter[name] ||
                0
              ) + 1;
          }
        );

        return Object.entries(
          counter
        ).map(
          (
            [
              name,
              value,
            ]
          ) => ({
            name,
            tests: value,
          })
        );
      },
      [results]
    );

  // ============================================================
  // DASHBOARD
  // ============================================================

  function renderDashboard() {
    return (
      <SecurityDashboard
        results={results}
        loading={loading}
        onRefresh={loadData}
        onSelectResult={setSelectedResult}
      />
    );
  }

  // ============================================================
  // ATTACK LAB
  // ============================================================

  function renderAttackLab() {
    return (
      <>
        <div className="page-header">

          <div>

            <span className="eyebrow">
              {t(
                "attackLab.eyebrow"
              )}
            </span>

            <h1>
              {t(
                "attackLab.title"
              )}
            </h1>

            <p>
              {t(
                "attackLab.description"
              )}
            </p>

          </div>

        </div>


        <AttackLabSwitcher
          onCompleted={() =>
            loadData(true)
          }
        />

      </>
    );
  }


  // ============================================================
  // HISTORY
  // ============================================================

  function renderHistory() {
    return (
      <Historic
        results={results}
        onRefresh={() =>
          loadData(true)
        }
      />
    );
  }


  // ============================================================
  // OWASP COVERAGE
  // ============================================================

  function renderOwasp() {
    const implementedCount =
      OWASP_RISKS.filter(
        (risk) =>
          risk.implemented
      ).length;

    const coverage =
      (
        implementedCount /
        OWASP_RISKS.length
      ) * 100;


    return (
      <>
        <div className="page-header">

          <div>

            <span className="eyebrow">
              {t(
                "owasp.eyebrow"
              )}
            </span>

            <h1>
              {t(
                "owasp.title"
              )}
            </h1>

            <p>
              {t(
                "owasp.description"
              )}
            </p>

          </div>

        </div>


        <div className="coverage-summary">

          <div>

            <strong>
              {
                implementedCount
              }

              {" / "}

              {
                OWASP_RISKS.length
              }
            </strong>


            <span>
              {
                isFrench
                  ? "risques implémentés"
                  : "risks implemented"
              }
            </span>

          </div>


          <div className="coverage-progress">

            <div
              className="coverage-progress-fill"

              style={{
                width:
                  `${coverage}%`,
              }}
            />

          </div>

        </div>


        <div className="owasp-grid">

          {
            OWASP_RISKS.map(
              (risk) => (

                <div
                  className={
                    `owasp-card ${
                      risk.implemented
                        ? "implemented"
                        : ""
                    }`
                  }

                  key={
                    risk.code
                  }
                >

                  <div className="owasp-card-top">

                    <span>
                      {
                        risk.code
                      }
                    </span>


                    {
                      risk.implemented
                        ? (
                            <CheckCircle2
                              size={19}
                              className="text-success"
                            />
                          )
                        : (
                            <span className="planned">
                              {
                                t(
                                  "owasp.planned"
                                )
                              }
                            </span>
                          )
                    }

                  </div>


                  <h3>
                    {
                      isFrench
                        ? risk.fr
                        : risk.en
                    }
                  </h3>


                  <p>
                    {
                      risk.implemented
                        ? t(
                            "owasp.automatedTesting"
                          )
                        : t(
                            "owasp.modulePlanned"
                          )
                    }
                  </p>

                </div>

              )
            )
          }

        </div>
      </>
    );
  }


  // ============================================================
  // APPLICATION
  // ============================================================

  return (
    <div className="app-shell">

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <Shield
              size={22}
            />
          </div>


          <div>

            <strong>
              {t(
                "app.name"
              )}
            </strong>

            <span>
              {t(
                "app.subtitle"
              )}
            </span>

          </div>

        </div>


        <nav>

          <button
            type="button"

            className={
              section ===
              "dashboard"
                ? "active"
                : ""
            }

            onClick={() =>
              setSection(
                "dashboard"
              )
            }
          >
            <LayoutDashboard
              size={19}
            />

            {t(
              "navigation.dashboard"
            )}
          </button>


          <button
            type="button"

            className={
              section ===
              "attack"
                ? "active"
                : ""
            }

            onClick={() =>
              setSection(
                "attack"
              )
            }
          >
            <FlaskConical
              size={19}
            />

            {t(
              "navigation.attackLab"
            )}
          </button>


          <button
            type="button"

            className={
              section ===
              "history"
                ? "active"
                : ""
            }

            onClick={() =>
              setSection(
                "history"
              )
            }
          >
            <History
              size={19}
            />

            {t(
              "navigation.history"
            )}
          </button>


          <button
            type="button"

            className={
              section ===
              "owasp"
                ? "active"
                : ""
            }

            onClick={() =>
              setSection(
                "owasp"
              )
            }
          >
            <ShieldCheck
              size={19}
            />

            {t(
              "navigation.owasp"
            )}
          </button>

          <button
            type="button"

            className={
              section ===
              "library"
                ? "active"
                : ""
            }

            onClick={() =>
              setSection(
                "library"
              )
            }
          >
            <BookOpen
              size={19}
            />

            {
              isFrench
                ? "Bibliothèque sécurité IA"
                : "AI Security Library"
            }
          </button>

        </nav>


        <div className="sidebar-status">

          <span
            className={
              backendOnline
                ? "online-dot"
                : "offline-dot"
            }
          />


          <div>

            <strong>
              {
                backendOnline
                  ? t(
                      "app.backendOnline"
                    )
                  : t(
                      "app.backendOffline"
                    )
              }
            </strong>

            <span>
              FastAPI :8000
            </span>

          </div>

        </div>

      </aside>


      <main className="main-content">

        <header className="topbar">

          <div className="topbar-status">

            <Activity
              size={16}
            />

            <span>
              {t(
                "app.target"
              )}
            </span>

            <strong>
              openai/gpt-oss-20b
            </strong>

          </div>


          <div className="topbar-actions">

            <LanguageSwitcher />


            <div
              className={
                `connection-pill ${
                  backendOnline
                    ? "connected"
                    : "disconnected"
                }`
              }
            >

              <span />

              {
                backendOnline
                  ? t(
                      "app.systemOperational"
                    )
                  : t(
                      "app.backendOffline"
                    )
              }

            </div>

          </div>

        </header>


        <div className="content">

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


          {
            loading
              ? (
                  <div className="loading-screen">

                    <RefreshCw
                      size={26}
                      className="spin"
                    />

                    {
                      isFrench
                        ? "Chargement des données de sécurité..."
                        : "Loading security data..."
                    }

                  </div>
                )
              : (
                  <>
                    {
                      section ===
                      "dashboard" &&
                      renderDashboard()
                    }

                    {
                      section ===
                      "attack" &&
                      renderAttackLab()
                    }

                    {
                      section ===
                      "history" &&
                      renderHistory()
                    }

                    {
                      section ===
                      "owasp" &&
                      renderOwasp()
                    }

                    {
                      section ===
                      "library" &&
                      <SecurityLibrary />
                    }
                  </>
                )
          }

        </div>

      </main>


      <ResultModal
        result={
          selectedResult
        }

        onClose={() =>
          setSelectedResult(
            null
          )
        }
      />


      <DashboardInsightModal
        insightKey={
          selectedInsight
        }

        stats={
          stats
        }

        attackDistribution={
          attackDistribution
        }

        isFrench={
          isFrench
        }

        onClose={() =>
          setSelectedInsight(
            null
          )
        }
      />

    </div>
  );
}


export default App;
