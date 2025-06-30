import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { WalletProvider, useWallet } from "./contexts/WalletContext";

// Import trực tiếp các component thay vì dùng lazy loading trong giai đoạn đầu
import AcademicHub from "./pages/AcademicHub";
import FinanceManager from "./pages/FinanceManager";
import StudyChat from "./pages/StudyChat";
import AICollections from "./pages/AICollections";
import HelpCenter from "./pages/HelpCenter";
import Explore from "./pages/Explore";
import AppLayout from "./components/layouts/AppLayout";
import LoadingScreen from "./components/common/LoadingScreen";
import ConnectWallet from "./features/auth/components/ConnectWallet";

/**
 * Cấu hình Toaster mặc định
 */
const toasterConfig = {
  position: "top-right",
  toastOptions: {
    duration: 4000,
    style: {
      background: "rgba(31, 41, 55, 0.95)",
      backdropFilter: "blur(20px)",
      color: "#fff",
      border: "1px solid rgba(75, 85, 99, 0.3)",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
    },
    success: {
      iconTheme: {
        primary: "#10B981",
        secondary: "#fff",
      },
    },
    error: {
      iconTheme: {
        primary: "#EF4444",
        secondary: "#fff",
      },
    },
    loading: {
      iconTheme: {
        primary: "#6366F1",
        secondary: "#fff",
      },
    },
  },
};

// Định nghĩa routes trực tiếp trong file này để tránh lỗi
const routes = [
  {
    path: "/",
    redirect: "/academic",
  },
  {
    path: "/academic",
    component: AcademicHub,
  },
  {
    path: "/finance",
    component: FinanceManager,
  },
  {
    path: "/study",
    component: StudyChat,
  },
  {
    path: "/ai-collections",
    component: AICollections,
  },
  {
    path: "/help",
    component: HelpCenter,
  },
  {
    path: "/explore",
    component: Explore,
  },
  {
    path: "*",
    redirect: "/academic",
  },
];

/**
 * Thành phần chính ứng dụng
 */
function AppContent() {
  const {
    account,
    connectWallet,
    isConnecting,
    isInitializing,
    isAuthenticated,
  } = useWallet();

  // Hiển thị loading screen khi đang khởi tạo
  if (isInitializing) {
    return <LoadingScreen message="Đang khởi tạo ứng dụng..." />;
  }

  // Nếu chưa kết nối ví, hiển thị màn hình kết nối
  if (!account || !isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/explore" element={<Explore />} />
          <Route
            path="*"
            element={
              <ConnectWallet
                onConnect={connectWallet}
                isConnecting={isConnecting}
              />
            }
          />
        </Routes>
      </Router>
    );
  }

  // Nếu đã kết nối ví, hiển thị ứng dụng chính
  return (
    <Router>
      <AppLayout>
        <Routes>
          {routes.map((route, index) => {
            // Xử lý routes chuyển hướng
            if (route.redirect) {
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={<Navigate to={route.redirect} replace />}
                />
              );
            }

            // Chặn truy cập /explore khi đã connect wallet, chuyển về /academic
            if (route.path === "/explore") {
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={<Navigate to="/academic" replace />}
                />
              );
            }

            // Xử lý routes bình thường
            const Component = route.component;
            return (
              <Route key={index} path={route.path} element={<Component />} />
            );
          })}
        </Routes>
      </AppLayout>
    </Router>
  );
}

/**
 * Wrapper ứng dụng với providers
 */
function App() {
  return (
    <WalletProvider>
      <AppContent />
      <Toaster {...toasterConfig} />
    </WalletProvider>
  );
}

export default App;
