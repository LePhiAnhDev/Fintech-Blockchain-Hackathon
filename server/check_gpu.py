import torch
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("🚀 AI SERVER - GPU/CPU STATUS & CONFIGURATION CHECK")
print("=" * 60)

# Check CUDA availability
cuda_available = torch.cuda.is_available()
print(f"CUDA Available: {'✅ YES' if cuda_available else '❌ NO'}")

if cuda_available:
    # GPU Information
    gpu_name = torch.cuda.get_device_name(0)
    gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3
    print(f"🎯 GPU Name: {gpu_name}")
    print(f"💾 GPU Memory: {gpu_memory:.1f} GB")
    print(f"🔥 GPU Count: {torch.cuda.device_count()}")
    
    # Check GPU memory usage
    try:
        print(f"📊 Memory Allocated: {torch.cuda.memory_allocated(0) / 1024**3:.2f} GB")
        print(f"📈 Memory Cached: {torch.cuda.memory_reserved(0) / 1024**3:.2f} GB")
    except:
        print("📊 Memory info: Available after model loading")
    
    print("\n🎮 GPU MODE ENABLED - AI models sẽ ưu tiên sử dụng GPU")
    
else:
    print("💻 GPU không có sẵn - AI models sẽ chạy trên CPU")
    print("⚠️ Hiệu suất có thể chậm hơn so với GPU")

# Check environment settings
print("\n" + "=" * 60)
print("⚙️ ENVIRONMENT CONFIGURATION")
print("=" * 60)

force_cpu = os.getenv("FORCE_CPU_MODE", "False").lower() == "true"
print(f"Force CPU Mode: {'✅ ON (GPU bị vô hiệu hóa)' if force_cpu else '❌ OFF (Ưu tiên GPU)'}")

cuda_alloc = os.getenv("PYTORCH_CUDA_ALLOC_CONF", "Not set")
print(f"CUDA Alloc Config: {cuda_alloc}")

# Check API keys
api_key = os.getenv("GOOGLE_API_KEY", "Not set")
if api_key != "Not set" and len(api_key) > 20:
    print(f"Google API Key: ✅ Set ({api_key[:10]}...{api_key[-10:]})")
elif api_key != "Not set":
    print(f"Google API Key: ✅ Set")
else:
    print("Google API Key: ❌ Not set")

etherscan_key = os.getenv("ETHERSCAN_API_KEY", "Not set")
if etherscan_key != "Not set" and etherscan_key != "YourAPIKeyHere":
    print(f"Etherscan API Key: ✅ Set")
else:
    print("Etherscan API Key: ⚠️ Using default/not set")

# Model status prediction
print("\n" + "=" * 60)
print("🤖 AI MODELS STATUS PREDICTION")
print("=" * 60)

print("📚 Study Chat (Gemini API): " + ("✅ Ready" if api_key != "Not set" else "❌ Need API key"))

if cuda_available and not force_cpu:
    print("📊 Blockchain LLM: ✅ Will use GPU acceleration")
    print("🔍 Fraud Detection: ✅ Will use optimized processing")
else:
    print("📊 Blockchain LLM: ⚠️ Will use CPU (slower)")
    print("🔍 Fraud Detection: ✅ CPU-optimized mode")

print("💰 Finance Manager: ✅ Ready (No AI model required)")

print("\n" + "=" * 60)
if cuda_available and not force_cpu and api_key != "Not set":
    print("🚀 OPTIMAL: Toàn bộ AI features sẽ hoạt động với hiệu suất tối ưu!")
elif api_key != "Not set":
    print("👍 GOOD: AI features sẽ hoạt động, GPU sẽ tăng tốc khi có")
else:
    print("⚠️ WARNING: Cần cấu hình API keys để sử dụng đầy đủ tính năng")
print("=" * 60)
