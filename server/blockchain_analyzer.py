import os
import time
import asyncio
import aiohttp
import joblib
import numpy as np
from datetime import datetime
from statistics import mean
from typing import Dict, List, Optional, Any
import logging
import torch
from dotenv import load_dotenv
from models import BlockchainAnalysisResponse, RiskLevel, PredictionType, ConfidenceLevel

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class TrainedFraudDetector:
    """XGBoost fraud detection model"""
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path or os.getenv("FRAUD_MODEL_PATH", "result/fraud_detection_model.pkl")
        self.complete_model = None
        self.is_loaded = False
        
    async def load_models(self) -> bool:
        """Load the trained fraud detection model"""
        try:
            if not os.path.exists(self.model_path):
                logger.warning(f"Model file not found: {self.model_path}. Using fallback logic.")
                self.is_loaded = False
                return True  # Continue without model for demo purposes
                
            logger.info("Loading fraud detection model...")
            self.complete_model = joblib.load(self.model_path)
            
            perf = self.complete_model.get('performance', {})
            logger.info(f"XGBoost model loaded")
            logger.info(f"Performance: F1={perf.get('f1_score', 0):.4f}, AUC={perf.get('auc', 0):.4f}")
            
            self.is_loaded = True
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            logger.warning("Using fallback prediction logic")
            self.is_loaded = False
            return True  # Continue without model
    
    def predict_single_address(self, features_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Predict fraud probability for a single address"""
        if not self.is_loaded or self.complete_model is None:
            return self._fallback_prediction(features_dict)

        try:
            model = self.complete_model['model']
            scaler = self.complete_model['scaler'] 
            feature_selector = self.complete_model['feature_selector']
            feature_names = self.complete_model['feature_names']

            # Prepare features
            feature_values = []
            for feature_name in feature_names:
                feature_values.append(features_dict.get(feature_name, 0))

            X = np.array([feature_values])
            X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)
            X_scaled = scaler.transform(X)
            X_selected = feature_selector.transform(X_scaled)

            # Make prediction
            prediction = model.predict(X_selected)[0]
            probability = model.predict_proba(X_selected)[0][1]

            # Determine risk level and confidence
            if probability > 0.7:
                risk_level = RiskLevel.HIGH
                confidence = ConfidenceLevel.HIGH
            elif probability > 0.3:
                risk_level = RiskLevel.MEDIUM
                confidence = ConfidenceLevel.MEDIUM
            else:
                risk_level = RiskLevel.LOW
                confidence = ConfidenceLevel.HIGH
            
            return {
                'address': features_dict.get('address', 'Unknown'),
                'prediction': int(prediction),
                'probability': float(probability * 100),  # Convert to percentage
                'risk_level': risk_level,
                'confidence': confidence,
                'model_used': 'xgboost',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Model prediction failed: {e}")
            return self._fallback_prediction(features_dict)
    
    def _fallback_prediction(self, features_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback prediction logic when model is not available"""
        logger.info("Using fallback prediction logic")
        
        # Simple rule-based logic for demo
        total_txs = features_dict.get('total transactions (including tnx to create contract', 0)
        unique_senders = features_dict.get('Unique Received From Addresses', 0)
        account_age_mins = features_dict.get('Time Diff between first and last (Mins)', 0)
        balance = features_dict.get('total ether balance', 0)
        
        # Calculate risk score based on simple heuristics
        risk_score = 0
        
        # Low activity might be suspicious
        if total_txs < 10 and account_age_mins > 24 * 60:  # Less than 10 txs but old account
            risk_score += 0.3
            
        # Very few unique senders relative to transactions
        if total_txs > 0 and (unique_senders / total_txs) < 0.1:
            risk_score += 0.2
            
        # Empty or very low balance
        if balance < 0.001:
            risk_score += 0.1
            
        # Very new account with many transactions
        if account_age_mins < 60 and total_txs > 50:  # Less than 1 hour old but many txs
            risk_score += 0.4
            
        # Convert to percentage
        probability = min(risk_score * 100, 100)
        
        # Determine risk level
        if probability > 70:
            risk_level = RiskLevel.HIGH
            confidence = ConfidenceLevel.MEDIUM
            prediction = 1
        elif probability > 30:
            risk_level = RiskLevel.MEDIUM
            confidence = ConfidenceLevel.MEDIUM
            prediction = 0
        else:
            risk_level = RiskLevel.LOW
            confidence = ConfidenceLevel.HIGH
            prediction = 0
        
        return {
            'address': features_dict.get('address', 'Unknown'),
            'prediction': prediction,
            'probability': float(probability),
            'risk_level': risk_level,
            'confidence': confidence,
            'model_used': 'fallback_heuristic',
            'timestamp': datetime.now().isoformat()
        }

class EthereumAnalyzer:
    """Ethereum blockchain data analyzer using Etherscan API"""
    
    def __init__(self, api_key: str = None, rate_limit_delay: float = 0.2):
        self.api_key = api_key or os.getenv("ETHERSCAN_API_KEY", "YourAPIKey")
        self.base_url = os.getenv("ETHERSCAN_BASE_URL", "https://api.etherscan.io/api")
        self.rate_limit_delay = rate_limit_delay
        
    async def make_api_request(self, session: aiohttp.ClientSession, params: Dict[str, Any]) -> List[Any]:
        """Make async API request to Etherscan"""
        try:
            params['apikey'] = self.api_key
            await asyncio.sleep(self.rate_limit_delay)
            
            async with session.get(self.base_url, params=params, timeout=30) as response:
                data = await response.json()
                
                if data.get('status') == '1':
                    return data.get('result', [])
                else:
                    error_msg = data.get('message', 'Unknown error')
                    logger.warning(f"API Error: {error_msg}")
                    return []
                    
        except Exception as e:
            logger.error(f"Request failed: {e}")
            return []
    
    async def get_transaction_history(self, session: aiohttp.ClientSession, address: str, limit: int = 1000) -> List[Dict[str, Any]]:
        """Get normal transaction history"""
        logger.info(f"Getting transaction history for {address}...")
        
        params = {
            'module': 'account',
            'action': 'txlist',
            'address': address,
            'startblock': 0,
            'endblock': 99999999,
            'page': 1,
            'offset': limit,
            'sort': 'desc'
        }
        
        return await self.make_api_request(session, params)
    
    async def get_internal_transactions(self, session: aiohttp.ClientSession, address: str, limit: int = 1000) -> List[Dict[str, Any]]:
        """Get internal transaction history"""
        logger.info(f"Getting internal transactions for {address}...")
        
        params = {
            'module': 'account',
            'action': 'txlistinternal',
            'address': address,
            'startblock': 0,
            'endblock': 99999999,
            'page': 1,
            'offset': limit,
            'sort': 'desc'
        }
        
        return await self.make_api_request(session, params)
    
    async def get_balance(self, session: aiohttp.ClientSession, address: str) -> float:
        """Get current balance"""
        logger.info(f"Getting balance for {address}...")
        
        params = {
            'module': 'account',
            'action': 'balance',
            'address': address,
            'tag': 'latest'
        }
        
        result = await self.make_api_request(session, params)
        if result:
            balance_wei = int(result) if isinstance(result, str) else 0
            balance_eth = balance_wei / (10**18)
            return balance_eth
        return 0
    
    async def calculate_features(self, address: str) -> Optional[Dict[str, Any]]:
        """Calculate blockchain features for the given address"""
        logger.info(f"ANALYZING BLOCKCHAIN DATA FOR: {address}")
        logger.info("="*60)

        if self.api_key == "YourAPIKey":
            logger.warning("Using demo data - Etherscan API key not configured")
            return self._generate_demo_features(address)

        async with aiohttp.ClientSession() as session:
            try:
                # Fetch all data concurrently
                normal_txs_task = self.get_transaction_history(session, address, 1000)
                internal_txs_task = self.get_internal_transactions(session, address, 1000)
                balance_task = self.get_balance(session, address)
                
                normal_txs, internal_txs, balance = await asyncio.gather(
                    normal_txs_task, internal_txs_task, balance_task
                )
            except Exception as e:
                logger.error(f"Failed to fetch blockchain data: {e}")
                logger.warning("Using demo data")
                return self._generate_demo_features(address)
        
        if not normal_txs and not internal_txs:
            logger.warning("No transaction data found! Using demo data.")
            return self._generate_demo_features(address)

        all_txs = normal_txs + internal_txs
        sent_txs = []
        received_txs = []
        
        # Categorize transactions
        for tx in all_txs:
            tx_from = tx.get('from', '').lower()
            tx_to = tx.get('to', '').lower()
            address_lower = address.lower()
            
            if tx_from == address_lower:
                sent_txs.append(tx)
            if tx_to == address_lower:
                received_txs.append(tx)
        
        logger.info(f"Found {len(all_txs)} total transactions")
        logger.info(f"Sent: {len(sent_txs)}")
        logger.info(f"Received: {len(received_txs)}")

        features = {}

        # Calculate time intervals between sent transactions
        if len(sent_txs) > 1:
            sent_intervals = []
            sorted_sent = sorted(sent_txs, key=lambda x: int(x['timeStamp']))
            for i in range(1, len(sorted_sent)):
                time_diff = int(sorted_sent[i]['timeStamp']) - int(sorted_sent[i-1]['timeStamp'])
                sent_intervals.append(time_diff / 60)  # Convert to minutes
            features['Avg min between sent tnx'] = mean(sent_intervals) if sent_intervals else 0
        else:
            features['Avg min between sent tnx'] = 0

        # Calculate time intervals between received transactions
        if len(received_txs) > 1:
            received_intervals = []
            sorted_received = sorted(received_txs, key=lambda x: int(x['timeStamp']))
            for i in range(1, len(sorted_received)):
                time_diff = int(sorted_received[i]['timeStamp']) - int(sorted_received[i-1]['timeStamp'])
                received_intervals.append(time_diff / 60)  # Convert to minutes
            features['Avg min between received tnx'] = mean(received_intervals) if received_intervals else 0
        else:
            features['Avg min between received tnx'] = 0

        # Calculate account age
        if all_txs:
            timestamps = [int(tx['timeStamp']) for tx in all_txs]
            first_tx = min(timestamps)
            last_tx = max(timestamps)
            features['Time Diff between first and last (Mins)'] = (last_tx - first_tx) / 60
        else:
            features['Time Diff between first and last (Mins)'] = 0

        # Count unique senders
        unique_senders = set()
        for tx in received_txs:
            unique_senders.add(tx['from'].lower())
        features['Unique Received From Addresses'] = len(unique_senders)

        # Calculate received values statistics
        if received_txs:
            received_values = []
            for tx in received_txs:
                value_wei = int(tx['value']) if tx['value'] else 0
                value_eth = value_wei / (10**18)
                received_values.append(value_eth)
            
            features['min value received'] = min(received_values)
            features['max value received '] = max(received_values)  # Note: space in key name to match model
            features['avg val received'] = mean(received_values)
        else:
            features['min value received'] = 0
            features['max value received '] = 0
            features['avg val received'] = 0

        # Calculate sent values statistics
        if sent_txs:
            sent_values = []
            for tx in sent_txs:
                value_wei = int(tx['value']) if tx['value'] else 0
                value_eth = value_wei / (10**18)
                sent_values.append(value_eth)
            
            features['min val sent'] = min(sent_values)
            features['avg val sent'] = mean(sent_values)
        else:
            features['min val sent'] = 0
            features['avg val sent'] = 0

        # Total transaction count
        features['total transactions (including tnx to create contract'] = len(all_txs)

        # Total ether received
        total_received = sum(int(tx['value']) / (10**18) for tx in received_txs if tx['value'])
        features['total ether received'] = total_received

        # Current balance
        features['total ether balance'] = balance

        # Add address for reference
        features['address'] = address

        logger.info(f"\nBLOCKCHAIN ANALYSIS SUMMARY:")
        logger.info(f"Account age: {features['Time Diff between first and last (Mins)']/60/24:.1f} days")
        logger.info(f"Current balance: {balance:.4f} ETH")
        logger.info(f"Total received: {total_received:.4f} ETH")
        logger.info(f"Total transactions: {len(all_txs)}")
        logger.info(f"Unique senders: {len(unique_senders)}")
        logger.info(f"Average sending interval: {features['Avg min between sent tnx']:.1f} minutes")
        logger.info(f"Average receiving interval: {features['Avg min between received tnx']:.1f} minutes")
        
        return features
    
    def _generate_demo_features(self, address: str) -> Dict[str, Any]:
        """Generate demo features for testing when API is not available"""
        import random
        
        # Generate realistic demo data
        total_txs = random.randint(50, 500)
        unique_senders = random.randint(10, min(total_txs, 100))
        balance = round(random.uniform(0.1, 10.0), 4)
        total_received = round(balance + random.uniform(0, 20), 4)
        account_age_days = random.randint(30, 365)
        
        features = {
            'address': address,
            'total transactions (including tnx to create contract': total_txs,
            'Unique Received From Addresses': unique_senders,
            'total ether balance': balance,
            'total ether received': total_received,
            'Time Diff between first and last (Mins)': account_age_days * 24 * 60,
            'Avg min between sent tnx': random.randint(30, 1440),  # 30 mins to 1 day
            'Avg min between received tnx': random.randint(60, 2880),  # 1 hour to 2 days
            'min value received': round(random.uniform(0.001, 0.1), 6),
            'max value received ': round(random.uniform(1, 10), 4),
            'avg val received': round(random.uniform(0.1, 2), 4),
            'min val sent': round(random.uniform(0.001, 0.1), 6),
            'avg val sent': round(random.uniform(0.1, 1.5), 4),
        }
        
        logger.info(f"Generated demo features for {address}")
        return features

class LLMAnalyzer:
    """LLM analyzer for generating human-readable analysis summaries"""
    
    def __init__(self, model_name: str = None):
        self.model_name = model_name or os.getenv("BLOCKCHAIN_LLM_MODEL", "google/gemma-2-2b-it")
        self.model = None
        self.tokenizer = None
        self.is_loaded = False
        self.is_cpu_only = False
        
    async def load_model(self) -> bool:
        """Load the LLM model with enhanced GPU support"""
        try:
            from transformers import AutoTokenizer, AutoModelForCausalLM
            import torch
            
            logger.info(f"Loading LLM model: {self.model_name}")
            
            # Check if user forces CPU mode
            force_cpu = os.getenv("FORCE_CPU_MODE", "False").lower() == "true"
            
            # GPU detection and optimization
            if torch.cuda.is_available() and not force_cpu:
                logger.info(f"🚀 CUDA detected: {torch.cuda.get_device_name(0)}")
                logger.info(f"💾 GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
                
                # Set memory fraction to avoid OOM
                torch.cuda.set_per_process_memory_fraction(0.8)
                
                # Set optimal CUDA settings
                cuda_alloc_conf = os.getenv("PYTORCH_CUDA_ALLOC_CONF")
                if cuda_alloc_conf:
                    os.environ["PYTORCH_CUDA_ALLOC_CONF"] = cuda_alloc_conf
                
                device_map = "auto"
                torch_dtype = torch.float16
                logger.info("⚡ Using GPU with float16 precision")
            else:
                if force_cpu:
                    logger.info("🔧 CPU mode forced by configuration")
                else:
                    logger.info("💻 CUDA not available, using CPU mode")
                device_map = "cpu"
                torch_dtype = torch.float32
                self.is_cpu_only = True
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            
            try:
                logger.info("🔄 Loading model...")
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    torch_dtype=torch_dtype,
                    device_map=device_map,
                    low_cpu_mem_usage=True,
                    trust_remote_code=True
                )
                
                if torch.cuda.is_available() and not self.is_cpu_only:
                    logger.info(f"✅ Model loaded on GPU: {self.model.device}")
                    # Clear cache after loading
                    torch.cuda.empty_cache()
                else:
                    logger.info("✅ Model loaded on CPU")
                    
            except Exception as gpu_error:
                logger.warning(f"⚠️ GPU loading failed: {gpu_error}")
                logger.info("🔄 Attempting to load model in CPU-only mode...")
                
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    torch_dtype=torch.float32,
                    device_map="cpu",
                    low_cpu_mem_usage=True,
                    trust_remote_code=True
                )
                self.is_cpu_only = True
                logger.info("✅ Model loaded successfully in CPU-only mode")
            
            self.is_loaded = True
            return True
            
        except Exception as e:
            logger.error(f"❌ Error loading LLM model: {e}")
            return False
    
    def unload_model(self) -> bool:
        """Unload LLM model and clear GPU memory"""
        try:
            if not self.is_loaded:
                return True
                
            logger.info("🧹 Unloading LLM model and clearing GPU memory...")
            
            # Clear model from memory
            if self.model is not None:
                try:
                    # Move to CPU before deletion if on GPU
                    if hasattr(self.model, 'to') and not self.is_cpu_only:
                        self.model.to('cpu')
                except:
                    pass
                del self.model
                self.model = None
            
            # Clear tokenizer
            if self.tokenizer is not None:
                del self.tokenizer
                self.tokenizer = None
            
            # Aggressive GPU memory cleanup
            try:
                import torch
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                    torch.cuda.synchronize()
                    # Force garbage collection
                    import gc
                    gc.collect()
                    torch.cuda.empty_cache()
                    logger.info("🧹 GPU memory cleared successfully")
            except Exception as cleanup_error:
                logger.warning(f"⚠️ GPU cleanup warning: {cleanup_error}")
            
            self.is_loaded = False
            logger.info("✅ LLM model unloaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error unloading LLM model: {e}")
            return False
    
    def generate_analysis(self, features: Dict[str, Any], prediction_result: Dict[str, Any]) -> str:
        """Generate human-readable analysis summary"""
        if not self.is_loaded:
            return self._generate_fallback_analysis(features, prediction_result)
        
        try:
            import torch
            
            prompt = self._create_prompt(features, prediction_result)
            device = "cpu" if self.is_cpu_only else self.model.device
            inputs = self.tokenizer(prompt, return_tensors="pt").to(device)
            
            logger.info("🤖 Generating AI analysis...")
            with torch.no_grad():
                generation_params = {
                    "max_new_tokens": 350,
                    "do_sample": True,
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "pad_token_id": self.tokenizer.eos_token_id,
                }
                
                # Add attention mask for better generation
                if "attention_mask" not in inputs:
                    inputs["attention_mask"] = torch.ones_like(inputs["input_ids"])
                
                try:
                    # Use different parameters based on device
                    if not self.is_cpu_only and torch.cuda.is_available():
                        # GPU optimized generation
                        generation_params.update({
                            "use_cache": True,
                            "early_stopping": True,
                        })
                        logger.info("⚡ Using GPU-optimized generation")
                    else:
                        # CPU optimized generation
                        generation_params.update({
                            "use_cache": False,
                            "max_new_tokens": 250,  # Reduce for CPU
                        })
                        logger.info("💻 Using CPU-optimized generation")
                    
                    outputs = self.model.generate(
                        inputs["input_ids"],
                        attention_mask=inputs.get("attention_mask"),
                        **generation_params
                    )
                    
                    analysis = self.tokenizer.decode(
                        outputs[0][inputs["input_ids"].shape[1]:], 
                        skip_special_tokens=True
                    )
                    
                    # Aggressive memory cleanup
                    del outputs
                    if torch.cuda.is_available() and not self.is_cpu_only:
                        torch.cuda.empty_cache()
                        torch.cuda.synchronize()
                    
                    logger.info("✅ AI analysis generated successfully")
                    return analysis.strip()
                    
                except Exception as e:
                    logger.error(f"Error generating analysis: {e}")
                    return self._generate_fallback_analysis(features, prediction_result)
        
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return self._generate_fallback_analysis(features, prediction_result)
    
    def _generate_fallback_analysis(self, features: Dict[str, Any], prediction_result: Dict[str, Any]) -> str:
        """Generate fallback analysis when LLM is not available"""
        logger.info("Using fallback analysis method")
        
        risk_level = prediction_result.get('risk_level', 'UNKNOWN')
        probability = prediction_result.get('probability', 0)
        address = prediction_result.get('address', 'Unknown')
        
        account_age_days = features.get('Time Diff between first and last (Mins)', 0) / 60 / 24
        total_txs = features.get('total transactions (including tnx to create contract', 0)
        unique_senders = features.get('Unique Received From Addresses', 0)
        balance = features.get('total ether balance', 0)
        
        if probability < 30:
            return f"""✅ **Phân tích ví {address[:10]}... - RỦI RO THẤP**

**Đánh giá tổng quan:**
Ví này được đánh giá là AN TOÀN với xác suất gian lận chỉ {probability:.1f}%. Các chỉ số blockchain cho thấy hoạt động bình thường và đáng tin cậy.

**Điểm tích cực:**
• Hoạt động giao dịch ổn định trong {account_age_days:.0f} ngày qua
• Số dư hiện tại: {balance:.4f} ETH cho thấy sử dụng thực tế
• Tỷ lệ người gửi ({unique_senders}) phù hợp với tổng giao dịch ({total_txs})
• Không phát hiện pattern đáng nghi từ AI model

**Khuyến nghị:**
• An toàn để thực hiện giao dịch bình thường
• Vẫn nên duy trì các biện pháp bảo mật cơ bản
• Kiểm tra định kỳ lịch sử giao dịch

Đây là một ví đáng tin cậy và an toàn để sử dụng."""
        
        elif probability < 70:
            return f"""⚠️ **Phân tích ví {address[:10]}... - RỦI RO VỪA PHẢI**

**Đánh giá tổng quan:**
Ví này có mức rủi ro TRUNG BÌNH với xác suất gian lận {probability:.1f}%. Một số pattern giao dịch cần được quan sát kỹ hơn.

**Điểm cần lưu ý:**
• Một số pattern giao dịch không hoàn toàn nhất quán
• Tỷ lệ người gửi ({unique_senders}) so với tổng giao dịch ({total_txs}) cần được xem xét
• Hoạt động trong {account_age_days:.0f} ngày qua có một số điểm cần theo dõi
• Số dư hiện tại: {balance:.4f} ETH

**Khuyến nghị:**
• Thận trọng khi thực hiện giao dịch giá trị lớn
• Xác minh kỹ đối tác giao dịch trước khi gửi tiền
• Theo dõi hoạt động của ví trong thời gian tới
• Cân nhắc kiểm tra thêm thông tin từ các nguồn khác

Cần thận trọng khi tương tác với địa chỉ này."""
        
        else:
            return f"""🚨 **CẢNH BÁO NGHIÊM TRỌNG - RỦI RO CAO**

**Phân tích ví {address[:10]}... - XÁC SUẤT GIAN LẬN {probability:.1f}%**

**CẢNH BÁO NGUY HIỂM:**
• Pattern giao dịch có dấu hiệu rõ ràng của hoạt động đáng nghi
• Sự bất thường nghiêm trọng giữa người gửi và người nhận
• Thời gian và giá trị giao dịch bất thường
• AI model phát hiện các chỉ số hành vi gian lận

**CHỈ SỐ ĐÁNG NGẠI:**
• Tuổi tài khoản: {account_age_days:.0f} ngày
• Tổng giao dịch: {total_txs}
• Số người gửi: {unique_senders}
• Số dư hiện tại: {balance:.4f} ETH

**KHUYẾN NGHỊ KHẨN CẤP:**
• TUYỆT ĐỐI KHÔNG gửi tiền hoặc tài sản có giá trị đến địa chỉ này
• Báo cáo địa chỉ này cho nền tảng giao dịch nếu có thể
• Nếu đã giao dịch với địa chỉ này, kiểm tra giao dịch của bạn ngay lập tức
• Cân nhắc chuyển tài sản khỏi ví của bạn sang ví mới nếu đã tương tác

Đây là địa chỉ có khả năng cao liên quan đến hoạt động gian lận. Hành động ngay để bảo vệ tài sản của bạn!"""
    
    def _create_prompt(self, features: Dict[str, Any], prediction_result: Dict[str, Any]) -> str:
        """Create prompt for LLM analysis"""
        address = prediction_result.get('address', 'Unknown')
        risk_level = prediction_result.get('risk_level', 'UNKNOWN')
        probability = prediction_result.get('probability', 0)
        prediction = prediction_result.get('prediction', 0)
        
        account_age_mins = features.get('Time Diff between first and last (Mins)', 0)
        account_age_days = account_age_mins / 60 / 24 if account_age_mins else 0
        balance = features.get('total ether balance', 0)
        total_received = features.get('total ether received', 0)
        total_txs = features.get('total transactions (including tnx to create contract', 0)
        unique_senders = features.get('Unique Received From Addresses', 0)
        avg_sent_interval = features.get('Avg min between sent tnx', 0)
        avg_received_interval = features.get('Avg min between received tnx', 0)
        
        prompt = f"""You are a blockchain security expert analyzing Ethereum wallet {address}.

Risk Assessment:
- Risk Level: {risk_level}
- Fraud Probability: {probability:.2f}%
- Account Age: {account_age_days:.1f} days
- Total Transactions: {total_txs}
- Unique Senders: {unique_senders}
- Current Balance: {balance:.4f} ETH
- Total Received: {total_received:.4f} ETH

Based on this analysis, provide a concise security assessment in Vietnamese (150-200 words) with:
1. Risk evaluation explanation
2. Key indicators found
3. Specific recommendations for users
4. Appropriate tone based on risk level

Response:"""
        
        return prompt

class BlockchainAnalysisService:
    """Main service for blockchain analysis"""
    
    def __init__(self):
        self.fraud_detector = TrainedFraudDetector()
        self.ethereum_analyzer = EthereumAnalyzer()
        self.llm_analyzer = LLMAnalyzer()
        self.is_initialized = False
    
    async def initialize(self) -> bool:
        """Initialize all components"""
        try:
            logger.info("Initializing Blockchain Analysis Service...")
            
            # Load fraud detection model
            fraud_loaded = await self.fraud_detector.load_models()
            if not fraud_loaded:
                logger.error("Failed to load fraud detection model")
                return False
            
            # LLM model will be loaded on-demand (lazy loading)
            logger.info("✅ LLM model configured for lazy loading (memory efficient)")
            
            self.is_initialized = True
            logger.info("Blockchain Analysis Service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize service: {e}")
            return False
    
    async def analyze_wallet(self, wallet_address: str) -> BlockchainAnalysisResponse:
        """Analyze a wallet address for fraud risk"""
        if not self.is_initialized:
            raise Exception("Service not initialized")
        
        start_time = time.time()
        
        try:
            logger.info(f"Starting analysis for wallet: {wallet_address}")
            
            # Extract blockchain features
            features = await self.ethereum_analyzer.calculate_features(wallet_address)
            if not features:
                raise Exception("Could not retrieve blockchain data")
            
            # Run fraud detection
            prediction_result = self.fraud_detector.predict_single_address(features)
            
            # Lazy load LLM model, generate analysis, then unload
            logger.info("📊 Performing lazy LLM analysis (memory efficient)...")
            try:
                # Load LLM model on-demand
                llm_loaded = await self.llm_analyzer.load_model()
                if llm_loaded:
                    logger.info("⚡ LLM model loaded for analysis")
                    ai_summary = self.llm_analyzer.generate_analysis(features, prediction_result)
                else:
                    logger.warning("⚠️ LLM loading failed, using fallback analysis")
                    ai_summary = self.llm_analyzer._generate_fallback_analysis(features, prediction_result)
            finally:
                # Always unload LLM model after use to free GPU memory
                if self.llm_analyzer.is_loaded:
                    self.llm_analyzer.unload_model()
                    logger.info("🧹 LLM model auto-unloaded after analysis")
            
            # Format response
            account_age_mins = features.get('Time Diff between first and last (Mins)', 0)
            account_age_days = account_age_mins / 60 / 24 if account_age_mins else 0
            
            response = BlockchainAnalysisResponse(
                address=wallet_address,
                risk_level=prediction_result['risk_level'],
                fraud_probability=prediction_result['probability'],
                prediction=PredictionType.FRAUDULENT if prediction_result['prediction'] == 1 else PredictionType.NORMAL,
                confidence=prediction_result['confidence'],
                account_age=f"{account_age_days:.1f} days",
                current_balance=f"{features.get('total ether balance', 0):.4f} ETH",
                total_received=f"{features.get('total ether received', 0):.4f} ETH",
                total_transactions=features.get('total transactions (including tnx to create contract', 0),
                unique_senders=features.get('Unique Received From Addresses', 0),
                avg_send_interval=f"{features.get('Avg min between sent tnx', 0):.1f} minutes",
                summarize=ai_summary
            )
            
            processing_time = time.time() - start_time
            logger.info(f"Analysis completed in {processing_time:.2f} seconds")
            
            return response
            
        except Exception as e:
            logger.error(f"Analysis failed for {wallet_address}: {e}")
            raise Exception(f"Analysis failed: {str(e)}")
    
    def unload_llm_model(self) -> bool:
        """Manually unload LLM model to free GPU memory"""
        return self.llm_analyzer.unload_model()
    
    def get_llm_status(self) -> bool:
        """Check if LLM model is currently loaded"""
        return self.llm_analyzer.is_loaded

# Global service instance
blockchain_service = BlockchainAnalysisService()