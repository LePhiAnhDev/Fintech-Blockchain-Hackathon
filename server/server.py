import os
import sys
sys.stdout.reconfigure(encoding='utf-8')
import asyncio
import time
import logging
import psutil
import torch
from datetime import datetime
from typing import Dict, List, Any, Optional
from contextlib import asynccontextmanager

# Import dotenv to load environment variables
from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()

import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

# Import models and services
from models import (
    HealthResponse, 
    FinanceCommand, FinanceResponse, FinanceInsightsRequest, FinanceInsightsResponse,
    WalletAnalysisRequest, BlockchainAnalysisResponse,
    StudyChatRequest, StudyChatResponse,
    ModelsStatusResponse, ModelStatus,
    ErrorResponse, ErrorDetail,
    StatsResponse, UsageStats,
    GenerativeArtRequest, GenerativeArtResponse,
    GenerativeVideoRequest, GenerativeVideoResponse,
    StreamingGenerativeRequest, StreamingGenerativeResponse,
    ModelLoadRequest, ModelLoadResponse, ModelUnloadRequest,
    SmartPlanningRequest, SmartPlanningResponse
)

from blockchain_analyzer import blockchain_service
from study_chat import StudyChatService
from finance_manager import finance_service, query_generator
from generative_service import generative_service
from model_manager import model_manager

# Configure logging
logging.basicConfig(
    level=logging.INFO if os.getenv("DEBUG", "True").lower() == "true" else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('ai_server.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# Global state
app_state = {
    'start_time': time.time(),
    'request_count': 0,
    'service_stats': {
        'finance_requests': 0,
        'blockchain_requests': 0,
        'study_requests': 0,
        'generative_art_requests': 0,
        'generative_video_requests': 0,
        'streaming_generative_requests': 0,
        'errors': 0
    },
    'models_loaded': {
        'fraud_detector': False,
        'llm_blockchain': False,
        'llm_study': False,
        'generative_art': False,
        'generative_video': False,
        'streaming_generative': False
    }
}

# Rate limiting storage (simple in-memory)
rate_limit_storage = {}

study_service = StudyChatService()

# Initialize services
async def initialize_services():
    """Initialize all AI services"""
    logger.info("🚀 Starting AI Server initialization...")
    
    try:
        # Initialize blockchain analysis service
        logger.info("📊 Initializing Blockchain Analysis Service...")
        blockchain_init = await blockchain_service.initialize()
        app_state['models_loaded']['fraud_detector'] = blockchain_init
        app_state['models_loaded']['llm_blockchain'] = blockchain_init
        
        if blockchain_init:
            logger.info("✅ Blockchain Analysis Service ready")
        else:
            logger.warning("⚠️ Blockchain Analysis Service failed to initialize")
        
        # Initialize study chat service
        logger.info("📚 Initializing Study Chat Service...")
        study_init = await study_service.initialize()
        app_state['models_loaded']['llm_study'] = study_init
        
        if study_init:
            logger.info("✅ Study Chat Service ready")
        else:
            logger.warning("⚠️ Study Chat Service failed to initialize")
        
        # Finance service is always ready
        logger.info("💰 Finance AI Service ready")
        
        logger.info("🎉 AI Server initialization completed!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Initialization failed: {e}")
        return False

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    # Startup
    await initialize_services()
    asyncio.create_task(cleanup_task())  
    yield
    # Shutdown
    logger.info("🔄 Shutting down AI Server...")

# Create FastAPI app
app = FastAPI(
    title="Student AI Server",
    description="AI-powered backend for student finance, blockchain analysis, and study assistance",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Middleware
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5001,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0"]
)

# Simple rate limiting function
def check_rate_limit(client_ip: str) -> bool:
    """Simple rate limiting check"""
    current_time = time.time()
    max_requests = int(os.getenv("MAX_REQUESTS_PER_MINUTE", "30"))
    
    if client_ip not in rate_limit_storage:
        rate_limit_storage[client_ip] = []
    
    # Clean old requests (older than 1 minute)
    rate_limit_storage[client_ip] = [
        req_time for req_time in rate_limit_storage[client_ip]
        if current_time - req_time < 60
    ]
    
    # Check rate limit
    if len(rate_limit_storage[client_ip]) >= max_requests:
        return False
    
    # Add current request
    rate_limit_storage[client_ip].append(current_time)
    return True

# Request tracking middleware
@app.middleware("http")
async def track_requests(request: Request, call_next):
    """Track request statistics"""
    start_time = time.time()
    app_state['request_count'] += 1
    
    # Simple rate limiting
    client_ip = request.client.host
    if not check_rate_limit(client_ip):
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Maximum 30 requests per minute."}
        )
    
    logger.info(f"📨 {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        app_state['service_stats']['errors'] += 1
        logger.error(f"❌ Request error: {e}")
        raise
    finally:
        processing_time = time.time() - start_time
        logger.info(f"✅ {request.method} {request.url.path} - {processing_time:.3f}s")

# Exception handlers
@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    """Handle validation errors"""
    logger.error(f"❌ Validation error: {exc}")
    
    errors = []
    for error in exc.errors():
        field_name = ".".join(str(x) for x in error["loc"])
        error_msg = error["msg"]
        
        # Make error messages more user-friendly
        if "wallet_address" in field_name:
            if "invalid characters" in error_msg.lower():
                error_msg = "Địa chỉ ví chứa ký tự không hợp lệ. Chỉ chấp nhận ký tự hex (0-9, a-f, A-F)."
            elif "42 characters" in error_msg:
                error_msg = "Địa chỉ ví phải có đúng 42 ký tự (bao gồm 0x)."
            elif "required" in error_msg.lower():
                error_msg = "Vui lòng nhập địa chỉ ví Ethereum."
        
        errors.append(ErrorDetail(
            field=field_name,
            message=error_msg,
            code=error["type"]
        ))
    
    error_response = ErrorResponse(
        message="Dữ liệu đầu vào không hợp lệ",
        errors=errors
    )
    return JSONResponse(
        status_code=422,
        content=error_response.model_dump(mode='json')  # Use model_dump with json mode for proper datetime serialization
    )

@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    error_response = ErrorResponse(message=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump(mode='json')  # Use model_dump with json mode for proper datetime serialization
    )

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    uptime = time.time() - app_state['start_time']
    
    return HealthResponse(
        service="Student AI Server",
        version="1.0.0",
        status="healthy",
        uptime=uptime,
        models_loaded=app_state['models_loaded']
    )

# Models status endpoint
@app.get("/models/status", response_model=ModelsStatusResponse)
async def get_models_status():
    """Get status of all loaded models"""
    models = []
    
    models.append(ModelStatus(
        name="Fraud Detection (XGBoost)",
        loaded=app_state['models_loaded']['fraud_detector'],
        loading_time=None,
        memory_usage=None
    ))
    
    models.append(ModelStatus(
        name="Blockchain Analysis LLM",
        loaded=app_state['models_loaded']['llm_blockchain'],
        loading_time=None,
        memory_usage=None
    ))
    
    models.append(ModelStatus(
        name="Study Assistant LLM",
        loaded=app_state['models_loaded']['llm_study'],
        loading_time=None,
        memory_usage=None
    ))
    
    # Get system memory info
    memory_info = psutil.virtual_memory()
    gpu_available = False
    gpu_memory = None
    
    try:
        import torch
        gpu_available = torch.cuda.is_available()
        if gpu_available:
            gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3  # GB
    except ImportError:
        pass
    
    return ModelsStatusResponse(
        models=models,
        total_memory_usage=memory_info.used / 1024**3,  # GB
        gpu_available=gpu_available,
        gpu_memory_usage=gpu_memory
    )

# Finance AI endpoints
@app.post("/finance-ai", response_model=FinanceResponse)
async def process_finance_command(request: FinanceCommand):
    """Process finance command with AI"""
    try:
        app_state['service_stats']['finance_requests'] += 1
        
        # Parse command to check if it's a query
        parsed_transaction = finance_service.parser.parse_command(request.command)
        
        # Check if it's a query command
        if parsed_transaction and parsed_transaction.category == 'query':
            query_type = parsed_transaction.type
            
            # Create a simple response indicating this needs backend data
            return FinanceResponse(
                transaction=parsed_transaction,
                response_text=f"QUERY:{query_type}",  # Special marker for frontend
                parsed_successfully=True,
                confidence=parsed_transaction.confidence
            )
        
        # Process normal transaction commands
        response = await finance_service.process_command(request.command)
        return response
    except Exception as e:
        logger.error(f"Finance AI error: {e}")
        app_state['service_stats']['errors'] += 1
        raise HTTPException(status_code=500, detail=f"Finance processing failed: {str(e)}")

@app.post("/finance-insights", response_model=FinanceInsightsResponse)
async def generate_finance_insights(request: FinanceInsightsRequest):
    """Generate financial insights from transaction data"""
    try:
        response = await finance_service.generate_insights(request.transactions, request.period)
        return response
    except Exception as e:
        logger.error(f"Finance insights error: {e}")
        app_state['service_stats']['errors'] += 1
        raise HTTPException(status_code=500, detail=f"Insights generation failed: {str(e)}")

@app.post("/finance-query")
async def process_finance_query(request: Dict[str, Any]):
    """Process special finance queries (daily expenses, monthly summary, etc.)"""
    try:
        app_state['service_stats']['finance_requests'] += 1
        
        query_type = request.get('query_type')
        data = request.get('data', {})
        
        if query_type == 'daily_expenses':
            response_text = query_generator.generate_daily_expense_response(data)
        elif query_type == 'monthly_expenses':
            response_text = query_generator.generate_monthly_expense_response(data)
        elif query_type == 'today_summary':
            response_text = query_generator.generate_today_summary_response(data)
        else:
            response_text = "❌ Không hiểu loại query này. Vui lòng thử lại!"
        
        return {
            "success": True,
            "response_text": response_text,
            "query_type": query_type
        }
        
    except Exception as e:
        logger.error(f"Finance query error: {e}")
        app_state['service_stats']['errors'] += 1
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")

@app.post("/smart-planning", response_model=SmartPlanningResponse)
async def generate_smart_plan(request: SmartPlanningRequest):
    """Generate smart financial planning using Gemini AI"""
    start_time = time.time()
    app_state['service_stats']['finance_requests'] += 1
    
    try:
        logger.info(f"📊 Generating smart plan for goal: {request.goal_type}")
        
        # Import Google Generative AI
        import google.generativeai as genai
        
        # Configure Gemini API
        api_key = os.getenv("GOOGLE_API_KEY", "GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found")
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash-exp"))
        
        # Prepare financial analysis from user data
        financial_data = request.financial_summary
        total_income = financial_data.get('total_income', 0)
        total_expenses = financial_data.get('total_expenses', 0)
        net_amount = financial_data.get('net_amount', 0)
        category_breakdown = financial_data.get('category_breakdown', {})
        
        # Format category breakdown for AI
        category_text = ""
        if category_breakdown:
            category_text = "\nCác khoản đã chi:\n"
            for category, amount in category_breakdown.items():
                category_text += f"- {category}: {amount:,.0f} ₫\n"
        
        # Create detailed prompt based on goal type
        if request.goal_type == "savings":
            prompt = f"""
Bạn là chuyên gia tư vấn tài chính cho sinh viên Việt Nam. Dựa trên thông tin tài chính sau, hãy tạo kế hoạch tiết kiệm chi tiết và thực tế:

**THÔNG TIN TÀI CHÍNH HIỆN TẠI:**
- Tổng thu nhập: {total_income:,.0f} ₫{category_text}
- Tổng chi bắt buộc: {total_expenses:,.0f} ₫
- Mỗi tháng còn dư: {net_amount:,.0f} ₫

**YÊU CẦU:**
Hãy phân tích và đưa ra kế hoạch tiết kiệm bao gồm:

1. **Phân tích tình hình tài chính hiện tại**
   - Đánh giá khả năng tiết kiệm
   - Tỷ lệ chi tiêu/thu nhập
   - Các khoản chi có thể tối ưu

2. **Gợi ý phương án tiết kiệm cụ thể**
   - Mục tiêu tiết kiệm hàng tháng (số tiền cụ thể)
   - Chia theo tuần để dễ thực hiện
   - Các mục tiêu phù hợp sinh viên (laptop, du lịch, dự phòng)

3. **Chiến lược tiết kiệm thông minh**
   - Cách cắt giảm chi tiêu không cần thiết
   - Lời khuyên về thói quen chi tiêu
   - Phương pháp 50/30/20 hoặc tương tự

4. **Dự đoán thời gian đạt mục tiêu**
   - Thời gian để có 10 triệu (mua laptop)
   - Thời gian để có 20 triệu (du lịch/khóa học)
   - Thời gian để có quỹ dự phòng 3 tháng

5. **Cảnh báo và lời khuyên**
   - Rủi ro tài chính cần tránh
   - Cách duy trì động lực tiết kiệm
   - Tips thực tế cho sinh viên

Trả lời bằng tiếng Việt, sử dụng emoji và format markdown để dễ đọc.
"""
        else:  # investment
            prompt = f"""
Bạn là chuyên gia tư vấn đầu tư cho sinh viên Việt Nam. Dựa trên thông tin tài chính sau, hãy tạo kế hoạch đầu tư an toàn và phù hợp:

**THÔNG TIN TÀI CHÍNH HIỆN TẠI:**
- Tổng thu nhập: {total_income:,.0f} ₫{category_text}
- Tổng chi bắt buộc: {total_expenses:,.0f} ₫  
- Mỗi tháng còn dư: {net_amount:,.0f} ₫

**YÊU CẦU:**
Hãy phân tích và đưa ra kế hoạch đầu tư bao gồm:

1. **Đánh giá khả năng đầu tư**
   - Phân tích số tiền có thể đầu tư an toàn
   - Tỷ lệ thu nhập phù hợp cho đầu tư (không quá 30% số dư)
   - Mức rủi ro chấp nhận được

2. **Các hình thức đầu tư an toàn cho sinh viên**
   - Gửi tiết kiệm kỳ hạn (lãi suất hiện tại ~6-7%/năm)
   - Ví điện tử có lãi (Momo, ViettelPay)
   - Trái phiếu chính phủ
   - Quỹ mở (bond fund, balanced fund)
   - Vàng SJC (đầu tư dài hạn)

3. **Phân bổ danh mục đầu tư**
   - Tỷ lệ phân bổ theo từng kênh (70% an toàn, 30% tăng trưởng)
   - Số tiền cụ thể cho từng hình thức
   - Thời gian đầu tư phù hợp

4. **Lộ trình đầu tư từng bước**
   - Bước 1: Xây dựng quỹ dự phòng (3-6 tháng)
   - Bước 2: Đầu tư an toàn (gửi tiết kiệm)
   - Bước 3: Mở rộng sang các kênh khác

5. **Cảnh báo rủi ro và lời khuyên**
   - Các bẫy đầu tư cần tránh (HYIP, đa cấp, crypto rủi ro cao)
   - Nguyên tắc "đừng bao giờ đầu tư tiền không thể mất được"
   - Tầm quan trọng của việc học hỏi trước khi đầu tư

6. **Dự đoán lợi nhuận**
   - Tính toán lợi nhuận dự kiến theo từng năm
   - So sánh với lạm phát (~3-4%/năm)
   - Thời gian để đạt các mục tiêu tài chính

Trả lời bằng tiếng Việt, sử dụng emoji và format markdown. Đưa ra các con số cụ thể và thực tế.
"""

        # Generate response from Gemini
        response = model.generate_content(prompt)
        
        if not response.text:
            raise ValueError("Không thể tạo kế hoạch từ AI")
        
        processing_time = time.time() - start_time
        
        logger.info(f"✅ Smart planning generated successfully - {processing_time:.3f}s")
        
        return SmartPlanningResponse(
            plan=response.text,
            goal_type=request.goal_type,
            recommendations=[],
            risk_assessment="",
            timeline="",
            processing_time=processing_time
        )
    
    except Exception as e:
        logger.error(f"❌ Smart planning error: {e}")
        app_state['service_stats']['errors'] += 1
        
        # Fallback response
        fallback_plan = f"""
## 🚫 Lỗi tạo kế hoạch

Xin lỗi, hiện tại không thể tạo kế hoạch thông minh do lỗi hệ thống: {str(e)}

### 🔄 Vui lòng thử lại sau hoặc:
- Kiểm tra kết nối internet
- Liên hệ hỗ trợ nếu lỗi tiếp tục

### 💡 Lời khuyên cơ bản cho {request.goal_type}:
{"Tập trung vào việc tiết kiệm 20-30% thu nhập hàng tháng và thiết lập mục tiêu cụ thể." if request.goal_type == "savings" else "Bắt đầu với các hình thức đầu tư an toàn như gửi tiết kiệm kỳ hạn trước khi chuyển sang các kênh rủi ro cao hơn."}
"""
        
        return SmartPlanningResponse(
            plan=fallback_plan,
            goal_type=request.goal_type,
            recommendations=[],
            risk_assessment="Cần xem xét lại do lỗi hệ thống",
            timeline="",
            processing_time=time.time() - start_time
        )

# Blockchain analysis endpoints - POST METHOD
@app.post("/analyze-wallet", response_model=BlockchainAnalysisResponse)
async def analyze_wallet_post(wallet_request: WalletAnalysisRequest):
    """Analyze blockchain wallet for fraud detection (POST method)"""
    try:
        app_state['service_stats']['blockchain_requests'] += 1
        
        wallet_address = wallet_request.wallet_address
        logger.info(f"🔍 POST Analysis request for: {wallet_address}")
        
        response = await blockchain_service.analyze_wallet(wallet_address)
        
        logger.info(f"✅ POST Analysis completed for {wallet_address}")
        logger.info(f"📊 Risk Level: {response.risk_level}, Fraud Probability: {response.fraud_probability}%")
        
        return response
        
    except Exception as e:
        logger.error(f"❌ POST Analysis error for {wallet_request.wallet_address}: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        
        app_state['service_stats']['errors'] += 1
        
        # Return user-friendly error message
        error_msg = str(e)
        if "API limit" in error_msg or "rate limit" in error_msg.lower():
            error_msg = "Đã vượt quá giới hạn API. Vui lòng thử lại sau vài phút."
        elif "network" in error_msg.lower() or "connection" in error_msg.lower():
            error_msg = "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet."
        elif "invalid" in error_msg.lower():
            error_msg = "Địa chỉ ví không hợp lệ hoặc không tồn tại."
        else:
            error_msg = "Không thể phân tích ví. Vui lòng thử lại sau."
        
        raise HTTPException(status_code=500, detail=error_msg)

# Blockchain analysis endpoints - GET METHOD for API docs
@app.get("/analyze-wallet", response_model=BlockchainAnalysisResponse)
async def analyze_wallet_get(wallet_address: str):
    """Analyze blockchain wallet for fraud detection (GET method for API docs testing)"""
    try:
        app_state['service_stats']['blockchain_requests'] += 1
        
        logger.info(f"🔍 GET Analysis request for: {wallet_address}")
        
        # Validate address
        if not wallet_address or not isinstance(wallet_address, str):
            raise HTTPException(status_code=400, detail="wallet_address parameter is required")
        
        # Clean address
        clean_address = wallet_address.strip()
        if not clean_address.startswith('0x'):
            clean_address = '0x' + clean_address
            
        # Basic validation
        if len(clean_address) != 42:
            raise HTTPException(status_code=400, detail="Địa chỉ ví phải có đúng 42 ký tự (bao gồm 0x)")
            
        import re
        hex_pattern = r'^0x[a-fA-F0-9]{40}$'
        if not re.match(hex_pattern, clean_address):
            raise HTTPException(status_code=400, detail="Địa chỉ ví chứa ký tự không hợp lệ")
        
        response = await blockchain_service.analyze_wallet(clean_address)
        
        logger.info(f"✅ GET Analysis completed for {wallet_address}")
        logger.info(f"📊 Risk Level: {response.risk_level}, Fraud Probability: {response.fraud_probability}%")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ GET Analysis error for {wallet_address}: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        
        app_state['service_stats']['errors'] += 1
        
        error_msg = str(e)
        if "API limit" in error_msg or "rate limit" in error_msg.lower():
            error_msg = "Đã vượt quá giới hạn API. Vui lòng thử lại sau vài phút."
        elif "network" in error_msg.lower() or "connection" in error_msg.lower():
            error_msg = "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet."
        elif "invalid" in error_msg.lower():
            error_msg = "Địa chỉ ví không hợp lệ hoặc không tồn tại."
        else:
            error_msg = "Không thể phân tích ví. Vui lòng thử lại sau."
        
        raise HTTPException(status_code=500, detail=error_msg)

# Study chat endpoints
@app.post("/study-chat", response_model=StudyChatResponse)
async def study_chat(request: StudyChatRequest):
    """Process study chat message"""
    try:
        app_state['service_stats']['study_requests'] += 1
        
        if not study_service.is_initialized:
            raise HTTPException(
                status_code=503,
                detail="Study chat service not available. Please try again later."
            )
        
        response = await study_service.process_message(request)
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Study chat error: {e}")
        app_state['service_stats']['errors'] += 1
        raise HTTPException(status_code=500, detail=f"Study chat failed: {str(e)}")

# AI Collections endpoints
@app.post("/generate-art", response_model=GenerativeArtResponse)
async def generate_art(request: GenerativeArtRequest):
    """Generate art using prompthero/openjourney model"""
    try:
        app_state['service_stats']['generative_art_requests'] += 1
        logger.info(f"🎨 Art generation request: {request.prompt[:50]}...")
        
        response = await generative_service.generate_art(request)
        
        if response.success:
            app_state['models_loaded']['generative_art'] = True
            logger.info(f"✅ Art generated successfully in {response.processing_time:.2f}s")
        else:
            app_state['service_stats']['errors'] += 1
            
        return response
        
    except Exception as e:
        logger.error(f"❌ Art generation error: {e}")
        app_state['service_stats']['errors'] += 1
        raise HTTPException(status_code=500, detail=f"Art generation failed: {str(e)}")

@app.post("/generate-video", response_model=GenerativeVideoResponse)
async def generate_video(request: GenerativeVideoRequest):
    """Generate video using AnimateDiff-Lightning model"""
    try:
        app_state['service_stats']['generative_video_requests'] += 1
        logger.info(f"🎬 Video generation request: {request.prompt[:50]}...")
        
        response = await generative_service.generate_video(request)
        
        if response.success:
            app_state['models_loaded']['generative_video'] = True
            # Set video URL if video was generated successfully
            if response.video_filename:
                response.video_url = f"/videos/{response.video_filename}"
            logger.info(f"✅ Video generated successfully in {response.processing_time:.2f}s")
        else:
            app_state['service_stats']['errors'] += 1
            
        return response
        
    except Exception as e:
        logger.error(f"❌ Video generation error: {e}")
        app_state['service_stats']['errors'] += 1
        raise HTTPException(status_code=500, detail=f"Video generation failed: {str(e)}")

@app.post("/generate-streaming", response_model=StreamingGenerativeResponse)
async def generate_streaming(request: StreamingGenerativeRequest):
    """Generate streaming art using SDXL-Turbo model"""
    try:
        app_state['service_stats']['streaming_generative_requests'] += 1
        logger.info(f"⚡ Streaming generation request: {request.prompt[:50]}...")
        
        response = await generative_service.generate_streaming(request)
        
        if response.success:
            app_state['models_loaded']['streaming_generative'] = True
            logger.info(f"✅ Streaming image generated successfully in {response.processing_time:.2f}s")
        else:
            app_state['service_stats']['errors'] += 1
            
        return response
        
    except Exception as e:
        logger.error(f"❌ Streaming generation error: {e}")
        app_state['service_stats']['errors'] += 1
        raise HTTPException(status_code=500, detail=f"Streaming generation failed: {str(e)}")

# Video streaming endpoint
@app.get("/videos/{filename}")
async def stream_video(filename: str):
    """Stream video files for AI Collections"""
    try:
        # Security: validate filename
        if not filename.endswith('.mp4') or '/' in filename or '\\' in filename:
            raise HTTPException(status_code=400, detail="Invalid filename")
        
        # Use absolute path to match where videos are saved
        videos_dir = os.path.abspath("videos")
        video_path = os.path.join(videos_dir, filename)
        
        # Check if file exists
        if not os.path.exists(video_path):
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Return video file with proper streaming headers
        from fastapi.responses import FileResponse
        
        return FileResponse(
            path=video_path,
            media_type="video/mp4",
            headers={
                "Accept-Ranges": "bytes",
                "Content-Type": "video/mp4",
                "Cache-Control": "public, max-age=3600"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error streaming video {filename}: {e}")
        raise HTTPException(status_code=500, detail="Failed to stream video")

# Model management endpoints
@app.post("/models/load", response_model=ModelLoadResponse)
async def load_model(request: ModelLoadRequest):
    """Load a specific model"""
    try:
        logger.info(f"📥 Loading model: {request.model_type}")
        
        response = await model_manager.load_model(request.model_type, request.force_reload)
        
        if response.loaded:
            app_state['models_loaded'][request.model_type] = True
            logger.info(f"✅ Model {request.model_type} loaded successfully")
        else:
            logger.error(f"❌ Failed to load model {request.model_type}: {response.error}")
            
        return response
        
    except Exception as e:
        logger.error(f"❌ Model loading error: {e}")
        raise HTTPException(status_code=500, detail=f"Model loading failed: {str(e)}")

@app.post("/models/unload")
async def unload_model(request: ModelUnloadRequest):
    """Unload a specific model"""
    try:
        logger.info(f"📥 Unloading model: {request.model_type}")
        
        success = await model_manager.unload_model(request.model_type)
        
        if success:
            app_state['models_loaded'][request.model_type] = False
            logger.info(f"✅ Model {request.model_type} unloaded successfully")
            return {"success": True, "message": f"Model {request.model_type} unloaded successfully"}
        else:
            return {"success": False, "message": f"Failed to unload model {request.model_type}"}
            
    except Exception as e:
        logger.error(f"❌ Model unloading error: {e}")
        raise HTTPException(status_code=500, detail=f"Model unloading failed: {str(e)}")

@app.post("/models/clear-all")
async def clear_all_models():
    """Force clear ALL models in the entire system and GPU memory"""
    start_time = time.time()
    logger.info(f"📨 POST /models/clear-all")
    
    try:
        logger.info("🧹 Force clearing ALL SYSTEM models and memory...")
        
        # 1. Clear AI Collections models
        await model_manager.unload_all_except(None)
        
        # 2. Clear blockchain and study models - PROPERLY
        logger.info("🔥 Clearing blockchain and study models...")
        
        # Clear blockchain service models
        try:
            if hasattr(blockchain_service, 'fraud_model') and blockchain_service.fraud_model is not None:
                del blockchain_service.fraud_model
                blockchain_service.fraud_model = None
                logger.info("🗑️ Cleared fraud_model")
        except Exception as e:
            logger.warning(f"⚠️ Error clearing fraud_model: {e}")
            
        try:
            if hasattr(blockchain_service, 'llm_tokenizer') and blockchain_service.llm_tokenizer is not None:
                del blockchain_service.llm_tokenizer
                blockchain_service.llm_tokenizer = None
                logger.info("🗑️ Cleared llm_tokenizer")
        except Exception as e:
            logger.warning(f"⚠️ Error clearing llm_tokenizer: {e}")
            
        try:
            if hasattr(blockchain_service, 'llm_model') and blockchain_service.llm_model is not None:
                # Move model to CPU before deletion
                try:
                    blockchain_service.llm_model.to('cpu')
                    logger.info("🔄 Moved llm_model to CPU")
                except:
                    pass
                del blockchain_service.llm_model
                blockchain_service.llm_model = None
                logger.info("🗑️ Cleared llm_model")
        except Exception as e:
            logger.warning(f"⚠️ Error clearing llm_model: {e}")
            
        # Clear study service models  
        try:
            if hasattr(study_service, 'tokenizer') and study_service.tokenizer is not None:
                del study_service.tokenizer
                study_service.tokenizer = None
                logger.info("🗑️ Cleared study tokenizer")
        except Exception as e:
            logger.warning(f"⚠️ Error clearing study tokenizer: {e}")
            
        try:
            if hasattr(study_service, 'model') and study_service.model is not None:
                # Move model to CPU before deletion
                try:
                    study_service.model.to('cpu')
                    logger.info("🔄 Moved study model to CPU")
                except:
                    pass
                del study_service.model
                study_service.model = None
                logger.info("🗑️ Cleared study model")
        except Exception as e:
            logger.warning(f"⚠️ Error clearing study model: {e}")
        
        # Force clear other blockchain service attributes
        try:
            blockchain_service.is_initialized = False
            logger.info("🔄 Reset blockchain service initialization state")
        except Exception as e:
            logger.warning(f"⚠️ Error resetting blockchain service: {e}")
            
        # Force clear other study service attributes
        try:
            study_service.is_initialized = False
            logger.info("🔄 Reset study service initialization state")
        except Exception as e:
            logger.warning(f"⚠️ Error resetting study service: {e}")
        
        # 3. Reset all app state
        for model_type in app_state['models_loaded']:
            app_state['models_loaded'][model_type] = False
        
        # 4. Aggressive GPU memory cleanup
        from model_manager import force_clear_gpu_memory, get_gpu_memory_info
        import gc
        
        # Python garbage collection
        collected = gc.collect()
        logger.info(f"🗑️ Python GC collected {collected} objects")
        
        # GPU memory cleanup
        force_clear_gpu_memory()
        
        # Additional aggressive cleanup
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.ipc_collect()
            torch.cuda.reset_peak_memory_stats()
            torch.cuda.reset_accumulated_memory_stats()
            torch.cuda.synchronize()
            logger.info("💥 Performed nuclear GPU cleanup")
        
        memory_info = get_gpu_memory_info() if torch.cuda.is_available() else "CPU mode"
        
        processing_time = time.time() - start_time
        logger.info(f"✅ POST /models/clear-all - {processing_time:.3f}s")
        logger.info(f"📊 Memory after NUCLEAR clear: {memory_info}")
        
        return {
            "success": True,
            "message": "ALL system models cleared successfully (nuclear cleanup)",
            "memory_info": memory_info,
            "processing_time": processing_time,
            "cleared_objects": collected
        }
        
    except Exception as e:
        logger.error(f"❌ Error clearing all models: {e}")
        return {
            "success": False,
            "message": f"Error clearing models: {str(e)}",
            "processing_time": time.time() - start_time
        }

@app.get("/models/manager-status")
async def get_model_manager_status():
    """Get detailed model manager status"""
    try:
        status = await model_manager.get_status()
        return {
            "success": True,
            "data": status
        }
    except Exception as e:
        logger.error(f"❌ Error getting model manager status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get model status: {str(e)}")

# Statistics endpoint
@app.get("/stats", response_model=StatsResponse)
async def get_server_stats():
    """Get server statistics"""
    uptime = time.time() - app_state['start_time']
    
    total_service_requests = sum([
        app_state['service_stats']['finance_requests'],
        app_state['service_stats']['blockchain_requests'],
        app_state['service_stats']['study_requests']
    ])
    
    error_rate = (app_state['service_stats']['errors'] / max(total_service_requests, 1)) * 100
    
    cpu_percent = psutil.cpu_percent()
    memory_info = psutil.virtual_memory()
    disk_info = psutil.disk_usage('/')
    
    stats = UsageStats(
        total_requests=app_state['request_count'],
        finance_requests=app_state['service_stats']['finance_requests'],
        blockchain_requests=app_state['service_stats']['blockchain_requests'],
        study_requests=app_state['service_stats']['study_requests'],
        error_rate=error_rate,
        avg_response_time=0.0,
        uptime=uptime
    )
    
    models_status = [
        ModelStatus(name="Fraud Detection", loaded=app_state['models_loaded']['fraud_detector']),
        ModelStatus(name="Blockchain LLM", loaded=app_state['models_loaded']['llm_blockchain']),
        ModelStatus(name="Study LLM", loaded=app_state['models_loaded']['llm_study'])
    ]
    
    system_info = {
        'cpu_usage': cpu_percent,
        'memory_usage': memory_info.percent,
        'disk_usage': disk_info.percent,
        'available_memory_gb': memory_info.available / 1024**3,
        'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    }
    
    return StatsResponse(
        stats=stats,
        models_status=models_status,
        system_info=system_info
    )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "Student AI Server",
        "version": "1.0.0",
        "description": "AI-powered backend for Vietnamese students",
        "endpoints": {
            "health": "/health",
            "blockchain": "/analyze-wallet",
            "models": "/models/status",
            "docs": "/docs"
        },
        "uptime_seconds": time.time() - app_state['start_time'],
        "models_loaded": app_state['models_loaded']
    }

# Background task for cleanup
async def cleanup_task():
    """Background cleanup task"""
    while True:
        try:
            current_time = time.time()
            for client_ip in list(rate_limit_storage.keys()):
                rate_limit_storage[client_ip] = [
                    req_time for req_time in rate_limit_storage[client_ip]
                    if current_time - req_time < 300
                ]
                
                if not rate_limit_storage[client_ip]:
                    del rate_limit_storage[client_ip]
            
            await asyncio.sleep(300)  # Run every 5 minutes
            
        except Exception as e:
            logger.error(f"Cleanup task error: {e}")
            await asyncio.sleep(60)

if __name__ == "__main__":
    # Get configuration from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    logger.info(f"🚀 Starting Student AI Server on {host}:{port} (debug={debug})...")
    
    uvicorn.run(
        "server:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if debug else "warning",
        access_log=True
    )
