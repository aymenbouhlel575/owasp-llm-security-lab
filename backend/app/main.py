from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.attacks import (
    router as attacks_router,
)

from backend.app.api.llm import (
    router as llm_router,
)

from backend.app.api.results import (
    router as results_router,
)

from backend.app.api.sensitive_information import (
    router as sensitive_information_router,
)

from backend.app.database.connection import (
    init_db,
)


from backend.app.api.supply_chain import router as supply_chain_router


from backend.app.api.data_model_poisoning import router as data_model_poisoning_router

from backend.app.api.improper_output_handling import router as improper_output_handling_router



from backend.app.api.excessive_agency import (
    router as excessive_agency_router,
)

from backend.app.api.system_prompt_leakage import (
    router as system_prompt_leakage_router,
)

from backend.app.api.vector_embedding_weaknesses import (
    router as vector_embedding_weaknesses_router,
)

from backend.app.api.misinformation import (
    router as misinformation_router,
)

from backend.app.api.unbounded_consumption import (
    router as unbounded_consumption_router,
)


@asynccontextmanager
async def lifespan(
    app: FastAPI,
):
    await init_db()
    yield


app = FastAPI(
    title="AI Security Testing Platform",

    description=(
        "Security evaluation platform for LLM "
        "and multi-agent systems aligned with "
        "OWASP Top 10 for LLM Applications"
    ),

    version="0.2.0",

    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
)


# ============================================================
# API ROUTERS
# ============================================================

app.include_router(
    llm_router
)

# LLM01 - Prompt Injection
app.include_router(
    attacks_router
)

# LLM02 - Sensitive Information Disclosure
app.include_router(
    sensitive_information_router
)

# Test history
app.include_router(
    results_router
)


# ============================================================
# ROOT
# ============================================================

# LLM03 - Supply Chain



# LLM03 - Supply Chain



# LLM03 - Supply Chain



# LLM03 - Supply Chain



# LLM03 - Supply Chain


# LLM03 - Supply Chain
app.include_router(
    supply_chain_router
)

# LLM04 - Data and Model Poisoning
app.include_router(
    data_model_poisoning_router
)

# LLM05 - Improper Output Handling
app.include_router(
    improper_output_handling_router
)



# LLM06 - Excessive Agency
app.include_router(
    excessive_agency_router
)

# LLM07 - System Prompt Leakage
app.include_router(
    system_prompt_leakage_router
)

# LLM08 - Vector and Embedding Weaknesses
app.include_router(
    vector_embedding_weaknesses_router
)

# LLM09 - Misinformation
app.include_router(
    misinformation_router
)

# LLM10 - Unbounded Consumption
app.include_router(
    unbounded_consumption_router
)


@app.get("/")
async def root():

    return {
        "name":
            "AI Security Testing Platform",

        "version":
            "0.2.0",

        "status":
            "running",

        "implemented_owasp_risks": [
            "LLM01:2025 Prompt Injection",
            (
                "LLM02:2025 "
                "Sensitive Information Disclosure"
            ),
        ],
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
async def health():

    return {
        "status":
            "healthy",

        "version":
            "0.2.0",

        "llm01":
            "available",

        "llm02":
            "available",
    }
