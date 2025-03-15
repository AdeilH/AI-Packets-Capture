# Network Traffic Analysis System

A comprehensive system for analyzing network packet captures (PCAPs) with AI-powered anomaly detection and LLM-based insights.

## Overview

This project consists of three main components:

1. **Ollama LLM Service**: Provides AI-powered analysis of network traffic
2. **Python Backend**: Processes PCAP files and communicates with the LLM
3. **Next.js Frontend**: User interface for uploading files and viewing analysis

## System Requirements

- Docker and Docker Compose
- Python 3.10+ with pip
- Node.js 16+ (or Bun as an alternative)
- Wireshark/tshark (for PCAP processing)

## Quick Start

### 1. Start the Ollama LLM Service
bash
Start only the Ollama service
docker compose up ollama
In a new terminal, pull the required model
docker exec -it <ollama_container_name> ollama pull qwen2:0.5b

Alternatively, if you have Ollama installed locally:
bash
ollama pull qwen2:0.5b
ollama serve

### 2. Set Up the Backend

bash
Navigate to the backend directory
cd backend
Create a virtual environment
python3 -m venv venv
Activate the virtual environment (Linux/macOS)
source venv/bin/activate
Activate the virtual environment (Windows)
venv\Scripts\activate
Install dependencies
pip install -r requirements.txt
Run the backend server
python app.py

The backend will be available at http://localhost:5000.

### 3. Set Up the Frontend

bash
Navigate to the frontend directory
cd frontend
If using Bun (recommended)
Install Bun if you don't have it: https://bun.sh/
curl -fsSL https://bun.sh/install | bash
Install dependencies
bun install
Run the development server with environment variables
NEXT_PUBLIC_API_URL=http://localhost:5000 bun run dev

If using npm instead:

bash
npm install
NEXT_PUBLIC_API_URL=http://localhost:5000 npm run dev


The frontend will be available at http://localhost:3000.

## Using Docker Compose (Recommended)

For the simplest setup, run the entire stack with Docker Compose:

bash
Start all services
docker compose up -d
View logs
docker compose logs -f

## Running the Application

1. Open your browser and navigate to http://localhost:3000
2. Upload a PCAP file or use the Demo Analysis feature
3. View the comprehensive analysis with AI-powered insights

## Troubleshooting

### LLM Service Issues

- Ensure the Ollama service is running: `docker ps | grep ollama`
- Check if the model is correctly pulled: `docker exec -it <ollama_container_name> ollama list`
- Verify the API is accessible: `curl http://localhost:11434/api/tags`

### Backend Issues

- Check if tshark is installed: `tshark --version`
- Verify the Flask server is running: `curl http://localhost:5000/api/status`
- Check logs for Python errors: `docker logs backend`
- If you see JSON serialization errors, they may be related to None values in the data

### Frontend Issues

- Clear Next.js cache: `rm -rf .next`
- Verify environment variables: `echo $NEXT_PUBLIC_API_URL`
- Check browser console for network errors

## Project Structure

├── backend/ # Flask backend
│ ├── app.py # Main application entry point
│ ├── llm_engine.py # LLM integration
│ ├── models/ # ML models for analysis
│ ├── packet_processing/ # PCAP handling
│ └── requirements.txt # Python dependencies
├── frontend/ # Next.js frontend
│ ├── app/ # Next.js App Router
│ ├── components/ # React components
│ ├── contexts/ # State management
│ ├── services/ # API services
│ └── visualizations/ # Data visualization components
├── docker-compose.yml # Docker Compose configuration
└── README.md # This file


## License

[MIT](LICENSE)