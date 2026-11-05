import {
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Database,
  FlaskConical,
  ShieldCheck,
  ShieldX,
  X,
} from "lucide-react";

import {
  useTranslation,
} from "react-i18next";


function formatDuration(
  milliseconds
) {
  if (
    milliseconds === null ||
    milliseconds === undefined
  ) {
    return "—";
  }

  if (milliseconds >= 1000) {
    return `${
      (
        milliseconds / 1000
      ).toFixed(2)
    } s`;
  }

  return `${
    Number(
      milliseconds
    ).toFixed(2)
  } ms`;
}


function getStepIcon(name) {
  if (name === "prepare_attack") {
    return FlaskConical;
  }

  if (name === "llm_call") {
    return BrainCircuit;
  }

  if (name === "evaluation") {
    return ShieldCheck;
  }

  if (name === "database") {
    return Database;
  }

  return CheckCircle2;
}


export default function TraceViewer({
  trace,
  onClose,
}) {
  const {
    i18n,
  } = useTranslation();

  if (!trace) {
    return null;
  }


  const isFrench =
    i18n.resolvedLanguage
      ?.startsWith("fr");


  const verdict =
    trace.verdict ||
    (
      trace.attack_success
        ? "COMPROMISED"
        : "BLOCKED"
    );


  const humanExplanation =
    isFrench
      ? (
          verdict ===
          "COMPROMISED"
            ? (
                "Le scénario a réussi : "
                + "le modèle a divulgué le secret "
                + "synthétique protégé. "
                + "L'objectif de l'attaque a donc été atteint."
              )
            : (
                "Le scénario n'a pas atteint son objectif. "
                + "Le secret synthétique protégé n'a pas été "
                + "détecté dans la réponse du modèle. "
                + "L'évaluateur V1 classe donc cette tentative "
                + "comme BLOQUÉE."
              )
        )
      : trace.explanation;


  return (
    <div
      className="trace-overlay"
      role="dialog"
      aria-modal="true"
    >

      <div className="trace-viewer">

        <div className="trace-header">

          <div>

            <span className="trace-eyebrow">
              {
                isFrench
                  ? "TRACE DE SÉCURITÉ LLM"
                  : "LLM SECURITY TRACE"
              }
            </span>

            <h2>
              {trace.attack_name}
            </h2>

            <p>
              {
                isFrench
                  ? "Exécution complète du scénario de sécurité"
                  : "Complete security scenario execution"
              }
            </p>

          </div>


          <button
            className="trace-close-button"
            onClick={onClose}
            aria-label={
              isFrench
                ? "Fermer"
                : "Close"
            }
          >
            <X size={20} />
          </button>

        </div>


        {/* ================================================= */}
        {/* TRACE SUMMARY                                     */}
        {/* ================================================= */}

        <div className="trace-summary-grid">

          <div className="trace-summary-item">
            <span>
              TRACE ID
            </span>

            <strong className="trace-id">
              {
                trace.trace_id
              }
            </strong>
          </div>


          <div className="trace-summary-item">
            <span>
              CAMPAIGN ID
            </span>

            <strong className="trace-id">
              {
                trace.campaign_id
              }
            </strong>
          </div>


          <div className="trace-summary-item">

            <span>
              {
                isFrench
                  ? "VERDICT"
                  : "VERDICT"
              }
            </span>

            <strong
              className={
                verdict === "BLOCKED"
                  ? "trace-verdict blocked"
                  : "trace-verdict compromised"
              }
            >
              {
                verdict === "BLOCKED"
                  ? (
                      isFrench
                        ? "BLOQUÉE"
                        : "BLOCKED"
                    )
                  : verdict
              }
            </strong>

          </div>


          <div className="trace-summary-item">

            <span>
              {
                isFrench
                  ? "TEMPS TOTAL"
                  : "TOTAL TIME"
              }
            </span>

            <strong>
              {
                formatDuration(
                  trace.timing
                    ?.total_ms
                )
              }
            </strong>

          </div>

        </div>


        {/* ================================================= */}
        {/* SCENARIO                                          */}
        {/* ================================================= */}

        <section className="trace-section">

          <div className="trace-section-title">
            <FlaskConical size={18} />

            <h3>
              {
                isFrench
                  ? "Scénario d'attaque"
                  : "Attack scenario"
              }
            </h3>
          </div>


          <div className="trace-info-grid">

            <div>
              <span>
                {
                  isFrench
                    ? "Catégorie"
                    : "Category"
                }
              </span>

              <strong>
                {
                  trace.category
                }
              </strong>
            </div>


            <div>
              <span>
                {
                  isFrench
                    ? "Technique"
                    : "Technique"
                }
              </span>

              <strong>
                {
                  trace.technique
                }
              </strong>
            </div>


            <div>
              <span>
                {
                  isFrench
                    ? "Sévérité"
                    : "Severity"
                }
              </span>

              <strong className="severity-high">
                {
                  trace.severity
                    ?.toUpperCase()
                }
              </strong>
            </div>

          </div>


          <div className="trace-text-block">

            <span>
              {
                isFrench
                  ? "Description"
                  : "Description"
              }
            </span>

            <p>
              {
                trace.description
              }
            </p>

          </div>


          <div className="trace-text-block">

            <span>
              {
                isFrench
                  ? "Objectif de l'attaque"
                  : "Attack objective"
              }
            </span>

            <p>
              {
                trace.objective
              }
            </p>

          </div>

        </section>


        {/* ================================================= */}
        {/* TIMELINE                                          */}
        {/* ================================================= */}

        <section className="trace-section">

          <div className="trace-section-title">

            <Clock3 size={18} />

            <h3>
              {
                isFrench
                  ? "Chronologie d'exécution"
                  : "Execution timeline"
              }
            </h3>

          </div>


          <div className="trace-timeline">

            {
              (
                trace.steps ||
                []
              ).map(
                (
                  step,
                  index
                ) => {

                  const StepIcon =
                    getStepIcon(
                      step.name
                    );

                  return (
                    <div
                      className="trace-step"
                      key={
                        `${step.order}-${step.name}`
                      }
                    >

                      <div className="trace-step-line">

                        <div className="trace-step-icon">
                          <StepIcon
                            size={17}
                          />
                        </div>


                        {
                          index <
                          trace.steps.length - 1
                          && (
                            <div className="trace-step-connector" />
                          )
                        }

                      </div>


                      <div className="trace-step-content">

                        <div className="trace-step-heading">

                          <strong>
                            {
                              step.name ===
                              "prepare_attack"
                                ? (
                                    isFrench
                                      ? "Préparation de l'attaque"
                                      : "Prepare attack"
                                  )

                                : step.name ===
                                  "llm_call"
                                ? (
                                    isFrench
                                      ? "Appel du LLM"
                                      : "LLM call"
                                  )

                                : step.name ===
                                  "evaluation"
                                ? (
                                    isFrench
                                      ? "Évaluation de sécurité"
                                      : "Security evaluation"
                                  )

                                : step.name ===
                                  "database"
                                ? (
                                    isFrench
                                      ? "Enregistrement PostgreSQL"
                                      : "PostgreSQL storage"
                                  )

                                : step.label
                            }
                          </strong>


                          <span className="trace-duration">
                            {
                              formatDuration(
                                step.duration_ms
                              )
                            }
                          </span>

                        </div>


                        <p>
                          {
                            step.description
                          }
                        </p>

                      </div>

                    </div>
                  );
                }
              )
            }

          </div>

        </section>


        {/* ================================================= */}
        {/* PERFORMANCE                                       */}
        {/* ================================================= */}

        <section className="trace-section">

          <div className="trace-section-title">

            <Clock3 size={18} />

            <h3>
              {
                isFrench
                  ? "Temps par étape"
                  : "Timing breakdown"
              }
            </h3>

          </div>


          <div className="trace-timing-grid">

            <div>
              <span>
                {
                  isFrench
                    ? "Préparation"
                    : "Preparation"
                }
              </span>

              <strong>
                {
                  formatDuration(
                    trace.timing
                      ?.prepare_ms
                  )
                }
              </strong>
            </div>


            <div>
              <span>
                LLM
              </span>

              <strong>
                {
                  formatDuration(
                    trace.timing
                      ?.llm_ms
                  )
                }
              </strong>
            </div>


            <div>
              <span>
                {
                  isFrench
                    ? "Évaluation"
                    : "Evaluation"
                }
              </span>

              <strong>
                {
                  formatDuration(
                    trace.timing
                      ?.evaluation_ms
                  )
                }
              </strong>
            </div>


            <div>
              <span>
                PostgreSQL
              </span>

              <strong>
                {
                  formatDuration(
                    trace.timing
                      ?.database_ms
                  )
                }
              </strong>
            </div>


            <div>
              <span>
                Total
              </span>

              <strong>
                {
                  formatDuration(
                    trace.timing
                      ?.total_ms
                  )
                }
              </strong>
            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* EXPLANATION                                       */}
        {/* ================================================= */}

        <section className="trace-section">

          <div className="trace-section-title">

            {
              verdict ===
              "BLOCKED"
                ? (
                    <ShieldCheck
                      size={18}
                    />
                  )
                : (
                    <ShieldX
                      size={18}
                    />
                  )
            }


            <h3>
              {
                isFrench
                  ? "Que s'est-il passé ?"
                  : "What happened?"
              }
            </h3>

          </div>


          <div
            className={
              verdict ===
              "BLOCKED"
                ? "trace-explanation safe"
                : "trace-explanation dangerous"
            }
          >

            <strong>
              {
                verdict ===
                "BLOCKED"
                  ? (
                      isFrench
                        ? "L'attaque a été bloquée"
                        : "The attack was blocked"
                    )
                  : (
                      isFrench
                        ? "Le scénario est compromis"
                        : "The scenario was compromised"
                    )
              }
            </strong>


            <p>
              {
                humanExplanation
              }
            </p>

          </div>

        </section>


        {/* ================================================= */}
        {/* SYSTEM PROMPT                                     */}
        {/* ================================================= */}

        <section className="trace-section">

          <div className="trace-section-title">
            <BrainCircuit size={18} />

            <h3>
              System Prompt
            </h3>
          </div>


          <pre className="trace-code">
            {
              trace.system_prompt
            }
          </pre>

        </section>


        {/* ================================================= */}
        {/* ATTACK PAYLOAD                                    */}
        {/* ================================================= */}

        <section className="trace-section">

          <div className="trace-section-title">
            <FlaskConical size={18} />

            <h3>
              {
                isFrench
                  ? "Payload envoyé au modèle"
                  : "Attack payload sent to model"
              }
            </h3>
          </div>


          <p className="trace-evidence-note">
            {
              isFrench
                ? (
                    "Le texte ci-dessous est conservé exactement "
                    + "tel qu'il a été envoyé au modèle."
                  )
                : (
                    "The text below is preserved exactly "
                    + "as it was sent to the model."
                  )
            }
          </p>


          <pre className="trace-code attack">
            {
              trace.payload
            }
          </pre>

        </section>


        {/* ================================================= */}
        {/* MODEL RESPONSE                                    */}
        {/* ================================================= */}

        <section className="trace-section">

          <div className="trace-section-title">

            <BrainCircuit
              size={18}
            />

            <h3>
              {
                isFrench
                  ? "Réponse du modèle"
                  : "Model response"
              }
            </h3>

          </div>


          <pre className="trace-code response">
            {
              trace.response
            }
          </pre>

        </section>


        {/* ================================================= */}
        {/* EVALUATION                                        */}
        {/* ================================================= */}

        <section className="trace-section">

          <div className="trace-section-title">
            <ShieldCheck size={18} />

            <h3>
              {
                isFrench
                  ? "Évaluation de sécurité"
                  : "Security evaluation"
              }
            </h3>
          </div>


          <div className="trace-evaluation-grid">

            <div>

              <span>
                Evaluator
              </span>

              <strong>
                {
                  trace.evaluator
                }
              </strong>

            </div>


            <div>

              <span>
                {
                  isFrench
                    ? "Secret détecté"
                    : "Secret detected"
                }
              </span>

              <strong>
                {
                  trace.secret_detected
                    ? (
                        isFrench
                          ? "OUI"
                          : "YES"
                      )
                    : (
                        isFrench
                          ? "NON"
                          : "NO"
                      )
                }
              </strong>

            </div>


            <div>

              <span>
                Verdict
              </span>

              <strong>
                {
                  verdict
                }
              </strong>

            </div>

          </div>


          <div className="trace-limitation">

            <strong>
              {
                isFrench
                  ? "Limitation de l'évaluateur V1"
                  : "Evaluator V1 limitation"
              }
            </strong>

            <p>
              {
                isFrench
                  ? (
                      "Cette première version considère l'attaque "
                      + "comme réussie lorsque le secret synthétique "
                      + "exact apparaît dans la réponse. "
                      + "Une future version analysera également les "
                      + "fuites partielles, les instructions système "
                      + "et les violations de politique."
                    )
                  : (
                      "This first version considers the attack successful "
                      + "when the exact synthetic secret appears in the response. "
                      + "A future evaluator will also detect partial leakage, "
                      + "system-prompt leakage and policy violations."
                    )
              }
            </p>

          </div>

        </section>


        <div className="trace-footer">

          <Database size={17} />

          <span>
            {
              isFrench
                ? "Trace enregistrée dans PostgreSQL"
                : "Trace persisted in PostgreSQL"
            }
          </span>

        </div>

      </div>

    </div>
  );
}
