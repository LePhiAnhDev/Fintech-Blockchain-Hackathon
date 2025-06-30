#!/usr/bin/env python3
"""
Quick GPU Memory Debug Script
Run this to check memory and test model loading
"""

import os
import sys
import torch
import requests
import json

def check_gpu_info():
    """Check GPU status"""
    print("="*60)
    print("🔍 GPU MEMORY STATUS")
    print("="*60)
    
    if not torch.cuda.is_available():
        print("❌ CUDA not available - running on CPU")
        return False
    
    try:
        gpu_name = torch.cuda.get_device_name(0)
        total_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3  # GB
        allocated = torch.cuda.memory_allocated() / 1024**3  # GB
        cached = torch.cuda.memory_reserved() / 1024**3     # GB
        free = total_memory - allocated
        
        print(f"🖥️ GPU: {gpu_name}")
        print(f"📊 Total: {total_memory:.2f}GB")
        print(f"🔴 Used: {allocated:.2f}GB ({allocated/total_memory*100:.1f}%)")
        print(f"🟡 Cached: {cached:.2f}GB")
        print(f"🟢 Free: {free:.2f}GB")
        
        if allocated > 6.0:
            print("⚠️ WARNING: High GPU memory usage!")
            print("💡 Try: python server/memory_utils.py")
        
        return True
        
    except Exception as e:
        print(f"❌ Error checking GPU: {e}")
        return False

def test_server_connection():
    """Test server connection"""
    print("\n" + "="*60)
    print("🌐 SERVER CONNECTION TEST")
    print("="*60)
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running")
            return True
        else:
            print(f"❌ Server returned status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Server not responding: {e}")
        print("💡 Start server: cd server && python server.py")
        return False

def clear_all_models():
    """Clear all models via API"""
    print("\n" + "="*60)
    print("🧹 CLEARING ALL MODELS")
    print("="*60)
    
    try:
        response = requests.post("http://localhost:8000/models/clear-all", timeout=30)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ All models cleared successfully")
                print(f"📊 Memory info: {data.get('memory_info', 'N/A')}")
                return True
            else:
                print(f"❌ Clear failed: {data.get('message', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error clearing models: {e}")
        return False

def test_model_loading(model_type="streaming_generative"):
    """Test loading the lightest model"""
    print(f"\n" + "="*60)
    print(f"🚀 TESTING MODEL LOAD: {model_type}")
    print("="*60)
    
    try:
        payload = {
            "model_type": model_type,
            "force_reload": True
        }
        
        print(f"📤 Loading {model_type}...")
        response = requests.post(
            "http://localhost:8000/models/load", 
            json=payload, 
            timeout=300  # 5 minutes timeout
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('loaded'):
                print(f"✅ Model {model_type} loaded successfully!")
                print(f"⏱️ Loading time: {data.get('loading_time', 0):.2f}s")
                print(f"📊 Memory usage: {data.get('memory_usage_mb', 0):.0f}MB")
                return True
            else:
                print(f"❌ Model loading failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing model load: {e}")
        return False

def get_model_status():
    """Get current model status"""
    print(f"\n" + "="*60)
    print("📋 MODEL STATUS")
    print("="*60)
    
    try:
        response = requests.get("http://localhost:8000/models/manager-status", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                status = data.get('data', {})
                loaded_models = status.get('currently_loaded', [])
                memory_usage = status.get('memory_usage_mb', 0)
                
                print(f"🔄 Currently loaded: {loaded_models if loaded_models else 'None'}")
                print(f"💾 Memory usage: {memory_usage:.0f}MB")
                
                models_status = status.get('models_status', {})
                for model_name, model_info in models_status.items():
                    status_icon = "✅" if model_info.get('loaded') else "❌"
                    print(f"   {status_icon} {model_name}: {'Loaded' if model_info.get('loaded') else 'Not loaded'}")
                
                return True
            else:
                print("❌ Failed to get model status")
                return False
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error getting model status: {e}")
        return False

def main():
    """Main debug function"""
    print("🔧 GPU MEMORY & MODEL DEBUG TOOL")
    print("For AI Collections troubleshooting")
    print()
    
    # Step 1: Check GPU
    gpu_ok = check_gpu_info()
    
    # Step 2: Test server
    server_ok = test_server_connection()
    
    if not server_ok:
        print("\n💡 NEXT STEPS:")
        print("1. Start the server: cd server && python server.py")
        print("2. Then run this debug script again")
        return
    
    # Step 3: Get current status
    get_model_status()
    
    # Step 4: Clear all models
    print("\n" + "💡 Do you want to clear all models and test loading? (y/N)")
    choice = input().strip().lower()
    
    if choice in ['y', 'yes']:
        # Clear all models first
        if clear_all_models():
            # Wait a bit
            import time
            time.sleep(2)
            
            # Test loading lightest model
            test_model_loading("streaming_generative")
    
    print("\n" + "="*60)
    print("🏁 DEBUG COMPLETED")
    print("="*60)
    print("💡 If you still have issues:")
    print("1. Check the server logs")
    print("2. Try: python server/memory_utils.py")
    print("3. Restart the server")
    print("4. Check if other processes are using GPU: nvidia-smi")

if __name__ == "__main__":
    main() 