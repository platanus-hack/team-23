
from clients.anthropic import AnthropicClient
import time


class SendPromptToClientAdapter:
    def __init__(self, clients):
        self.clients = clients

    def send_prompt(self, prompt, use_powerful_model):
        for client in self.clients:
            response = client.send_prompt(prompt, use_powerful_model)
            if not response:
                continue
            return response


def send_prompt_to_clients(prompt: str, use_powerful_model = False):
    for attempt in range(3):
        clients = [
            AnthropicClient(),
        ]
        adapter = SendPromptToClientAdapter(
            clients=clients
        )
        response = adapter.send_prompt(prompt=prompt, use_powerful_model=use_powerful_model)
        if not response:
            print(f"Attempt {attempt + 1} failed, retrying...")
            time.sleep((2 ** attempt))
        return response
