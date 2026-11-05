import {
  Activity,
  BrainCircuit,
  Gauge,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Target,
  TriangleAlert,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useMemo,
  useState,
} from "react";

import "./SecurityDashboard.css";


function normalizeVerdict(result) {
  const verdict = String(
    result?.verdict || ""
  ).toUpperCase();

  if (
    [
      "BLOCKED",
      "PARTIAL",
      "COMPROMISED",
    ].includes(verdict)
  ) {
    return verdict;
  }

  return result?.attack_success
    ? "COMPROMISED"
    : "BLOCKED";
}


function extractOwaspCode(category) {
  const match = String(
    category || ""
  ).match(/LLM\d{2}/i);

  return match
    ? match[0].toUpperCase()
    : "UNKNOWN";
}


function percent(value, total) {
  if (!total) {
    return 0;
  }

  return (
    value /
    total
  ) * 100;
}


function formatPercent(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  return `${Number(value).toFixed(1)}%`;
}


function latestModel(results, key) {
  const row = results.find(
    item => item?.[key]
  );

  return (
    row?.[key] ||
    "—"
  );
}


export default function SecurityDashboard({
  results = [],
  loading = false,
  onRefresh,
  onSelectResult,
}) {
  const [
    modeFilter,
    setModeFilter,
  ] = useState("all");


  const filteredResults = useMemo(
    () => {
      if (
        modeFilter ===
        "all"
      ) {
        return results;
      }

      return results.filter(
        result =>
          (
            result.execution_mode ||
            "legacy"
          ) === modeFilter
      );
    },
    [
      results,
      modeFilter,
    ]
  );


  const stats = useMemo(
    () => {
      let blocked = 0;
      let partial = 0;
      let compromised = 0;

      const confidences = [];


      filteredResults.forEach(
        result => {
          const verdict =
            normalizeVerdict(
              result
            );


          if (
            verdict ===
            "BLOCKED"
          ) {
            blocked += 1;
          }


          if (
            verdict ===
            "PARTIAL"
          ) {
            partial += 1;
          }


          if (
            verdict ===
            "COMPROMISED"
          ) {
            compromised += 1;
          }


          const confidence =
            Number(
              result.judge_confidence
            );


          if (
            Number.isFinite(
              confidence
            )
          ) {
            confidences.push(
              confidence
            );
          }
        }
      );


      const total =
        filteredResults.length;


      const averageConfidence =
        confidences.length
          ? (
              confidences.reduce(
                (sum, value) =>
                  sum + value,
                0
              )
              /
              confidences.length
            ) * 100
          : null;


      return {
        total,
        blocked,
        partial,
        compromised,

        asr:
          percent(
            compromised,
            total
          ),

        blockingRate:
          percent(
            blocked,
            total
          ),

        averageConfidence,
      };
    },
    [
      filteredResults,
    ]
  );


  const protection = useMemo(
    () => {
      const baseline =
        results.filter(
          result =>
            result.execution_mode ===
            "baseline"
        );


      const protectedRows =
        results.filter(
          result =>
            result.execution_mode ===
            "protected"
        );


      const baselineCompromised =
        baseline.filter(
          result =>
            normalizeVerdict(
              result
            ) ===
            "COMPROMISED"
        ).length;


      const protectedCompromised =
        protectedRows.filter(
          result =>
            normalizeVerdict(
              result
            ) ===
            "COMPROMISED"
        ).length;


      const baselineAsr =
        baseline.length
          ? percent(
              baselineCompromised,
              baseline.length
            )
          : null;


      const protectedAsr =
        protectedRows.length
          ? percent(
              protectedCompromised,
              protectedRows.length
            )
          : null;


      let effectiveness =
        null;


      if (
        baselineAsr !== null &&
        protectedAsr !== null
      ) {
        if (
          baselineAsr >
          0
        ) {
          effectiveness =
            (
              1 -
              (
                protectedAsr /
                baselineAsr
              )
            ) * 100;

          effectiveness =
            Math.max(
              0,
              Math.min(
                effectiveness,
                100
              )
            );
        } else {
          effectiveness =
            protectedAsr ===
            0
              ? 100
              : 0;
        }
      }


      return {
        baselineCount:
          baseline.length,

        protectedCount:
          protectedRows.length,

        baselineAsr,
        protectedAsr,
        effectiveness,
      };
    },
    [
      results,
    ]
  );


  const owaspData = useMemo(
    () => {
      const map = {};


      filteredResults.forEach(
        result => {
          const code =
            extractOwaspCode(
              result.owasp_category
            );


          if (
            code ===
            "UNKNOWN"
          ) {
            return;
          }


          if (
            !map[code]
          ) {
            map[code] = {
              code,
              blocked: 0,
              partial: 0,
              compromised: 0,
            };
          }


          const verdict =
            normalizeVerdict(
              result
            );


          if (
            verdict ===
            "BLOCKED"
          ) {
            map[
              code
            ].blocked += 1;
          }


          if (
            verdict ===
            "PARTIAL"
          ) {
            map[
              code
            ].partial += 1;
          }


          if (
            verdict ===
            "COMPROMISED"
          ) {
            map[
              code
            ].compromised += 1;
          }
        }
      );


      return Object.values(
        map
      ).sort(
        (
          a,
          b
        ) =>
          a.code.localeCompare(
            b.code
          )
      );
    },
    [
      filteredResults,
    ]
  );


  const coverage = useMemo(
    () => {
      const categories =
        new Set(
          results.map(
            result =>
              extractOwaspCode(
                result.owasp_category
              )
          )
        );


      categories.delete(
        "UNKNOWN"
      );


      return categories.size;
    },
    [
      results,
    ]
  );


  const attackerModel =
    latestModel(
      results,
      "attacker_model"
    );


  const targetModel =
    latestModel(
      results,
      "target_model"
    );


  const judgeModel =
    latestModel(
      results,
      "judge_model"
    );


  const comparisonData = [
    {
      mode:
        "Baseline",

      asr:
        protection.baselineAsr ??
        0,
    },

    {
      mode:
        "Protected",

      asr:
        protection.protectedAsr ??
        0,
    },
  ];


  return (
    <div className="security-dashboard-pro">

      <div className="sdp-header">

        <div>

          <span className="sdp-eyebrow">
            AI SECURITY POSTURE
          </span>


          <h1>
            AI Security Dashboard
          </h1>


          <p>
            Dynamic OWASP security posture,
            multi-LLM evaluation and guardrail
            effectiveness.
          </p>

        </div>


        <div className="sdp-header-actions">

          <select
            value={
              modeFilter
            }
            onChange={
              event =>
                setModeFilter(
                  event.target.value
                )
            }
          >

            <option value="all">
              All modes
            </option>

            <option value="baseline">
              Baseline
            </option>

            <option value="protected">
              Protected
            </option>

            <option value="legacy">
              Legacy
            </option>

          </select>


          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              onRefresh
            }
          >

            <RefreshCw
              size={16}
              className={
                loading
                  ? "spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>

      </div>


      {/* ======================================================
          MULTI LLM
          ====================================================== */}

      <section className="sdp-model-pipeline">

        <div className="sdp-model attacker">

          <BrainCircuit
            size={20}
          />

          <div>

            <span>
              ATTACKER
            </span>

            <strong>
              {
                attackerModel
              }
            </strong>

          </div>

        </div>


        <div className="sdp-arrow">
          →
        </div>


        <div className="sdp-model target">

          <Target
            size={20}
          />

          <div>

            <span>
              TARGET
            </span>

            <strong>
              {
                targetModel
              }
            </strong>

          </div>

        </div>


        <div className="sdp-arrow">
          →
        </div>


        <div className="sdp-model judge">

          <ShieldCheck
            size={20}
          />

          <div>

            <span>
              JUDGE
            </span>

            <strong>
              {
                judgeModel
              }
            </strong>

          </div>

        </div>

      </section>


      {/* ======================================================
          KPIs
          ====================================================== */}

      <section className="sdp-kpis">

        <div className="sdp-kpi">

          <Activity
            size={19}
          />

          <span>
            SECURITY TESTS
          </span>

          <strong>
            {
              stats.total
            }
          </strong>

          <small>
            active dataset
          </small>

        </div>


        <div className="sdp-kpi success">

          <ShieldCheck
            size={19}
          />

          <span>
            BLOCKED
          </span>

          <strong>
            {
              stats.blocked
            }
          </strong>

          <small>
            {
              formatPercent(
                stats.blockingRate
              )
            }
          </small>

        </div>


        <div className="sdp-kpi warning">

          <TriangleAlert
            size={19}
          />

          <span>
            PARTIAL
          </span>

          <strong>
            {
              stats.partial
            }
          </strong>

          <small>
            ambiguous
          </small>

        </div>


        <div className="sdp-kpi danger">

          <ShieldOff
            size={19}
          />

          <span>
            COMPROMISED
          </span>

          <strong>
            {
              stats.compromised
            }
          </strong>

          <small>
            ASR{" "}
            {
              formatPercent(
                stats.asr
              )
            }
          </small>

        </div>


        <div className="sdp-kpi accent">

          <Gauge
            size={19}
          />

          <span>
            JUDGE CONFIDENCE
          </span>

          <strong>
            {
              formatPercent(
                stats.averageConfidence
              )
            }
          </strong>

          <small>
            average
          </small>

        </div>


        <div className="sdp-kpi accent">

          <ShieldCheck
            size={19}
          />

          <span>
            OWASP COVERAGE
          </span>

          <strong>
            {
              coverage
            }
            /10
          </strong>

          <small>
            {
              coverage * 10
            }
            %
          </small>

        </div>

      </section>


      {/* ======================================================
          BASELINE VS PROTECTED
          ====================================================== */}

      <section className="sdp-panel">

        <div className="sdp-panel-header">

          <div>

            <span>
              GUARDRAIL VALIDATION
            </span>

            <h2>
              Baseline vs Protected
            </h2>

          </div>

        </div>


        <div className="sdp-comparison">

          <div className="sdp-chart">

            <ResponsiveContainer
              width="100%"
              height={250}
            >

              <BarChart
                data={
                  comparisonData
                }
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="mode"
                />

                <YAxis
                  domain={[
                    0,
                    100,
                  ]}
                />

                <Tooltip
                  formatter={
                    value =>
                      `${Number(
                        value
                      ).toFixed(
                        1
                      )}%`
                  }
                />

                <Bar
                  dataKey="asr"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>


          <div className="sdp-comparison-metrics">

            <div>

              <span>
                BASELINE ASR
              </span>

              <strong>
                {
                  formatPercent(
                    protection
                      .baselineAsr
                  )
                }
              </strong>

              <small>
                {
                  protection
                    .baselineCount
                }
                {" "}
                tests
              </small>

            </div>


            <div>

              <span>
                PROTECTED ASR
              </span>

              <strong>
                {
                  formatPercent(
                    protection
                      .protectedAsr
                  )
                }
              </strong>

              <small>
                {
                  protection
                    .protectedCount
                }
                {" "}
                tests
              </small>

            </div>


            <div className="guardrail">

              <span>
                GUARDRAIL EFFECTIVENESS
              </span>

              <strong>
                {
                  formatPercent(
                    protection
                      .effectiveness
                  )
                }
              </strong>

              <small>
                relative ASR reduction
              </small>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          OWASP BREAKDOWN
          ====================================================== */}

      <section className="sdp-panel">

        <div className="sdp-panel-header">

          <div>

            <span>
              OWASP TOP 10
            </span>

            <h2>
              Security outcomes by category
            </h2>

          </div>

        </div>


        <ResponsiveContainer
          width="100%"
          height={330}
        >

          <BarChart
            data={
              owaspData
            }
          >

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="code"
            />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="blocked"
              stackId="result"
            />

            <Bar
              dataKey="partial"
              stackId="result"
            />

            <Bar
              dataKey="compromised"
              stackId="result"
            />

          </BarChart>

        </ResponsiveContainer>

      </section>


      {/* ======================================================
          RECENT ACTIVITY
          ====================================================== */}

      <section className="sdp-panel">

        <div className="sdp-panel-header">

          <div>

            <span>
              SECURITY ACTIVITY
            </span>

            <h2>
              Recent evaluations
            </h2>

          </div>

        </div>


        <div className="sdp-recent-list">

          {
            filteredResults
              .slice(
                0,
                10
              )
              .map(
                result => {

                  const verdict =
                    normalizeVerdict(
                      result
                    );


                  return (
                    <button
                      type="button"
                      className="sdp-result-row"
                      key={
                        result.id
                      }
                      onClick={() =>
                        onSelectResult?.(
                          result
                        )
                      }
                    >

                      <span className="sdp-result-code">
                        {
                          extractOwaspCode(
                            result
                              .owasp_category
                          )
                        }
                      </span>


                      <span className="sdp-result-name">
                        {
                          result.attack_name
                        }
                      </span>


                      <span>
                        {
                          result.execution_mode ||
                          "legacy"
                        }
                      </span>


                      <span className="sdp-result-model">
                        {
                          result.target_model ||
                          result.model
                        }
                      </span>


                      <strong
                        className={
                          `sdp-verdict ${
                            verdict.toLowerCase()
                          }`
                        }
                      >
                        {
                          verdict
                        }
                      </strong>

                    </button>
                  );
                }
              )
          }

        </div>

      </section>

    </div>
  );
}
