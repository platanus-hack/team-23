import json
import requests
from flask import Flask, request, jsonify
from constants import TAG_NAME, PER_PAGE_LIMIT
from flask_cors import CORS
from dotenv import load_dotenv
from utils import extract_tag_content, get_first_n_words, inverted_index_to_text
from clients.adapter import send_prompt_to_clients
from open_alex_client import get_works_by_keywords


load_dotenv()


app = Flask(__name__)
cors = CORS(app)


@app.route("/")
def hello_world():
    return "hello platanus first commit!"


@app.route('/query', methods=['GET'])
def query():
    works_partial = []
    question = request.args.get("question")
    per_page = int(request.args.get("per_page", PER_PAGE_LIMIT))
    if per_page > PER_PAGE_LIMIT:
        per_page = PER_PAGE_LIMIT

    if not question:
        return jsonify({"error": "question parameter is required"}), 400

    # PROMPT TO GET TERMS FROM A QUESTION
    terms_prompt = requests.get("https://raw.githubusercontent.com/antidiestro/etai-prompts/refs/heads/main/generate_keywords.md").text
    terms = terms_prompt.replace("{{QUERY}}", question)
    terms_ans = send_prompt_to_clients(prompt=terms)
    ans = extract_tag_content(text=terms_ans, tag_name=TAG_NAME)
    terms = json.loads(ans)
    if not terms:
        return jsonify({"error": "failed to get terms"}), 500

    works = get_works_by_keywords(
        keywords=terms["keywords"], per_page=per_page,
    )
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


@app.route('/works', methods=['GET'])
def works():
    question = request.args.get("question")
    per_page = int(request.args.get("per_page", 100))
    if per_page > PER_PAGE_LIMIT:
        per_page = PER_PAGE_LIMIT

    if not question:
        return jsonify({"error": "question parameter is required"}), 400

    terms_prompt = requests.get("https://raw.githubusercontent.com/antidiestro/etai-prompts/refs/heads/main/generate_keywords.md").text
    terms = terms_prompt.replace("{{QUERY}}", question)
    terms_ans = send_prompt_to_clients(prompt=terms)
    ans = extract_tag_content(text=terms_ans, tag_name=TAG_NAME)
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
    
    return jsonify(works_partial), 200


@app.route('/facts', methods=['GET'])
def facts():
    question = request.args.get("question")
    if not question:
        return jsonify({"error": "question parameter is required"}), 400

    facts_prompt = requests.get("https://raw.githubusercontent.com/antidiestro/etai-prompts/refs/heads/main/generate_introductory_facts.md").text
    facts_prompt = facts_prompt.replace("{{QUERY}}", question)
    facts_response = send_prompt_to_clients(prompt=facts_prompt, use_light_model=True)
    try:
        facts_ = json.loads(extract_tag_content(text=facts_response, tag_name=TAG_NAME))
    except json.decoder.JSONDecodeError:
        facts_ = "Failed to get facts"
        print(facts_, facts_response)

    return jsonify(facts_), 200


if __name__ == '__main__':
    app.run(debug=True)
