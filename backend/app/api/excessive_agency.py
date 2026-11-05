from backend.app.api.campaign_attack_factory import (
    build_campaign_router,
)

from backend.app.attacks.excessive_agency import (
    ExcessiveAgencyAttack,
)


router = build_campaign_router(
    prefix="/api/attacks/excessive-agency",
    tag="LLM06 Excessive Agency",
    attack_class=ExcessiveAgencyAttack,
)
