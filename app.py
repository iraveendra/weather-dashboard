from transformers import pipeline
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load the model with specific parameters for creativity
model = pipeline('text-generation', model='gpt2', truncation=True)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    text = data['text']
    print(f"Received text: {text}")  # Print the received text

    # Add a creative prompt to influence the model output
    creative_prompt = f"In one catchy sentence, describe this weather: {text}"
    print(f"Creative prompt: {creative_prompt}")  # Print the creative prompt

    # Generate text with stricter length constraints and more creative sampling
    result = model(creative_prompt, max_length=30, num_return_sequences=1, 
                   do_sample=True, top_p=0.95, temperature=0.85)
    print(f"Model result: {result}")  # Print the raw model output

    # Ensure the result is a single line and remove the prompt part
    generated_text = result[0]['generated_text'].replace(creative_prompt, '').strip()
    print(f"Generated text after cleaning: {generated_text}")  # Print the cleaned text

    # Further ensure the result is concise and remove extra punctuation
    one_liner = generated_text.replace('\n', ' ').replace('\r', '').strip()
    print(f"One-liner: {one_liner}")  # Print the final one-liner

    # Limit the response to a concise one-liner
    if len(one_liner.split('.')) > 1:
        one_liner = one_liner.split('.')[0] + '.'

    return jsonify([{'generated_text': one_liner}])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
