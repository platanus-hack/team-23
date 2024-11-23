# Flask App with Multiple LLMs and External APIs

This repository contains a Flask application that connects with multiple LLMs (e.g., OpenAI, Anthropic models) and external APIs. The goal is to receive queries on an endpoint, search for data on external APIs, and then use AI model SDKs to return summaries from external data.

## Setup and Run the Flask Application

1. Clone the repository:
    ```bash
    git clone https://github.com/githubnext/workspace-blank.git
    cd workspace-blank
    ```

2. Create and activate a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3. Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4. Set up the OpenAI and Anthropic API keys:
    - OpenAI: Sign up on [OpenAI](https://www.openai.com/) and get your API key.
    - Anthropic: Sign up on [Anthropic](https://www.anthropic.com/) and get your API key.

5. Create a `.env` file in the root directory and add your API keys:
    ```env
    OPENAI_API_KEY=your_openai_api_key
    ANTHROPIC_API_KEY=your_anthropic_api_key
    ```

6. Run the Flask application:
    ```bash
    flask run
    ```

## Using the Integrated LLMs and External APIs

1. Send a POST request to the `/query` endpoint with a JSON payload containing the query:
    ```json
    {
        "query": "your_query_here"
    }
    ```

2. The Flask application will call external APIs to retrieve data based on the query.

3. The retrieved data will be processed and summarized using the integrated LLMs (OpenAI and Anthropic).

4. The summarized data will be returned as a JSON response:
    ```json
    {
        "openai_summary": "summary_from_openai",
        "anthropic_summary": "summary_from_anthropic"
    }
    ```

## Example

Here is an example of how to use the Flask application:

1. Start the Flask application:
    ```bash
    flask run
    ```

2. Send a POST request to the `/query` endpoint:
    ```bash
    curl -X POST http://127.0.0.1:5000/query -H "Content-Type: application/json" -d '{"query": "What is the weather like today?"}'
    ```

3. You will receive a JSON response with summaries from OpenAI and Anthropic:
    ```json
    {
        "openai_summary": "The weather today is sunny with a high of 75°F.",
        "anthropic_summary": "Today's weather is clear and warm with temperatures reaching 75°F."
    }
    ```

## Notes

- Make sure to replace `your_openai_api_key` and `your_anthropic_api_key` with your actual API keys in the `.env` file.
- You can customize the external API calls and the LLM prompts as needed.

        "bedrock_summary": "The forecast for today is sunny with a high of 75°F."
    }
    ```

## Notes

- Make sure to replace `your_openai_api_key`, `your_anthropic_api_key`, `your_aws_access_key_id`, `your_aws_secret_access_key`, and `your_aws_region` with your actual API keys in the `.env` file.
- You can customize the external API calls and the LLM prompts as needed.
