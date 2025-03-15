import pyshark
import pandas as pd
import numpy as np
from datetime import datetime
import os
import logging

class PacketParser:
    def __init__(self):
        self.stats = {
            'total_packets': 0,
            'parsed_packets': 0,
            'protocols': {}
        }
        self.tshark_available = self._check_tshark()
        
    def _check_tshark(self):
        """Check if tshark is available"""
        try:
            import subprocess
            result = subprocess.run(['tshark', '--version'], capture_output=True, text=True)
            return result.returncode == 0
        except Exception:
            print("TShark not found. Please install Wireshark/TShark for PCAP parsing.")
            return False
    
    def parse_pcap(self, file_path):
        """Parse a PCAP file and extract detailed features for analysis"""
        if not self.tshark_available:
            print(f"Cannot parse {file_path}: TShark not available")
            return self._get_sample_packet_data()
            
        try:
            packets = []
            cap = pyshark.FileCapture(file_path)
            
            # Track additional information
            services = {}
            first_timestamp = None
            last_timestamp = None
            
            for packet in cap:
                try:
                    # Get basic packet info
                    timestamp = float(packet.sniff_timestamp)
                    if first_timestamp is None:
                        first_timestamp = timestamp
                    last_timestamp = timestamp
                    
                    packet_dict = {
                        'timestamp': timestamp,
                        'length': int(packet.length),
                        'protocol': packet.transport_layer if hasattr(packet, 'transport_layer') else 'Unknown'
                    }
                    
                    # Add IP layer features
                    if hasattr(packet, 'ip'):
                        packet_dict.update({
                            'src_ip': packet.ip.src,
                            'dst_ip': packet.ip.dst,
                            'ttl': int(packet.ip.ttl)
                        })
                    
                    # Add TCP/UDP features and detect services
                    if hasattr(packet, 'tcp'):
                        src_port = int(packet.tcp.srcport)
                        dst_port = int(packet.tcp.dstport)
                        packet_dict.update({
                            'src_port': src_port,
                            'dst_port': dst_port,
                            'tcp_flags': int(packet.tcp.flags, 16) if hasattr(packet.tcp, 'flags') else 0
                        })
                        
                        # Detect common services
                        if dst_port in [80, 443]:
                            service = f"HTTP/HTTPS (port {dst_port})"
                            services[service] = services.get(service, 0) + 1
                        elif dst_port == 53:
                            service = "DNS"
                            services[service] = services.get(service, 0) + 1
                        # Add more service detection logic here
                        
                    elif hasattr(packet, 'udp'):
                        src_port = int(packet.udp.srcport)
                        dst_port = int(packet.udp.dstport)
                        packet_dict.update({
                            'src_port': src_port,
                            'dst_port': dst_port
                        })
                        
                        # Detect UDP services
                        if dst_port == 53:
                            service = "DNS"
                            services[service] = services.get(service, 0) + 1
                        elif dst_port == 67 or dst_port == 68:
                            service = "DHCP"
                            services[service] = services.get(service, 0) + 1
                    
                    # Detect application layer protocols if available
                    if hasattr(packet, 'highest_layer'):
                        packet_dict['app_protocol'] = packet.highest_layer
                        
                        # Track application services
                        app = packet.highest_layer
                        if app not in ['TCP', 'UDP', 'IP']:
                            services[app] = services.get(app, 0) + 1
                    
                    packets.append(packet_dict)
                    
                    # Update stats
                    protocol = packet_dict.get('protocol', 'Unknown')
                    self.stats['protocols'][protocol] = self.stats['protocols'].get(protocol, 0) + 1
                    
                except Exception as e:
                    print(f"Error parsing packet: {e}")
                    continue
                
            # Calculate duration
            duration = last_timestamp - first_timestamp if first_timestamp and last_timestamp else 0
            
            # Update stats
            self.stats['total_packets'] += len(packets)
            self.stats['parsed_packets'] += len(packets)
            self.stats['duration'] = duration
            self.stats['services'] = services
            
            # Analysis flow patterns
            flows = self._analyze_flows(packets)
            self.stats['flows'] = flows
            
            return packets
            
        except Exception as e:
            print(f"Error parsing PCAP file: {e}")
            return self._get_sample_packet_data()
    
    def _process_packet(self, packet):
        """Process a single packet and return its features"""
        packet_dict = {
            'timestamp': float(packet.sniff_timestamp),
            'length': int(packet.length),
            'protocol': packet.transport_layer if hasattr(packet, 'transport_layer') else 'Unknown'
        }
        
        # Add IP layer features
        if hasattr(packet, 'ip'):
            packet_dict.update({
                'src_ip': packet.ip.src,
                'dst_ip': packet.ip.dst,
                'ttl': int(packet.ip.ttl)
            })
        
        # Add TCP/UDP features and detect services
        if hasattr(packet, 'tcp'):
            src_port = int(packet.tcp.srcport)
            dst_port = int(packet.tcp.dstport)
            packet_dict.update({
                'src_port': src_port,
                'dst_port': dst_port,
                'tcp_flags': int(packet.tcp.flags, 16) if hasattr(packet.tcp, 'flags') else 0
            })
            
            # Detect common services
            if dst_port in [80, 443]:
                service = f"HTTP/HTTPS (port {dst_port})"
                self.stats['services'][service] = self.stats['services'].get(service, 0) + 1
            elif dst_port == 53:
                service = "DNS"
                self.stats['services'][service] = self.stats['services'].get(service, 0) + 1
            # Add more service detection logic here
            
        elif hasattr(packet, 'udp'):
            src_port = int(packet.udp.srcport)
            dst_port = int(packet.udp.dstport)
            packet_dict.update({
                'src_port': src_port,
                'dst_port': dst_port
            })
            
            # Detect UDP services
            if dst_port == 53:
                service = "DNS"
                self.stats['services'][service] = self.stats['services'].get(service, 0) + 1
            elif dst_port == 67 or dst_port == 68:
                service = "DHCP"
                self.stats['services'][service] = self.stats['services'].get(service, 0) + 1
        
        # Detect application layer protocols if available
        if hasattr(packet, 'highest_layer'):
            packet_dict['app_protocol'] = packet.highest_layer
            
            # Track application services
            app = packet.highest_layer
            if app not in ['TCP', 'UDP', 'IP']:
                self.stats['services'][app] = self.stats['services'].get(app, 0) + 1
        
        return packet_dict
    
    def _analyze_flows(self, packets):
        """Analyze packet flows (connections between hosts)"""
        flows = {}
        for packet in packets:
            if 'src_ip' in packet and 'dst_ip' in packet:
                src_ip = packet['src_ip']
                dst_ip = packet['dst_ip']
                protocol = packet.get('protocol', 'Unknown')
                
                # Create flow key
                src_port = packet.get('src_port', 0)
                dst_port = packet.get('dst_port', 0)
                flow_key = f"{src_ip}:{src_port}-{dst_ip}:{dst_port}-{protocol}"
                
                if flow_key not in flows:
                    flows[flow_key] = {
                        'src_ip': src_ip,
                        'dst_ip': dst_ip,
                        'src_port': src_port,
                        'dst_port': dst_port,
                        'protocol': protocol,
                        'packets': 0,
                        'bytes': 0,
                        'start_time': packet['timestamp'],
                        'end_time': packet['timestamp']
                    }
                
                flows[flow_key]['packets'] += 1
                flows[flow_key]['bytes'] += packet.get('length', 0)
                flows[flow_key]['end_time'] = max(flows[flow_key]['end_time'], packet['timestamp'])
        
        # Convert to list and sort by packet count
        flow_list = list(flows.values())
        flow_list.sort(key=lambda x: x['packets'], reverse=True)
        
        return {
            'total_flows': len(flow_list),
            'top_flows': flow_list[:20]  # Return top 20 flows
        }
    
    def _get_sample_packet_data(self):
        """Return sample packet data for development without tshark"""
        print("Returning sample packet data for development")
        current_time = datetime.now().timestamp()
        sample_data = []
        
        protocols = ['TCP', 'UDP', 'ICMP', 'Unknown']
        src_ips = ['192.168.1.100', '192.168.1.101', '10.0.0.5', '172.16.0.10']
        dst_ips = ['192.168.1.1', '8.8.8.8', '1.1.1.1', '192.168.1.254']
        
        # Create 100 sample packets
        for i in range(100):
            protocol = protocols[i % len(protocols)]
            src_ip = src_ips[i % len(src_ips)]
            dst_ip = dst_ips[i % len(dst_ips)]
            
            packet = {
                'timestamp': current_time - (100 - i) * 0.5,  # Packets spread over 50 seconds
                'length': 100 + (i % 900),  # Packet size between 100 and 1000
                'protocol': protocol,
                'src_ip': src_ip,
                'dst_ip': dst_ip,
                'ttl': 64,
            }
            
            if protocol == 'TCP':
                packet.update({
                    'src_port': 50000 + (i % 1000),
                    'dst_port': 80 if i % 3 == 0 else (443 if i % 3 == 1 else 22),
                    'tcp_flags': 0x02 if i % 5 == 0 else (0x10 if i % 5 == 1 else 0x18)
                })
            elif protocol == 'UDP':
                packet.update({
                    'src_port': 50000 + (i % 1000),
                    'dst_port': 53 if i % 2 == 0 else 123
                })
            
            sample_data.append(packet)
            
            # Create some anomalies
            if i % 30 == 0:
                # Add a strange packet
                anomaly = packet.copy()
                anomaly['length'] = 5000  # Unusually large
                anomaly['src_ip'] = '45.33.22.11'  # Unknown source
                if protocol == 'TCP':
                    anomaly['dst_port'] = 4444  # Unusual port
                sample_data.append(anomaly)
        
        # Update stats with sample data
        self.stats['total_packets'] += len(sample_data)
        self.stats['parsed_packets'] += len(sample_data)
        
        # Count protocols
        for packet in sample_data:
            protocol = packet.get('protocol', 'Unknown')
            self.stats['protocols'][protocol] = self.stats['protocols'].get(protocol, 0) + 1
            
        return sample_data
    
    def get_stats(self):
        """Return parser statistics"""
        return self.stats
    
    def extract_features(self, packets):
        """Convert packet data to features for machine learning"""
        df = pd.DataFrame(packets)
        
        # Feature engineering
        if not df.empty and 'timestamp' in df.columns:
            # Time-based features
            df['hour'] = df['timestamp'].apply(lambda x: datetime.fromtimestamp(x).hour)
            
            # Add inter-arrival times
            df = df.sort_values('timestamp')
            df['inter_arrival_time'] = df['timestamp'].diff()
            
            # Group by source-destination pairs
            if 'src_ip' in df.columns and 'dst_ip' in df.columns:
                flow_groups = df.groupby(['src_ip', 'dst_ip'])
                
                # Calculate flow statistics
                flow_stats = flow_groups.agg({
                    'length': ['count', 'mean', 'std', 'min', 'max'],
                    'inter_arrival_time': ['mean', 'std']
                })
                
                # Flatten column names
                flow_stats.columns = ['_'.join(col).strip() for col in flow_stats.columns.values]
                
                # Reset index to get src_ip and dst_ip as columns
                flow_stats = flow_stats.reset_index()
                
                return flow_stats
        
        return df 