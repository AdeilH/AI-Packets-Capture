#!/bin/bash
# This script runs inside the Ollama container

# Start Ollama server
ollama serve &

# Wait for server to become available
sleep 10

# Pull the model
ollama pull phi3:mini

# Keep container running
tail -f /dev/null 