from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy import (
    select,
)

from sqlalchemy.ext.asyncio import (
    AsyncSession,
)

from backend.app.api.campaign_attack_factory import (
    build_campaign_router,
)

from backend.app.attacks.prompt_injection import (
    PromptInjectionAttack,
)

from backend.app.database.connection import (
    get_db,
)

from backend.app.database.models import (
    AttackTrace,
)


# ============================================================
# ROOT ROUTER
# ============================================================

router = APIRouter()


# ============================================================
# LLM01
# ============================================================

prompt_injection_router = (
    build_campaign_router(
        prefix=
            "/api/attacks/prompt-injection",

        tag=
            "LLM01 Prompt Injection",

        attack_class=
            PromptInjectionAttack,
    )
)


router.include_router(
    prompt_injection_router
)


# ============================================================
# COMPLETE TRACE
# ============================================================

@router.get(
    "/api/attacks/traces/{trace_id}",
    tags=[
        "Attack Traces"
    ],
)
async def get_attack_trace(
    trace_id: str,

    db: AsyncSession = Depends(
        get_db
    ),
):

    query = (
        select(
            AttackTrace
        )
        .where(
            AttackTrace.id
            ==
            trace_id
        )
    )


    result = (
        await db.execute(
            query
        )
    )


    trace = (
        result
        .scalar_one_or_none()
    )


    if trace is None:

        raise HTTPException(
            status_code=404,
            detail=
                "Trace not found",
        )


    return {
        "trace_id":
            trace.id,

        "campaign_id":
            trace.campaign_id,

        "scenario_index":
            trace.scenario_index,

        "category":
            trace.category,

        "attack_name":
            trace.attack_name,

        "technique":
            trace.technique,

        "description":
            trace.description,

        "objective":
            trace.objective,

        "severity":
            trace.severity,

        "system_prompt":
            trace.system_prompt,

        "payload":
            trace.payload,

        "generated_payload":
            getattr(
                trace,
                "generated_payload",
                None,
            ),

        "response":
            trace.response,

        "verdict":
            trace.verdict,

        "explanation":
            trace.explanation,

        "evaluator":
            trace.evaluator,

        "execution_mode":
            getattr(
                trace,
                "execution_mode",
                None,
            ),

        "models": {
            "attacker": {
                "model":
                    getattr(
                        trace,
                        "attacker_model",
                        None,
                    ),
            },

            "target": {
                "model":
                    (
                        getattr(
                            trace,
                            "target_model",
                            None,
                        )
                    ),
            },

            "judge": {
                "model":
                    getattr(
                        trace,
                        "judge_model",
                        None,
                    ),
            },
        },

        "attacker_metadata":
            getattr(
                trace,
                "attacker_metadata",
                None,
            ),

        "deterministic":
            getattr(
                trace,
                "deterministic_evaluation",
                None,
            ),

        "input_guard":
            getattr(
                trace,
                "input_guard",
                None,
            ),

        "output_guard":
            getattr(
                trace,
                "output_guard",
                None,
            ),

        "judge":
            getattr(
                trace,
                "judge_result",
                None,
            ),

        "judge_confidence":
            getattr(
                trace,
                "judge_confidence",
                None,
            ),

        "raw_attack_success":
            getattr(
                trace,
                "raw_attack_success",
                None,
            ),

        "started_at":
            trace.started_at,

        "finished_at":
            trace.finished_at,

        "timing": {
            "prepare_ms":
                trace.prepare_duration_ms,

            "llm_ms":
                trace.llm_duration_ms,

            "evaluation_ms":
                trace.evaluation_duration_ms,

            "database_ms":
                trace.database_duration_ms,

            "total_ms":
                trace.total_duration_ms,
        },

        "steps":
            trace.steps,
    }
