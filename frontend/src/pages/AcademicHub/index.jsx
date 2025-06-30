import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, ShoppingCart, Search, RefreshCw } from "lucide-react";
import { useWallet } from "../../contexts/WalletContext";
import { useAcademicHub } from "../../hooks/useAcademicHub";
import Button from "../../components/common/Button";
import { SuccessModal } from "../../components/common";
import { DiscoverTab, CreateTab, SellTab } from "./components";

const AcademicHub = () => {
    const { account } = useWallet();
    const [activeTab, setActiveTab] = useState("discover");
    const {
        listings,
        userNFTs,
        contractInfo,
        loading,
        contractInstance,
        loadListings,
        loadUserNFTs,
        uploadDocument,
        purchaseNFT,
        listForSale,
        successModal,
        closeSuccessModal,
    } = useAcademicHub();

    // Memoize tabs configuration
    const tabs = useMemo(
        () => [
            {
                id: "discover",
                label: "Discover",
                icon: Search,
                description: "Browse and purchase academic documents",
                count: listings.length,
            },
            {
                id: "create",
                label: "Create",
                icon: Plus,
                description: "Upload and mint new academic NFTs",
            },
            {
                id: "sell",
                label: "My NFTs",
                icon: ShoppingCart,
                description: "Manage your NFT collection",
                count: userNFTs.length,
            },
        ],
        [listings.length, userNFTs.length]
    );

    // Debug logging for data status
    useEffect(() => {
        console.log("🔄 AcademicHub data status:", {
            account: !!account,
            hasContract: !!contractInstance,
            listingsCount: listings.length,
            userNFTsCount: userNFTs.length,
            loading,
        });
    }, [account, contractInstance, listings.length, userNFTs.length, loading]);

    // Handle refresh with loading state
    const handleRefresh = async () => {
        console.log("🔄 Manual refresh triggered");
        await Promise.all([
            loadListings(true), // Force reload
            loadUserNFTs(true), // Force reload
        ]);
    };

    return (
        <div className="space-y-6">
            {/* Simple Horizontal Tabs Navigation */}
            <div className="flex items-center justify-center gap-8 mb-8">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                ? "text-blue-400 bg-blue-500/10"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{tab.label}</span>
                            {tab.count !== undefined && (
                                <span
                                    className={`px-2 py-1 text-xs rounded-full font-medium ${isActive
                                        ? "bg-blue-500/20 text-blue-300"
                                        : "bg-gray-700 text-gray-300"
                                        }`}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="min-h-[600px]"
            >
                {activeTab === "discover" && (
                    <DiscoverTab
                        listings={listings}
                        loading={loading}
                        onPurchase={purchaseNFT}
                        onRefresh={handleRefresh}
                    />
                )}
                {activeTab === "create" && (
                    <CreateTab onUpload={uploadDocument} contractInfo={contractInfo} />
                )}
                {activeTab === "sell" && (
                    <SellTab userNFTs={userNFTs} loading={loading} onList={listForSale} />
                )}
            </motion.div>

            {/* Success Modal */}
            <SuccessModal
                isOpen={successModal.isOpen}
                data={successModal.data}
                type={successModal.type}
                onClose={closeSuccessModal}
            />
        </div>
    );
};

export default AcademicHub;
