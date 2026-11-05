from backend.app.api.campaign_attack_factory import (
    build_campaign_router,
)

from backend.app.attacks.improper_output_handling import (
    ImproperOutputHandlingAttack,
)


router = build_campaign_router(
    prefix="/api/attacks/improper-output-handling",
    tag="LLM05 Improper Output Handling",
    attack_class=ImproperOutputHandlingAttack,
)
