from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime
from models.anomaly_detector import AnomalyDetector
from packet_processing.packet_parser import PacketParser
from llm_engine import LLMEngine
import threading
import time
from utils import sanitize_for_json

app = Flask(__name__)
# Configure CORS to accept requests from frontend
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

# Initialize models
anomaly_detector = AnomalyDetector()
packet_parser = PacketParser()
llm_engine = LLMEngine(model_name=os.environ.get("LLM_MODEL", "mistral"))

# Start a background thread to check LLM availability
def check_llm_availability():
    # Wait a bit to allow the container to fully start
    time.sleep(5)
    print(f"Checking LLM availability at {llm_engine.api_base}...")
    print(f"Environment variables: LLM_API_BASE={os.environ.get('LLM_API_BASE')}")
    
    # Try to ping the Ollama service directly
    try:
        import subprocess
        result = subprocess.run(['curl', '-s', f"{llm_engine.api_base}/api/tags"], 
                               capture_output=True, text=True)
        print(f"Direct curl test: {result.stdout[:100]}...")
    except Exception as e:
        print(f"Curl test failed: {e}")
    
    available = llm_engine.wait_for_service()
    if available:
        print("LLM service is available")
    else:
        print("WARNING: LLM service is not available. Network analysis will be limited.")

# Start the background thread for non-blocking LLM check
llm_thread = threading.Thread(target=check_llm_availability)
llm_thread.daemon = True
llm_thread.start()

def format_llm_input(packet_summary, anomalies):
    """Format data for LLM input"""
    # Get packet stats
    stats = packet_parser.get_stats()
    
    # Format the input
    return {
        "packet_summary": {
            "total_packets": stats['total_packets'],
            "protocols": stats['protocols'],
            "top_sources": packet_summary.get("top_sources", [])
        },
        "anomalies": anomalies
    }

@app.route('/api/upload', methods=['POST'])
def upload_pcap():
    """Endpoint to upload and analyze PCAP files"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Save uploaded file
    upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, f"upload_{datetime.now().strftime('%Y%m%d%H%M%S')}.pcap")
    file.save(file_path)
    
    # Process PCAP file
    packet_data = packet_parser.parse_pcap(file_path)
    
    # Get packet statistics and flow data
    packet_stats = packet_parser.get_stats()
    
    # Analyze flows
    flow_features = packet_parser.extract_features(packet_data)
    
    # Detect anomalies
    anomaly_results = anomaly_detector.analyze(packet_data)
    
    # Create analysis summary
    packet_summary = {
        'total_packets': len(packet_data),
        'duration': packet_stats.get('duration', 0),
        'protocols': packet_stats.get('protocols', {}),
        'services': packet_stats.get('services', {}),
        'top_sources': anomaly_results['summary'].get('top_sources', []),
        'top_destinations': anomaly_results['summary'].get('top_destinations', [])
    }
    
    # Perform LLM analysis if requested
    run_llm_analysis = request.form.get('run_llm_analysis', 'false').lower() == 'true'
    llm_results = None
    
    if run_llm_analysis:
        # Format data for LLM analysis
        llm_input = {
            'packet_summary': packet_summary,
            'anomalies': anomaly_results['anomalies'],
            'flow_data': packet_stats.get('flows', {})
        }
        
        # Run comprehensive LLM analysis
        llm_results = llm_engine.analyze(llm_input)
    
    response_data = {
        'status': 'success',
        'file_name': file.filename,
        'packet_count': len(packet_data),
        'capture_duration': packet_stats.get('duration', 0),
        'anomalies': anomaly_results['anomalies'],
        'summary': packet_summary,
        'flow_analysis': packet_stats.get('flows', {}).get('top_flows', [])[:10],
        'llm_analysis': llm_results
    }
    
    # Sanitize data for JSON serialization
    sanitized_data = sanitize_for_json(response_data)
    return jsonify(sanitized_data)

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get system status and statistics"""
    return jsonify({
        'status': 'running',
        'analyzed_packets': packet_parser.get_stats()['total_packets'],
        'detected_anomalies': anomaly_detector.get_stats()['total_anomalies'],
        'model_status': anomaly_detector.get_model_info()
    })

@app.route('/api/analyze-llm', methods=['POST'])
def analyze_with_llm():
    """Deep analysis of network traffic using LLM"""
    data = request.json
    packet_summary = data.get('packet_summary', [])
    anomalies = data.get('anomalies', [])
    
    # Format input for LLM
    llm_input = format_llm_input(packet_summary, anomalies)
    
    # Get LLM analysis
    llm_analysis = llm_engine.analyze(llm_input)
    
    return jsonify({
        'analysis': llm_analysis,
        'summary': llm_engine.generate_summary(),
        'recommendations': llm_engine.generate_recommendations()
    })

@app.route('/api/analyze-pcap', methods=['POST'])
def analyze_pcap_comprehensive():
    """Perform comprehensive PCAP analysis using the LLM"""
    data = request.json
    packet_summary = data.get('packet_summary', {})
    anomalies = data.get('anomalies', [])
    flow_data = data.get('flow_data', {})
    
    # Format input for comprehensive LLM analysis
    llm_input = {
        'packet_summary': packet_summary,
        'anomalies': anomalies,
        'flow_data': flow_data
    }
    
    # Get LLM analysis
    llm_analysis = llm_engine.analyze(llm_input)
    
    # Structure the response
    response = {
        'analysis': {
            'traffic_overview': llm_engine.extract_section(llm_analysis['analysis'], "TRAFFIC OVERVIEW"),
            'protocol_analysis': llm_engine.extract_section(llm_analysis['analysis'], "PROTOCOL ANALYSIS"),
            'connection_patterns': llm_engine.extract_section(llm_analysis['analysis'], "CONNECTION PATTERNS"),
            'security_assessment': llm_engine.extract_section(llm_analysis['analysis'], "SECURITY ASSESSMENT"),
            'contextual_interpretation': llm_engine.extract_section(llm_analysis['analysis'], "CONTEXTUAL INTERPRETATION"),
        },
        'full_analysis': llm_analysis['analysis'],
        'alert_level': llm_analysis['alert_level'],
        'identified_threats': llm_analysis['identified_threats'],
        'recommendations': llm_analysis['recommendations']
    }
    
    return jsonify(response)

@app.route('/api/sample-analysis', methods=['GET'])
def get_sample_analysis():
    """Return sample packet analysis for demo/testing"""
    # Create sample packet summary
    packet_summary = {
        'total_packets': 5234,
        'duration': 600.5,  # 10 minutes
        'protocols': {
            'TCP': 4083,
            'UDP': 628,
            'ICMP': 105,
            'Other': 418
        },
        'services': {
            'HTTP/HTTPS': 445,
            'DNS': 628,
            'SSH': 287,
            'Others': 3874
        },
        'top_sources': [
            {'ip': '192.168.1.105', 'count': 1542},
            {'ip': '192.168.1.110', 'count': 982},
            {'ip': '192.168.1.112', 'count': 875},
            {'ip': '10.0.0.1', 'count': 453},
            {'ip': '172.16.0.5', 'count': 214}
        ],
        'top_destinations': [
            {'ip': '8.8.8.8', 'count': 382},
            {'ip': '203.0.113.25', 'count': 345},
            {'ip': '192.168.1.1', 'count': 312},
            {'ip': '172.217.21.3', 'count': 276},
            {'ip': '13.32.108.104', 'count': 198}
        ]
    }
    
    # Create sample anomalies
    anomalies = [
        {
            'id': 'anom-001',
            'type': 'Suspicious Port',
            'severity': 'medium',
            'description': 'Multiple connections to non-standard port 8080 on external host',
            'source_ip': '192.168.1.105',
            'destination_ip': '203.0.113.25',
            'timestamp': '2023-05-15T10:23:45Z'
        },
        {
            'id': 'anom-002',
            'type': 'DNS Volume',
            'severity': 'medium',
            'description': 'Unusually high volume of DNS queries from single host',
            'source_ip': '192.168.1.110',
            'destination_ip': '8.8.8.8',
            'timestamp': '2023-05-15T10:24:12Z'
        },
        {
            'id': 'anom-003',
            'type': 'Weak Encryption',
            'severity': 'low',
            'description': 'Use of deprecated TLSv1.0 protocol detected',
            'source_ip': '192.168.1.112',
            'destination_ip': '172.217.21.3',
            'timestamp': '2023-05-15T10:26:58Z'
        }
    ]
    
    # Get sample LLM analysis
    llm_analysis = llm_engine.get_sample_analysis()
    
    return jsonify({
        'status': 'success',
        'file_name': 'sample_capture.pcap',
        'packet_count': packet_summary['total_packets'],
        'capture_duration': packet_summary['duration'],
        'anomalies': anomalies,
        'summary': packet_summary,
        'flow_analysis': [],
        'llm_analysis': llm_analysis
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 