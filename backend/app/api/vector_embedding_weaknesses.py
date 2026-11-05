from backend.app.api.campaign_attack_factory import (
    build_campaign_router,
)

from backend.app.attacks.vector_embedding_weaknesses import (
    VectorEmbeddingWeaknessesAttack,
)


router = build_campaign_router(
    prefix="/api/attacks/vector-embedding-weaknesses",
    tag="LLM08 Vector and Embedding Weaknesses",
    attack_class=VectorEmbeddingWeaknessesAttack,
)
