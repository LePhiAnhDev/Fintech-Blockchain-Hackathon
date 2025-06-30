from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base response model
class BaseResponse(BaseModel):
    success: bool = True
    message: str = "Request processed successfully"
    timestamp: datetime = Field(default_factory=datetime.now)

# Health check models
class HealthResponse(BaseResponse):
    service: str = "Student AI Server"
    version: str = "1.0.0"
    status: str = "healthy"
    uptime: float = 0.0
    models_loaded: Dict[str, bool] = {}
    
# Finance AI models
class FinanceCommand(BaseModel):
    command: str = Field(..., min_length=1, max_length=1000, description="Finance command to process")
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class TransactionData(BaseModel):
    type: str = Field(..., description="Transaction type: income or expense")
    amount: float = Field(..., gt=0, description="Transaction amount")
    description: str = Field(..., min_length=1, max_length=500, description="Transaction description")
    category: Optional[str] = None
    confidence: Optional[float] = Field(None, ge=0, le=1)

class FinanceResponse(BaseResponse):
    transaction: Optional[TransactionData] = None
    response_text: str = ""
    parsed_successfully: bool = True
    confidence: float = 0.95

class FinanceInsightsRequest(BaseModel):
    transactions: List[Dict[str, Any]] = []
    period: str = Field(default="month", pattern="^(week|month|quarter|year)$")

class FinanceInsightsResponse(BaseResponse):
    insights: List[str] = []
    recommendations: List[str] = []
    trends: Dict[str, Any] = {}
    summary: str = ""

# Blockchain Analysis models
class WalletAnalysisRequest(BaseModel):
    wallet_address: str = Field(..., min_length=1, description="Ethereum wallet address")
    
    @validator('wallet_address')
    def validate_address(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError('Wallet address is required')
            
        # Clean the address
        v = v.strip()
        
        if not v:
            raise ValueError('Wallet address cannot be empty')
        
        # Add 0x prefix if missing
        if not v.startswith('0x'):
            v = '0x' + v
            
        # Check length (should be 42 characters: 0x + 40 hex chars)
        if len(v) != 42:
            raise ValueError(f'Ethereum address must be 42 characters long (including 0x prefix). Got {len(v)} characters.')
            
        # Check if it contains only valid hex characters
        hex_part = v[2:]  # Remove 0x prefix
        if not all(c in '0123456789abcdefABCDEF' for c in hex_part):
            raise ValueError('Ethereum address contains invalid characters. Only hex characters (0-9, a-f, A-F) are allowed.')
            
        return v.lower()  # Return normalized lowercase address

    class Config:
        json_schema_extra = {
            "example": {
                "wallet_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
            }
        }

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    UNKNOWN = "UNKNOWN"

class PredictionType(str, Enum):
    NORMAL = "NORMAL"
    FRAUDULENT = "FRAUDULENT"

class ConfidenceLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class BlockchainAnalysisResponse(BaseResponse):
    address: str
    risk_level: RiskLevel
    fraud_probability: float = Field(..., ge=0, le=100)
    prediction: PredictionType
    confidence: ConfidenceLevel
    data_source: str = "Live Blockchain (Etherscan)"
    account_age: str = ""
    current_balance: str = ""
    total_received: str = ""
    total_transactions: int = 0
    unique_senders: int = 0
    avg_send_interval: str = ""
    summarize: str = ""

# Study Chat models
class StudyChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000, description="Study question or message")
    conversation_id: Optional[str] = None
    subject: Optional[str] = None
    difficulty: Optional[str] = Field(None, pattern="^(beginner|intermediate|advanced)$")
    language: str = Field(default="vi", pattern="^(vi|en)$")

class StudyChatResponse(BaseResponse):
    response: str = Field(..., description="AI response to the study question")
    conversation_id: Optional[str] = None
    subject_detected: Optional[str] = None
    confidence: float = Field(default=0.95, ge=0, le=1)
    follow_up_questions: List[str] = []
    related_topics: List[str] = []
    processing_time: float = 0.0

# Model loading status
class ModelStatus(BaseModel):
    name: str
    loaded: bool = False
    loading_time: Optional[float] = None
    error: Optional[str] = None
    memory_usage: Optional[float] = None

class ModelsStatusResponse(BaseResponse):
    models: List[ModelStatus] = []
    total_memory_usage: float = 0.0
    gpu_available: bool = False
    gpu_memory_usage: Optional[float] = None

# Error models
class ErrorDetail(BaseModel):
    field: str
    message: str
    code: Optional[str] = None

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    errors: Optional[List[ErrorDetail]] = None
    timestamp: datetime = Field(default_factory=datetime.now)

# Batch processing models
class BatchRequest(BaseModel):
    requests: List[Union[FinanceCommand, WalletAnalysisRequest, StudyChatRequest]]
    batch_id: Optional[str] = None

class BatchResponse(BaseResponse):
    batch_id: str
    total_requests: int
    successful: int
    failed: int
    results: List[Union[FinanceResponse, BlockchainAnalysisResponse, StudyChatResponse]]
    processing_time: float

# Configuration models
class ServerConfig(BaseModel):
    host: str = Field(default_factory=lambda: os.getenv("HOST", "0.0.0.0"))
    port: int = Field(default_factory=lambda: int(os.getenv("PORT", "8000")))
    debug: bool = Field(default_factory=lambda: os.getenv("DEBUG", "True").lower() == "true")
    log_level: str = Field(default_factory=lambda: os.getenv("LOG_LEVEL", "info"))
    max_requests_per_minute: int = Field(default_factory=lambda: int(os.getenv("MAX_REQUESTS_PER_MINUTE", "30")))
    max_concurrent_requests: int = Field(default_factory=lambda: int(os.getenv("MAX_CONCURRENT_REQUESTS", "5")))
    allowed_origins: List[str] = Field(default_factory=lambda: os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5001").split(","))

class ModelConfig(BaseModel):
    fraud_model_path: str = Field(default_factory=lambda: os.getenv("FRAUD_MODEL_PATH", "result/fraud_detection_model.pkl"))
    google_api_key: str = Field(default_factory=lambda: os.getenv("GOOGLE_API_KEY", ""))
    gemini_model_name: str = Field(default_factory=lambda: os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash-exp"))
    blockchain_llm_model: str = Field(default_factory=lambda: os.getenv("BLOCKCHAIN_LLM_MODEL", "google/gemma-2-2b-it"))
    etherscan_api_key: str = Field(default_factory=lambda: os.getenv("ETHERSCAN_API_KEY", "YourAPIKey"))
    etherscan_base_url: str = Field(default_factory=lambda: os.getenv("ETHERSCAN_BASE_URL", "https://api.etherscan.io/api"))
    use_fallback_responses: bool = Field(default_factory=lambda: os.getenv("USE_FALLBACK_RESPONSES", "True").lower() == "true")
    force_cpu_mode: bool = Field(default_factory=lambda: os.getenv("FORCE_CPU_MODE", "False").lower() == "true")
    load_models_on_startup: bool = True
    max_memory_gb: int = 8

# Statistics models
class UsageStats(BaseModel):
    total_requests: int = 0
    finance_requests: int = 0
    blockchain_requests: int = 0
    study_requests: int = 0
    error_rate: float = 0.0
    avg_response_time: float = 0.0
    uptime: float = 0.0

class StatsResponse(BaseResponse):
    stats: UsageStats
    models_status: List[ModelStatus]
    system_info: Dict[str, Any] = {}

# Validation models
class ValidationResult(BaseModel):
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []

# AI Collections models
class GenerativeArtRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000, description="Prompt for image generation")
    num_inference_steps: int = Field(default=70, ge=10, le=100)
    guidance_scale: float = Field(default=5.0, ge=1.0, le=20.0)
    width: int = Field(default=512, ge=256, le=1024)
    height: int = Field(default=512, ge=256, le=1024)

class GenerativeArtResponse(BaseResponse):
    image_base64: str = Field(..., description="Generated image in base64 format")
    prompt_used: str = ""
    processing_time: float = 0.0
    model_used: str = "prompthero/openjourney"

class GenerativeVideoRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000, description="Prompt for video generation")
    num_frames: int = Field(default=32, ge=8, le=64)
    guidance_scale: float = Field(default=1.0, ge=0.5, le=2.0)
    num_inference_steps: int = Field(default=4, ge=1, le=10)
    width: int = Field(default=512, ge=256, le=1024)
    height: int = Field(default=512, ge=256, le=1024)

class GenerativeVideoResponse(BaseResponse):
    video_filename: str = Field(..., description="Generated video filename")
    video_url: str = Field(default="", description="URL to stream the video")
    prompt_used: str = ""
    processing_time: float = 0.0
    num_frames: int = 32
    fps: int = 5
    model_used: str = "ByteDance/AnimateDiff-Lightning"

class StreamingGenerativeRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000, description="Prompt for streaming image generation")
    num_inference_steps: int = Field(default=2, ge=1, le=5)
    guidance_scale: float = Field(default=0.0, ge=0.0, le=1.0)
    width: int = Field(default=512, ge=256, le=1024)
    height: int = Field(default=512, ge=256, le=1024)

class StreamingGenerativeResponse(BaseResponse):
    image_base64: str = Field(..., description="Generated image in base64 format")
    prompt_used: str = ""
    processing_time: float = 0.0
    model_used: str = "stabilityai/sdxl-turbo"

class ModelLoadRequest(BaseModel):
    model_type: str = Field(..., pattern="^(generative_art|generative_video|streaming_generative|blockchain|study_chat)$")
    force_reload: bool = False

class ModelUnloadRequest(BaseModel):
    model_type: str = Field(..., pattern="^(generative_art|generative_video|streaming_generative|blockchain|study_chat)$")

class ModelLoadResponse(BaseResponse):
    model_type: str
    loaded: bool = False
    loading_time: float = 0.0
    memory_usage_mb: float = 0.0
    error: Optional[str] = None

# Cache models
class CacheEntry(BaseModel):
    key: str
    value: Any
    created_at: datetime
    expires_at: Optional[datetime] = None
    hit_count: int = 0

class CacheStats(BaseModel):
    total_entries: int = 0
    hit_rate: float = 0.0
    memory_usage: float = 0.0
    oldest_entry: Optional[datetime] = None

# Smart Planning models
class SmartPlanningRequest(BaseModel):
    financial_summary: Dict[str, Any] = Field(..., description="User's financial data summary")
    goal_type: str = Field(..., pattern="^(savings|investment)$", description="Planning goal: savings or investment")
    user_profile: str = Field(default="student", description="User profile information")
    additional_data: Optional[Dict[str, Any]] = None

class SmartPlanningResponse(BaseResponse):
    plan: str = Field(..., description="AI-generated smart financial plan")
    goal_type: str = ""
    recommendations: List[str] = []
    risk_assessment: str = ""
    timeline: str = ""
    processing_time: float = 0.0