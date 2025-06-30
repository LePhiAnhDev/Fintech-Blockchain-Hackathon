#!/usr/bin/env python3
"""
Quick API Test Script
Test các endpoints để debug
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint, method="GET", data=None):
    """Test an endpoint and print response"""
    print(f"\n{'='*60}")
    print(f"🧪 Testing {method} {endpoint}")
    print('='*60)
    
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", json=data, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            try:
                json_response = response.json()
                print(f"JSON Response:")
                print(json.dumps(json_response, indent=2, ensure_ascii=False))
                return json_response
            except:
                print(f"Raw Response: {response.text}")
                return response.text
        else:
            print(f"Raw Response: {response.text}")
            return response.text
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def main():
    """Test main endpoints"""
    print("🔧 API ENDPOINT TESTING")
    print("Testing AI Collections endpoints")
    
    # Test 1: Health check
    test_endpoint("/health")
    
    # Test 2: Model manager status
    test_endpoint("/models/manager-status")
    
    # Test 3: Try clearing models
    print("\n🧪 Testing Clear All Models...")
    clear_result = test_endpoint("/models/clear-all", "POST")
    
    # Test 4: Try loading streaming model
    print("\n🧪 Testing Load Streaming Model...")
    load_data = {
        "model_type": "streaming_generative", 
        "force_reload": False
    }
    load_result = test_endpoint("/models/load", "POST", load_data)
    
    # Test 5: Check status again
    print("\n🧪 Checking status after load attempt...")
    test_endpoint("/models/manager-status")
    
    print("\n" + "="*60)
    print("🏁 TESTING COMPLETED")
    print("="*60)
    print("💡 Analysis:")
    
    if clear_result:
        if isinstance(clear_result, dict) and clear_result.get('success'):
            print("✅ Clear All works")
        else:
            print("❌ Clear All failed")
            if isinstance(clear_result, dict):
                print(f"   Error: {clear_result.get('message', 'Unknown')}")
    
    if load_result:
        if isinstance(load_result, dict) and load_result.get('loaded'):
            print("✅ Model loading works")
        else:
            print("❌ Model loading failed")
            if isinstance(load_result, dict):
                print(f"   Error: {load_result.get('error', 'Unknown')}")
                print(f"   Loaded: {load_result.get('loaded', 'N/A')}")

if __name__ == "__main__":
    main() 