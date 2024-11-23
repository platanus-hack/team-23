import os
from anthropic import Anthropic

client = Anthropic(
    api_key=os.environ["ANTHROPIC_API_KEY"],
)


def create_message_for_claude(content: str) -> str:
    return client.messages.create(
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": content,
            }
        ],
        model="claude-3-opus-20240229",
    )
