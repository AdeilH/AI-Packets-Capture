#!/bin/bash

# Define variables
OLLAMA_HOST=${OLLAMA_HOST:-"http://ollama:11434"}
MODEL=${MODEL:-"mistral"}
MAX_RETRIES=10
RETRY_DELAY=5

echo "Waiting for Ollama service at $OLLAMA_HOST..."
# Wait for Ollama to be available
for i in $(seq 1 $MAX_RETRIES); do
    if curl -s -f "$OLLAMA_HOST/api/tags" > /dev/null; then
        echo "Ollama service is available!"
        break
    fi
    
    if [ $i -eq $MAX_RETRIES ]; then
        echo "Failed to connect to Ollama after $MAX_RETRIES attempts."
        exit 1
    fi
    
    echo "Attempt $i/$MAX_RETRIES: Ollama not yet available. Retrying in ${RETRY_DELAY}s..."
    sleep $RETRY_DELAY
done

# Check if model is already pulled
echo "Checking if model $MODEL is available..."
MODELS=$(curl -s "$OLLAMA_HOST/api/tags")
if echo "$MODELS" | grep -q "$MODEL"; then
    echo "Model $MODEL is already available."
else
    echo "Model $MODEL not found. Pulling..."
    curl -X POST "$OLLAMA_HOST/api/pull" -d "{\"name\":\"$MODEL\"}"
    echo "Model $MODEL has been pulled."
fi

echo "Ollama setup completed successfully." 