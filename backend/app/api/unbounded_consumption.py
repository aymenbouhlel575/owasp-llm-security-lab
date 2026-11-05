from backend.app.api.campaign_attack_factory import (
    build_campaign_router,
)

from backend.app.attacks.unbounded_consumption import (
    UnboundedConsumptionAttack,
)


router = build_campaign_router(
    prefix="/api/attacks/unbounded-consumption",
    tag="LLM10 Unbounded Consumption",
    attack_class=UnboundedConsumptionAttack,
)
