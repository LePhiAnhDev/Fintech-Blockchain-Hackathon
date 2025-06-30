import asyncio
import logging
import time
import re
import os
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from models import StudyChatRequest, StudyChatResponse

# Import Google Generative AI
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class SubjectDetector:
    """Detect academic subjects from Vietnamese text"""
    
    def __init__(self):
        self.subject_keywords = {
            'toán': ['toán', 'toán học', 'mathematics', 'math', 'phương trình', 'hình học', 'đại số', 'giải tích', 'số học', 'tính toán', 'công thức', 'bài tập toán', 'giải toán'],
            'lý': ['vật lý', 'physics', 'lực', 'điện', 'từ', 'quang', 'cơ học', 'nhiệt', 'sóng', 'ánh sáng', 'electron', 'vật lí', 'bài tập lý'],
            'hóa': ['hóa học', 'chemistry', 'phân tử', 'nguyên tố', 'phản ứng', 'axit', 'bazơ', 'ion', 'hợp chất', 'hóa lý', 'bài tập hóa'],
            'sinh': ['sinh học', 'biology', 'tế bào', 'gen', 'adn', 'protein', 'quang hợp', 'sinh vật', 'động vật', 'thực vật', 'sinh lý', 'bài tập sinh'],
            'văn': ['văn học', 'literature', 'thơ', 'truyện', 'tiểu thuyết', 'tác phẩm', 'tác giả', 'phân tích', 'cảm nhận', 'văn bản', 'bài văn', 'luận văn'],
            'sử': ['lịch sử', 'history', 'chiến tranh', 'vua', 'triều đại', 'cách mạng', 'sự kiện lịch sử', 'thời đại', 'bài sử'],
            'địa': ['địa lý', 'geography', 'khí hậu', 'địa hình', 'lục địa', 'đại dương', 'quốc gia', 'thủ đô', 'bản đồ', 'bài địa'],
            'anh': ['tiếng anh', 'english', 'grammar', 'vocabulary', 'từ vựng', 'ngữ pháp', 'speaking', 'listening', 'reading', 'writing', 'bài tiếng anh'],
            'tin': ['tin học', 'computer science', 'lập trình', 'programming', 'algorithm', 'thuật toán', 'code', 'máy tính', 'bài tin học'],
            'kinh tế': ['kinh tế', 'economics', 'thị trường', 'cung cầu', 'gdp', 'lạm phát', 'đầu tư', 'tài chính'],
            'khác': ['học tập', 'giáo dục', 'bài tập', 'kiểm tra', 'thi cử', 'nghiên cứu', 'ôn tập']
        }
    
    def detect_subject(self, text: str) -> str:
        """Detect subject from text"""
        text_lower = text.lower()
        
        subject_scores = {}
        for subject, keywords in self.subject_keywords.items():
            score = 0
            for keyword in keywords:
                if keyword in text_lower:
                    score += len(keyword)  # Longer keywords get higher scores
            
            if score > 0:
                subject_scores[subject] = score
        
        if subject_scores:
            return max(subject_scores.items(), key=lambda x: x[1])[0]
        
        return 'khác'

class StudyAssistantLLM:
    """Study assistant using Google Gemini API for Vietnamese education"""
    
    def __init__(self, api_key: str = None):
        # Đọc API key từ environment variables
        self.api_key = api_key or os.getenv('GOOGLE_API_KEY')
        self.model_name = os.getenv('GEMINI_MODEL_NAME', 'gemini-2.0-flash-exp')
        self.model = None
        self.is_loaded = False
        
        # Vietnamese education context
        self.education_context = {
            'grade_levels': ['tiểu học', 'trung học cơ sở', 'trung học phổ thông', 'đại học'],
            'common_questions': [
                'giải thích', 'phân tích', 'so sánh', 'đánh giá', 
                'tính toán', 'chứng minh', 'mô tả', 'kể tên'
            ],
            'response_formats': {
                'explanation': 'Giải thích chi tiết với ví dụ cụ thể',
                'calculation': 'Hướng dẫn từng bước tính toán',
                'analysis': 'Phân tích đa chiều với luận điểm rõ ràng',
                'comparison': 'So sánh theo nhiều tiêu chí khác nhau'
            }
        }
        
    async def load_model(self) -> bool:
        """Initialize Google Gemini API"""
        try:
            logger.info("Initializing Google Gemini API...")
            
            # Configure the API
            genai.configure(api_key=self.api_key)
            
            # Initialize the model
            self.model = genai.GenerativeModel(self.model_name)
            
            # Test the connection
            test_response = await self._generate_test_response()
            if test_response:
                self.is_loaded = True
                logger.info("Google Gemini API initialized successfully")
                return True
            else:
                logger.error("Failed to test Gemini API connection")
                return False
            
        except Exception as e:
            logger.error(f"Error initializing Gemini API: {e}")
            return False
    
    async def _generate_test_response(self) -> bool:
        """Test Gemini API connection"""
        try:
            response = self.model.generate_content("Hello, test connection")
            return response and response.text
        except Exception as e:
            logger.error(f"Gemini API test failed: {e}")
            return False
    
    def create_study_prompt(self, question: str, subject: str, difficulty: str = "intermediate") -> str:
        """Create specialized prompt for educational content"""
        
        # Base system prompt for Vietnamese education
        system_prompt = """Bạn là một giáo viên AI chuyên nghiệp, giỏi giảng dạy các môn học ở Việt Nam. 
Bạn có kiến thức sâu rộng về chương trình giáo dục Việt Nam và có thể giảng dạy từ cấp tiểu học đến đại học.
Hãy trả lời câu hỏi một cách chi tiết, dễ hiểu và phù hợp với trình độ học sinh Việt Nam.

NGUYÊN TẮC TRẢ LỜI:
1. Sử dụng tiếng Việt rõ ràng, dễ hiểu
2. Giải thích từng bước một cách logic và có hệ thống
3. Đưa ra ví dụ cụ thể, gần gũi với học sinh Việt Nam
4. Khuyến khích tư duy phản biện và sáng tạo
5. Liên hệ với thực tế Việt Nam khi phù hợp
6. Sử dụng emojis để làm cho câu trả lời sinh động hơn
7. Luôn kết thúc bằng lời khuyến khích học tập

"""
        
        # Subject-specific instructions
        subject_instructions = {
            'toán': '''📊 TOÁN HỌC: 
- Giải thích các bước tính toán chi tiết, rõ ràng
- Sử dụng công thức và ví dụ số cụ thể
- Hướng dẫn phương pháp giải từng bước
- Kiểm tra kết quả và giải thích ý nghĩa''',
            
            'lý': '''⚡ VẬT LÝ:
- Mô tả hiện tượng vật lý một cách sinh động
- Giải thích nguyên lý hoạt động và định luật
- Đưa ra ứng dụng thực tế trong cuộc sống
- Sử dụng sơ đồ, hình ảnh minh họa (mô tả bằng text)''',
            
            'hóa': '''🧪 HÓA HỌC:
- Giải thích phản ứng hóa học và cơ chế
- Mô tả tính chất các chất và ứng dụng
- Nhấn mạnh an toàn hóa học
- Liên hệ với môi trường và cuộc sống''',
            
            'sinh': '''🌱 SINH HỌC:
- Mô tả cấu trúc và chức năng sinh học
- Giải thích mối liên hệ trong hệ sinh thái
- Liên hệ với sức khỏe con người
- Đưa ra ví dụ về sinh vật ở Việt Nam''',
            
            'văn': '''📚 VĂN HỌC:
- Phân tích tác phẩm văn học một cách sâu sắc
- Giải thích nghệ thuật ngôn từ và biện pháp tu từ
- Đánh giá giá trị nhân văn và xã hội
- Liên hệ với văn hóa Việt Nam''',
            
            'sử': '''🏛️ LỊCH SỬ:
- Trình bày sự kiện lịch sử theo thứ tự thời gian
- Phân tích nguyên nhân - kết quả
- Rút ra bài học kinh nghiệm
- Tôn vinh những giá trị lịch sử Việt Nam''',
            
            'địa': '''🌍 ĐỊA LÝ:
- Mô tả địa lý tự nhiên và kinh tế-xã hội
- Giải thích tương tác giữa con người và môi trường
- Sử dụng số liệu cụ thể về Việt Nam
- Đưa ra những vấn đề môi trường hiện tại''',
            
            'anh': '''🇬🇧 TIẾNG ANH:
- Giải thích ngữ pháp một cách dễ hiểu
- Cung cấp từ vựng phong phú với ví dụ
- Hướng dẫn cách phát âm chính xác
- Đưa ra tình huống giao tiếp thực tế''',
            
            'tin': '''💻 TIN HỌC:
- Hướng dẫn lập trình từ cơ bản đến nâng cao
- Giải thích thuật toán và cấu trúc dữ liệu
- Đưa ra ví dụ mã nguồn cụ thể
- Ứng dụng công nghệ trong giáo dục''',
        }
        
        # Difficulty adjustments
        difficulty_instructions = {
            'beginner': '''🌟 TRÌNH ĐỘ CƠ BẢN:
- Sử dụng ngôn ngữ đơn giản, dễ hiểu
- Ví dụ gần gũi với đời sống học sinh
- Tránh thuật ngữ phức tạp
- Giải thích từ những kiến thức cơ bản nhất''',
            
            'intermediate': '''📈 TRÌNH ĐỘ TRUNG BÌNH:
- Cân bằng giữa lý thuyết và thực hành
- Sử dụng thuật ngữ chuyên môn phù hợp
- Đưa ra nhiều ví dụ minh họa
- Kết nối kiến thức đã học''',
            
            'advanced': '''🎓 TRÌNH ĐỘ NÂNG CAO:
- Đi sâu vào chi tiết và phân tích nhiều góc độ
- Sử dụng thuật ngữ chuyên môn chính xác
- Thách thức tư duy với các vấn đề phức tạp
- Khuyến khích nghiên cứu sâu hơn'''
        }
        
        # Construct full prompt
        prompt = system_prompt
        
        if subject in subject_instructions:
            prompt += f"\n{subject_instructions[subject]}\n"
        
        if difficulty in difficulty_instructions:
            prompt += f"\n{difficulty_instructions[difficulty]}\n"
        
        prompt += f"""
📝 CÂU HỎI CỦA HỌC SINH: {question}

Hãy trả lời câu hỏi này một cách chi tiết, dễ hiểu và có tính khuyến khích. 
Đừng quên sử dụng emojis để làm cho câu trả lời sinh động và thú vị hơn!
"""
        
        return prompt
    
    async def generate_response(self, question: str, subject: str = "khác", difficulty: str = "intermediate") -> Tuple[str, float]:
        """Generate educational response using Gemini API"""
        if not self.is_loaded:
            return self._generate_fallback_response(question, subject), 0.5
        
        try:
            # Create educational prompt
            prompt = self.create_study_prompt(question, subject, difficulty)
            
            logger.info("Generating study assistance response with Gemini...")
            
            start_time = time.time()
            
            # Generate response using Gemini
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_p=0.95,
                    top_k=40,
                    max_output_tokens=1024,
                )
            )
            
            generation_time = time.time() - start_time
            
            if response and response.text:
                # Post-process response
                response_text = self._post_process_response(response.text)
                
                logger.info(f"Response generated in {generation_time:.2f}s")
                return response_text, 0.95
            else:
                logger.warning("Empty response from Gemini API")
                return self._generate_fallback_response(question, subject), 0.5
                
        except Exception as e:
            logger.error(f"Error in Gemini generation: {e}")
            return self._generate_fallback_response(question, subject), 0.3
    
    def _post_process_response(self, response: str) -> str:
        """Post-process the generated response"""
        # Remove any incomplete sentences at the end
        response = response.strip()
        
        # Clean up common generation artifacts
        response = re.sub(r'\n+', '\n', response)
        response = re.sub(r' +', ' ', response)
        
        # Ensure the response ends with proper punctuation
        if response and not response[-1] in '.!?':
            response += '.'
        
        return response.strip()
    
    def _generate_fallback_response(self, question: str, subject: str) -> str:
        """Generate fallback response when Gemini API is not available"""
        logger.info("Using fallback study response")
        
        # Subject-specific fallback responses
        fallback_responses = {
            'toán': f"""📊 Câu hỏi toán học: "{question}"

🔢 Để giải quyết bài toán này, tôi gợi ý các bước sau:

1. **Xác định dữ liệu**: Đọc kỹ đề bài, xác định những gì đã cho và cần tìm
2. **Chọn phương pháp**: Xác định công thức hoặc phương pháp giải phù hợp
3. **Thực hiện tính toán**: Áp dụng công thức và tính toán từng bước
4. **Kiểm tra kết quả**: Xem kết quả có hợp lý không

💡 **Lưu ý**: Hãy kiểm tra lại phép tính và đơn vị đo lường!
🌟 **Khuyến khích**: Toán học là ngôn ngữ của vũ trụ, hãy kiên trì luyện tập!""",

            'lý': f"""⚡ Câu hỏi vật lý: "{question}"

🔬 Để hiểu rõ hiện tượng vật lý này:

1. **Quan sát hiện tượng**: Mô tả những gì xảy ra
2. **Tìm nguyên lý**: Xác định định luật vật lý liên quan
3. **Phân tích nguyên nhân**: Giải thích tại sao hiện tượng xảy ra
4. **Ứng dụng thực tế**: Tìm ví dụ trong cuộc sống

🔬 **Gợi ý**: Hãy liên hệ với những hiện tượng tương tự trong thực tế!
🌟 **Khuyến khích**: Vật lý giúp bạn hiểu thế giới xung quanh!""",

            'hóa': f"""🧪 Câu hỏi hóa học: "{question}"

⚗️ Để giải quyết bài tập hóa học:

1. **Xác định chất tham gia**: Viết công thức hóa học các chất
2. **Cân bằng phương trình**: Đảm bảo số nguyên tử mỗi nguyên tố bằng nhau
3. **Tính toán theo tỷ lệ**: Sử dụng số mol và khối lượng mol
4. **Kiểm tra kết quả**: Xem có hợp lý về mặt hóa học không

⚗️ **An toàn**: Luôn chú ý đến tính chất và độ nguy hiểm của các chất!
🌟 **Khuyến khích**: Hóa học là chìa khóa để hiểu cuộc sống!""",

            'sinh': f"""🌱 Câu hỏi sinh học: "{question}"

🔬 Để hiểu về sinh học:

1. **Mô tả cấu trúc**: Hình dạng, kích thước, thành phần
2. **Giải thích chức năng**: Vai trò và hoạt động
3. **Tìm mối liên hệ**: Quan hệ với các bộ phận khác
4. **Ứng dụng trong đời sống**: Tác động đến con người và môi trường

🦋 **Khám phá**: Sinh học có mặt khắp nơi trong cuộc sống!
🌟 **Khuyến khích**: Hãy yêu thương và bảo vệ thiên nhiên!""",

            'văn': f"""📚 Câu hỏi văn học: "{question}"

✍️ Để phân tích văn học:

1. **Đọc hiểu**: Nắm bắt nội dung và thông điệp chính
2. **Phân tích nghệ thuật**: Ngôn ngữ, hình ảnh, biện pháp tu từ
3. **Đánh giá giá trị**: Ý nghĩa nhân văn và xã hội
4. **Liên hệ thực tế**: Bài học cho cuộc sống hiện tại

📖 **Cảm nhận**: Văn học giúp ta hiểu sâu hơn về con người và cuộc sống!
🌟 **Khuyến khích**: Hãy đọc nhiều sách để phát triển tâm hồn!""",
        }
        
        return fallback_responses.get(subject, f"""📖 Câu hỏi học tập: "{question}"

🎯 Để trả lời câu hỏi này một cách tốt nhất:

1. **Nghiên cứu tài liệu**: Tìm hiểu từ sách giáo khoa và tài liệu tham khảo
2. **Phân tích đề bài**: Xác định rõ yêu cầu cần trả lời
3. **Tổ chức ý tưởng**: Sắp xếp thông tin theo thứ tự logic
4. **Trình bày rõ ràng**: Sử dụng ngôn từ chính xác và dễ hiểu

💡 **Gợi ý**: Hãy tham khảo nhiều nguồn tài liệu để có cái nhìn toàn diện!

🤔 **Lưu ý**: Tôi khuyến khích bạn thảo luận với giáo viên hoặc bạn bè để hiểu sâu hơn về vấn đề này.

🌟 **Khuyến khích**: Học tập là hành trình suốt đời, hãy luôn tò mò và khám phá!""")

class FollowUpGenerator:
    """Generate follow-up questions for deeper learning"""
    
    def __init__(self):
        self.question_patterns = {
            'toán': [
                "Bạn có thể áp dụng phương pháp này cho bài tập khác không?",
                "Tại sao chúng ta sử dụng công thức này?",
                "Có cách nào khác để giải bài này không?"
            ],
            'lý': [
                "Hiện tượng này có ứng dụng gì trong thực tế?",
                "Điều gì sẽ xảy ra nếu thay đổi điều kiện?",
                "Có thể giải thích bằng định luật nào khác?"
            ],
            'hóa': [
                "Phản ứng này có ảnh hưởng gì đến môi trường?",
                "Làm thế nào để tăng hiệu suất phản ứng?",
                "Có thể dự đoán sản phẩm của phản ứng tương tự?"
            ],
            'sinh': [
                "Cơ chế này tiến hóa như thế nào?",
                "Có sự tương đồng nào với sinh vật khác?",
                "Điều gì xảy ra khi có rối loạn?"
            ],
            'văn': [
                "Tác phẩm này phản ánh điều gì về thời đại?",
                "Có thể so sánh với tác phẩm nào khác?",
                "Thông điệp này còn phù hợp hiện tại không?"
            ],
            'khác': [
                "Bạn có câu hỏi nào khác về chủ đề này?",
                "Có muốn tìm hiểu sâu hơn về vấn đề nào?",
                "Phần nào bạn cảm thấy chưa rõ?"
            ]
        }
    
    def generate_follow_ups(self, subject: str, question: str) -> List[str]:
        """Generate relevant follow-up questions"""
        base_questions = self.question_patterns.get(subject, self.question_patterns['khác'])
        
        # Analyze question type for more specific follow-ups
        question_lower = question.lower()
        
        specific_questions = []
        
        if 'tại sao' in question_lower or 'vì sao' in question_lower:
            specific_questions.append("Bạn có muốn tìm hiểu thêm về nguyên nhân sâu xa không?")
        
        if 'như thế nào' in question_lower or 'cách nào' in question_lower:
            specific_questions.append("Có phương pháp nào khác để thực hiện không?")
        
        if 'so sánh' in question_lower:
            specific_questions.append("Bạn muốn so sánh thêm với trường hợp nào khác?")
        
        if 'ví dụ' in question_lower:
            specific_questions.append("Bạn cần thêm ví dụ cụ thể nào?")
        
        # Combine and limit
        all_questions = specific_questions + base_questions
        return all_questions[:3]

class StudyChatService:
    """Main study chat service"""
    
    def __init__(self):
        self.subject_detector = SubjectDetector()
        self.llm_assistant = StudyAssistantLLM()
        self.follow_up_generator = FollowUpGenerator()
        self.is_initialized = False
        
        # Conversation memory (simple in-memory cache)
        self.conversation_memory = {}
    
    async def initialize(self) -> bool:
        """Initialize the study chat service"""
        try:
            logger.info("Initializing Study Chat Service...")
            
            # Load LLM model
            llm_loaded = await self.llm_assistant.load_model()
            if not llm_loaded:
                logger.warning("LLM model not loaded, will use fallback responses")
            
            self.is_initialized = True
            logger.info("Study Chat Service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize study chat service: {e}")
            return False
    
    async def process_message(self, request: StudyChatRequest) -> StudyChatResponse:
        """Process a study chat message"""
        start_time = time.time()
        
        try:
            logger.info(f"Processing study message: {request.message[:50]}...")
            
            # Detect subject if not provided
            subject = request.subject or self.subject_detector.detect_subject(request.message)
            
            # Get conversation context
            conversation_context = []
            if request.conversation_id and request.conversation_id in self.conversation_memory:
                conversation_context = self.conversation_memory[request.conversation_id][-3:]  # Last 3 messages
            
            # Generate response using LLM
            response_text, confidence = await self.llm_assistant.generate_response(
                request.message, 
                subject, 
                request.difficulty or "intermediate"
            )
            
            # Generate follow-up questions
            follow_ups = self.follow_up_generator.generate_follow_ups(subject, request.message)
            
            # Related topics (simple keyword-based)
            related_topics = self._get_related_topics(subject, request.message)
            
            # Store in conversation memory
            if request.conversation_id:
                if request.conversation_id not in self.conversation_memory:
                    self.conversation_memory[request.conversation_id] = []
                
                self.conversation_memory[request.conversation_id].extend([
                    {"role": "user", "content": request.message, "timestamp": datetime.now()},
                    {"role": "assistant", "content": response_text, "timestamp": datetime.now()}
                ])
                
                # Keep only last 10 exchanges (20 messages)
                if len(self.conversation_memory[request.conversation_id]) > 20:
                    self.conversation_memory[request.conversation_id] = self.conversation_memory[request.conversation_id][-20:]
            
            processing_time = time.time() - start_time
            
            return StudyChatResponse(
                response=response_text,
                conversation_id=request.conversation_id,
                subject_detected=subject,
                confidence=confidence,
                follow_up_questions=follow_ups,
                related_topics=related_topics,
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"Error processing study message: {e}")
            return StudyChatResponse(
                response="Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại hoặc diễn đạt câu hỏi khác cách.",
                conversation_id=request.conversation_id,
                subject_detected="khác",
                confidence=0.0,
                follow_up_questions=["Bạn có thể hỏi lại bằng cách khác không?"],
                related_topics=[],
                processing_time=time.time() - start_time,
                success=False,
                message=f"Processing error: {str(e)}"
            )
    
    def _get_related_topics(self, subject: str, question: str) -> List[str]:
        """Get related topics based on subject and question"""
        related_topics_map = {
            'toán': ['Đại số', 'Hình học', 'Giải tích', 'Thống kê', 'Lượng giác'],
            'lý': ['Cơ học', 'Điện học', 'Quang học', 'Nhiệt học', 'Vật lý hiện đại'],
            'hóa': ['Hóa vô cơ', 'Hóa hữu cơ', 'Hóa phân tích', 'Hóa lý', 'Sinh hóa'],
            'sinh': ['Tế bào học', 'Di truyền học', 'Sinh thái học', 'Tiến hóa', 'Sinh lý'],
            'văn': ['Thơ', 'Truyện ngắn', 'Tiểu thuyết', 'Kịch', 'Văn học dân gian'],
            'sử': ['Lịch sử Việt Nam', 'Lịch sử thế giới', 'Khảo cổ học', 'Địa lý lịch sử'],
            'địa': ['Địa lý tự nhiên', 'Địa lý kinh tế', 'Khí hậu học', 'Địa chất'],
            'anh': ['Ngữ pháp', 'Từ vựng', 'Phát âm', 'Giao tiếp', 'Viết luận'],
            'tin': ['Lập trình', 'Cơ sở dữ liệu', 'Mạng máy tính', 'Trí tuệ nhân tạo'],
            'khác': ['Học tập hiệu quả', 'Phương pháp nghiên cứu', 'Kỹ năng thi cử']
        }
        
        base_topics = related_topics_map.get(subject, related_topics_map['khác'])
        
        # Filter based on question content (simple keyword matching)
        question_lower = question.lower()
        relevant_topics = []
        
        for topic in base_topics:
            topic_lower = topic.lower()
            # Simple relevance check
            if any(word in question_lower for word in topic_lower.split()):
                relevant_topics.append(topic)
        
        # If no specific matches, return first 3 topics
        if not relevant_topics:
            relevant_topics = base_topics[:3]
        
        return relevant_topics[:3]

# Global service instance
study_service = StudyChatService()