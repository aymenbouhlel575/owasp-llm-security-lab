from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy import (
    select,
)

from sqlalchemy.ext.asyncio import (
    AsyncSession,
)

from backend.app.database.connection import (
    get_db,
)

from backend.app.database.models import (
    SecurityTestRun,
)


router = APIRouter(
    tags=[
        "Security Results"
    ],
)


def normalize_verdict(
    row,
):
    verdict = getattr(
        row,
        "verdict",
        None,
    )

    if verdict:
        verdict = str(
            verdict
        ).upper()

        if verdict in {
            "BLOCKED",
            "PARTIAL",
            "COMPROMISED",
        }:
            return verdict

    return (
        "COMPROMISED"
        if row.attack_success
        else "BLOCKED"
    )


@router.get(
    "/api/results"
)
async def get_results(
    db: AsyncSession = Depends(
        get_db
    ),
):
    query = (
        select(
            SecurityTestRun
        )
        .order_by(
            SecurityTestRun.id.desc()
        )
    )

    db_result = (
        await db.execute(
            query
        )
    )

    rows = (
        db_result
        .scalars()
        .all()
    )

    results = []

    for row in rows:

        verdict = normalize_verdict(
            row
        )

        results.append(
            {
                "id":
                    row.id,

                "created_at":
                    row.created_at,

                "trace_id":
                    row.trace_id,

                "campaign_id":
                    row.campaign_id,

                "scenario_index":
                    row.scenario_index,

                "trace_available":
                    bool(
                        row.trace_id
                    ),

                "owasp_category":
                    row.owasp_category,

                "attack_name":
                    row.attack_name,

                "provider":
                    row.provider,

                "model":
                    row.model,

                "payload":
                    row.payload,

                "response":
                    row.response,

                "attack_success":
                    row.attack_success,

                "raw_attack_success":
                    getattr(
                        row,
                        "raw_attack_success",
                        None,
                    ),

                "verdict":
                    verdict,

                "severity":
                    row.severity,

                "execution_mode":
                    getattr(
                        row,
                        "execution_mode",
                        None,
                    ),

                "attacker_model":
                    getattr(
                        row,
                        "attacker_model",
                        None,
                    ),

                "target_model":
                    (
                        getattr(
                            row,
                            "target_model",
                            None,
                        )
                        or
                        row.model
                    ),

                "judge_model":
                    getattr(
                        row,
                        "judge_model",
                        None,
                    ),

                "judge_confidence":
                    getattr(
                        row,
                        "judge_confidence",
                        None,
                    ),
            }
        )

    return {
        "total":
            len(
                results
            ),

        "results":
            results,
    }


# ============================================================
# AI SECURITY ANALYTICS
# ============================================================

from collections import defaultdict

from fastapi.responses import (
    StreamingResponse,
)

import csv
import io


def _security_verdict(
    row,
):
    verdict = getattr(
        row,
        "verdict",
        None,
    )

    if verdict:
        verdict = str(
            verdict
        ).upper()

        if verdict in {
            "BLOCKED",
            "PARTIAL",
            "COMPROMISED",
        }:
            return verdict

    return (
        "COMPROMISED"
        if row.attack_success
        else "BLOCKED"
    )


def _owasp_code(
    category,
):
    value = str(
        category or ""
    ).upper()

    for number in range(
        1,
        11,
    ):
        code = (
            f"LLM{number:02d}"
        )

        if code in value:
            return code

    return "UNKNOWN"


def _percentage(
    numerator,
    denominator,
):
    if not denominator:
        return 0.0

    return round(
        (
            numerator /
            denominator
        )
        *
        100,
        2,
    )


async def _load_security_rows(
    db,
):
    result = (
        await db.execute(
            select(
                SecurityTestRun
            )
            .order_by(
                SecurityTestRun.id.desc()
            )
        )
    )

    return (
        result
        .scalars()
        .all()
    )


def _compute_security_analytics(
    rows,
):
    total = len(
        rows
    )

    blocked = 0
    partial = 0
    compromised = 0

    baseline_total = 0
    baseline_compromised = 0

    protected_total = 0
    protected_compromised = 0

    judge_confidences = []

    trace_count = 0

    categories = defaultdict(
        lambda: {
            "total":
                0,

            "blocked":
                0,

            "partial":
                0,

            "compromised":
                0,

            "baseline_total":
                0,

            "baseline_compromised":
                0,

            "protected_total":
                0,

            "protected_compromised":
                0,
        }
    )


    attacker_models = set()
    target_models = set()
    judge_models = set()


    for row in rows:

        verdict = (
            _security_verdict(
                row
            )
        )

        mode = str(
            getattr(
                row,
                "execution_mode",
                None,
            )
            or
            "legacy"
        ).lower()

        code = (
            _owasp_code(
                row.owasp_category
            )
        )


        if verdict == "BLOCKED":
            blocked += 1

        elif verdict == "PARTIAL":
            partial += 1

        elif verdict == "COMPROMISED":
            compromised += 1


        if row.trace_id:
            trace_count += 1


        confidence = getattr(
            row,
            "judge_confidence",
            None,
        )

        try:
            confidence = float(
                confidence
            )

            if (
                0
                <=
                confidence
                <=
                1
            ):
                judge_confidences.append(
                    confidence
                )

        except (
            TypeError,
            ValueError,
        ):
            pass


        attacker_model = getattr(
            row,
            "attacker_model",
            None,
        )

        target_model = (
            getattr(
                row,
                "target_model",
                None,
            )
            or
            row.model
        )

        judge_model = getattr(
            row,
            "judge_model",
            None,
        )


        if attacker_model:
            attacker_models.add(
                attacker_model
            )

        if target_model:
            target_models.add(
                target_model
            )

        if judge_model:
            judge_models.add(
                judge_model
            )


        if code != "UNKNOWN":

            item = categories[
                code
            ]

            item[
                "total"
            ] += 1


            if verdict == "BLOCKED":
                item[
                    "blocked"
                ] += 1

            elif verdict == "PARTIAL":
                item[
                    "partial"
                ] += 1

            elif verdict == "COMPROMISED":
                item[
                    "compromised"
                ] += 1


            if mode == "baseline":

                baseline_total += 1

                item[
                    "baseline_total"
                ] += 1

                if (
                    verdict
                    ==
                    "COMPROMISED"
                ):
                    baseline_compromised += 1

                    item[
                        "baseline_compromised"
                    ] += 1


            elif mode == "protected":

                protected_total += 1

                item[
                    "protected_total"
                ] += 1

                if (
                    verdict
                    ==
                    "COMPROMISED"
                ):
                    protected_compromised += 1

                    item[
                        "protected_compromised"
                    ] += 1


    asr = _percentage(
        compromised,
        total,
    )

    blocking_rate = _percentage(
        blocked,
        total,
    )


    baseline_asr = (
        _percentage(
            baseline_compromised,
            baseline_total,
        )
        if baseline_total
        else None
    )


    protected_asr = (
        _percentage(
            protected_compromised,
            protected_total,
        )
        if protected_total
        else None
    )


    guardrail_effectiveness = (
        None
    )


    if (
        baseline_asr is not None
        and
        protected_asr is not None
        and
        baseline_asr > 0
    ):
        guardrail_effectiveness = round(
            max(
                0.0,
                min(
                    100.0,
                    (
                        1
                        -
                        (
                            protected_asr
                            /
                            baseline_asr
                        )
                    )
                    *
                    100
                ),
            ),
            2,
        )


    average_judge_confidence = (
        round(
            (
                sum(
                    judge_confidences
                )
                /
                len(
                    judge_confidences
                )
            )
            *
            100,
            2,
        )
        if judge_confidences
        else None
    )


    owasp_rows = []


    for number in range(
        1,
        11,
    ):

        code = (
            f"LLM{number:02d}"
        )

        item = categories[
            code
        ]

        category_asr = (
            _percentage(
                item[
                    "compromised"
                ],
                item[
                    "total"
                ],
            )
        )


        category_baseline_asr = (
            _percentage(
                item[
                    "baseline_compromised"
                ],
                item[
                    "baseline_total"
                ],
            )
            if item[
                "baseline_total"
            ]
            else None
        )


        category_protected_asr = (
            _percentage(
                item[
                    "protected_compromised"
                ],
                item[
                    "protected_total"
                ],
            )
            if item[
                "protected_total"
            ]
            else None
        )


        owasp_rows.append(
            {
                "code":
                    code,

                "total":
                    item[
                        "total"
                    ],

                "blocked":
                    item[
                        "blocked"
                    ],

                "partial":
                    item[
                        "partial"
                    ],

                "compromised":
                    item[
                        "compromised"
                    ],

                "asr":
                    category_asr,

                "baseline_tests":
                    item[
                        "baseline_total"
                    ],

                "baseline_asr":
                    category_baseline_asr,

                "protected_tests":
                    item[
                        "protected_total"
                    ],

                "protected_asr":
                    category_protected_asr,
            }
        )


    coverage_count = len(
        [
            row
            for row
            in owasp_rows
            if row[
                "total"
            ]
            >
            0
        ]
    )


    coverage_score = (
        coverage_count
        /
        10
    ) * 100


    robustness_score = (
        max(
            0.0,
            100.0
            -
            asr,
        )
    )


    traceability_score = (
        _percentage(
            trace_count,
            total,
        )
    )


    judge_coverage_score = (
        _percentage(
            len(
                judge_confidences
            ),
            total,
        )
    )


    maturity_score = (
        None
    )


    if (
        guardrail_effectiveness
        is not None
    ):
        maturity_score = round(
            (
                0.30
                *
                coverage_score
            )
            +
            (
                0.30
                *
                robustness_score
            )
            +
            (
                0.20
                *
                guardrail_effectiveness
            )
            +
            (
                0.10
                *
                traceability_score
            )
            +
            (
                0.10
                *
                judge_coverage_score
            ),
            2,
        )


    return {
        "summary": {
            "total_tests":
                total,

            "blocked":
                blocked,

            "partial":
                partial,

            "compromised":
                compromised,

            "attack_success_rate":
                asr,

            "blocking_rate":
                blocking_rate,

            "average_judge_confidence":
                average_judge_confidence,
        },

        "guardrails": {
            "baseline_tests":
                baseline_total,

            "baseline_compromised":
                baseline_compromised,

            "baseline_asr":
                baseline_asr,

            "protected_tests":
                protected_total,

            "protected_compromised":
                protected_compromised,

            "protected_asr":
                protected_asr,

            "effectiveness":
                guardrail_effectiveness,
        },

        "owasp": {
            "coverage":
                coverage_count,

            "coverage_percent":
                round(
                    coverage_score,
                    2,
                ),

            "categories":
                owasp_rows,
        },

        "models": {
            "attackers":
                sorted(
                    attacker_models
                ),

            "targets":
                sorted(
                    target_models
                ),

            "judges":
                sorted(
                    judge_models
                ),
        },

        "maturity": {
            "score":
                maturity_score,

            "official_owasp_score":
                False,

            "components": {
                "coverage":
                    round(
                        coverage_score,
                        2,
                    ),

                "robustness":
                    round(
                        robustness_score,
                        2,
                    ),

                "guardrail_effectiveness":
                    guardrail_effectiveness,

                "traceability":
                    traceability_score,

                "judge_coverage":
                    judge_coverage_score,
            },

            "formula":
                (
                    "0.30*coverage + "
                    "0.30*robustness + "
                    "0.20*guardrail_effectiveness + "
                    "0.10*traceability + "
                    "0.10*judge_coverage"
                ),
        },
    }


@router.get(
    "/api/security/analytics"
)
async def get_security_analytics(
    db: AsyncSession = Depends(
        get_db
    ),
):
    rows = (
        await _load_security_rows(
            db
        )
    )

    return (
        _compute_security_analytics(
            rows
        )
    )


# ============================================================
# JSON AUDIT REPORT
# ============================================================

@router.get(
    "/api/security/audit-report"
)
async def get_security_audit_report(
    db: AsyncSession = Depends(
        get_db
    ),
):
    rows = (
        await _load_security_rows(
            db
        )
    )


    analytics = (
        _compute_security_analytics(
            rows
        )
    )


    findings = []


    for category in (
        analytics[
            "owasp"
        ][
            "categories"
        ]
    ):

        if (
            category[
                "total"
            ]
            ==
            0
        ):
            continue


        findings.append(
            {
                "owasp":
                    category[
                        "code"
                    ],

                "tests":
                    category[
                        "total"
                    ],

                "compromised":
                    category[
                        "compromised"
                    ],

                "partial":
                    category[
                        "partial"
                    ],

                "asr":
                    category[
                        "asr"
                    ],

                "baseline_asr":
                    category[
                        "baseline_asr"
                    ],

                "protected_asr":
                    category[
                        "protected_asr"
                    ],
            }
        )


    findings.sort(
        key=lambda item:
            item[
                "asr"
            ],
        reverse=True,
    )


    recent_compromises = []


    for row in rows:

        if (
            _security_verdict(
                row
            )
            !=
            "COMPROMISED"
        ):
            continue


        recent_compromises.append(
            {
                "id":
                    row.id,

                "created_at":
                    row.created_at,

                "owasp":
                    _owasp_code(
                        row.owasp_category
                    ),

                "attack_name":
                    row.attack_name,

                "mode":
                    getattr(
                        row,
                        "execution_mode",
                        None,
                    ),

                "target_model":
                    (
                        getattr(
                            row,
                            "target_model",
                            None,
                        )
                        or
                        row.model
                    ),

                "judge_confidence":
                    getattr(
                        row,
                        "judge_confidence",
                        None,
                    ),
            }
        )


        if (
            len(
                recent_compromises
            )
            >=
            10
        ):
            break


    return {
        "report_type":
            "AI Security Audit Report",

        "framework":
            "OWASP Top 10 for LLM Applications",

        "analytics":
            analytics,

        "findings":
            findings,

        "recent_compromises":
            recent_compromises,

        "notes": [
            (
                "The maturity score is an internal "
                "platform metric and is not an official "
                "OWASP score."
            ),
            (
                "Guardrail effectiveness requires both "
                "Baseline and Protected campaigns."
            ),
        ],
    }


# ============================================================
# CSV EXPORT
# ============================================================

@router.get(
    "/api/security/audit-report.csv"
)
async def export_security_audit_csv(
    db: AsyncSession = Depends(
        get_db
    ),
):
    rows = (
        await _load_security_rows(
            db
        )
    )


    buffer = (
        io.StringIO()
    )


    writer = csv.writer(
        buffer
    )


    writer.writerow(
        [
            "id",
            "created_at",
            "owasp_category",
            "attack_name",
            "verdict",
            "execution_mode",
            "attacker_model",
            "target_model",
            "judge_model",
            "judge_confidence",
            "attack_success",
            "raw_attack_success",
        ]
    )


    for row in rows:

        writer.writerow(
            [
                row.id,

                row.created_at,

                row.owasp_category,

                row.attack_name,

                _security_verdict(
                    row
                ),

                getattr(
                    row,
                    "execution_mode",
                    None,
                ),

                getattr(
                    row,
                    "attacker_model",
                    None,
                ),

                (
                    getattr(
                        row,
                        "target_model",
                        None,
                    )
                    or
                    row.model
                ),

                getattr(
                    row,
                    "judge_model",
                    None,
                ),

                getattr(
                    row,
                    "judge_confidence",
                    None,
                ),

                row.attack_success,

                getattr(
                    row,
                    "raw_attack_success",
                    None,
                ),
            ]
        )


    buffer.seek(
        0
    )


    return StreamingResponse(
        iter(
            [
                buffer.getvalue()
            ]
        ),

        media_type=
            "text/csv",

        headers={
            "Content-Disposition":
                (
                    "attachment; "
                    "filename=ai_security_audit.csv"
                )
        },
    )
