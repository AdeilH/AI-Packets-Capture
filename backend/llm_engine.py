import requests
import json
import os
import time
from typing import List, Dict, Any, Optional

class LLMEngine:
    def __init__(self, model_name="mistral", max_retries=5, retry_delay=2):
        self.model_name = model_name
        # Set default to ollama (service name) when running in Docker
        self.api_base = os.environ.get("LLM_API_BASE", "http://ollama:11434")
        self.last_analysis = None
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        print(f"Initializing LLMEngine with API base: {self.api_base}")  # Debug info
        
    def is_available(self) -> bool:
        """Check if Ollama is available and model is loaded"""
        try:
            # First check if Ollama service is up
            response = requests.get(f"{self.api_base}/api/tags")
            if response.status_code != 200:
                print(f"Ollama service not available: {response.status_code}")
                return False
                
            # Check if our model is available
            models = response.json().get('models', [])
            for model in models:
                if model.get('name') == self.model_name:
                    return True
                    
            print(f"Model {self.model_name} not loaded in Ollama")
            return False
        except Exception as e:
            print(f"Error checking Ollama availability: {e}")
            return False
    
    def wait_for_service(self) -> bool:
        """Wait for Ollama service to be available"""
        print(f"Waiting for Ollama service at {self.api_base}...")
        for attempt in range(self.max_retries):
            if self.is_available():
                print(f"Ollama service ready with model {self.model_name}")
                return True
            print(f"Attempt {attempt+1}/{self.max_retries}: Ollama service not ready, retrying in {self.retry_delay}s...")
            time.sleep(self.retry_delay)
        print("Failed to connect to Ollama service after maximum retries")
        return False
            
    def analyze(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze network data with LLM"""
        # Check/wait for Ollama service
        if not self.wait_for_service():
            return {
                "error": "LLM service unavailable",
                "analysis": "Unable to perform LLM analysis as the service is unavailable.",
                "alert_level": "Unknown",
                "identified_threats": [],
                "recommendations": ["Check LLM service configuration and connectivity."]
            }
            
        # Format the prompt
        prompt = self._create_prompt(input_data)
        
        # Load model-specific configuration
        config_path = os.path.join(os.path.dirname(__file__), 'models', f"{self.model_name.split(':')[0]}_config.json")
        model_config = {}
        
        try:
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    model_config = json.load(f)
                    print(f"Loaded model-specific config for {self.model_name}")
            else:
                print(f"No model-specific config found at {config_path}, using defaults")
        except Exception as e:
            print(f"Error loading model config: {e}")
        
        # Create request with model-specific parameters if available
        request_data = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,
            "temperature": model_config.get("temperature", 0.1),
            "max_tokens": model_config.get("num_predict", 1024),
        }
        
        # Add other parameters if they exist in config
        for param in ["top_p", "top_k", "stop", "system"]:
            if param in model_config:
                request_data[param] = model_config[param]
        
        # Call the local LLM (using Ollama API format)
        try:
            response = requests.post(
                f"{self.api_base}/api/generate",
                json=request_data,
                timeout=60  # Add timeout to prevent hanging requests
            )
            
            if response.status_code == 200:
                result = response.json()
                self.last_analysis = result.get("response", "No response from LLM")
                return {
                    "analysis": self.last_analysis,
                    "alert_level": self._extract_alert_level(self.last_analysis),
                    "identified_threats": self._extract_threats(self.last_analysis),
                    "recommendations": self.generate_recommendations()
                }
            else:
                error_msg = f"Failed to get LLM response: {response.status_code}"
                print(error_msg)
                return {"error": error_msg, "analysis": "Error occurred during analysis."}
                
        except requests.RequestException as e:
            error_msg = f"Request error with LLM service: {str(e)}"
            print(error_msg)
            return {"error": error_msg, "analysis": "Error occurred during analysis."}
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            print(error_msg)
            return {"error": error_msg, "analysis": "Error occurred during analysis."}
    
    def _create_prompt(self, input_data: Dict[str, Any]) -> str:
        """Create a detailed prompt for comprehensive network analysis"""
        anomalies = input_data.get("anomalies", [])
        packet_summary = input_data.get("packet_summary", {})
        flow_data = input_data.get("flow_data", {})
        
        prompt = """You are a cybersecurity expert analyzing network traffic captured in a PCAP file.
Provide a comprehensive analysis that includes:

1. TRAFFIC OVERVIEW: Explain what the overall traffic represents and key patterns observed
2. PROTOCOL ANALYSIS: Analyze the protocol distribution and what activities they indicate
3. CONNECTION PATTERNS: Identify communication patterns between hosts and their significance
4. SECURITY ASSESSMENT: Identify potential security issues, suspicious activities, or vulnerabilities
5. CONTEXTUAL INTERPRETATION: Explain what this traffic likely represents in a network environment
6. RECOMMENDATIONS: What actions should be taken based on this analysis

Use technical details where relevant, but explain concepts clearly. Be specific about what's happening in this traffic.

NETWORK SUMMARY:
"""
        
        # Add packet summary statistics
        prompt += f"Total Packets: {packet_summary.get('total_packets', 0)}\n"
        prompt += f"Protocol Distribution: {json.dumps(packet_summary.get('protocols', {}))}\n"
        prompt += f"Top Source IPs: {json.dumps(packet_summary.get('top_sources', []))}\n"
        prompt += f"Top Destination IPs: {json.dumps(packet_summary.get('top_destinations', []))}\n"
        prompt += f"Capture Duration: {packet_summary.get('duration', 0)} seconds\n\n"
        
        # Add flow data for better context
        if flow_data:
            prompt += "TOP TRAFFIC FLOWS:\n"
            for i, flow in enumerate(flow_data.get('top_flows', [])[:10]):
                prompt += f"Flow {i+1}: {flow.get('src_ip')}:{flow.get('src_port')} → "
                prompt += f"{flow.get('dst_ip')}:{flow.get('dst_port')} "
                prompt += f"({flow.get('protocol')}, {flow.get('packets')} packets, "
                prompt += f"{flow.get('bytes')} bytes)\n"
            prompt += "\n"
        
        # Add detected services
        if 'services' in packet_summary:
            prompt += "DETECTED SERVICES:\n"
            for service, count in packet_summary.get('services', {}).items():
                prompt += f"- {service}: {count} connections\n"
            prompt += "\n"
        
        # Add anomaly information
        if anomalies:
            prompt += "DETECTED ANOMALIES:\n"
            for i, anomaly in enumerate(anomalies[:10]):  # Limit to first 10 anomalies
                prompt += f"Anomaly {i+1}:\n"
                prompt += f"- Source: {anomaly.get('src_ip', 'Unknown')}\n"
                prompt += f"- Destination: {anomaly.get('dst_ip', 'Unknown')}\n"
                prompt += f"- Protocol: {anomaly.get('protocol', 'Unknown')}\n"
                prompt += f"- Anomaly Score: {anomaly.get('anomaly_score', 0)}\n"
                if 'description' in anomaly:
                    prompt += f"- Description: {anomaly.get('description')}\n"
                prompt += "\n"
        
        prompt += "Provide your comprehensive analysis:"
        return prompt
        
    def _extract_alert_level(self, analysis: str) -> str:
        """Extract the alert level from the LLM response"""
        if "critical" in analysis.lower():
            return "Critical"
        elif "high" in analysis.lower():
            return "High"
        elif "medium" in analysis.lower():
            return "Medium"
        else:
            return "Low"
            
    def _extract_threats(self, analysis: str) -> List[str]:
        """Extract identified threats from the LLM response"""
        # This is a simplified implementation
        threats = []
        lower_analysis = analysis.lower()
        
        threat_indicators = [
            "malware", "scan", "brute force", "data exfiltration", 
            "c2", "command and control", "ddos", "lateral movement",
            "port scan", "vulnerability exploit", "suspicious traffic"
        ]
        
        for indicator in threat_indicators:
            if indicator in lower_analysis:
                threats.append(indicator.title())
                
        return threats
    
    def generate_summary(self) -> str:
        """Generate a short summary from the last analysis"""
        if not self.last_analysis:
            return "No analysis performed yet"
            
        # In a real implementation, you might call the LLM again to summarize
        # Here we'll just take the first 200 characters
        return self.last_analysis[:200] + "..."
        
    def generate_recommendations(self) -> List[str]:
        """Extract recommendations from LLM analysis"""
        if not self.last_analysis:
            return []
            
        # Look for recommendations in the LLM response
        rec_section = self.last_analysis.lower().find("recommend")
        if rec_section == -1:
            return ["No specific recommendations found"]
        
        # Extract the recommendation section
        rec_text = self.last_analysis[rec_section:]
        
        # Split into bullet points if possible
        if "-" in rec_text:
            recs = [r.strip() for r in rec_text.split("-") if r.strip()]
            return recs[1:6]  # Skip the header and limit to 5 recommendations
        else:
            return [rec_text[:200] + "..."]

    def extract_section(self, text, section_name):
        """Extract a specific section from the LLM analysis"""
        if not text:
            return "Not available"
        
        # Find the section by name
        lower_text = text.lower()
        section_name_lower = section_name.lower()
        
        start_idx = lower_text.find(section_name_lower)
        if start_idx == -1:
            return "Not found in analysis"
        
        # Find the next section heading or end of text
        next_section_starts = []
        for heading in ["TRAFFIC OVERVIEW", "PROTOCOL ANALYSIS", "CONNECTION PATTERNS", 
                        "SECURITY ASSESSMENT", "CONTEXTUAL INTERPRETATION", "RECOMMENDATIONS"]:
            if heading.lower() != section_name_lower:
                pos = lower_text.find(heading.lower(), start_idx + len(section_name))
                if pos != -1:
                    next_section_starts.append(pos)
        
        # Find where this section ends
        if next_section_starts:
            end_idx = min(next_section_starts)
        else:
            end_idx = len(text)
        
        # Extract the section content (skipping the heading)
        section_content = text[start_idx:end_idx].strip()
        
        # Remove the section heading from the content
        heading_end = section_content.find('\n')
        if heading_end != -1:
            section_content = section_content[heading_end:].strip()
        
        return section_content

    def get_sample_analysis(self):
        """Return sample analysis data for when no real data is available"""
        return {
            "summary": "Network traffic exhibits patterns consistent with normal business operations, though there are several points of interest that warrant attention.",
            "analysis": """
# Comprehensive Network Analysis

## TRAFFIC OVERVIEW
The capture contains 5,234 packets over a 10-minute period showing predominantly TCP traffic (78%) with moderate DNS queries (12%) and occasional HTTP/HTTPS connections (8.5%). Data flows are asymmetric with more outbound than inbound connections.

## PROTOCOL ANALYSIS
TCP connections show regular keep-alive patterns and normal three-way handshakes. Several connections to remote port 443 suggest HTTPS traffic. DNS traffic has a normal query-response ratio with primarily A record lookups with occasional MX records.

## CONNECTION PATTERNS
Three primary workstations (192.168.1.105, 192.168.1.110, 192.168.1.112) communicate with both internal resources and external destinations. Connection duration follows a bimodal distribution with short-lived connections (2-5s) for DNS and HTTP, and longer persistent connections (300s+) for application traffic.

## SECURITY ASSESSMENT
Repeated connection attempts from 192.168.1.105 to external IP 203.0.113.25 on port 8080 are concerning as this is not a standard HTTP port and may indicate command and control (C2) activity. High volume of DNS queries from a single workstation (192.168.1.110) may indicate DNS tunneling. Some connections use weak TLSv1.0 encryption.

## CONTEXTUAL INTERPRETATION
The network traffic suggests a typical office environment with regular web browsing, email usage, and application communication. The suspicious outbound connection attempts to non-standard ports warrant further investigation, particularly given their regularity and destination consistency.
            """,
            "alert_level": "Medium",
            "identified_threats": [
                "Potential C2 communication via non-standard port",
                "Possible DNS tunneling activity",
                "Use of deprecated encryption standards"
            ],
            "recommendations": [
                "Investigate outbound connections to 203.0.113.25:8080",
                "Analyze high-volume DNS queries from 192.168.1.110 for data exfiltration",
                "Enforce TLS 1.2+ for all encrypted communications",
                "Implement egress filtering on firewalls to prevent unauthorized outbound connections"
            ],
            "traffic_overview": "The capture contains 5,234 packets over a 10-minute period showing predominantly TCP traffic (78%) with moderate DNS queries (12%) and occasional HTTP/HTTPS connections (8.5%). Data flows are asymmetric with more outbound than inbound connections.",
            "protocol_analysis": "TCP connections show regular keep-alive patterns and normal three-way handshakes. Several connections to remote port 443 suggest HTTPS traffic. DNS traffic has a normal query-response ratio with primarily A record lookups with occasional MX records.",
            "connection_patterns": "Three primary workstations (192.168.1.105, 192.168.1.110, 192.168.1.112) communicate with both internal resources and external destinations. Connection duration follows a bimodal distribution with short-lived connections (2-5s) for DNS and HTTP, and longer persistent connections (300s+) for application traffic.",
            "security_assessment": "Repeated connection attempts from 192.168.1.105 to external IP 203.0.113.25 on port 8080 are concerning as this is not a standard HTTP port and may indicate command and control (C2) activity. High volume of DNS queries from a single workstation (192.168.1.110) may indicate DNS tunneling. Some connections use weak TLSv1.0 encryption.",
            "contextual_interpretation": "The network traffic suggests a typical office environment with regular web browsing, email usage, and application communication. The suspicious outbound connection attempts to non-standard ports warrant further investigation, particularly given their regularity and destination consistency."
        } 