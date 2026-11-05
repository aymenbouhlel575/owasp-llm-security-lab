from backend.app.llm.base import LLMProvider


class MockLLMProvider(LLMProvider):

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None
    ) -> str:

        return f"Mock LLM received: {prompt}"

    def provider_name(self) -> str:
        return "mock"

    def model_name(self) -> str:
        return "mock-security-model"

