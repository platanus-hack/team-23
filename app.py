from flask import Flask, request, jsonify
import openai
import anthropic
import requests

app = Flask(__name__)

# Set up OpenAI and Anthropic API keys
openai.api_key = 'your_openai_api_key'
anthropic.api_key = 'your_anthropic_api_key'

@app.route('/query', methods=['POST'])
def query():
    data = request.json
    user_query = data.get('query')

    # Call external APIs to retrieve data
    external_data = call_external_apis(user_query)

    # Use LLMs to process and summarize the data
    openai_summary = summarize_with_openai(external_data)
    anthropic_summary = summarize_with_anthropic(external_data)

    # Return the summarized data as a response
    response = {
        'openai_summary': openai_summary,
        'anthropic_summary': anthropic_summary
    }
    return jsonify(response)

def call_external_apis(query):
    # Example function to call external APIs and retrieve data
    response = requests.get(f'https://api.example.com/search?q={query}')
    return response.json()

def summarize_with_openai(data):
    # Example function to summarize data using OpenAI
    response = openai.Completion.create(
        engine="davinci",
        prompt=f"Summarize the following data: {data}",
        max_tokens=100
    )
    return response.choices[0].text.strip()

def summarize_with_anthropic(data):
    # Example function to summarize data using Anthropic
    response = anthropic.Completion.create(
        model="claude-v1",
        prompt=f"Summarize the following data: {data}",
        max_tokens=100
    )
    return response.choices[0].text.strip()

if __name__ == '__main__':
    app.run(debug=True)
