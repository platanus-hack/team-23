from flask import Flask, request, jsonify
from constants import OPEN_ALEX_API_URL
from flask_cors import CORS
import requests
from dotenv import load_dotenv


load_dotenv()


app = Flask(__name__)
cors = CORS(app)


@app.route("/")
def hello_world():
    return "hello platanus first commit!"


def get_works(query: str):
    response = requests.get(
        f"{OPEN_ALEX_API_URL}/works?search={query}"
    )
    if response.status_code != 200:
        return None

    return response.json()


def get_works_with_abstract(query: str):
    response = requests.get(
        f"{OPEN_ALEX_API_URL}/works?search={query}&filter=has_abstract:true"
    )
    if response.status_code != 200:
        return None

    return response.json()


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


@app.route('/query', methods=['GET'])
def query():
    query = request.args.get("query")
    if not query:
        return jsonify({"error": "query parameter is required"}), 400

    works_with_abstract = get_works_with_abstract(
        query=query
    )
    if not works_with_abstract or len(works_with_abstract["results"]) == 0:
        return jsonify({"error": "failed to get works"}), 500

    results = [
        {
            "doi": work["doi"],
            "title": work["title"],
            "abstract": inverted_index_to_text(
                inverted_idx=work["abstract_inverted_index"]
            )
        }
        for work in works_with_abstract["results"][0:15]
    ]

    return jsonify(results)


if __name__ == '__main__':
    app.run(debug=True)
