from backend.app.api.campaign_attack_factory import (
    build_campaign_router,
)

from backend.app.attacks.data_model_poisoning import (
    DataModelPoisoningAttack,
)


router = build_campaign_router(
    prefix="/api/attacks/data-model-poisoning",
    tag="LLM04 Data and Model Poisoning",
    attack_class=DataModelPoisoningAttack,
)
