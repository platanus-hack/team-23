import requests
from urllib.parse import urlencode
from constants import OPEN_ALEX_API_URL, PER_PAGE_LIMIT, OPEN_ALEX_DEFAULT_SELECT, OPEN_ALEX_DEFAULT_FILTER


class OpenAlexClient:
    API_URL = OPEN_ALEX_API_URL
    
    def __init__(self, per_page):
        self.per_page = per_page

    def search(self, params, endpoint):
        encoded_query = urlencode(params)
        url = f"{self.API_URL}/{endpoint}?{encoded_query}"
        response = requests.get(url)
        if response.status_code != 200:
            return None
        return response.json()


def get_works_by_keywords(keywords: list[str], select: str | None = None, per_page = PER_PAGE_LIMIT):
    select = select or OPEN_ALEX_DEFAULT_SELECT
    query = ' OR '.join(keywords)
    params = {
        'search': query,
        'per_page': per_page,
        'filter': OPEN_ALEX_DEFAULT_FILTER,
        'select': select,
    }
    client = OpenAlexClient(per_page=per_page)
    return client.search(params=params, endpoint='works')
