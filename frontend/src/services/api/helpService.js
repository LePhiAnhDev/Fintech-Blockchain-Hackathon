import apiClient from "./apiClient";

/**
 * Help Center Service
 * Handles all help-related API calls
 */
class HelpService {
  /**
   * Get FAQ items
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {string} params.search - Search query
   * @param {number} params.limit - Limit results
   * @returns {Promise<Object>} FAQ data
   */
  async getFAQ(params = {}) {
    try {
      const response = await apiClient.get("/help/faq", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching FAQ:", error);
      throw error;
    }
  }

  /**
   * Get specific FAQ item
   * @param {number} id - FAQ item ID
   * @returns {Promise<Object>} FAQ item data
   */
  async getFAQItem(id) {
    try {
      const response = await apiClient.get(`/help/faq/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching FAQ item:", error);
      throw error;
    }
  }

  /**
   * Get support options
   * @returns {Promise<Object>} Support options data
   */
  async getSupportOptions() {
    try {
      const response = await apiClient.get("/help/support");
      return response.data;
    } catch (error) {
      console.error("Error fetching support options:", error);
      throw error;
    }
  }

  /**
   * Get system status
   * @returns {Promise<Object>} System status data
   */
  async getSystemStatus() {
    try {
      const response = await apiClient.get("/help/status");
      return response.data;
    } catch (error) {
      console.error("Error fetching system status:", error);
      throw error;
    }
  }

  /**
   * Submit contact form
   * @param {Object} contactData - Contact form data
   * @param {string} contactData.name - User name
   * @param {string} contactData.email - User email
   * @param {string} contactData.subject - Message subject
   * @param {string} contactData.message - Message content
   * @param {string} contactData.type - Message type (general, urgent, etc.)
   * @returns {Promise<Object>} Submission result
   */
  async submitContact(contactData) {
    try {
      const response = await apiClient.post("/help/contact", contactData);
      return response.data;
    } catch (error) {
      console.error("Error submitting contact form:", error);
      throw error;
    }
  }

  /**
   * Get help guides
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @returns {Promise<Object>} Guides data
   */
  async getGuides(params = {}) {
    try {
      const response = await apiClient.get("/help/guides", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching guides:", error);
      throw error;
    }
  }

  /**
   * Search help content
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchHelp(query, options = {}) {
    try {
      const searchPromises = [
        this.getFAQ({ search: query, limit: 10 }),
        this.getGuides({ search: query }),
      ];

      const [faqResults, guideResults] = await Promise.all(searchPromises);

      return {
        success: true,
        data: {
          faqs: faqResults.data?.faqs || [],
          guides: guideResults.data?.guides || [],
          total:
            (faqResults.data?.faqs?.length || 0) +
            (guideResults.data?.guides?.length || 0),
        },
      };
    } catch (error) {
      console.error("Error searching help content:", error);
      throw error;
    }
  }

  /**
   * Get popular help topics
   * @returns {Promise<Object>} Popular topics data
   */
  async getPopularTopics() {
    try {
      // This would typically come from analytics data
      // For now, return static popular topics
      const popularTopics = [
        {
          id: 1,
          title: "Kết nối ví MetaMask",
          category: "wallet",
          views: 1250,
        },
        { id: 2, title: "Tạo NFT đầu tiên", category: "nft", views: 980 },
        { id: 3, title: "Phí giao dịch", category: "nft", views: 756 },
        { id: 4, title: "Bảo mật tài khoản", category: "security", views: 642 },
        { id: 5, title: "AI Collections setup", category: "ai", views: 534 },
      ];

      return {
        success: true,
        data: {
          topics: popularTopics,
          total: popularTopics.length,
        },
      };
    } catch (error) {
      console.error("Error fetching popular topics:", error);
      throw error;
    }
  }

  /**
   * Report a problem
   * @param {Object} problemData - Problem report data
   * @returns {Promise<Object>} Report submission result
   */
  async reportProblem(problemData) {
    try {
      // Add problem type to contact data
      const contactData = {
        ...problemData,
        type: "problem",
        subject: `Problem Report: ${problemData.subject || "General Issue"}`,
      };

      return await this.submitContact(contactData);
    } catch (error) {
      console.error("Error reporting problem:", error);
      throw error;
    }
  }

  /**
   * Request feature
   * @param {Object} featureData - Feature request data
   * @returns {Promise<Object>} Request submission result
   */
  async requestFeature(featureData) {
    try {
      // Add feature request type to contact data
      const contactData = {
        ...featureData,
        type: "feature",
        subject: `Feature Request: ${featureData.subject || "New Feature"}`,
      };

      return await this.submitContact(contactData);
    } catch (error) {
      console.error("Error requesting feature:", error);
      throw error;
    }
  }

  /**
   * Get help statistics
   * @returns {Promise<Object>} Help statistics
   */
  async getHelpStats() {
    try {
      // This would typically come from analytics
      // For now, return mock statistics
      const stats = {
        totalFAQs: 8,
        totalGuides: 4,
        avgResponseTime: "< 2 hours",
        satisfactionRate: "98%",
        resolvedTickets: 1247,
        activeUsers: 1234,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching help stats:", error);
      throw error;
    }
  }
}

// Export singleton instance
const helpService = new HelpService();
export default helpService;
