#!/bin/bash

# Check network connectivity to Ollama service
echo "Checking network connectivity to Ollama..."
echo "Current hostname: $(hostname)"
echo "Environment variables:"
env | grep LLM

echo "Testing DNS resolution for 'ollama'..."
getent hosts ollama || echo "DNS resolution failed"

echo "Testing TCP connection to ollama:11434..."
nc -zv ollama 11434 || echo "TCP connection failed"

echo "Attempting HTTP connection to Ollama API..."
curl -v http://ollama:11434/api/tags || echo "HTTP connection failed"

echo "Network diagnostics complete." 