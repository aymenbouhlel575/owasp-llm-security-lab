import json
import os
import re

from dotenv import load_dotenv
from groq import AsyncGroq

from backend.app.llm.base import (
    LLMProvider,
)


load_dotenv()


class GroqProvider(
    LLMProvider
):

    ROLE_ENV = {
        "target":
            "TARGET_MODEL",

        "attacker":
            "ATTACKER_MODEL",

        "judge":
            "JUDGE_MODEL",
    }


    def __init__(
        self,
        model: str | None = None,
        role: str = "target",
    ):
        api_key = os.getenv(
            "GROQ_API_KEY"
        )

        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is missing"
            )


        self.role = (
            role
            .strip()
            .lower()
        )


        role_env = (
            self.ROLE_ENV.get(
                self.role
            )
        )


        configured_model = (
            os.getenv(
                role_env
            )
            if role_env
            else None
        )


        self.model = (
            model
            or configured_model
            or os.getenv(
                "GROQ_MODEL"
            )
            or "openai/gpt-oss-20b"
        )


        self.client = AsyncGroq(
            api_key=api_key
        )


    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_completion_tokens: int | None = None,
    ) -> str:

        messages = []


        if system_prompt:

            messages.append(
                {
                    "role":
                        "system",

                    "content":
                        system_prompt,
                }
            )


        messages.append(
            {
                "role":
                    "user",

                "content":
                    prompt,
            }
        )


        kwargs = {
            "model":
                self.model,

            "messages":
                messages,
        }


        if temperature is not None:

            kwargs[
                "temperature"
            ] = temperature


        if max_completion_tokens is not None:

            kwargs[
                "max_completion_tokens"
            ] = max_completion_tokens


        completion = (
            await self.client
            .chat
            .completions
            .create(
                **kwargs
            )
        )


        return (
            completion
            .choices[
                0
            ]
            .message
            .content
            or ""
        )


    async def generate_json(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_completion_tokens: int | None = 2048,
    ) -> dict:

        messages = []


        if system_prompt:

            messages.append(
                {
                    "role":
                        "system",

                    "content":
                        system_prompt,
                }
            )


        messages.append(
            {
                "role":
                    "user",

                "content":
                    prompt,
            }
        )


        kwargs = {
            "model":
                self.model,

            "messages":
                messages,

            "response_format": {
                "type":
                    "json_object",
            },
        }


        if temperature is not None:

            kwargs[
                "temperature"
            ] = temperature


        if max_completion_tokens is not None:

            kwargs[
                "max_completion_tokens"
            ] = max_completion_tokens


        completion = (
            await self.client
            .chat
            .completions
            .create(
                **kwargs
            )
        )


        content = (
            completion
            .choices[
                0
            ]
            .message
            .content
            or ""
        ).strip()


        try:

            return json.loads(
                content
            )

        except json.JSONDecodeError:

            match = re.search(
                r"\{.*\}",
                content,
                flags=re.DOTALL,
            )

            if not match:

                raise RuntimeError(
                    "The LLM did not return valid JSON."
                )


            return json.loads(
                match.group(
                    0
                )
            )


    def provider_name(
        self,
    ) -> str:

        return "groq"


    def model_name(
        self,
    ) -> str:

        return self.model


    def role_name(
        self,
    ) -> str:

        return self.role
