import os
from anthropic import Anthropic
from anthropic import Anthropic, APIError, APITimeoutError, RateLimitError



class AnthropicClient:
    MODELS = [
        # "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022"
    ]

    client = Anthropic(
        api_key=os.environ["ANTHROPIC_API_KEY"],
    )

    def _create_message_for_claude(self, content: str, model: str) -> str:
        try:
            return self.client.messages.create(
                max_tokens=1024,
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

    def send_prompt(self, prompt):
        for model in self.MODELS:
            response = self._create_message_for_claude(content=prompt, model=model)
            if response:
                return response
        return response
