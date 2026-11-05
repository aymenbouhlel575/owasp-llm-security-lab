from abc import ABC, abstractmethod


class LLMProvider(ABC):

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None
    ) -> str:
        pass

    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    def model_name(self) -> str:
        pass
