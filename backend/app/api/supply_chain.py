import inspect

from backend.app.api.campaign_attack_factory import (
    build_campaign_router,
)

from backend.app.attacks import (
    supply_chain as supply_chain_module,
)


def resolve_supply_chain_attack_class():

    candidates = []


    for (
        _name,
        obj
    ) in inspect.getmembers(
        supply_chain_module,
        inspect.isclass,
    ):

        if (
            obj.__module__
            !=
            supply_chain_module.__name__
        ):
            continue


        category = str(
            getattr(
                obj,
                "category",
                "",
            )
        )


        if category.startswith(
            "LLM03"
        ):

            candidates.append(
                obj
            )


    if not candidates:

        raise RuntimeError(
            "Aucune classe d'attaque LLM03 trouvée "
            "dans backend.app.attacks.supply_chain"
        )


    if len(
        candidates
    ) > 1:

        names = [
            cls.__name__
            for cls
            in candidates
        ]

        raise RuntimeError(
            "Plusieurs classes LLM03 trouvées: "
            +
            ", ".join(
                names
            )
        )


    return candidates[
        0
    ]


SupplyChainAttackClass = (
    resolve_supply_chain_attack_class()
)


router = build_campaign_router(
    prefix=
        "/api/attacks/supply-chain",

    tag=
        "LLM03 Supply Chain",

    attack_class=
        SupplyChainAttackClass,
)
