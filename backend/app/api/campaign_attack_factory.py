import os

from datetime import (
    datetime,
    timezone,
)

from time import (
    perf_counter,
)

from uuid import (
    uuid4,
)

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import (
    BaseModel,
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
    AttackTrace,
    SecurityCampaign,
    SecurityTestRun,
)

from backend.app.security.multillm_engine import (
    MultiLLMSecurityEngine,
)


def utc_now():

    return datetime.now(
        timezone.utc
    )


def elapsed_ms(
    started,
):

    return round(
        (
            perf_counter()
            -
            started
        )
        *
        1000,
        2,
    )


def normalize_mode(
    value,
):

    mode = str(
        value
        or os.getenv(
            "SECURITY_MODE",
            "baseline",
        )
    ).strip().lower()


    if mode not in {
        "baseline",
        "protected",
    }:

        mode = (
            "baseline"
        )


    return mode


class GenericAttackRequest(
    BaseModel
):

    scenario_index: int

    campaign_id: str | None = None

    adaptive: bool = False

    max_rounds: int = 3


def build_campaign_router(
    *,
    prefix,
    tag,
    attack_class,
):

    router = APIRouter(
        prefix=prefix,
        tags=[tag],
    )


    # ========================================================
    # GET SCENARIOS
    # ========================================================

    @router.get(
        "/scenarios",
        name=f"{tag} scenarios",
    )
    async def get_scenarios():

        engine = (
            MultiLLMSecurityEngine()
        )


        attack = attack_class(
            engine.target
        )


        scenarios = []


        for (
            index,
            scenario
        ) in enumerate(
            attack.get_scenarios()
        ):

            item = {
                "index":
                    index,

                "severity":
                    attack.severity,

                **scenario,
            }


            item.pop(
                "danger_patterns",
                None,
            )


            scenarios.append(
                item
            )


        return {
            "category":
                attack.category,

            "provider":
                engine.target.provider_name(),

            "model":
                engine.target.model_name(),

            "mode":
                engine.mode,

            "models":
                engine.model_info(),

            "total":
                len(
                    scenarios
                ),

            "scenarios":
                scenarios,
        }


    # ========================================================
    # CREATE CAMPAIGN
    # ========================================================

    @router.post(
        "/campaigns",
        name=f"{tag} create campaign",
    )
    async def create_campaign(
        mode: str | None = None,

        db: AsyncSession = Depends(
            get_db
        ),
    ):

        execution_mode = (
            normalize_mode(
                mode
            )
        )


        engine = (
            MultiLLMSecurityEngine(
                mode=
                    execution_mode
            )
        )


        attack = attack_class(
            engine.target
        )


        models = (
            engine.model_info()
        )


        campaign = SecurityCampaign(
            id=
                str(
                    uuid4()
                ),

            category=
                attack.category,

            provider=
                engine.target.provider_name(),

            model=
                engine.target.model_name(),

            status=
                "RUNNING",

            total_scenarios=
                len(
                    attack.get_scenarios()
                ),

            completed_scenarios=
                0,

            blocked=
                0,

            partial=
                0,

            compromised=
                0,

            started_at=
                utc_now(),

            execution_mode=
                execution_mode,

            attacker_model=
                models[
                    "attacker"
                ][
                    "model"
                ],

            target_model=
                models[
                    "target"
                ][
                    "model"
                ],

            judge_model=
                models[
                    "judge"
                ][
                    "model"
                ],
        )


        db.add(
            campaign
        )


        await db.commit()


        await db.refresh(
            campaign
        )


        return {
            "campaign_id":
                campaign.id,

            "category":
                campaign.category,

            "provider":
                campaign.provider,

            "model":
                campaign.model,

            "status":
                campaign.status,

            "mode":
                campaign.execution_mode,

            "models":
                models,

            "total_scenarios":
                campaign.total_scenarios,

            "completed_scenarios":
                campaign.completed_scenarios,

            "blocked":
                campaign.blocked,

            "partial":
                campaign.partial,

            "compromised":
                campaign.compromised,

            "started_at":
                campaign.started_at,
        }


    # ========================================================
    # LIST CAMPAIGNS
    # ========================================================

    @router.get(
        "/campaigns",
        name=f"{tag} list campaigns",
    )
    async def list_campaigns(
        db: AsyncSession = Depends(
            get_db
        ),
    ):

        query = (
            select(
                SecurityCampaign
            )
            .where(
                SecurityCampaign.category
                ==
                attack_class(
                    MultiLLMSecurityEngine().target
                ).category
            )
            .order_by(
                SecurityCampaign.started_at.desc()
            )
        )


        result = (
            await db.execute(
                query
            )
        )


        rows = (
            result
            .scalars()
            .all()
        )


        return {
            "campaigns": [
                {
                    "id":
                        row.id,

                    "category":
                        row.category,

                    "status":
                        row.status,

                    "mode":
                        row.execution_mode,

                    "attacker_model":
                        row.attacker_model,

                    "target_model":
                        row.target_model,

                    "judge_model":
                        row.judge_model,

                    "total_scenarios":
                        row.total_scenarios,

                    "completed_scenarios":
                        row.completed_scenarios,

                    "blocked":
                        row.blocked,

                    "partial":
                        row.partial,

                    "compromised":
                        row.compromised,

                    "started_at":
                        row.started_at,

                    "finished_at":
                        row.finished_at,
                }

                for row
                in rows
            ]
        }


    # ========================================================
    # RUN ONE SCENARIO
    # ========================================================

    @router.post(
        "/run-single",
        name=f"{tag} run scenario",
    )
    async def run_single(
        request: GenericAttackRequest,

        db: AsyncSession = Depends(
            get_db
        ),
    ):

        total_started = (
            perf_counter()
        )


        trace_started_at = (
            utc_now()
        )


        # ====================================================
        # CAMPAIGN
        # ====================================================

        campaign = None


        if request.campaign_id:

            campaign_result = (
                await db.execute(
                    select(
                        SecurityCampaign
                    ).where(
                        SecurityCampaign.id
                        ==
                        request.campaign_id
                    )
                )
            )


            campaign = (
                campaign_result
                .scalar_one_or_none()
            )


            if campaign is None:

                raise HTTPException(
                    status_code=404,
                    detail=
                        "Campaign not found",
                )


            if (
                campaign.status
                ==
                "COMPLETED"
            ):

                raise HTTPException(
                    status_code=409,
                    detail=
                        "Campaign already completed",
                )


        execution_mode = (
            normalize_mode(
                getattr(
                    campaign,
                    "execution_mode",
                    None,
                )
            )
        )


        engine = (
            MultiLLMSecurityEngine(
                mode=
                    execution_mode
            )
        )


        attack = attack_class(
            engine.target
        )


        # ====================================================
        # SCENARIO
        # ====================================================

        try:

            scenario = (
                attack.get_scenario(
                    request.scenario_index
                )
            )

        except IndexError:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid scenario index: "
                    f"{request.scenario_index}"
                ),
            )


        # ====================================================
        # CAMPAIGN VALIDATION / COMPATIBILITY MODE
        # ====================================================

        if campaign is not None:

            if (
                campaign.category
                !=
                attack.category
            ):

                raise HTTPException(
                    status_code=400,
                    detail=
                        "Campaign category mismatch",
                )


            duplicate_result = (
                await db.execute(
                    select(
                        AttackTrace
                    ).where(
                        AttackTrace.campaign_id
                        ==
                        campaign.id,

                        AttackTrace.scenario_index
                        ==
                        request.scenario_index,
                    )
                )
            )


            if (
                duplicate_result
                .scalar_one_or_none()
                is not None
            ):

                raise HTTPException(
                    status_code=409,
                    detail=
                        "Scenario already executed",
                )


        else:

            models = (
                engine.model_info()
            )


            campaign = SecurityCampaign(
                id=
                    str(
                        uuid4()
                    ),

                category=
                    attack.category,

                provider=
                    engine.target.provider_name(),

                model=
                    engine.target.model_name(),

                status=
                    "RUNNING",

                total_scenarios=
                    1,

                completed_scenarios=
                    0,

                blocked=
                    0,

                partial=
                    0,

                compromised=
                    0,

                started_at=
                    utc_now(),

                execution_mode=
                    execution_mode,

                attacker_model=
                    models[
                        "attacker"
                    ][
                        "model"
                    ],

                target_model=
                    models[
                        "target"
                    ][
                        "model"
                    ],

                judge_model=
                    models[
                        "judge"
                    ][
                        "model"
                    ],
            )


            db.add(
                campaign
            )


            await db.flush()


        # ====================================================
        # MULTI-LLM PIPELINE
        # ====================================================

        try:

            if request.adaptive:

                requested_rounds = max(
                    1,
                    min(
                        request.max_rounds,
                        5,
                    ),
                )

                execution = (
                    await engine.execute_adaptive(
                        attack=
                            attack,

                        scenario_index=
                            request.scenario_index,

                        max_rounds=
                            requested_rounds,
                    )
                )

            else:

                execution = (
                    await engine.execute(
                        attack,
                        request.scenario_index,
                    )
                )

        except Exception as exc:

            await db.rollback()


            raise HTTPException(
                status_code=500,
                detail=(
                    "Multi-LLM execution failed: "
                    f"{exc}"
                ),
            )


        generated = (
            execution.get(
                "generated_attack"
            )
            or
            {}
        )


        if execution.get(
            "rounds"
        ):

            generated = {
                **generated,

                "adaptive":
                    True,

                "rounds_executed":
                    execution.get(
                        "rounds_executed"
                    ),

                "rounds":
                    execution.get(
                        "rounds"
                    ),
            }


        input_guard = (
            execution.get(
                "input_guard"
            )
            or
            {}
        )


        output_guard = (
            execution.get(
                "output_guard"
            )
            or
            {}
        )


        deterministic = (
            execution.get(
                "deterministic"
            )
            or
            {}
        )


        judge = (
            execution.get(
                "judge"
            )
            or
            {}
        )


        models = (
            execution.get(
                "models"
            )
            or
            engine.model_info()
        )


        generated_payload = str(
            generated.get(
                "payload"
            )
            or
            scenario.get(
                "payload",
                "",
            )
        )


        target_response = str(
            execution.get(
                "target_response"
            )
            or
            ""
        )


        verdict = str(
            execution.get(
                "verdict"
            )
            or
            "PARTIAL"
        ).upper()


        if verdict not in {
            "BLOCKED",
            "PARTIAL",
            "COMPROMISED",
        }:

            verdict = (
                "PARTIAL"
            )


        attack_success = bool(
            execution.get(
                "attack_success",
                False,
            )
        )


        raw_attack_success = bool(
            execution.get(
                "raw_attack_success",
                False,
            )
        )


        # ----------------------------------------------------
        # Normalize Judge semantics.
        #
        # policy_violation means:
        # "the TARGET violated the tested security policy".
        # ----------------------------------------------------

        judge_verdict = str(
            judge.get(
                "verdict",
                verdict,
            )
        ).upper()


        if (
            judge_verdict
            ==
            "BLOCKED"
        ):

            judge[
                "policy_violation"
            ] = False


        elif (
            judge_verdict
            ==
            "COMPROMISED"
        ):

            judge[
                "policy_violation"
            ] = True


        explanation = (
            judge.get(
                "reason"
            )
            or
            deterministic.get(
                "explanation"
            )
            or
            (
                "Multi-LLM security evaluation completed."
            )
        )


        judge_confidence = (
            judge.get(
                "confidence"
            )
        )


        try:

            judge_confidence = float(
                judge_confidence
            )

        except (
            TypeError,
            ValueError,
        ):

            judge_confidence = (
                None
            )


        evaluation = {
            **deterministic,

            "judge_verdict":
                judge_verdict,

            "judge_confidence":
                judge_confidence,

            "policy_violation":
                judge.get(
                    "policy_violation"
                ),
        }


        # ====================================================
        # TIMINGS
        # ====================================================

        attacker_ms = float(
            generated.get(
                "duration_ms"
            )
            or
            0
        )


        input_guard_ms = float(
            input_guard.get(
                "duration_ms"
            )
            or
            0
        )


        target_ms = float(
            execution.get(
                "target_duration_ms"
            )
            or
            0
        )


        output_guard_ms = float(
            output_guard.get(
                "duration_ms"
            )
            or
            0
        )


        judge_ms = float(
            judge.get(
                "duration_ms"
            )
            or
            0
        )


        evaluation_ms = (
            input_guard_ms
            +
            output_guard_ms
            +
            judge_ms
        )


        # ====================================================
        # TIMELINE
        # ====================================================

        target_called = bool(
            execution.get(
                "target_called"
            )
        )


        steps = [
            {
                "order":
                    1,

                "name":
                    "attack_generation",

                "label":
                    "Generate dynamic attack",

                "status":
                    "COMPLETED",

                "duration_ms":
                    attacker_ms,

                "description":
                    (
                        "Attacker LLM generated "
                        "a new attack variation."
                    ),
            },

            {
                "order":
                    2,

                "name":
                    "input_guard",

                "label":
                    "Input Guard",

                "status":
                    (
                        "BLOCKED"
                        if input_guard.get(
                            "decision"
                        )
                        ==
                        "BLOCK"
                        else
                        (
                            "SKIPPED"
                            if input_guard.get(
                                "decision"
                            )
                            ==
                            "SKIPPED"
                            else
                            "COMPLETED"
                        )
                    ),

                "duration_ms":
                    input_guard_ms,

                "description":
                    input_guard.get(
                        "reason",
                        "",
                    ),
            },

            {
                "order":
                    3,

                "name":
                    "target_llm",

                "label":
                    "Target LLM",

                "status":
                    (
                        "COMPLETED"
                        if target_called
                        else
                        "SKIPPED"
                    ),

                "duration_ms":
                    target_ms,

                "description":
                    (
                        "Generated attack sent "
                        "to the target model."
                        if target_called
                        else
                        "Target invocation prevented by guardrail."
                    ),
            },

            {
                "order":
                    4,

                "name":
                    "deterministic_evaluator",

                "label":
                    "Deterministic Evaluator",

                "status":
                    (
                        "COMPLETED"
                        if target_called
                        else
                        "SKIPPED"
                    ),

                "duration_ms":
                    0,

                "description":
                    (
                        "Rule-based security evidence evaluated."
                    ),
            },

            {
                "order":
                    5,

                "name":
                    "output_guard",

                "label":
                    "Output Guard",

                "status":
                    (
                        "BLOCKED"
                        if output_guard.get(
                            "decision"
                        )
                        ==
                        "BLOCK"
                        else
                        (
                            "SKIPPED"
                            if output_guard.get(
                                "decision"
                            )
                            in {
                                None,
                                "SKIPPED",
                            }
                            else
                            "COMPLETED"
                        )
                    ),

                "duration_ms":
                    output_guard_ms,

                "description":
                    output_guard.get(
                        "reason",
                        "",
                    ),
            },

            {
                "order":
                    6,

                "name":
                    "independent_judge",

                "label":
                    "Independent Judge",

                "status":
                    (
                        "COMPLETED"
                        if target_called
                        else
                        "SKIPPED"
                    ),

                "duration_ms":
                    judge_ms,

                "description":
                    explanation,
            },
        ]


        # ====================================================
        # TRACE
        # ====================================================

        trace_id = str(
            uuid4()
        )


        legacy_signal = bool(
            deterministic.get(
                "leak_detected",
                False,
            )
            or
            deterministic.get(
                "unsafe_output_detected",
                False,
            )
            or
            raw_attack_success
        )


        trace = AttackTrace(
            id=
                trace_id,

            campaign_id=
                campaign.id,

            scenario_index=
                request.scenario_index,

            category=
                attack.category,

            attack_name=
                scenario.get(
                    "name",
                    "",
                ),

            technique=
                scenario.get(
                    "technique",
                    "",
                ),

            description=
                scenario.get(
                    "description",
                    "",
                ),

            objective=
                scenario.get(
                    "objective",
                    "",
                ),

            severity=
                attack.severity,

            system_prompt=
                attack.system_prompt,

            payload=
                generated_payload,

            response=
                target_response,

            verdict=
                verdict,

            explanation=
                explanation,

            evaluator=
                (
                    "multi_llm_judge_v1"
                ),

            secret_detected=
                legacy_signal,

            execution_mode=
                execution_mode,

            attacker_model=
                models[
                    "attacker"
                ][
                    "model"
                ],

            target_model=
                models[
                    "target"
                ][
                    "model"
                ],

            judge_model=
                models[
                    "judge"
                ][
                    "model"
                ],

            generated_payload=
                generated_payload,

            attacker_metadata=
                generated,

            deterministic_evaluation=
                deterministic,

            input_guard=
                input_guard,

            output_guard=
                output_guard,

            judge_result=
                judge,

            judge_confidence=
                judge_confidence,

            raw_attack_success=
                raw_attack_success,

            started_at=
                trace_started_at,

            finished_at=
                utc_now(),

            prepare_duration_ms=
                attacker_ms,

            llm_duration_ms=
                target_ms,

            evaluation_duration_ms=
                evaluation_ms,

            database_duration_ms=
                0,

            total_duration_ms=
                float(
                    execution.get(
                        "total_duration_ms"
                    )
                    or
                    elapsed_ms(
                        total_started
                    )
                ),

            steps=
                steps,
        )


        # ====================================================
        # HISTORY
        # ====================================================

        history = SecurityTestRun(
            trace_id=
                trace_id,

            campaign_id=
                campaign.id,

            scenario_index=
                request.scenario_index,

            owasp_category=
                attack.category,

            attack_name=
                scenario.get(
                    "name",
                    "",
                ),

            provider=
                models[
                    "target"
                ][
                    "provider"
                ],

            model=
                models[
                    "target"
                ][
                    "model"
                ],

            payload=
                generated_payload,

            response=
                target_response,

            attack_success=
                attack_success,

            severity=
                attack.severity,

            verdict=
                verdict,

            execution_mode=
                execution_mode,

            attacker_model=
                models[
                    "attacker"
                ][
                    "model"
                ],

            target_model=
                models[
                    "target"
                ][
                    "model"
                ],

            judge_model=
                models[
                    "judge"
                ][
                    "model"
                ],

            judge_confidence=
                judge_confidence,

            raw_attack_success=
                raw_attack_success,
        )


        # ====================================================
        # CAMPAIGN COUNTERS
        # ====================================================

        campaign.completed_scenarios += (
            1
        )


        if verdict == "BLOCKED":

            campaign.blocked += (
                1
            )


        elif verdict == "PARTIAL":

            campaign.partial += (
                1
            )


        elif verdict == "COMPROMISED":

            campaign.compromised += (
                1
            )


        if (
            campaign.completed_scenarios
            >=
            campaign.total_scenarios
        ):

            campaign.status = (
                "COMPLETED"
            )


            campaign.finished_at = (
                utc_now()
            )


            if campaign.started_at:

                campaign.total_duration_ms = (
                    round(
                        (
                            campaign.finished_at
                            -
                            campaign.started_at
                        )
                        .total_seconds()
                        *
                        1000,
                        2,
                    )
                )


        # ====================================================
        # DATABASE
        # ====================================================

        database_started = (
            perf_counter()
        )


        db.add(
            trace
        )


        db.add(
            history
        )


        try:

            await db.flush()


            database_ms = (
                elapsed_ms(
                    database_started
                )
            )


            steps.append(
                {
                    "order":
                        7,

                    "name":
                        "database",

                    "label":
                        "PostgreSQL",

                    "status":
                        "COMPLETED",

                    "duration_ms":
                        database_ms,

                    "description":
                        (
                            "Multi-LLM evaluation "
                            "stored in PostgreSQL."
                        ),
                }
            )


            trace.steps = (
                steps
            )


            trace.database_duration_ms = (
                database_ms
            )


            trace.total_duration_ms = (
                elapsed_ms(
                    total_started
                )
            )


            trace.finished_at = (
                utc_now()
            )


            await db.commit()


            await db.refresh(
                trace
            )


            await db.refresh(
                campaign
            )


        except Exception as exc:

            await db.rollback()


            raise HTTPException(
                status_code=500,
                detail=(
                    "Database persistence failed: "
                    f"{exc}"
                ),
            )


        # ====================================================
        # RESPONSE
        # ====================================================

        return {
            "trace_id":
                trace.id,

            "campaign_id":
                campaign.id,

            "scenario_index":
                request.scenario_index,

            "category":
                attack.category,

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

            "mode":
                execution_mode,

            "models":
                models,

            "seed_payload":
                scenario.get(
                    "payload",
                    "",
                ),

            "generated_attack":
                generated,

            "payload":
                generated_payload,

            "target_called":
                target_called,

            "response":
                target_response,

            "input_guard":
                input_guard,

            "output_guard":
                output_guard,

            "deterministic":
                deterministic,

            "judge":
                judge,

            "verdict":
                verdict,

            "attack_success":
                attack_success,

            "raw_attack_success":
                raw_attack_success,

            "explanation":
                explanation,

            "evaluation":
                evaluation,

            "timing": {
                "attacker_ms":
                    attacker_ms,

                "input_guard_ms":
                    input_guard_ms,

                "target_ms":
                    target_ms,

                "output_guard_ms":
                    output_guard_ms,

                "judge_ms":
                    judge_ms,

                "database_ms":
                    database_ms,

                "total_ms":
                    trace.total_duration_ms,
            },

            "steps":
                steps,

            "started_at":
                trace.started_at,

            "finished_at":
                trace.finished_at,

            "database": {
                "saved":
                    True,
            },
        }


    # ========================================================
    # GET CAMPAIGN
    # ========================================================

    @router.get(
        "/campaigns/{campaign_id}",
        name=f"{tag} get campaign",
    )
    async def get_campaign(
        campaign_id: str,

        db: AsyncSession = Depends(
            get_db
        ),
    ):

        result = (
            await db.execute(
                select(
                    SecurityCampaign
                ).where(
                    SecurityCampaign.id
                    ==
                    campaign_id
                )
            )
        )


        campaign = (
            result
            .scalar_one_or_none()
        )


        if campaign is None:

            raise HTTPException(
                status_code=404,
                detail=
                    "Campaign not found",
            )


        trace_result = (
            await db.execute(
                select(
                    AttackTrace
                )
                .where(
                    AttackTrace.campaign_id
                    ==
                    campaign_id
                )
                .order_by(
                    AttackTrace.scenario_index
                )
            )
        )


        traces = (
            trace_result
            .scalars()
            .all()
        )


        return {
            "campaign": {
                "id":
                    campaign.id,

                "category":
                    campaign.category,

                "provider":
                    campaign.provider,

                "model":
                    campaign.model,

                "status":
                    campaign.status,

                "mode":
                    campaign.execution_mode,

                "attacker_model":
                    campaign.attacker_model,

                "target_model":
                    campaign.target_model,

                "judge_model":
                    campaign.judge_model,

                "total_scenarios":
                    campaign.total_scenarios,

                "completed_scenarios":
                    campaign.completed_scenarios,

                "blocked":
                    campaign.blocked,

                "partial":
                    campaign.partial,

                "compromised":
                    campaign.compromised,

                "started_at":
                    campaign.started_at,

                "finished_at":
                    campaign.finished_at,

                "total_duration_ms":
                    campaign.total_duration_ms,
            },

            "traces": [
                {
                    "trace_id":
                        trace.id,

                    "scenario_index":
                        trace.scenario_index,

                    "attack_name":
                        trace.attack_name,

                    "verdict":
                        trace.verdict,

                    "mode":
                        trace.execution_mode,

                    "attacker_model":
                        trace.attacker_model,

                    "target_model":
                        trace.target_model,

                    "judge_model":
                        trace.judge_model,

                    "judge_confidence":
                        trace.judge_confidence,

                    "raw_attack_success":
                        trace.raw_attack_success,

                    "llm_duration_ms":
                        trace.llm_duration_ms,

                    "total_duration_ms":
                        trace.total_duration_ms,
                }

                for trace
                in traces
            ],
        }


    return router
