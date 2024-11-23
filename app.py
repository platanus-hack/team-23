import json
from flask import Flask, request, jsonify
from constants import OPEN_ALEX_API_URL, TAG_NAME, PER_PAGE_LIMIT
from flask_cors import CORS
from anthropic_client import create_message_for_claude
from urllib.parse import urlencode
import requests
from dotenv import load_dotenv
import re

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
    terms = """
        You are an AI assistant tasked with extracting key scientific information from user-submitted queries in an educational scientific research tool. Your goal is to identify the main object(s) of study and generate strings that could be used to filter scientific articles by title in a large database of millions of publications.

        Here is the user query you need to analyze:

        <query>
        {{QUERY}}
        </query>

        Follow these steps to complete the task:

        1. Carefully analyze the query to identify the main object(s) of study. These are the primary scientific concepts, phenomena, or entities that the query is focused on.

        2. Based on the identified object(s) of study, generate four keywords that meet the following criteria:
        - Consist of the object(s) of study and/or their synonyms
        - Are concise and specific
        - Could plausibly be found within the title of a scientific article on the topic

        3. Ensure that the keywords are distinct from each other and capture different aspects of the topic if possible.

        4. If the query is too vague or broad, focus on the most specific scientific concepts mentioned or implied.

        5. If the query contains non-scientific terms, translate them into their closest scientific equivalents when generating keywords.

        Present your results in a JSON object in the following format:

        <output_format>
        {
        "keywords": [
        "first keyword",
        "second keyword",
        "third keyword",
        "fourth keyword"
        ]
        }
        </output_format>

        Examples:

        Query: 'How do black holes affect the space-time continuum?'
        Output:
        {
        "keywords": [
        "black holes",
        "space-time continuum",
        "gravitational effects",
        "singularities"
        ]
        }

        Query: 'What are the latest advancements in renewable energy storage?'
        Output:
        {
        "keywords": [
        "renewable energy storage",
        "battery technology",
        "grid-scale storage",
        "energy efficiency"
        ]
        }

        Important considerations:
        - Ensure that each keyword is unique and not a repetition of another.
        - Avoid overly broad terms that wouldn't effectively filter scientific articles.
        - If the query mentions a specific application or context, include at least one keyword related to that context.
        - If possible, include both general and specific terms related to the topic to capture a range of relevant articles.

        Provide your answer in the specified JSON format, enclosed in <answer> tags.
    """

    terms = terms.replace("{{QUERY}}", question)
    terms_ans = create_message_for_claude(content=terms)
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
                get_first_n_words(inverted_index_to_text(inverted_idx=work["abstract_inverted_index"]))
            ),
            "pub_year": work["publication_year"],
        }
        for work in works["results"]
    ]

    if not works_partial:
        return jsonify({"error": "failed to get works"}), 500

    # SUMMARIZE PROMPT

    return jsonify(
        {
            "works": works_partial,
        }
    ), 200


if __name__ == '__main__':
    app.run(debug=True)
