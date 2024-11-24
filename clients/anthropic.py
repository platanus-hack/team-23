import os
from anthropic import Anthropic
from anthropic import Anthropic, APIError, APITimeoutError, RateLimitError


class AnthropicClient:
    MODELS = ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"]
    POWERFUL_MODELS = ["claude-3-5-sonnet-20241022"]
    LIGHT_MODELS = ["claude-3-5-haiku-20241022"]

    client = Anthropic(
        api_key=os.environ["ANTHROPIC_API_KEY"],
    )

    def _create_message_for_claude(self, content: str, model: str) -> str:
        try:
            return self.client.messages.create(
                max_tokens=3000,
                temperature=0.5,
                messages=[
                    {
                        "role": "user",
                        "content": content,
                    }
                ],
                model=model,
            )
        except (RateLimitError, APITimeoutError, APIError):
            return None

    def get_models(self, use_powerful_model=False, use_light_model=False):
        if use_powerful_model:
            return self.POWERFUL_MODELS
        elif use_light_model:
            return self.LIGHT_MODELS
        return self.MODELS

    def send_prompt(self, prompt, use_powerful_model=False, use_light_model=False):
        models = self.get_models(
            use_powerful_model=use_powerful_model, use_light_model=use_light_model
        )
        for model in models:
            response = self._create_message_for_claude(content=prompt, model=model)
            if response:
                return response.content[0].text
            continue
        return
