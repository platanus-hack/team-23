class BaseClient:
    CLIENT = None
    MODELS = []
    POWERFUL_MODELS = []
    LIGHT_MODELS = []

    def get_models(self, use_powerful_model=False, use_light_model=False):
        raise NotImplementedError

    def send_prompt(self, prompt, use_powerful_model=False, use_light_model=False):
        raise NotImplementedError
