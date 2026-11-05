from backend.app.llm.groq_provider import (
    GroqProvider,
)


def build_target_provider():
    return GroqProvider(
        role="target"
    )


def build_attacker_provider():
    return GroqProvider(
        role="attacker"
    )


def build_judge_provider():
    return GroqProvider(
        role="judge"
    )


def get_model_roles():

    target = (
        build_target_provider()
    )

    attacker = (
        build_attacker_provider()
    )

    judge = (
        build_judge_provider()
    )


    return {
        "attacker": {
            "provider":
                attacker.provider_name(),

            "model":
                attacker.model_name(),
        },

        "target": {
            "provider":
                target.provider_name(),

            "model":
                target.model_name(),
        },

        "judge": {
            "provider":
                judge.provider_name(),

            "model":
                judge.model_name(),
        },
    }
