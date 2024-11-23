import json
from flask import Flask, request, jsonify
from constants import OPEN_ALEX_API_URL, TAG_NAME, PER_PAGE_LIMIT
from flask_cors import CORS
from urllib.parse import urlencode
import requests
from dotenv import load_dotenv
import re
from clients.adapter import send_prompt_to_clients


load_dotenv()


app = Flask(__name__)
cors = CORS(app)


def get_works_by_keywords(keywords, per_page = 100):
    query = ' OR '.join(keywords)
    params = {
        'search': query,
        'per_page': per_page,
        'filter': 'has_abstract:true',
        'select': 'id,doi,title,authorships,abstract_inverted_index,publication_year',
    }
    encoded_query = urlencode(params)
    url = f"{OPEN_ALEX_API_URL}/works?{encoded_query}"
    response = requests.get(url)
    if response.status_code != 200:
        return None

    return response.json()


def extract_tag_content(text, tag_name):
    pattern = rf"<{tag_name}>(.*?)</{tag_name}>"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None


@app.route("/")
def hello_world():
    return "hello platanus first commit!"


def inverted_index_to_text(inverted_idx: dict):
    position_term_pairs = []
    for term, positions in inverted_idx.items():
        for position in positions:
            position_term_pairs.append((position, term))

    position_term_pairs.sort()
    reconstructed_string = []

    for _, term in position_term_pairs:
        reconstructed_string.append(term)

    return ' '.join(reconstructed_string)


def get_first_n_words(text: str, n: int = 300) -> str:
    words = text.split()
    first_200_words = words[:n]
    return ' '.join(first_200_words)


@app.route('/query', methods=['GET'])
def query():
    works_partial = []
    question = request.args.get("question")
    per_page = int(request.args.get("per_page", 100))
    if per_page > PER_PAGE_LIMIT:
        per_page = PER_PAGE_LIMIT

    if not question:
        return jsonify({"error": "question parameter is required"}), 400

    # PROMPT TO GET TERMS FROM A QUESTION
    terms_prompt = requests.get("https://raw.githubusercontent.com/antidiestro/etai-prompts/refs/heads/main/generate_keywords.md").text
    terms = terms_prompt.replace("{{QUERY}}", question)
    terms_ans = send_prompt_to_clients(prompt=terms)
    ans = extract_tag_content(text=terms_ans.content[0].text, tag_name=TAG_NAME)
    terms = json.loads(ans)
    if not terms:
        return jsonify({"error": "failed to get terms"}), 500

    works = get_works_by_keywords(keywords=terms["keywords"], per_page=per_page)

    works_partial = [
        {
            "doi": work["doi"],
            "title": work["title"],
            "abstract": (
                get_first_n_words(
                    inverted_index_to_text(inverted_idx=work["abstract_inverted_index"])
                )
            ),
            "pub_year": work["publication_year"],
        }
        for work in works["results"]
    ]

    if not works_partial:
        return jsonify({"error": "failed to get works"}), 500

    # PROMPT TO GENERATE SUMMARY

    summary_prompt = requests.get("https://raw.githubusercontent.com/antidiestro/etai-prompts/refs/heads/main/summarize.md").text
    summary_prompt = summary_prompt.replace("{{QUERY}}", json.dumps(works_partial))
    summary_prompt = summary_prompt.replace("{{INPUT}}", question)
    summary_response = send_prompt_to_clients(prompt=summary_prompt)
    try:
        summary = extract_tag_content(text=summary_response.content[0].text, tag_name=TAG_NAME)
        summary = json.loads(summary)
    except json.decoder.JSONDecodeError:
        summary = "Failed to get summary"

    return jsonify(
        {
            "summary": summary,
            "keywords": terms["keywords"],
            "works_partial": [
                {
                    "doi": work["doi"],
                    "title": work["title"],
                    "pub_year": work["pub_year"],
                }
                for work in works_partial
            ],
        }
    ), 200


if __name__ == '__main__':
    app.run(debug=True)
