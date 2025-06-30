import { lazy } from 'react';

// Lazy load các component trang để cải thiện hiệu suất
const Dashboard = lazy(() => import('../pages/Dashboard'));
const FinanceManager = lazy(() => import('../pages/FinanceManager'));
const BlockchainAnalysis = lazy(() => import('../pages/BlockchainAnalysis'));
const StudyChat = lazy(() => import('../pages/StudyChat'));
const AICollections = lazy(() => import('../pages/AICollections'));

/**
 * Cấu hình routes của ứng dụng
 */
const routes = [
    {
        path: '/',
        redirect: '/dashboard',
    },
    {
        path: '/dashboard',
        component: Dashboard,
        exact: true,
    },
    {
        path: '/finance',
        component: FinanceManager,
        exact: true,
    },
    {
        path: '/blockchain',
        component: BlockchainAnalysis,
        exact: true,
    },
    {
        path: '/study',
        component: StudyChat,
        exact: true,
    },
    {
        path: '/ai-collections',
        component: AICollections,
        exact: true,
    },
    {
        path: '*',
        redirect: '/dashboard',
    },
];

export default routes;