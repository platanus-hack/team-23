# Flask App with Anthropic API and OpenAlex API

This repository contains a Flask application that connects with the Anthropic API and retrieves data from the OpenAlex API. The goal is to receive queries on an endpoint, search for data on the OpenAlex API, and return the retrieved works.

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

4. Set up the Anthropic API key:
    - Anthropic: Sign up on [Anthropic](https://www.anthropic.com/) and get your API key.

5. Create a `.env` file in the root directory and add your API key:
    ```env
    ANTHROPIC_API_KEY=your_anthropic_api_key
    ```

6. Run the Flask application:
    ```bash
    flask run
    ```

## Using the Flask Application

1. Send a GET request to the `/query` endpoint with the query as a parameter:
    ```bash
    curl -X GET "http://127.0.0.1:5000/query?question=your_query_here"
    ```

2. The Flask application will call the OpenAlex API to retrieve data based on the query.

3. The retrieved data will be returned as a JSON response:
    ```json
    {
        "works": [
            {
                "doi": "10.1234/example",
                "title": "Example Title",
                "abstract": "This is an example abstract.",
                "pub_year": 2021
            },
            ...
        ]
    }
    ```

## Example

Here is an example of how to use the Flask application:

1. Start the Flask application:
    ```bash
    flask run
    ```

2. Send a GET request to the `/query` endpoint:
    ```bash
    curl -X GET "http://127.0.0.1:5000/query?question=What+is+the+impact+of+climate+change+on+marine+life?"
    ```

3. You will receive a JSON response with the retrieved works:
    ```json
    {
        "works": [
            {
                "doi": "10.1234/example",
                "title": "Impact of Climate Change on Marine Life",
                "abstract": "This study explores the effects of climate change on marine ecosystems.",
                "pub_year": 2021
            },
            ...
        ]
    }
    ```

## Notes

- Make sure to replace `your_anthropic_api_key` with your actual API key in the `.env` file.
- You can customize the OpenAlex API calls and the Anthropic prompts as needed.
