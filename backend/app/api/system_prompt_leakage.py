from backend.app.api.campaign_attack_factory import (
    build_campaign_router,
)

from backend.app.attacks.system_prompt_leakage import (
    SystemPromptLeakageAttack,
)


router = build_campaign_router(
    prefix="/api/attacks/system-prompt-leakage",
    tag="LLM07 System Prompt Leakage",
    attack_class=SystemPromptLeakageAttack,
)
