import os
import uuid
from flask import Flask, render_template, request, jsonify
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configuration
LANGFLOW_API_URL = os.getenv('LANGFLOW_API_URL', 'https://langflow.mlocal.eu')
FLOW_ID = os.getenv('FLOW_ID', 'b873c03b-f400-45da-9a1b-a87d1d4eb34d')
LANGFLOW_API_KEY = os.getenv('LANGFLOW_API_KEY')  # Optional API key

# TWEAKS configuration for components
TWEAKS = {
    "ChatInput-pAvwn": {},
    "ParseData-yvTEQ": {},
    "Prompt-hWODU": {},
    "SplitText-FwMKx": {},
    "ChatOutput-Pwlra": {},
    "OpenAIEmbeddings-xEd2Y": {},
    "OpenAIEmbeddings-Cbc6i": {},
    "File-8cwWP": {},
    "OpenAIModel-EVEO2": {},
    "Chroma-enKEk": {},
    "Chroma-vI4wu": {},
    "Memory-im0o0": {},
    "OllamaModel-LssJw": {}
}


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"response": "No message provided."}), 400

    # Generate a unique session ID for each request
    session_id = str(uuid.uuid4())
    
    payload = {
        "input_value": user_message,
        "output_type": "chat",
        "input_type": "chat",
        "tweaks": TWEAKS,
        "session_id": session_id,
        "clear_context": True  # Clear previous context for each new request
    }

    headers = {}
    if LANGFLOW_API_KEY:
        headers["x-api-key"] = LANGFLOW_API_KEY

    try:
        response = requests.post(
            f"{LANGFLOW_API_URL}/api/v1/run/{FLOW_ID}",
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        data = response.json()
        print("Langflow API Response:", data)  # Debug print
        
        # Extract message from the nested response structure
        try:
            message = data['outputs'][0]['outputs'][0]['results']['message']['data']['text']
            return jsonify({"response": message})
        except (KeyError, IndexError) as e:
            print("Error extracting message:", str(e))
            # Fallback to original message if structure is different
            if isinstance(data, dict):
                if "output" in data:
                    return jsonify({"response": data["output"]})
                elif "response" in data:
                    return jsonify({"response": data["response"]})
            return jsonify({"response": "Could not extract response from Langflow."})
    except requests.exceptions.RequestException as e:
        print("API Error:", str(e))  # Debug print
        return jsonify({"response": f"Error communicating with Langflow API: {str(e)}"}), 500
    except Exception as e:
        print("Unexpected Error:", str(e))  # Debug print
        return jsonify({"response": f"Unexpected error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
