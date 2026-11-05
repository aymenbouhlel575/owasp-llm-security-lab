from backend.app.api.campaign_attack_factory import (
    build_campaign_router,
)

from backend.app.attacks.sensitive_information_disclosure import (
    SensitiveInformationDisclosureAttack,
)


router = build_campaign_router(
    prefix=
        "/api/attacks/sensitive-information",

    tag=
        "LLM02 Sensitive Information Disclosure",

    attack_class=
        SensitiveInformationDisclosureAttack,
)
