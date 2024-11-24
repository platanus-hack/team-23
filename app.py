import os
import json
import requests
from flask import Flask, request, jsonify
import constants
from flask_cors import CORS
from dotenv import load_dotenv
from utils import extract_tag_content, inverted_index_to_text_v2
from clients.adapter import send_prompt_to_clients
from open_alex_client import get_works_by_keywords
from flask import Flask
from flask_caching import Cache


load_dotenv()


config = {
    "DEBUG": True,
    "CACHE_TYPE": "redis",
    "CACHE_REDIS_URL": os.getenv('REDIS_TEMPORARY_URL'),
    "CACHE_DEFAULT_TIMEOUT": 300,
    "CACHE_OPTIONS": {
        "ssl_cert_reqs": None
    }
}

app = Flask(__name__)
app.config.from_mapping(config)
cache = Cache(app)
cors = CORS(app)


@app.route("/")
def hello_world():
    return "hello platanus first commit!"


@app.route('/query', methods=['GET'])
@cache.cached(query_string=True)
def query():
    question = request.args.get("question")
    per_page = int(request.args.get("per_page", constants.PER_PAGE_LIMIT))
    if per_page > constants.PER_PAGE_LIMIT:
        per_page = constants.PER_PAGE_LIMIT

    if not question:
        return jsonify({"error": "question parameter is required"}), 400

    # PROMPT TO GET TERMS FROM A QUESTION
    with open(constants.KEYWORDS_PROMPT_PATH, 'r', encoding='utf-8') as file:
        prompt = file.read().strip()
        prompt = prompt.replace("{{QUERY}}", question)

    terms_ans = send_prompt_to_clients(prompt=prompt, use_light_model=True)
    ans = extract_tag_content(text=terms_ans, tag_name=constants.TAG_NAME)
    terms = json.loads(ans)
    if not terms:
        return jsonify({"error": "failed to get terms"}), 500

    works = get_works_by_keywords(
        keywords=terms["keywords"], per_page=per_page,
    )

    prompt_works = [
        {
            "doi": works["doi"],
            "title": works["title"],
            "abstract": (
                inverted_index_to_text_v2(inverted_idx=works["abstract_inverted_index"])
            ),
            "pub_date": works["publication_date"],
            "cited_by_count": works["cited_by_count"],
        }
        for works in works["results"]
        if works.get("doi") is not None
    ]
    query_works = [
        {
            "doi": works["doi"],
            "title": works["title"],
            "pub_date": works["publication_date"],
            "pub_year": works["publication_year"],
            "authorships": works["authorships"],
            "cited_by_count": works["cited_by_count"],
        }
        for works in works["results"]
    ]

    if not prompt_works:
        return jsonify({"error": "failed to get works"}), 500

    total_count = works.get("meta", {}).get("count", 0)

    # PROMPT TO GENERATE SUMMARY
    with open(constants.SUMMARY_PROMPT_PATH, 'r', encoding='utf-8') as file:
        summary_prompt = file.read().strip()
        summary_prompt = summary_prompt.replace("{{QUERY}}", json.dumps(prompt_works))
        summary_prompt = summary_prompt.replace("{{INPUT}}", question)

    summary_response = send_prompt_to_clients(prompt=summary_prompt, use_powerful_model=True)

    try:
        summary = json.loads(summary_response)
    except (json.decoder.JSONDecodeError, TypeError):
        summary = "Failed to get summary"
        print(summary, summary_response)

    return jsonify(
        {
            "summary": summary,
            "keywords": terms["keywords"],
            "total_count": total_count,
            "works_partial": query_works
        }
    ), 200


@app.route('/works', methods=['GET'])
def works():
    question = request.args.get("question")
    per_page = int(request.args.get("per_page", 100))
    if per_page > constants.PER_PAGE_LIMIT:
        per_page = constants.PER_PAGE_LIMIT

    if not question:
        return jsonify({"error": "question parameter is required"}), 400

    with open(constants.KEYWORDS_PROMPT_PATH, 'r', encoding='utf-8') as file:
        terms_prompt = file.read().strip()
        terms = terms_prompt.replace("{{QUERY}}", question)

    terms_ans = send_prompt_to_clients(prompt=terms, use_light_model=True)
    ans = extract_tag_content(text=terms_ans, tag_name=constants.TAG_NAME)
    terms = json.loads(ans)
    if not terms:
        return jsonify({"error": "failed to get terms"}), 500
    
    works = get_works_by_keywords(keywords=terms["keywords"], per_page=per_page)

    works_partial = [
        {
            "doi": work["doi"],
            "title": work["title"],
            "abstract": (
                inverted_index_to_text_v2(inverted_idx=work["abstract_inverted_index"])
            ),
            "pub_date": work["publication_date"],
            "cited_by_count": work["cited_by_count"],
        }
        for work in works["results"]
    ]

    if not works_partial:
        return jsonify({"error": "failed to get works"}), 500
    
    return jsonify(works_partial), 200


@app.route('/facts', methods=['GET'])
@cache.cached(query_string=True)
def facts():
    """
    factos
    """
    question = request.args.get("question")
    if not question:
        return jsonify({"error": "question parameter is required"}), 400

    with open(constants.FACTS_PROMPT_PATH, 'r', encoding='utf-8') as file:
        facts_prompt = file.read().strip()
        facts_prompt = facts_prompt.replace("{{QUERY}}", question)

    facts_response = send_prompt_to_clients(prompt=facts_prompt, use_light_model=True)
    try:
        facts_ = json.loads(
            extract_tag_content(text=facts_response, tag_name=constants.TAG_NAME)
        )
    except json.decoder.JSONDecodeError:
        facts_ = "Failed to get facts"
        print(facts_, facts_response)

    return jsonify(facts_), 200


if __name__ == '__main__':
    app.run(debug=True)
