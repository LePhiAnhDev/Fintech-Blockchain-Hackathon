import { backendAPI, aiServerAPI, uploadFile, downloadFile } from "./apiClient";
import authService from "./authService";
import financeService, { financeAIService } from "./financeService";
import blockchainService from "./blockchainService";
import studyService from "./studyService";
import dashboardService from "./dashboardService";
import aiCollectionsService from "./aiCollectionsService";
import helpService from "./helpService";

// Health check APIs
const healthService = {
  checkBackend: () => backendAPI.get("/health"),
  checkAIServer: () => aiServerAPI.get("/health"),
};

// Export all services
export {
  authService,
  financeService,
  financeAIService,
  blockchainService,
  studyService,
  dashboardService,
  aiCollectionsService,
  helpService,
  healthService,
  uploadFile,
  downloadFile,
};

// Export default object for backward compatibility
export default {
  auth: authService,
  finance: financeService,
  financeAI: financeAIService,
  blockchain: blockchainService,
  study: studyService,
  dashboard: dashboardService,
  aiCollections: aiCollectionsService,
  help: helpService,
  health: healthService,
  uploadFile,
  downloadFile,
};
