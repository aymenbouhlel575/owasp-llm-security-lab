import "./DashboardInsightModal.css";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FlaskConical,
  Gauge,
  Lightbulb,
  ShieldCheck,
  ShieldOff,
  Target,
  X,
} from "lucide-react";


function percentage(
  value
) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(
      Number(value)
    )
  ) {
    return "0.0%";
  }

  return `${Number(value).toFixed(1)}%`;
}


export default function DashboardInsightModal({
  insightKey,
  stats,
  attackDistribution = [],
  isFrench = true,
  onClose,
}) {
  if (!insightKey) {
    return null;
  }


  // ============================================================
  // CONTENT
  // ============================================================

  const content = {

    // ==========================================================
    // TOTAL TESTS
    // ==========================================================

    totalTests: {
      icon:
        FlaskConical,

      title: {
        fr:
          "Tests de sécurité",
        en:
          "Security Tests",
      },

      value:
        stats.total,

      meaning: {
        fr:
          "Ce chiffre représente le nombre total de scénarios "
          + "de sécurité exécutés et enregistrés par la plateforme.",

        en:
          "This value represents the total number of security "
          + "scenarios executed and stored by the platform.",
      },

      calculation: {
        fr:
          "Nombre total de lignes de tests présentes dans "
          + "l'historique PostgreSQL.",

        en:
          "Total number of security test records stored "
          + "in PostgreSQL history.",
      },

      interpretation: {
        fr:
          `${stats.total} tests ont été exécutés jusqu'à présent. `
          + "Un nombre élevé signifie que la plateforme possède "
          + "davantage d'observations, mais cela ne signifie pas "
          + "automatiquement que tous les risques sont couverts.",

        en:
          `${stats.total} tests have been executed so far. `
          + "A larger number provides more observations, but does "
          + "not automatically mean that all security risks are covered.",
      },

      limits: {
        fr:
          "Le nombre de tests ne mesure pas directement le niveau "
          + "de sécurité. Plusieurs tests peuvent concerner la même "
          + "attaque ou la même catégorie OWASP.",

        en:
          "The number of tests does not directly measure security. "
          + "Many tests may concern the same attack or OWASP category.",
      },

      recommendations: {
        fr: [
          "Augmenter progressivement le nombre de scénarios.",
          "Ajouter plusieurs variantes d'une même attaque.",
          "Répéter certains tests car les LLM peuvent être probabilistes.",
          "Étendre la couverture aux autres catégories OWASP.",
          "Conserver les traces pour analyser l'évolution dans le temps.",
        ],

        en: [
          "Gradually increase the number of scenarios.",
          "Add several variants of the same attack.",
          "Repeat tests because LLM behaviour can be probabilistic.",
          "Extend coverage to other OWASP categories.",
          "Keep traces to analyse security evolution over time.",
        ],
      },
    },


    // ==========================================================
    // BLOCKED ATTACKS
    // ==========================================================

    blocked: {
      icon:
        ShieldCheck,

      title: {
        fr:
          "Attaques bloquées",
        en:
          "Attacks Blocked",
      },

      value:
        stats.blocked,

      meaning: {
        fr:
          "Ce chiffre indique combien de tests n'ont pas réussi "
          + "à provoquer la violation recherchée par l'évaluateur.",

        en:
          "This value shows how many tests did not trigger the "
          + "security violation detected by the evaluator.",
      },

      calculation: {
        fr:
          "Attaques bloquées = nombre total de tests − attaques réussies.",

        en:
          "Blocked attacks = total tests − successful attacks.",
      },

      interpretation: {
        fr:
          `${stats.blocked} réponses sur ${stats.total} ont été classées `
          + "comme bloquées selon les règles d'évaluation actuelles.",

        en:
          `${stats.blocked} responses out of ${stats.total} were classified `
          + "as blocked according to the current evaluation rules.",
      },

      limits: {
        fr:
          "BLOCKED signifie que le scénario testé n'a pas réussi selon "
          + "l'évaluateur. Cela ne prouve pas que le modèle est protégé "
          + "contre toutes les variantes de cette attaque.",

        en:
          "BLOCKED means that the tested scenario did not succeed according "
          + "to the evaluator. It does not prove protection against every "
          + "possible variation of the attack.",
      },

      recommendations: {
        fr: [
          "Tester plusieurs formulations du même prompt malveillant.",
          "Ajouter des attaques indirectes et multi-tours.",
          "Améliorer progressivement l'évaluateur.",
          "Analyser les traces même lorsque le verdict est BLOCKED.",
          "Tester avec plusieurs modèles et configurations.",
        ],

        en: [
          "Test several formulations of the same malicious prompt.",
          "Add indirect and multi-turn attacks.",
          "Progressively improve the evaluator.",
          "Inspect traces even when the verdict is BLOCKED.",
          "Test different models and configurations.",
        ],
      },
    },


    // ==========================================================
    // SUCCESSFUL ATTACKS
    // ==========================================================

    successful: {
      icon:
        ShieldOff,

      title: {
        fr:
          "Attaques réussies",
        en:
          "Successful Attacks",
      },

      value:
        stats.succeeded,

      meaning: {
        fr:
          "Une attaque réussie signifie que la réponse du modèle "
          + "a satisfait les critères définis pour considérer le "
          + "test comme compromis.",

        en:
          "A successful attack means the model response matched "
          + "the criteria used to classify the test as compromised.",
      },

      calculation: {
        fr:
          "Nombre de résultats pour lesquels attack_success = true.",

        en:
          "Number of results where attack_success = true.",
      },

      interpretation: {
        fr:
          stats.succeeded === 0
            ? (
                "Aucune attaque enregistrée n'a réussi selon "
                + "l'évaluateur actuel."
              )
            : (
                `${stats.succeeded} attaque(s) ont réussi. `
                + "Ces traces doivent être examinées en priorité."
              ),

        en:
          stats.succeeded === 0
            ? (
                "No recorded attack succeeded according "
                + "to the current evaluator."
              )
            : (
                `${stats.succeeded} attack(s) succeeded. `
                + "These traces should be investigated first."
              ),
      },

      limits: {
        fr:
          stats.succeeded === 0
            ? (
                "0 attaque réussie ne signifie pas 0 vulnérabilité. "
                + "Cela signifie uniquement qu'aucun des tests exécutés "
                + "n'a déclenché les critères actuels."
              )
            : (
                "Une attaque réussie doit être vérifiée dans sa trace "
                + "pour comprendre exactement la cause de l'échec."
              ),

        en:
          stats.succeeded === 0
            ? (
                "Zero successful attacks does not mean zero vulnerabilities. "
                + "It only means none of the executed tests triggered "
                + "the current detection criteria."
              )
            : (
                "A successful attack should be inspected through its trace "
                + "to determine the exact cause of failure."
              ),
      },

      recommendations: {
        fr:
          stats.succeeded === 0
            ? [
                "Ne pas conclure que le système est totalement sécurisé.",
                "Ajouter de nouveaux scénarios et variantes.",
                "Tester des attaques indirectes.",
                "Ajouter d'autres méthodes d'évaluation.",
              ]
            : [
                "Ouvrir immédiatement les traces compromises.",
                "Identifier le payload responsable.",
                "Analyser la réponse du modèle.",
                "Ajouter ou renforcer les guardrails.",
                "Créer un test de non-régression.",
              ],

        en:
          stats.succeeded === 0
            ? [
                "Do not conclude that the system is completely secure.",
                "Add new scenarios and variants.",
                "Test indirect attacks.",
                "Add additional evaluation methods.",
              ]
            : [
                "Immediately inspect compromised traces.",
                "Identify the responsible payload.",
                "Analyse the model response.",
                "Add or strengthen guardrails.",
                "Create a regression security test.",
              ],
      },
    },


    // ==========================================================
    // BLOCKING RATE
    // ==========================================================

    blockingRate: {
      icon:
        Gauge,

      title: {
        fr:
          "Taux de blocage observé",
        en:
          "Observed Blocking Rate",
      },

      value:
        percentage(
          stats.blockingRate
        ),

      meaning: {
        fr:
          "Cette métrique représente la proportion des tests "
          + "exécutés qui ont été classés comme bloqués.",

        en:
          "This metric represents the proportion of executed "
          + "tests that were classified as blocked.",
      },

      calculation: {
        fr:
          `(${stats.blocked} attaques bloquées / ${stats.total} tests) × 100`,

        en:
          `(${stats.blocked} blocked attacks / ${stats.total} tests) × 100`,
      },

      interpretation: {
        fr:
          `Le taux observé est actuellement de `
          + `${percentage(stats.blockingRate)} sur `
          + `${stats.total} tests exécutés.`,

        en:
          `The currently observed blocking rate is `
          + `${percentage(stats.blockingRate)} across `
          + `${stats.total} executed tests.`,
      },

      limits: {
        fr:
          "Ce pourcentage décrit uniquement l'échantillon de tests exécutés. "
          + "Un taux de 100 % ne signifie pas que le système possède une "
          + "sécurité absolue contre toutes les attaques possibles.",

        en:
          "This percentage only describes the executed test sample. "
          + "A 100% value does not imply absolute security against "
          + "all possible attacks.",
      },

      recommendations: {
        fr: [
          "Augmenter la diversité des scénarios avant d'interpréter ce taux.",
          "Mesurer le taux séparément pour chaque catégorie OWASP.",
          "Ajouter des répétitions pour les scénarios probabilistes.",
          "Suivre l'évolution du taux après chaque modification du système.",
        ],

        en: [
          "Increase scenario diversity before interpreting this rate.",
          "Measure the rate independently for each OWASP category.",
          "Repeat scenarios when model behaviour is probabilistic.",
          "Track rate evolution after each system modification.",
        ],
      },
    },


    // ==========================================================
    // ATTACK OUTCOMES PIE CHART
    // ==========================================================

    outcomes: {
      icon:
        BarChart3,

      title: {
        fr:
          "Résultats des attaques",
        en:
          "Attack Outcomes",
      },

      value:
        `${stats.blocked} / ${stats.total}`,

      meaning: {
        fr:
          "Ce graphique compare les attaques bloquées aux attaques "
          + "ayant réussi à provoquer une violation.",

        en:
          "This chart compares blocked attacks with attacks that "
          + "successfully triggered a security violation.",
      },

      calculation: {
        fr:
          `Bloquées : ${stats.blocked} — `
          + `Réussies : ${stats.succeeded}.`,

        en:
          `Blocked: ${stats.blocked} — `
          + `Successful: ${stats.succeeded}.`,
      },

      interpretation: {
        fr:
          stats.succeeded === 0
            ? (
                "Pour les tests actuellement enregistrés, tous les "
                + "scénarios ont été classés comme bloqués."
              )
            : (
                "Le graphique montre qu'une partie des scénarios "
                + "a réussi à contourner la protection testée."
              ),

        en:
          stats.succeeded === 0
            ? (
                "For the currently recorded tests, all scenarios "
                + "were classified as blocked."
              )
            : (
                "The chart shows that some scenarios successfully "
                + "bypassed the tested protection."
              ),
      },

      limits: {
        fr:
          "La répartition dépend directement de la qualité des scénarios "
          + "et des critères utilisés par l'évaluateur.",

        en:
          "The distribution depends directly on scenario quality "
          + "and the evaluator criteria.",
      },

      recommendations: {
        fr: [
          "Comparer les résultats par type d'attaque.",
          "Ajouter les verdicts PARTIAL dans une prochaine version.",
          "Examiner les traces plutôt que seulement le résultat global.",
          "Comparer les campagnes dans le temps.",
        ],

        en: [
          "Compare results by attack type.",
          "Include PARTIAL verdicts in a future version.",
          "Inspect traces rather than relying only on global results.",
          "Compare campaigns over time.",
        ],
      },
    },


    // ==========================================================
    // ATTACK DISTRIBUTION
    // ==========================================================

    distribution: {
      icon:
        Target,

      title: {
        fr:
          "Distribution des attaques",
        en:
          "Attack Distribution",
      },

      value:
        `${attackDistribution.length}`,

      meaning: {
        fr:
          "Ce graphique montre combien de fois chaque scénario "
          + "ou technique d'attaque a été exécuté.",

        en:
          "This chart shows how many times each attack scenario "
          + "or technique has been executed.",
      },

      calculation: {
        fr:
          "Les tests sont regroupés par nom d'attaque, puis le nombre "
          + "d'exécutions de chaque groupe est compté.",

        en:
          "Tests are grouped by attack name and the number of executions "
          + "for each group is counted.",
      },

      interpretation: {
        fr:
          "Une distribution équilibrée permet d'éviter qu'une seule "
          + "technique soit beaucoup plus testée que les autres.",

        en:
          "A balanced distribution helps prevent one technique from "
          + "being tested far more often than the others.",
      },

      limits: {
        fr:
          "Une distribution équilibrée entre cinq scénarios LLM01 "
          + "ne signifie pas que les dix risques OWASP sont couverts.",

        en:
          "A balanced distribution across five LLM01 scenarios does not "
          + "mean that all ten OWASP risks are covered.",
      },

      recommendations: {
        fr: [
          "Ajouter progressivement les autres catégories OWASP.",
          "Créer plusieurs variantes par scénario.",
          "Identifier les attaques sous-testées.",
          "Comparer la distribution avec la couverture OWASP.",
        ],

        en: [
          "Gradually implement additional OWASP categories.",
          "Create multiple variants for each scenario.",
          "Identify under-tested attacks.",
          "Compare attack distribution with OWASP coverage.",
        ],
      },
    },

  };


  const insight =
    content[
      insightKey
    ];


  if (!insight) {
    return null;
  }


  const Icon =
    insight.icon ||
    Activity;


  const language =
    isFrench
      ? "fr"
      : "en";


  const recommendations =
    insight.recommendations[
      language
    ] || [];


  return (
    <div
      className="dashboard-insight-overlay"

      onMouseDown={
        (event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }
        }
      }
    >

      <div className="dashboard-insight-modal">

        {/* HEADER */}

        <div className="dashboard-insight-header">

          <div className="dashboard-insight-title">

            <div className="dashboard-insight-icon">
              <Icon
                size={22}
              />
            </div>

            <div>

              <span>
                {
                  isFrench
                    ? "EXPLICATION DE LA MÉTRIQUE"
                    : "METRIC EXPLANATION"
                }
              </span>

              <h2>
                {
                  insight.title[
                    language
                  ]
                }
              </h2>

            </div>

          </div>


          <button
            type="button"
            className="dashboard-insight-close"
            onClick={
              onClose
            }
            aria-label={
              isFrench
                ? "Fermer"
                : "Close"
            }
          >
            <X
              size={20}
            />
          </button>

        </div>


        {/* CURRENT VALUE */}

        <div className="dashboard-insight-value">

          <span>
            {
              isFrench
                ? "VALEUR ACTUELLE"
                : "CURRENT VALUE"
            }
          </span>

          <strong>
            {
              insight.value
            }
          </strong>

        </div>


        {/* MEANING */}

        <section className="dashboard-insight-section">

          <h3>
            {
              isFrench
                ? "Que signifie cette information ?"
                : "What does this information mean?"
            }
          </h3>

          <p>
            {
              insight.meaning[
                language
              ]
            }
          </p>

        </section>


        {/* CALCULATION */}

        <section className="dashboard-insight-section">

          <h3>
            {
              isFrench
                ? "Comment est-elle calculée ?"
                : "How is it calculated?"
            }
          </h3>

          <div className="dashboard-insight-calculation">

            <Activity
              size={18}
            />

            <span>
              {
                insight.calculation[
                  language
                ]
              }
            </span>

          </div>

        </section>


        {/* INTERPRETATION */}

        <section className="dashboard-insight-section">

          <h3>
            {
              isFrench
                ? "Comment interpréter le résultat ?"
                : "How should this result be interpreted?"
            }
          </h3>

          <p>
            {
              insight.interpretation[
                language
              ]
            }
          </p>

        </section>


        {/* LIMITS */}

        <section className="dashboard-insight-section">

          <div className="dashboard-insight-warning">

            <AlertTriangle
              size={19}
            />

            <div>

              <strong>
                {
                  isFrench
                    ? "Attention à l'interprétation"
                    : "Interpretation warning"
                }
              </strong>

              <p>
                {
                  insight.limits[
                    language
                  ]
                }
              </p>

            </div>

          </div>

        </section>


        {/* RECOMMENDATIONS */}

        <section className="dashboard-insight-section">

          <div className="dashboard-insight-section-title">

            <Lightbulb
              size={19}
            />

            <h3>
              {
                isFrench
                  ? "Recommandations"
                  : "Recommendations"
              }
            </h3>

          </div>


          <div className="dashboard-insight-recommendations">

            {
              recommendations.map(
                (
                  recommendation,
                  index
                ) => (

                  <div
                    key={
                      `${insightKey}-${index}`
                    }
                  >

                    <CheckCircle2
                      size={17}
                    />

                    <span>
                      {
                        recommendation
                      }
                    </span>

                  </div>

                )
              )
            }

          </div>

        </section>


        <div className="dashboard-insight-footer">

          {
            isFrench
              ? (
                  "Ces informations sont calculées à partir "
                  + "des tests enregistrés par la plateforme."
                )
              : (
                  "These insights are calculated from the "
                  + "tests recorded by the platform."
                )
          }

        </div>

      </div>

    </div>
  );
}
