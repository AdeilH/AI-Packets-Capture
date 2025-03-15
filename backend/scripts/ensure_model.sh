#!/bin/bash

# Define variables
OLLAMA_HOST=${OLLAMA_HOST:-"http://ollama:11434"}
PRIMARY_MODEL=${LLM_MODEL:-"phi3:mini"}
FALLBACK_MODELS=("tinyllama" "mistral" "llama3:8b-q4")
MAX_RETRIES=3

echo "Ensuring LLM model availability..."

# Try to pull the primary model
echo "Attempting to pull primary model: $PRIMARY_MODEL"
for i in $(seq 1 $MAX_RETRIES); do
    if curl -s -X POST "$OLLAMA_HOST/api/pull" -d "{\"name\":\"$PRIMARY_MODEL\"}" | grep -q "success"; then
        echo "Primary model $PRIMARY_MODEL successfully pulled!"
        exit 0
    fi
    
    echo "Attempt $i/$MAX_RETRIES failed. Waiting before retry..."
    sleep 5
done

# If primary model fails, try fallbacks
echo "Failed to pull primary model. Trying fallbacks..."
for model in "${FALLBACK_MODELS[@]}"; do
    echo "Attempting to pull fallback model: $model"
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -s -X POST "$OLLAMA_HOST/api/pull" -d "{\"name\":\"$model\"}" | grep -q "success"; then
            echo "Fallback model $model successfully pulled! Updating configuration..."
            # You might want to update an environment file or config here
            echo "export LLM_MODEL=$model" > /app/models/active_model.env
            exit 0
        fi
        
        echo "Attempt $i/$MAX_RETRIES failed. Waiting before retry..."
        sleep 5
    done
done

echo "All model pull attempts failed. System will operate with limited functionality."
exit 1 