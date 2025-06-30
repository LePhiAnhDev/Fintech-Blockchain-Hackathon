import re
import asyncio
import logging
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
from models import FinanceResponse, TransactionData, FinanceInsightsResponse

logger = logging.getLogger(__name__)

class FinanceCommandParser:
    """Parse natural language finance commands"""
    
    def __init__(self):
        # Patterns for different command types
        self.patterns = {
            'amount_description': re.compile(r'^([+\-]?)(\d+(?:\.\d+)?)(k|tr|triệu|nghìn|m)?\s+(.+)$', re.IGNORECASE),
            'vietnamese_currency': re.compile(r'(\d+(?:\.\d+)?)\s*(k|tr|triệu|nghìn|m|đồng|vnd)', re.IGNORECASE),
            'expense_keywords': ['chi', 'mua', 'trả', 'thanh toán', 'tiêu', 'tốn', 'mất'],
            'income_keywords': ['thu', 'nhận', 'lương', 'thưởng', 'bán', 'kiếm', 'được'],
            'daily_expense_keywords': ['dò lại chi tiêu', 'chi hôm', 'tiêu hôm', 'chi tiêu hôm', 'chi ngày'],
            'monthly_expense_keywords': ['chi tiêu tháng này', 'chi tháng này', 'tiêu tháng này', 'chi tiêu tháng'],
            'today_summary_keywords': ['tổng thu chi hôm nay', 'thu chi hôm nay', 'thu chi ngày', 'tổng hôm nay'],
            'blockchain_keywords': ['lưu blockchain', 'ghi blockchain', 'blockchain', 'immutable']
        }
        
        # Category mapping
        self.category_mapping = {
            'food_drink': ['ăn', 'uống', 'cafe', 'cà phê', 'trà sữa', 'cơm', 'bún', 'phở', 'bánh', 'thức ăn', 'đồ ăn'],
            'transport': ['xe', 'xăng', 'grab', 'taxi', 'bus', 'xe buýt', 'di chuyển', 'đi lại'],
            'education': ['học phí', 'sách', 'văn phòng phẩm', 'khoá học', 'giáo dục', 'học tập'],
            'utilities': ['điện', 'nước', 'internet', 'điện thoại', 'wifi', 'tiện ích'],
            'healthcare': ['thuốc', 'bác sĩ', 'bệnh viện', 'khám', 'y tế', 'sức khỏe'],
            'entertainment': ['phim', 'game', 'giải trí', 'vui chơi', 'du lịch', 'nghỉ dưỡng'],
            'shopping': ['mua sắm', 'quần áo', 'giày', 'túi', 'mỹ phẩm', 'đồ dùng'],
            'income': ['lương', 'thưởng', 'làm thêm', 'gia sư', 'freelance', 'bán hàng', 'thu nhập']
        }
    
    def parse_amount(self, amount_str: str, unit: str = None) -> float:
        """Parse amount string with Vietnamese units"""
        try:
            amount = float(amount_str.replace(',', '.'))
            
            if unit:
                unit_lower = unit.lower()
                if unit_lower in ['k', 'nghìn']:
                    amount *= 1000
                elif unit_lower in ['tr', 'triệu', 'm']:
                    amount *= 1000000
                elif unit_lower in ['tỷ']:
                    amount *= 1000000000
            
            return amount
        except ValueError:
            return 0.0
    
    def detect_category(self, description: str) -> str:
        """Detect category from description"""
        description_lower = description.lower()
        
        for category, keywords in self.category_mapping.items():
            for keyword in keywords:
                if keyword in description_lower:
                    return category
        
        return 'other'
    
    def detect_transaction_type(self, command: str, sign: str = None) -> str:
        """Detect if transaction is income or expense"""
        if sign == '+':
            return 'income'
        elif sign == '-':
            return 'expense'
        
        command_lower = command.lower()
        
        # Check for income keywords
        for keyword in self.patterns['income_keywords']:
            if keyword in command_lower:
                return 'income'
        
        # Default to expense if no clear income indicators
        return 'expense'
    
    def detect_query_type(self, command: str) -> str:
        """Detect if command is a query rather than a transaction"""
        command_lower = command.lower()
        
        # Check for daily expense queries
        for keyword in self.patterns['daily_expense_keywords']:
            if keyword in command_lower:
                return 'daily_expenses'
        
        # Check for monthly expense queries
        for keyword in self.patterns['monthly_expense_keywords']:
            if keyword in command_lower:
                return 'monthly_expenses'
        
        # Check for today summary queries
        for keyword in self.patterns['today_summary_keywords']:
            if keyword in command_lower:
                return 'today_summary'
        
        # Check for blockchain keywords
        for keyword in self.patterns['blockchain_keywords']:
            if keyword in command_lower:
                return 'blockchain'
        
        return 'transaction'

    def parse_command(self, command: str) -> Optional[TransactionData]:
        """Parse a finance command into structured data"""
        try:
            command = command.strip()
            
            # First check if this is a query command
            query_type = self.detect_query_type(command)
            if query_type != 'transaction':
                # Return a special TransactionData to indicate this is a query
                return TransactionData(
                    type=query_type,
                    amount=0,
                    description=command,
                    category='query',
                    confidence=0.95
                )
            
            # Try main pattern: [+/-]amount[unit] description
            match = self.patterns['amount_description'].match(command)
            
            if match:
                sign, amount_str, unit, description = match.groups()
                
                amount = self.parse_amount(amount_str, unit)
                if amount <= 0:
                    return None
                
                transaction_type = self.detect_transaction_type(command, sign)
                category = self.detect_category(description)
                
                # Check if blockchain should be used
                if self.detect_query_type(command) == 'blockchain':
                    category = 'blockchain'
                
                return TransactionData(
                    type=transaction_type,
                    amount=amount,
                    description=description.strip(),
                    category=category,
                    confidence=0.95
                )
            
            # Try alternative patterns
            currency_match = self.patterns['vietnamese_currency'].search(command)
            if currency_match:
                amount_str, unit = currency_match.groups()
                amount = self.parse_amount(amount_str, unit)
                
                if amount > 0:
                    # Extract description (everything except the amount part)
                    description = re.sub(self.patterns['vietnamese_currency'], '', command).strip()
                    if not description:
                        description = "Giao dịch"
                    
                    transaction_type = self.detect_transaction_type(command)
                    category = self.detect_category(description)
                    
                    # Check if blockchain should be used
                    if self.detect_query_type(command) == 'blockchain':
                        category = 'blockchain'
                    
                    return TransactionData(
                        type=transaction_type,
                        amount=amount,
                        description=description,
                        category=category,
                        confidence=0.85
                    )
            
            return None
            
        except Exception as e:
            logger.error(f"Error parsing command '{command}': {e}")
            return None
    
    def generate_response(self, transaction: TransactionData) -> str:
        """Generate response message for a transaction"""
        def format_amount(amount: float) -> str:
            if amount >= 1000000:
                return f"{amount / 1000000:.1f}tr"
            elif amount >= 1000:
                return f"{amount / 1000:.0f}k"
            else:
                return f"{amount:.0f}"
        
        formatted_amount = format_amount(transaction.amount)
        
        if transaction.type == 'income':
            return f"✅ Đã lưu: thu **{formatted_amount} VNĐ** từ \"{transaction.description}\""
        else:
            return f"✅ Đã lưu: chi **{formatted_amount} VNĐ** cho \"{transaction.description}\""

class FinanceInsightsGenerator:
    """Generate financial insights and recommendations"""
    
    def __init__(self):
        self.insights_cache = {}
    
    def analyze_spending_patterns(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze spending patterns from transaction data"""
        if not transactions:
            return {'total_income': 0, 'total_expenses': 0, 'categories': {}, 'trends': {}}
        
        total_income = 0
        total_expenses = 0
        categories = {}
        monthly_data = {}
        
        for tx in transactions:
            amount = float(tx.get('amount', 0))
            tx_type = tx.get('type', 'expense')
            category = tx.get('category', 'other')
            date_str = tx.get('date', datetime.now().isoformat())
            
            try:
                tx_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                month_key = tx_date.strftime('%Y-%m')
            except:
                month_key = datetime.now().strftime('%Y-%m')
            
            if tx_type == 'income':
                total_income += amount
            else:
                total_expenses += amount
                
                # Track by category
                if category not in categories:
                    categories[category] = {'amount': 0, 'count': 0}
                categories[category]['amount'] += amount
                categories[category]['count'] += 1
            
            # Track monthly trends
            if month_key not in monthly_data:
                monthly_data[month_key] = {'income': 0, 'expenses': 0}
            
            if tx_type == 'income':
                monthly_data[month_key]['income'] += amount
            else:
                monthly_data[month_key]['expenses'] += amount
        
        return {
            'total_income': total_income,
            'total_expenses': total_expenses,
            'net_amount': total_income - total_expenses,
            'categories': categories,
            'monthly_trends': monthly_data,
            'transaction_count': len(transactions)
        }
    
    def generate_insights(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate insights based on financial analysis"""
        insights = []
        
        total_income = analysis.get('total_income', 0)
        total_expenses = analysis.get('total_expenses', 0)
        net_amount = analysis.get('net_amount', 0)
        categories = analysis.get('categories', {})
        
        # Income vs Expenses insight
        if total_expenses > total_income:
            deficit = total_expenses - total_income
            insights.append(f"⚠️ Bạn đang chi tiêu nhiều hơn thu nhập {deficit:,.0f} VNĐ trong kỳ này")
        elif net_amount > 0:
            savings_rate = (net_amount / total_income) * 100 if total_income > 0 else 0
            insights.append(f"✅ Bạn đã tiết kiệm được {net_amount:,.0f} VNĐ ({savings_rate:.1f}% thu nhập)")
        
        # Top spending categories
        if categories:
            sorted_categories = sorted(categories.items(), key=lambda x: x[1]['amount'], reverse=True)
            top_category = sorted_categories[0]
            category_name = self._get_category_display_name(top_category[0])
            percentage = (top_category[1]['amount'] / total_expenses) * 100 if total_expenses > 0 else 0
            insights.append(f"📊 Chi tiêu nhiều nhất cho {category_name}: {top_category[1]['amount']:,.0f} VNĐ ({percentage:.1f}%)")
        
        # Spending frequency
        if categories:
            high_frequency_categories = [cat for cat, data in categories.items() if data['count'] >= 5]
            if high_frequency_categories:
                insights.append(f"🔄 Các khoản chi thường xuyên: {', '.join(self._get_category_display_name(cat) for cat in high_frequency_categories[:3])}")
        
        return insights
    
    def generate_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate financial recommendations"""
        recommendations = []
        
        total_income = analysis.get('total_income', 0)
        total_expenses = analysis.get('total_expenses', 0)
        categories = analysis.get('categories', {})
        
        # Savings recommendations
        if total_expenses > total_income:
            recommendations.append("💡 Hãy xem xét cắt giảm các chi phí không cần thiết để cân bằng thu chi")
        elif total_income > 0:
            savings_rate = ((total_income - total_expenses) / total_income) * 100
            if savings_rate < 10:
                recommendations.append("🎯 Cố gắng tiết kiệm ít nhất 10% thu nhập mỗi tháng cho tương lai")
            elif savings_rate > 30:
                recommendations.append("💰 Tỷ lệ tiết kiệm rất tốt! Hãy xem xét đầu tư để tăng thêm thu nhập")
        
        # Category-specific recommendations
        if categories:
            sorted_categories = sorted(categories.items(), key=lambda x: x[1]['amount'], reverse=True)
            
            for category, data in sorted_categories[:2]:
                if category == 'food_drink' and data['amount'] > total_income * 0.3:
                    recommendations.append("🍽️ Chi phí ăn uống chiếm tỷ lệ cao, hãy thử nấu ăn tại nhà nhiều hơn")
                elif category == 'transport' and data['amount'] > total_income * 0.15:
                    recommendations.append("🚗 Xem xét sử dụng phương tiện công cộng để tiết kiệm chi phí di chuyển")
                elif category == 'entertainment' and data['amount'] > total_income * 0.2:
                    recommendations.append("🎮 Chi phí giải trí khá cao, hãy cân bằng giữa vui chơi và tiết kiệm")
        
        # General recommendations
        if len(recommendations) < 2:
            recommendations.extend([
                "📱 Sử dụng app quản lý tài chính để theo dõi chi tiêu hàng ngày",
                "📈 Đặt mục tiêu tài chính cụ thể cho từng tháng và theo dõi tiến độ"
            ])
        
        return recommendations[:3]  # Limit to 3 recommendations
    
    def _get_category_display_name(self, category: str) -> str:
        """Get display name for category"""
        display_names = {
            'food_drink': 'ăn uống',
            'transport': 'di chuyển',
            'education': 'giáo dục',
            'utilities': 'tiện ích',
            'healthcare': 'y tế',
            'entertainment': 'giải trí',
            'shopping': 'mua sắm',
            'income': 'thu nhập',
            'other': 'khác'
        }
        return display_names.get(category, category)

class FinanceAIService:
    """Main finance AI service"""
    
    def __init__(self):
        self.parser = FinanceCommandParser()
        self.insights_generator = FinanceInsightsGenerator()
        self.is_initialized = True
    
    async def process_command(self, command: str) -> FinanceResponse:
        """Process a finance command"""
        try:
            logger.info(f"Processing finance command: {command}")
            
            # Parse the command
            transaction = self.parser.parse_command(command)
            
            if transaction:
                # Generate response message
                response_text = self.parser.generate_response(transaction)
                
                return FinanceResponse(
                    transaction=transaction,
                    response_text=response_text,
                    parsed_successfully=True,
                    confidence=transaction.confidence
                )
            else:
                # Command could not be parsed
                return FinanceResponse(
                    transaction=None,
                    response_text="❌ Cú pháp không đúng! Vui lòng nhập theo định dạng:\n\n• `25k cafe` - chi tiêu\n• `+7tr lương` - thu nhập\n\nHoặc nhấn nút **Hướng dẫn** để xem thêm ví dụ.",
                    parsed_successfully=False,
                    confidence=0.0
                )
                
        except Exception as e:
            logger.error(f"Error processing finance command: {e}")
            return FinanceResponse(
                transaction=None,
                response_text="❌ Có lỗi xảy ra khi xử lý giao dịch. Vui lòng thử lại.",
                parsed_successfully=False,
                confidence=0.0,
                success=False,
                message=f"Processing error: {str(e)}"
            )
    
    async def generate_insights(self, transactions: List[Dict[str, Any]], period: str = "month") -> FinanceInsightsResponse:
        """Generate financial insights and recommendations"""
        try:
            logger.info(f"Generating insights for {len(transactions)} transactions over {period}")
            
            # Analyze spending patterns
            analysis = self.insights_generator.analyze_spending_patterns(transactions)
            
            # Generate insights and recommendations
            insights = self.insights_generator.generate_insights(analysis)
            recommendations = self.insights_generator.generate_recommendations(analysis)
            
            # Create summary
            total_income = analysis.get('total_income', 0)
            total_expenses = analysis.get('total_expenses', 0)
            net_amount = analysis.get('net_amount', 0)
            
            if net_amount >= 0:
                summary = f"Trong {period} này, bạn đã thu được {total_income:,.0f} VNĐ, chi tiêu {total_expenses:,.0f} VNĐ và tiết kiệm được {net_amount:,.0f} VNĐ."
            else:
                deficit = abs(net_amount)
                summary = f"Trong {period} này, bạn đã thu được {total_income:,.0f} VNĐ, chi tiêu {total_expenses:,.0f} VNĐ và thâm hụt {deficit:,.0f} VNĐ."
            
            return FinanceInsightsResponse(
                insights=insights,
                recommendations=recommendations,
                trends=analysis,
                summary=summary
            )
            
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            return FinanceInsightsResponse(
                insights=["Không thể tạo insights do lỗi hệ thống"],
                recommendations=["Vui lòng thử lại sau"],
                trends={},
                summary="Có lỗi xảy ra khi phân tích dữ liệu tài chính",
                success=False,
                message=f"Insights generation error: {str(e)}"
            )

class FinanceQueryGenerator:
    """Generate humorous and fun responses for finance queries"""
    
    def __init__(self):
        self.daily_expense_responses = [
            "Ơ kìa! Hôm {date} bạn đã 'nện' tổng cộng {total}đ! 🤑",
            "Wow! Ngày {date} là ngày 'chiến đấu' với {count} giao dịch, tổng thiệt hại {total}đ! 💸",
            "Hôm {date} ví của bạn đã khóc {count} lần với tổng số nước mắt {total}đ! 😭💔",
            "Báo cáo tình báo: Ngày {date} có {count} vụ 'đánh úp' ví, thiệt hại {total}đ! 🕵️‍♂️"
        ]
        
        self.monthly_expense_responses = [
            "Có liền! Tổng chi tiêu tháng này của bạn là {total}đ. Tháng này bạn đã chi tiêu có lý do gì đặc biệt không? 🤔",
            "Ui chao! Tháng này bạn đã 'xài phè phè' tổng cộng {total}đ rồi đó! Có phải do mùa sale không? 🛒",
            "Tháng này ví của bạn giảm cân {total}đ! Chắc là diet thành công quá! 😂💪",
            "Breaking news: Tháng này bạn đã 'đốt' {total}đ! Hy vọng không phải do mua đồ impulse nhé! 🔥"
        ]
        
        self.today_summary_responses = [
            "Hôm nay ({date}) bạn đã có: {count} giao dịch, tổng thu chi {net}đ! {status} 📊",
            "Báo cáo ngày {date}: {count} giao dịch, {income_text}, {expense_text}. Kết quả: {net_text}! {emoji}",
            "Update hôm nay ({date}): Ví bạn đã {action} với {count} lần 'giao tranh', tổng kết {net}đ! {emoji}"
        ]
        
        self.fun_facts = [
            "Fun fact: Nếu bạn tiết kiệm những đồng xu thừa, sau 1 năm sẽ mua được 1 ly cafe! ☕",
            "Did you know: Chi tiêu có kế hoạch giúp bạn ngủ ngon hơn đấy! 😴",
            "Pro tip: Mỗi lần muốn mua gì, hãy đợi 24h. 80% khả năng bạn sẽ không muốn mua nữa! 🤓",
            "Life hack: Ghi chép chi tiêu hàng ngày giúp bạn 'tỉnh táo' hơn khi mua sắm! 🧠"
        ]
    
    def generate_daily_expense_response(self, data: dict) -> str:
        """Generate humorous daily expense report"""
        import random
        
        date = data.get('date', 'hôm đó')
        total = self.format_currency(data.get('totalAmount', 0))
        count = data.get('count', 0)
        expenses = data.get('expenses', [])
        
        # Choose random response template
        template = random.choice(self.daily_expense_responses)
        response = template.format(date=date, total=total, count=count)
        
        # Add detailed breakdown if there are expenses
        if expenses and len(expenses) > 0:
            response += f"\n\n📝 Chi tiết 'tội trạng':\n"
            
            for i, expense in enumerate(expenses[:5], 1):  # Limit to 5 items
                time_str = expense.get('date', '')[:10] if expense.get('date') else ''
                amount = self.format_currency(expense.get('amount', 0))
                desc = expense.get('description', 'Không rõ')
                category = expense.get('category', 'other')
                
                emoji = self.get_category_emoji(category)
                response += f"{i}. {emoji} {amount}đ - {desc}\n"
            
            if len(expenses) > 5:
                response += f"... và {len(expenses) - 5} vụ án khác! 🕵️‍♂️"
        
        # Add fun fact
        response += f"\n\n{random.choice(self.fun_facts)}"
        
        return response
    
    def generate_monthly_expense_response(self, data: dict) -> str:
        """Generate humorous monthly expense report"""
        import random
        
        total = self.format_currency(data.get('totalExpenses', 0))
        month_name = data.get('monthName', 'tháng này')
        categories = data.get('categories', [])
        
        # Choose random response template
        template = random.choice(self.monthly_expense_responses)
        response = template.format(total=total, month=month_name)
        
        # Add top categories
        if categories and len(categories) > 0:
            response += f"\n\n🏆 Top danh mục 'ăn tiền':\n"
            
            for i, cat in enumerate(categories[:3], 1):
                cat_name = self._get_category_display_name(cat.get('_id', 'other'))
                amount = self.format_currency(cat.get('total', 0))
                emoji = self.get_category_emoji(cat.get('_id', 'other'))
                response += f"{i}. {emoji} {cat_name}: {amount}đ\n"
        
        # Add motivation
        motivation = [
            "💪 Tháng sau hãy cố gắng tiết kiệm hơn nhé!",
            "🎯 Đặt budget cho tháng sau để kiểm soát chi tiêu!",
            "📱 Dùng app này để theo dõi chi tiêu hàng ngày nhé!",
            "💡 Hãy nghĩ kỹ trước khi mua những thứ không cần thiết!"
        ]
        
        response += f"\n{random.choice(motivation)}"
        
        return response
    
    def generate_today_summary_response(self, data: dict) -> str:
        """Generate humorous today summary report"""
        import random
        
        date = data.get('dateFormatted', 'hôm nay')
        count = data.get('transactionCount', {}).get('total', 0)
        income = data.get('totalIncome', 0)
        expenses = data.get('totalExpenses', 0)
        net = data.get('netAmount', 0)
        
        # Format amounts
        income_text = f"thu {self.format_currency(income)}đ" if income > 0 else "không có thu nhập"
        expense_text = f"chi {self.format_currency(expenses)}đ" if expenses > 0 else "không chi tiêu gì"
        
        # Determine status and emoji
        if net > 0:
            net_text = f"lãi {self.format_currency(net)}đ"
            emoji = "🎉"
            status = "Tuyệt vời!"
            action = "thắng lớn"
        elif net < 0:
            net_text = f"lỗ {self.format_currency(abs(net))}đ"
            emoji = "😅"
            status = "Ơ ối!"
            action = "hơi thất thu"
        else:
            net_text = "hòa vốn"
            emoji = "😐"
            status = "Ổn ổn!"
            action = "cân bằng"
        
        # Choose random response template
        template = random.choice(self.today_summary_responses)
        response = template.format(
            date=date,
            count=count,
            income_text=income_text,
            expense_text=expense_text,
            net=self.format_currency(net),
            net_text=net_text,
            emoji=emoji,
            status=status,
            action=action
        )
        
        return response
    
    def format_currency(self, amount: float) -> str:
        """Format currency amount"""
        if amount >= 1000000:
            return f"{amount / 1000000:.1f}tr"
        elif amount >= 1000:
            return f"{amount / 1000:.0f}k"
        else:
            return f"{amount:.0f}"
    
    def get_category_emoji(self, category: str) -> str:
        """Get emoji for category"""
        emoji_map = {
            'food_drink': '🍕',
            'transport': '🚗',
            'education': '📚',
            'utilities': '⚡',
            'healthcare': '🏥',
            'entertainment': '🎮',
            'shopping': '🛒',
            'income': '💰',
            'other': '📦'
        }
        return emoji_map.get(category, '📦')
    
    def _get_category_display_name(self, category: str) -> str:
        """Get display name for category"""
        display_names = {
            'food_drink': 'ăn uống',
            'transport': 'di chuyển',
            'education': 'giáo dục',
            'utilities': 'tiện ích',
            'healthcare': 'y tế',
            'entertainment': 'giải trí',
            'shopping': 'mua sắm',
            'income': 'thu nhập',
            'other': 'khác'
        }
        return display_names.get(category, category)

# Global service instance
finance_service = FinanceAIService()
query_generator = FinanceQueryGenerator()