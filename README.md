# AI powered collections

AI Powered Collections is an integrated platform leveraging advanced AI technologies to support Vietnamese students in managing their academic and financial lives. It features smart financial management, blockchain analysis with fraud detection, and an AI-powered academic assistant — all combined to provide a comprehensive and intelligent support system.

## Features

- Fraud detection system in Blockchain transactions
- AI manages spending and gives advice
- AI learning supports diverse students
- AI generates images with Streaming level
- AI manages and updates new information of people
- Distributed tracing with unique request IDs
- Environment-based configuration

## Prerequisites

- Node.js (v20 or higher)
- Python (v3.10.11)
- MongoDB
- Cuda 

## Environment Variables

Change the contents of the .env and .env.local files in the 3 folders backend/, server/ and frontend/:

```env
# backend/
# Môi trường và cấu hình cơ bản
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:3000

# Cơ sở dữ liệu MongoDB
MONGODB_URI=mongodb://localhost:27017/student-ai

# JWT (xác thực)
JWT_SECRET=JWT_SECRET
JWT_EXPIRES_IN=7d

# Server AI nội bộ
AI_SERVER_URL=http://localhost:8000

# Giới hạn tốc độ request
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Blockchain (cần cấu hình để deploy smart contract)
SEPOLIA_RPC_URL=SEPOLIA_RPC_URL
PRIVATE_KEY=PRIVATE_KEY
ETHERSCAN_API_KEY=ETHERSCAN_API_KEY

# IPFS thông qua Pinata
PINATA_API_KEY=PINATA_API_KEY
PINATA_SECRET_KEY=PINATA_SECRET_KEY
PINATA_JWT=PINATA_JWT


# server/
HOST=0.0.0.0  
PORT=8000  
DEBUG=True 
GOOGLE_API_KEY=GOOGLE_API_KEY
GEMINI_MODEL_NAME=gemini-2.0-flash-exp 
ETHERSCAN_API_KEY=ETHERSCAN_API_KEY  
ETHERSCAN_BASE_URL=https://api.etherscan.io/api 
FRAUD_MODEL_PATH=result/fraud_detection_model.pkl  
BLOCKCHAIN_LLM_MODEL=google/gemma-2-2b-it 
FORCE_CPU_MODE=False  
PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512 
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5001,http://127.0.0.1:3000 
MAX_REQUESTS_PER_MINUTE=30  
MAX_CONCURRENT_REQUESTS=5 
LOG_LEVEL=INFO 
USE_FALLBACK_RESPONSES=True 


# frontend
VITE_BACKEND_URL=http://localhost:5001
VITE_AI_SERVER_URL=http://localhost:8000

# Development
VITE_NODE_ENV=development
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/LePhiAnhDev/Fintech-Blockchain-Hackathon.git
cd Fintech-Blockchain-Hackathon
```

2. Install dependencies:
```bash
cd server
python -m venv env
env\Scripts\activate
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install -r requirements.txt
huggingface-cli login # paste your ACCESS TOKEN in HuggingFace
python server.py
```
```bash
cd ../backend
npm install
npm run dev
```
```bash
cd ../frontend
npm install
npm run dev
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:
```
http://localhost:8000/docs
```

## Project Structure

```
D:.
├───backend
│   ├───artifacts
│   │   ├───@openzeppelin
│   │   │   └───contracts
│   │   │       ├───access
│   │   │       │   └───Ownable.sol
│   │   │       ├───interfaces
│   │   │       │   ├───draft-IERC6093.sol
│   │   │       │   └───IERC4906.sol
│   │   │       ├───token
│   │   │       │   └───ERC721
│   │   │       │       ├───ERC721.sol
│   │   │       │       ├───extensions
│   │   │       │       │   ├───ERC721URIStorage.sol
│   │   │       │       │   └───IERC721Metadata.sol
│   │   │       │       ├───IERC721.sol
│   │   │       │       ├───IERC721Receiver.sol
│   │   │       │       └───utils
│   │   │       │           └───ERC721Utils.sol
│   │   │       └───utils
│   │   │           ├───Context.sol
│   │   │           ├───introspection
│   │   │           │   ├───ERC165.sol
│   │   │           │   └───IERC165.sol
│   │   │           ├───math
│   │   │           │   ├───Math.sol
│   │   │           │   ├───SafeCast.sol
│   │   │           │   └───SignedMath.sol
│   │   │           ├───Panic.sol
│   │   │           ├───ReentrancyGuard.sol
│   │   │           └───Strings.sol
│   │   ├───build-info
│   │   └───contracts
│   │       └───AcademicNFT.sol
│   ├───contracts
│   ├───scripts
│   ├───src
│   │   ├───config
│   │   ├───middleware
│   │   ├───models
│   │   └───routes
│   └───uploads
├───frontend
│   ├───dist
│   │   └───assets
│   ├───public
│   └───src
│       ├───assets
│       ├───components
│       │   ├───common
│       │   │   ├───Button
│       │   │   ├───Card
│       │   │   ├───CustomSelect
│       │   │   ├───FilePreview
│       │   │   ├───Hyperspeed
│       │   │   ├───LoadingScreen
│       │   │   ├───Logo
│       │   │   ├───MarkdownRenderer
│       │   │   ├───PageHeader
│       │   │   ├───SuccessModal
│       │   │   └───SuccessPopup
│       │   └───layouts
│       │       ├───AppLayout
│       │       ├───Navbar
│       │       └───Sidebar
│       ├───config
│       ├───constants
│       ├───contexts
│       ├───features
│       │   └───auth
│       │       └───components
│       ├───hooks
│       ├───pages
│       │   ├───AcademicHub
│       │   │   └───components
│       │   ├───AICollections
│       │   │   └───components
│       │   ├───BlockchainAnalysis
│       │   │   └───components
│       │   ├───Explore
│       │   ├───FinanceManager
│       │   │   └───components
│       │   ├───HelpCenter
│       │   └───StudyChat
│       │       └───components
│       ├───services
│       │   └───api
│       ├───styles
│       └───utils
└───server
    └───result

```

## License

This project is licensed under the Apache License - see the LICENSE file for details.
