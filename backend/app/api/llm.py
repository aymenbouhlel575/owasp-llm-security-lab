from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.llm.mock import MockLLMProvider
from backend.app.llm.groq_provider import GroqProvider


router = APIRouter(
    prefix="/api/llm",
    tags=["LLM"],
)


class PromptRequest(BaseModel):
    prompt: str


@router.post("/test")
async def test_mock_llm(request: PromptRequest):

    provider = MockLLMProvider()

    response = await provider.generate(request.prompt)

    return {
        "provider": provider.provider_name(),
        "model": provider.model_name(),
        "prompt": request.prompt,
        "response": response,
    }


@router.post("/groq")
async def test_groq_llm(request: PromptRequest):

    provider = GroqProvider()

    response = await provider.generate(request.prompt)

    return {
        "provider": provider.provider_name(),
        "model": provider.model_name(),
        "prompt": request.prompt,
        "response": response,
    }
