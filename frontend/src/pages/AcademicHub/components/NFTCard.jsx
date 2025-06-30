import React, { useState } from "react";
import {
    ShoppingCart,
    Eye,
    Tag,
    Image,
    FileText,
    ExternalLink,
    User,
    Calendar,
    DollarSign,
    CheckCircle,
    Clock,
    TrendingUp,
} from "lucide-react";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import FilePreview from "../../../components/common/FilePreview";
import NFTDetailsModal from "./NFTDetailsModal";

const NFTCard = ({ nft, onAction, actionLabel, isOwned }) => {
    const [showDetails, setShowDetails] = useState(false);

    const getFileTypeIcon = (fileType) => {
        switch (fileType?.toLowerCase()) {
            case "png":
            case "jpeg":
            case "jpg":
            case "gif":
                return <Image className="w-12 h-12 text-blue-400" />;
            case "pdf":
                return <div className="text-xl">📄</div>;
            case "docx":
            case "doc":
                return <div className="text-xl">📝</div>;
            case "txt":
                return <div className="text-xl">📄</div>;
            case "md":
                return <div className="text-xl">📋</div>;
            default:
                return <FileText className="w-12 h-12 text-blue-400" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Unknown";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return "Unknown";
        }
    };

    const formatAddress = (address) => {
        if (!address) return "Unknown";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <>
            <Card className="group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden h-full">
                {/* Status Badge */}
                {isOwned && (
                    <div className="absolute top-2 right-2 z-10">
                        {nft.isListed ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                                <TrendingUp className="w-3 h-3" />
                                Listed
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">
                                <Clock className="w-3 h-3" />
                                Not Listed
                            </div>
                        )}
                    </div>
                )}

                <div className="relative overflow-hidden">
                    {/* Preview Image/Icon */}
                    <div className="h-36 relative">
                        <FilePreview
                            fileUrl={nft.ipfsUrl}
                            fileType={nft.fileType}
                            className="w-full h-full"
                        />

                        {/* File Type Badge */}
                        <div className="absolute top-2 left-2">
                            <span className="text-xs bg-black/50 text-white px-2 py-1 rounded backdrop-blur-sm">
                                {nft.fileType?.toUpperCase() || "FILE"}
                            </span>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowDetails(true)}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/10 text-white h-10 w-10 p-0"
                            >
                                <Eye className="w-5 h-5" />
                            </Button>
                            {nft.externalUrl && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(nft.externalUrl, "_blank")}
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/10 text-white h-10 w-10 p-0"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="p-3">
                        {/* Title and Description */}
                        <div className="mb-3">
                            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-1 text-sm">
                                {nft.name}
                            </h3>
                            <p className="text-xs text-gray-400 line-clamp-2">
                                {nft.description}
                            </p>
                        </div>

                        {/* Price Display */}
                        {nft.price && (
                            <div className="mb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Price</span>
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3 text-green-400" />
                                        <span className="font-semibold text-white text-sm">
                                            {nft.price} ETH
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="space-y-1 mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>Creator</span>
                                </div>
                                <span className="font-mono">{formatAddress(nft.creator)}</span>
                            </div>

                            {nft.royaltyPercent !== undefined && (
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>Royalty</span>
                                    </div>
                                    <span>{nft.royaltyPercent}%</span>
                                </div>
                            )}
                        </div>

                        {/* Attributes Preview */}
                        {nft.attributes && nft.attributes.length > 0 && (
                            <div className="mb-3">
                                <div className="flex flex-wrap gap-1">
                                    {nft.attributes.slice(0, 2).map((attr, index) => (
                                        <span
                                            key={index}
                                            className="text-xs bg-gray-800/50 text-gray-300 px-1.5 py-0.5 rounded"
                                        >
                                            {attr.trait_type}: {attr.value}
                                        </span>
                                    ))}
                                    {nft.attributes.length > 2 && (
                                        <span className="text-xs text-gray-400 px-1.5 py-0.5">
                                            +{nft.attributes.length - 2}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Button */}
                        <Button
                            onClick={onAction}
                            variant="primary"
                            className="w-full"
                            size="sm"
                        >
                            {actionLabel}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Details Modal */}
            {showDetails && (
                <NFTDetailsModal
                    nft={nft}
                    onClose={() => setShowDetails(false)}
                    onAction={onAction}
                    actionLabel={actionLabel}
                    isOwned={isOwned}
                />
            )}
        </>
    );
};

export default NFTCard;
