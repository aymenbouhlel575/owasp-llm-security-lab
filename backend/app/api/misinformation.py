from backend.app.api.campaign_attack_factory import (
    build_campaign_router,
)

from backend.app.attacks.misinformation import (
    MisinformationAttack,
)


router = build_campaign_router(
    prefix="/api/attacks/misinformation",
    tag="LLM09 Misinformation",
    attack_class=MisinformationAttack,
)
