from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
    func,
)

from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
)


class Base(DeclarativeBase):
    pass


# ============================================================
# 1. SECURITY TEST HISTORY
#
# One row = one result visible in Test History.
#
# New fields:
# - trace_id
# - campaign_id
# - scenario_index
#
# They allow the History page to retrieve the complete trace.
# ============================================================

class SecurityTestRun(Base):

    __tablename__ = "security_test_runs"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # --------------------------------------------------------
    # TRACE / CAMPAIGN LINKS
    # --------------------------------------------------------

    trace_id: Mapped[str | None] = mapped_column(
        String(36),
        nullable=True,
        index=True,
    )

    campaign_id: Mapped[str | None] = mapped_column(
        String(36),
        nullable=True,
        index=True,
    )

    scenario_index: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    # --------------------------------------------------------
    # SECURITY RESULT
    # --------------------------------------------------------

    owasp_category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    attack_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    provider: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    model: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    payload: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    response: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    attack_success: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    severity: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )


    # --------------------------------------------------------
    # MULTI-LLM EVALUATION
    # --------------------------------------------------------

    verdict: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    execution_mode: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    attacker_model: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    target_model: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    judge_model: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    judge_confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    raw_attack_success: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )



# ============================================================
# 2. SECURITY CAMPAIGN
#
# One campaign = one complete execution of an attack family.
#
# Example:
#
# Prompt Injection Campaign
#
#     Campaign ID
#         |
#         +-- Scenario 01 -> Trace 01
#         +-- Scenario 02 -> Trace 02
#         +-- Scenario 03 -> Trace 03
#         +-- Scenario 04 -> Trace 04
#         +-- Scenario 05 -> Trace 05
# ============================================================

class SecurityCampaign(Base):

    __tablename__ = "security_campaigns"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    provider: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    model: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="RUNNING",
        nullable=False,
    )

    total_scenarios: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    completed_scenarios: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    blocked: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    partial: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    compromised: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    total_duration_ms: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )


    # --------------------------------------------------------
    # MULTI-LLM CONFIGURATION
    # --------------------------------------------------------

    execution_mode: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    attacker_model: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    target_model: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    judge_model: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )



# ============================================================
# 3. ATTACK TRACE
#
# One trace = one executed attack scenario.
#
# This table stores all details required for auditability.
# ============================================================

class AttackTrace(Base):

    __tablename__ = "attack_traces"

    __table_args__ = (
        UniqueConstraint(
            "campaign_id",
            "scenario_index",
            name="uq_attack_trace_campaign_scenario",
        ),
    )

    # --------------------------------------------------------
    # IDENTIFIERS
    # --------------------------------------------------------

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    campaign_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(
            "security_campaigns.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    scenario_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # --------------------------------------------------------
    # ATTACK INFORMATION
    # --------------------------------------------------------

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    attack_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    technique: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    objective: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    severity: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    # --------------------------------------------------------
    # LLM INPUT
    # --------------------------------------------------------

    system_prompt: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    payload: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # --------------------------------------------------------
    # LLM OUTPUT
    # --------------------------------------------------------

    response: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # --------------------------------------------------------
    # SECURITY EVALUATION
    # --------------------------------------------------------

    verdict: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    explanation: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    evaluator: Mapped[str] = mapped_column(
        String(100),
        default="exact_secret_detection_v1",
        nullable=False,
    )

    secret_detected: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    # --------------------------------------------------------
    # MULTI-LLM PIPELINE
    # --------------------------------------------------------

    execution_mode: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    attacker_model: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    target_model: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    judge_model: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    generated_payload: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    attacker_metadata: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    deterministic_evaluation: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    input_guard: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    output_guard: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    judge_result: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    judge_confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    raw_attack_success: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )



    # --------------------------------------------------------
    # TIMESTAMPS
    # --------------------------------------------------------

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    finished_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    # --------------------------------------------------------
    # PERFORMANCE / TIMING
    # --------------------------------------------------------

    prepare_duration_ms: Mapped[float] = mapped_column(
        Float,
        default=0,
        nullable=False,
    )

    llm_duration_ms: Mapped[float] = mapped_column(
        Float,
        default=0,
        nullable=False,
    )

    evaluation_duration_ms: Mapped[float] = mapped_column(
        Float,
        default=0,
        nullable=False,
    )

    database_duration_ms: Mapped[float] = mapped_column(
        Float,
        default=0,
        nullable=False,
    )

    total_duration_ms: Mapped[float] = mapped_column(
        Float,
        default=0,
        nullable=False,
    )

    # --------------------------------------------------------
    # EXECUTION TIMELINE
    #
    # Example:
    #
    # [
    #     {
    #         "order": 1,
    #         "name": "prepare_attack",
    #         "status": "COMPLETED",
    #         "duration_ms": 0.2
    #     },
    #     {
    #         "order": 2,
    #         "name": "llm_call",
    #         "status": "COMPLETED",
    #         "duration_ms": 650.3
    #     }
    # ]
    # --------------------------------------------------------

    steps: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
